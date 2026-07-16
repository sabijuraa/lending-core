// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {LendingCore} from "../src/LendingCore.sol";
import {MarketParams} from "../src/types/Market.sol";
import {IOracle} from "../src/interfaces/IOracle.sol";
import {IInterestRateModel} from "../src/interfaces/IInterestRateModel.sol";

contract MockERC20 {
    string public name = "Mock";
    string public symbol = "MOCK";
    uint8 public decimals = 18;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract MockOracle is IOracle {
    function price() external view returns (uint256, uint256) {
        return (1e36, block.timestamp);
    }
}

contract MockIRM is IInterestRateModel {
    function borrowRatePerSecond(uint256) external pure returns (uint256) {
        return 0;
    }
}

contract LendingCoreTest is Test {
    LendingCore core;
    MockERC20 loan;
    MockERC20 collateral;
    MarketParams params;

    address supplier = address(0xA11CE);
    address other = address(0xB0B);

    function setUp() public {
        core = new LendingCore();
        loan = new MockERC20();
        collateral = new MockERC20();

        params = MarketParams({
            loanToken: address(loan),
            collateralToken: address(collateral),
            oracle: IOracle(address(new MockOracle())),
            irm: IInterestRateModel(address(new MockIRM())),
            lltv: 0.8e18,
            maxStaleness: 1 hours
        });

        core.createMarket(params);

        loan.mint(supplier, 1_000_000e18);
        vm.prank(supplier);
        loan.approve(address(core), type(uint256).max);
    }

    function test_CreateMarketIsIdempotentlyGuarded() public {
        vm.expectRevert(LendingCore.MarketAlreadyExists.selector);
        core.createMarket(params);
    }

    function test_SupplyMintsSharesAndPullsTokens() public {
        vm.prank(supplier);
        uint256 shares = core.supply(params, 1000e18, supplier);

        assertGt(shares, 0, "no shares minted");
        assertEq(loan.balanceOf(address(core)), 1000e18, "tokens not pulled in");

        (uint256 supplyShares,,) = core.position(core.idOf(params), supplier);
        assertEq(supplyShares, shares, "position not credited");
    }

    function test_WithdrawReturnsTokens() public {
        vm.startPrank(supplier);
        core.supply(params, 1000e18, supplier);
        core.withdraw(params, 500e18, supplier, supplier);
        vm.stopPrank();

        assertEq(loan.balanceOf(address(core)), 500e18, "wrong amount left in market");
    }

    function test_SupplyRevertsOnZeroAssets() public {
        vm.prank(supplier);
        vm.expectRevert(LendingCore.ZeroAssets.selector);
        core.supply(params, 0, supplier);
    }

    function test_SupplyRevertsOnUncreatedMarket() public {
        MarketParams memory ghost = params;
        ghost.lltv = 0.5e18; // different params, different id, never created
        vm.prank(supplier);
        vm.expectRevert(LendingCore.MarketNotCreated.selector);
        core.supply(ghost, 1000e18, supplier);
    }

    /// forge-config: default.fuzz.runs = 5000
    function testFuzz_SupplyThenWithdrawNeverReturnsMore(uint256 amount) public {
        amount = bound(amount, 1, 1_000_000e18);

        vm.startPrank(supplier);
        core.supply(params, amount, supplier);

        uint256 before = loan.balanceOf(supplier);
        // Withdraw the same amount; the round trip must not return more than supplied.
        core.withdraw(params, amount, supplier, supplier);
        uint256 gained = loan.balanceOf(supplier) - before;
        vm.stopPrank();

        assertLe(gained, amount, "withdrew more than supplied");
    }
}

// --- borrow-side tests, appended for commit 6 -------------------------------

contract LendingCoreBorrowTest is Test {
    LendingCore core;
    MockERC20 loan;
    MockERC20 collateral;
    MarketParams params;

    address supplier = address(0xA11CE);
    address borrower = address(0xB0B);

    function setUp() public {
        core = new LendingCore();
        loan = new MockERC20();
        collateral = new MockERC20();

        params = MarketParams({
            loanToken: address(loan),
            collateralToken: address(collateral),
            oracle: IOracle(address(new MockOracle())), // price 1e36 => 1:1
            irm: IInterestRateModel(address(new MockIRM())),
            lltv: 0.8e18,
            maxStaleness: 1 hours
        });
        core.createMarket(params);

        loan.mint(supplier, 1_000_000e18);
        vm.prank(supplier);
        loan.approve(address(core), type(uint256).max);
        vm.prank(supplier);
        core.supply(params, 100_000e18, supplier);

        collateral.mint(borrower, 1_000e18);
        vm.prank(borrower);
        collateral.approve(address(core), type(uint256).max);
        vm.prank(borrower);
        loan.approve(address(core), type(uint256).max);
    }

    function test_BorrowUpToLimitSucceeds() public {
        vm.startPrank(borrower);
        core.supplyCollateral(params, 100e18, borrower);
        // price 1:1, 80% LLTV => 80 borrowable against 100 collateral.
        core.borrow(params, 80e18, borrower, borrower);
        vm.stopPrank();
        assertEq(loan.balanceOf(borrower), 80e18, "borrowed amount not received");
    }

    function test_BorrowBeyondLimitReverts() public {
        vm.startPrank(borrower);
        core.supplyCollateral(params, 100e18, borrower);
        vm.expectRevert(LendingCore.Unhealthy.selector);
        core.borrow(params, 80e18 + 1, borrower, borrower);
        vm.stopPrank();
    }

    function test_WithdrawCollateralThatWouldUnderCollateralizeReverts() public {
        vm.startPrank(borrower);
        core.supplyCollateral(params, 100e18, borrower);
        core.borrow(params, 80e18, borrower, borrower);
        // Removing any collateral now drops borrowing power below the debt.
        vm.expectRevert(LendingCore.Unhealthy.selector);
        core.withdrawCollateral(params, 1e18, borrower, borrower);
        vm.stopPrank();
    }

    function test_RepayThenWithdrawCollateral() public {
        vm.startPrank(borrower);
        core.supplyCollateral(params, 100e18, borrower);
        core.borrow(params, 80e18, borrower, borrower);
        core.repay(params, 80e18, borrower);
        // Debt cleared, collateral can now leave.
        core.withdrawCollateral(params, 100e18, borrower, borrower);
        vm.stopPrank();
        assertEq(collateral.balanceOf(borrower), 1_000e18, "collateral not fully returned");
    }
}

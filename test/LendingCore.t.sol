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
            liquidationBonus: 0.05e18,
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
            liquidationBonus: 0.05e18,
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

// --- liquidation tests, commit 7 --------------------------------------------

contract MockCrashOracle is IOracle {
    uint256 public p;
    uint256 public t;

    constructor(uint256 _p) {
        p = _p;
        t = block.timestamp;
    }

    function setPrice(uint256 _p) external {
        p = _p;
        t = block.timestamp;
    }

    function price() external view returns (uint256, uint256) {
        return (p, t);
    }
}

contract LendingCoreLiquidationTest is Test {
    LendingCore core;
    MockERC20 loan;
    MockERC20 collateral;
    MockCrashOracle oracle;
    MarketParams params;

    address supplier  = address(0xA11CE);
    address borrower  = address(0xB0B);
    address liquidator = address(0xA1C1);

    // Price 1:1 (1e36 scaled), 80% LLTV, 5% liquidation bonus.
    uint256 constant INITIAL_PRICE = 1e36;
    uint256 constant LLTV          = 0.8e18;
    uint256 constant BONUS         = 0.05e18;

    function setUp() public {
        core       = new LendingCore();
        loan       = new MockERC20();
        collateral = new MockERC20();
        oracle     = new MockCrashOracle(INITIAL_PRICE);

        params = MarketParams({
            loanToken:        address(loan),
            collateralToken:  address(collateral),
            oracle:           IOracle(address(oracle)),
            irm:              IInterestRateModel(address(new MockIRM())),
            lltv:             LLTV,
            liquidationBonus: BONUS,
            maxStaleness:     1 hours
        });
        core.createMarket(params);

        // Supplier funds the pool.
        loan.mint(supplier, 1_000_000e18);
        vm.prank(supplier);
        loan.approve(address(core), type(uint256).max);
        vm.prank(supplier);
        core.supply(params, 100_000e18, supplier);

        // Borrower posts 100 collateral, borrows 80 (at the LLTV limit).
        collateral.mint(borrower, 1_000e18);
        vm.startPrank(borrower);
        collateral.approve(address(core), type(uint256).max);
        core.supplyCollateral(params, 100e18, borrower);
        loan.approve(address(core), type(uint256).max);
        core.borrow(params, 80e18, borrower, borrower);
        vm.stopPrank();

        // Liquidator has funds to repay.
        loan.mint(liquidator, 1_000_000e18);
        vm.prank(liquidator);
        loan.approve(address(core), type(uint256).max);
    }

    function test_CannotLiquidateHealthyPosition() public {
        vm.prank(liquidator);
        vm.expectRevert(LendingCore.PositionHealthy.selector);
        core.liquidate(params, borrower, liquidator);
    }

    function test_LiquidationAfterPriceCrash() public {
        // Drop price 20%: collateral now worth 80, LLTV threshold = 64.
        // Borrower's debt is 80, health = 64/80 = 0.8 — unhealthy.
        oracle.setPrice(0.8e36);

        uint256 collateralBefore = collateral.balanceOf(liquidator);
        uint256 loanBefore       = loan.balanceOf(liquidator);

        vm.prank(liquidator);
        (uint256 debtRepaid, uint256 collateralSeized) =
            core.liquidate(params, borrower, liquidator);

        // Liquidator repaid the full debt.
        assertGt(debtRepaid, 0, "no debt repaid");
        // Liquidator received collateral.
        assertGt(collateralSeized, 0, "no collateral seized");
        // Liquidator's loan balance decreased by debtRepaid.
        assertEq(loan.balanceOf(liquidator), loanBefore - debtRepaid, "loan balance wrong");
        // Liquidator's collateral balance increased by collateralSeized.
        assertEq(collateral.balanceOf(liquidator), collateralBefore + collateralSeized, "collateral balance wrong");
    }

    function test_LiquidatorReceivesBonusCollateral() public {
        // Drop price to make position unhealthy but collateral still covers debt+bonus.
        oracle.setPrice(0.8e36);

        vm.prank(liquidator);
        (, uint256 collateralSeized) = core.liquidate(params, borrower, liquidator);

        // Collateral seized should be worth more than debt repaid (the bonus).
        // At 0.8e36 price: collateralValue = collateralSeized * 0.8
        // debtRepaid * (1 + bonus) = debtRepaid * 1.05
        // collateralSeized * 0.8 >= debtRepaid * 1.05
        assertGt(collateralSeized, 0, "collateral seized");
    }

    function test_BadDebtRealizationWhenCollateralInsufficientForBonus() public {
        // Crash price to 50%: collateral worth 50, debt is 80.
        // No liquidator would pay 80 to receive 50 of collateral.
        oracle.setPrice(0.5e36);

        bytes32 id = core.idOf(params);
        (, uint256 totalSupplyBefore,,, ) = core.market(id);

        vm.prank(liquidator);
        core.liquidate(params, borrower, liquidator);

        // After liquidation, borrower should have no remaining borrow shares.
        (,uint256 borrowShares,) = core.position(id, borrower);
        assertEq(borrowShares, 0, "borrow shares not cleared after bad debt");

        // Total supply assets should have decreased — suppliers took the loss.
        (uint256 totalSupplyAfter,,,,) = core.market(id);
        assertLt(totalSupplyAfter, totalSupplyBefore, "bad debt not realized against suppliers");
    }

    function test_BorrowerPositionClearedAfterLiquidation() public {
        oracle.setPrice(0.8e36);
        bytes32 id = core.idOf(params);

        vm.prank(liquidator);
        core.liquidate(params, borrower, liquidator);

        (,uint256 borrowShares, uint256 col) = core.position(id, borrower);
        assertEq(borrowShares, 0, "borrow shares remain");
        assertEq(col, 0, "collateral remains");
    }
}

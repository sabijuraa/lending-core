// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {LendingCore} from "../src/LendingCore.sol";
import {LendingCoreView} from "../src/LendingCoreView.sol";
import {MarketParams} from "../src/types/Market.sol";
import {IOracle} from "../src/interfaces/IOracle.sol";
import {IInterestRateModel} from "../src/interfaces/IInterestRateModel.sol";

contract MockERC20View {
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

contract MockOracleView is IOracle {
    uint256 public p;
    uint256 public t;

    constructor() {
        p = 1e36;
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

contract MockIRMView is IInterestRateModel {
    function borrowRatePerSecond(uint256) external pure returns (uint256) {
        return 317097919; // ~1% APR
    }
}

contract LendingCoreViewTest is Test {
    LendingCore core;
    LendingCoreView view_;
    MockERC20View loan;
    MockERC20View collateral;
    MockOracleView oracle;
    MarketParams params;

    address supplier = address(0xA11CE);
    address borrower = address(0xB0B);

    function setUp() public {
        core = new LendingCore();
        view_ = new LendingCoreView(address(core));
        loan = new MockERC20View();
        collateral = new MockERC20View();
        oracle = new MockOracleView();

        params = MarketParams({
            loanToken: address(loan),
            collateralToken: address(collateral),
            oracle: IOracle(address(oracle)),
            irm: IInterestRateModel(address(new MockIRMView())),
            lltv: 0.8e18,
            liquidationBonus: 0.05e18,
            maxStaleness: 1 hours
        });

        core.createMarket(params);

        // Setup supplier
        loan.mint(supplier, 1_000_000e18);
        vm.prank(supplier);
        loan.approve(address(core), type(uint256).max);
        vm.prank(supplier);
        core.supply(params, 100_000e18, supplier);

        // Setup borrower
        collateral.mint(borrower, 1_000e18);
        loan.mint(borrower, 1_000e18);
        vm.startPrank(borrower);
        collateral.approve(address(core), type(uint256).max);
        loan.approve(address(core), type(uint256).max);
        core.supplyCollateral(params, 100e18, borrower);
        core.borrow(params, 50e18, borrower, borrower);
        vm.stopPrank();
    }

    function test_GetPositionHealthReturnsCorrectValue() public view {
        // 100 collateral, 50 debt, 80% LLTV, price 1:1
        // maxBorrow = 100 * 1 * 0.8 = 80
        // healthFactor = 80 / 50 * 1e18 = 1.6e18
        uint256 health = view_.getPositionHealth(params, borrower);
        assertEq(health, 1.6e18, "wrong health factor");
    }

    function test_GetPositionHealthMaxForNoDebt() public view {
        uint256 health = view_.getPositionHealth(params, supplier);
        assertEq(health, type(uint256).max, "no debt should return max");
    }

    function test_GetMaxBorrow() public view {
        // 100 collateral, 50 debt, 80% LLTV
        // maxBorrow = 80, current = 50, available = 30
        uint256 maxBorrow = view_.getMaxBorrow(params, borrower);
        assertEq(maxBorrow, 30e18, "wrong max borrow");
    }

    function test_GetMaxBorrowZeroWhenAtLimit() public {
        vm.prank(borrower);
        core.borrow(params, 30e18, borrower, borrower);

        uint256 maxBorrow = view_.getMaxBorrow(params, borrower);
        assertEq(maxBorrow, 0, "should be zero at limit");
    }

    function test_GetLiquidationPrice() public view {
        // 100 collateral, 50 debt, 80% LLTV
        // At liquidation: 50 = 100 * price / 1e36 * 0.8
        // price = 50 * 1e36 / (100 * 0.8) = 0.625e36
        uint256 liqPrice = view_.getLiquidationPrice(params, borrower);
        assertEq(liqPrice, 0.625e36, "wrong liquidation price");
    }

    function test_GetSupplyBalance() public view {
        uint256 balance = view_.getSupplyBalance(params, supplier);
        assertApproxEqAbs(balance, 100_000e18, 1e18, "wrong supply balance");
    }

    function test_GetBorrowBalance() public view {
        uint256 balance = view_.getBorrowBalance(params, borrower);
        assertApproxEqAbs(balance, 50e18, 1e18, "wrong borrow balance");
    }

    function test_GetUtilization() public view {
        // 100k supplied, 50 borrowed
        uint256 util = view_.getUtilization(params);
        assertApproxEqAbs(util, 0.0005e18, 1e14, "wrong utilization");
    }

    function test_GetBorrowAPR() public view {
        uint256 apr = view_.getBorrowAPR(params);
        // ~1% APR = 100 bps
        assertApproxEqAbs(apr, 100, 10, "wrong borrow APR");
    }

    function test_GetSupplyAPR() public view {
        uint256 apr = view_.getSupplyAPR(params);
        // Very low utilization, so supply APR is near zero
        assertLt(apr, 1, "supply APR should be near zero with low util");
    }

    function test_HealthFactorDropsWithPrice() public {
        uint256 healthBefore = view_.getPositionHealth(params, borrower);

        // Drop price by 50%
        oracle.setPrice(0.5e36);

        uint256 healthAfter = view_.getPositionHealth(params, borrower);
        assertLt(healthAfter, healthBefore, "health should drop with price");
        assertLt(healthAfter, 1e18, "should be liquidatable at 50% price");
    }
}

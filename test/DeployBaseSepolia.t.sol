// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {DeployBaseSepolia} from "../script/Deploy.s.sol";
import {LendingCore} from "../src/LendingCore.sol";
import {IOracle} from "../src/interfaces/IOracle.sol";
import {IInterestRateModel} from "../src/interfaces/IInterestRateModel.sol";
import {MarketParams} from "../src/types/Market.sol";
import {TestToken} from "../script/testnet/TestToken.sol";
import {FixedPriceOracle} from "../script/testnet/FixedPriceOracle.sol";

/// @notice Runs the testnet deploy in-process and drives a full user flow through it.
contract DeployBaseSepoliaTest is Test {
    DeployBaseSepolia.Deployed d;
    DeployBaseSepolia script;
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        script = new DeployBaseSepolia();
        d = script.deploy(address(this));
    }

    function _wethParams() internal view returns (MarketParams memory) {
        return MarketParams({
            loanToken: address(d.usdc),
            collateralToken: address(d.weth),
            oracle: IOracle(address(d.wethOracle)),
            irm: IInterestRateModel(address(d.irm)),
            lltv: 0.86e18,
            liquidationBonus: 0.05e18,
            maxStaleness: 7 days
        });
    }

    function test_marketsAreCreated() public view {
        assertTrue(d.core.isCreated(d.wethMarket));
        assertTrue(d.core.isCreated(d.wbtcMarket));
        assertEq(d.core.idOf(_wethParams()), d.wethMarket);
        assertEq(address(d.view_.core()), address(d.core));
    }

    function test_supplyBorrowRepayFlow() public {
        MarketParams memory p = _wethParams();

        vm.startPrank(alice);
        d.usdc.mint(alice, 100_000e6);
        d.usdc.approve(address(d.core), type(uint256).max);
        d.core.supply(p, 100_000e6, alice);
        vm.stopPrank();

        vm.startPrank(bob);
        d.weth.mint(bob, 10e18);
        d.weth.approve(address(d.core), type(uint256).max);
        d.core.supplyCollateral(p, 10e18, bob);
        // 10 WETH at 3,000 is 30,000 USDC of collateral, 86% LLTV allows 25,800.
        d.core.borrow(p, 20_000e6, bob, bob);
        assertEq(d.usdc.balanceOf(bob), 20_000e6);
        vm.expectRevert(LendingCore.Unhealthy.selector);
        d.core.borrow(p, 6_000e6, bob, bob);

        d.usdc.approve(address(d.core), type(uint256).max);
        d.core.repay(p, 20_000e6, bob);
        vm.stopPrank();
    }

    function test_priceDropMakesPositionLiquidatable() public {
        MarketParams memory p = _wethParams();
        d.usdc.mint(address(this), 100_000e6);
        d.usdc.approve(address(d.core), type(uint256).max);
        d.core.supply(p, 100_000e6, address(this));

        vm.startPrank(bob);
        d.weth.mint(bob, 10e18);
        d.weth.approve(address(d.core), type(uint256).max);
        d.core.supplyCollateral(p, 10e18, bob);
        d.core.borrow(p, 25_000e6, bob, bob);
        vm.stopPrank();

        d.wethOracle.setPrice(2000e6 * 1e36 / 1e18);
        d.usdc.mint(address(this), 50_000e6);
        d.core.liquidate(p, bob, address(this));
        assertGt(d.weth.balanceOf(address(this)), 0);
    }

    function test_faucetCapReverts() public {
        vm.expectRevert(TestToken.MintTooLarge.selector);
        d.usdc.mint(alice, 100_001e6);
    }

    function test_oracleOnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(FixedPriceOracle.NotOwner.selector);
        d.wethOracle.setPrice(1);
    }

    function test_oracleRejectsZero() public {
        vm.expectRevert(FixedPriceOracle.ZeroPrice.selector);
        d.wethOracle.setPrice(0);
    }

    function testFuzz_faucetMintWithinCap(uint256 amount) public {
        amount = bound(amount, 0, d.weth.maxMintPerCall());
        d.weth.mint(alice, amount);
        assertEq(d.weth.balanceOf(alice), amount);
    }
}

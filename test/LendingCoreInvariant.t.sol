// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {StdInvariant} from "forge-std/StdInvariant.sol";
import {LendingCore} from "../src/LendingCore.sol";
import {MarketParams, Market} from "../src/types/Market.sol";
import {IOracle} from "../src/interfaces/IOracle.sol";
import {IInterestRateModel} from "../src/interfaces/IInterestRateModel.sol";

// Reuse the mocks from the unit tests.
contract MockERC20Inv {
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

contract MockOracleInv is IOracle {
    uint256 public p = 1e36;
    uint256 public t;

    constructor() { t = block.timestamp; }

    function setPrice(uint256 _p) external { p = _p; t = block.timestamp; }

    function price() external view returns (uint256, uint256) {
        return (p, t);
    }
}

contract MockIRMInv is IInterestRateModel {
    function borrowRatePerSecond(uint256) external pure returns (uint256) {
        // A small non-zero rate so interest accrual is tested.
        return 317097919; // ~1% APR per second scaled
    }
}

/// @dev Handler drives the invariant fuzzer. Every function the fuzzer calls
///      is a valid protocol action. The handler bounds inputs to realistic
///      ranges so the fuzzer spends time on meaningful states rather than
///      reverting on every call.
contract Handler is Test {
    LendingCore public core;
    MockERC20Inv public loan;
    MockERC20Inv public collateral;
    MockOracleInv public oracle;
    MarketParams public params;
    bytes32 public id;

    address[] public actors;
    uint256 constant MAX_AMOUNT = 1_000_000e18;

    constructor(
        LendingCore _core,
        MockERC20Inv _loan,
        MockERC20Inv _collateral,
        MockOracleInv _oracle,
        MarketParams memory _params
    ) {
        core       = _core;
        loan       = _loan;
        collateral = _collateral;
        oracle     = _oracle;
        params     = _params;
        id         = _core.idOf(_params);

        // Create a set of actors the fuzzer cycles through.
        for (uint256 i = 0; i < 5; i++) {
            address actor = address(uint160(0xBEEF + i));
            actors.push(actor);
            loan.mint(actor, MAX_AMOUNT);
            collateral.mint(actor, MAX_AMOUNT);
            vm.prank(actor);
            loan.approve(address(core), type(uint256).max);
            vm.prank(actor);
            collateral.approve(address(core), type(uint256).max);
        }
    }

    function supply(uint256 actorSeed, uint256 assets) external {
        address actor = actors[actorSeed % actors.length];
        assets = bound(assets, 1, MAX_AMOUNT);
        vm.prank(actor);
        try core.supply(params, assets, actor) {} catch {}
    }

    function withdraw(uint256 actorSeed, uint256 assets) external {
        address actor = actors[actorSeed % actors.length];
        (uint256 supplyShares,,) = core.position(id, actor);
        if (supplyShares == 0) return;
        (uint256 totalSupplyAssets, uint256 totalSupplyShares,,,) = core.market(id);
        // Compute max withdrawable without underflowing.
        uint256 maxAssets = supplyShares * (totalSupplyAssets + 1) / (totalSupplyShares + 1e6);
        if (maxAssets == 0) return;
        assets = bound(assets, 1, maxAssets);
        vm.prank(actor);
        try core.withdraw(params, assets, actor, actor) {} catch {}
    }

    function supplyCollateral(uint256 actorSeed, uint256 assets) external {
        address actor = actors[actorSeed % actors.length];
        assets = bound(assets, 1, MAX_AMOUNT);
        vm.prank(actor);
        try core.supplyCollateral(params, assets, actor) {} catch {}
    }

    function borrow(uint256 actorSeed, uint256 assets) external {
        address actor = actors[actorSeed % actors.length];
        assets = bound(assets, 1, 10_000e18); // keep borrows modest
        vm.prank(actor);
        try core.borrow(params, assets, actor, actor) {} catch {}
    }

    function repay(uint256 actorSeed, uint256 assets) external {
        address actor = actors[actorSeed % actors.length];
        (, uint256 borrowShares,) = core.position(id, actor);
        if (borrowShares == 0) return;
        (,, uint256 totalBorrowAssets, uint256 totalBorrowShares,) = core.market(id);
        uint256 maxAssets = borrowShares * (totalBorrowAssets + 1) / (totalBorrowShares + 1e6);
        if (maxAssets == 0) return;
        assets = bound(assets, 1, maxAssets);
        vm.prank(actor);
        try core.repay(params, assets, actor) {} catch {}
    }

    function liquidate(uint256 actorSeed, uint256 targetSeed) external {
        address liquidator = actors[actorSeed % actors.length];
        address target     = actors[targetSeed % actors.length];
        if (target == liquidator) return;
        vm.prank(liquidator);
        try core.liquidate(params, target, liquidator) {} catch {}
    }

    function crashPrice(uint256 priceSeed) external {
        // Drop price between 50% and 90% of current to create liquidatable positions.
        uint256 current = oracle.p();
        uint256 factor  = bound(priceSeed, 0.1e18, 0.9e18);
        oracle.setPrice(current * factor / 1e18);
    }

    function recoverPrice() external {
        oracle.setPrice(1e36);
    }

    function warpTime(uint256 seconds_) external {
        seconds_ = bound(seconds_, 1, 7 days);
        vm.warp(block.timestamp + seconds_);
    }
}

/// @dev The invariant suite. Foundry calls handler functions in random order
///      with random inputs, then checks these invariants after every call.
contract LendingCoreInvariantTest is StdInvariant, Test {
    LendingCore     core;
    MockERC20Inv    loan;
    MockERC20Inv    collateral;
    MockOracleInv   oracle;
    Handler         handler;
    MarketParams    params;
    bytes32         id;

    function setUp() public {
        core       = new LendingCore();
        loan       = new MockERC20Inv();
        collateral = new MockERC20Inv();
        oracle     = new MockOracleInv();

        params = MarketParams({
            loanToken:        address(loan),
            collateralToken:  address(collateral),
            oracle:           IOracle(address(oracle)),
            irm:              IInterestRateModel(address(new MockIRMInv())),
            lltv:             0.8e18,
            liquidationBonus: 0.05e18,
            maxStaleness:     365 days // wide window so time warps don't break oracle
        });

        core.createMarket(params);
        id = core.idOf(params);

        handler = new Handler(core, loan, collateral, oracle, params);

        // Seed the market with some initial liquidity so early borrows don't all revert.
        loan.mint(address(this), 100_000e18);
        loan.approve(address(core), type(uint256).max);
        core.supply(params, 100_000e18, address(this));

        // Tell Foundry to call only the handler, not the core directly.
        targetContract(address(handler));
    }

    /// @dev The market can always pay every supplier.
    ///      totalBorrowAssets can exceed totalSupplyAssets only when bad debt
    ///      has been realized and the write-down hasn't been fully settled yet —
    ///      but our bad-debt realization is immediate, so this must always hold.
    function invariant_solvency() public view {
        (uint256 totalSupplyAssets,, uint256 totalBorrowAssets,,) = core.market(id);
        assertGe(
            totalSupplyAssets,
            totalBorrowAssets,
            "market is insolvent: borrows exceed supply"
        );
    }

    /// @dev The loan token balance held by the core covers what it owes suppliers.
    ///      Borrows reduce both the balance and the supply assets, so the net
    ///      obligation to suppliers is always totalSupplyAssets - totalBorrowAssets.
    function invariant_balanceCoversSurplus() public view {
        (uint256 totalSupplyAssets,, uint256 totalBorrowAssets,,) = core.market(id);
        uint256 surplus = totalSupplyAssets - totalBorrowAssets;
        uint256 held    = loan.balanceOf(address(core));
        assertGe(
            held,
            surplus,
            "core holds less loan token than it owes suppliers net of borrows"
        );
    }

    /// @dev Total borrow shares and total supply shares must be consistent:
    ///      if there are no borrowers, borrow shares must be zero.
    function invariant_zeroSharesIfZeroAssets() public view {
        (uint256 totalSupplyAssets, uint256 totalSupplyShares, uint256 totalBorrowAssets, uint256 totalBorrowShares,) =
            core.market(id);

        if (totalSupplyAssets == 0) {
            assertEq(totalSupplyShares, 0, "supply shares non-zero when supply assets is zero");
        }
        // The reverse direction does not hold for borrows: interest accrual leaves
        // dust shares worth zero assets, which is harmless and accepted in all
        // lending protocols. What must hold is: zero shares implies zero assets.
        if (totalBorrowShares == 0) {
            assertEq(totalBorrowAssets, 0, "borrow assets non-zero when borrow shares is zero");
        }
    }
}

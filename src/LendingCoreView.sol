// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {LendingCore} from "./LendingCore.sol";
import {MarketParams, Market, Position} from "./types/Market.sol";
import {SharesMath} from "./libraries/SharesMath.sol";
import {HealthMath} from "./libraries/HealthMath.sol";
import {OracleLib} from "./libraries/OracleLib.sol";

/// @title LendingCoreView
/// @notice Read-only helper for frontends, bots, and integrators.
/// @dev Stateless view functions that compute derived values from LendingCore.
///      Deployed separately to keep the core contract minimal.
contract LendingCoreView {
    using SharesMath for uint256;

    LendingCore public immutable core;

    constructor(address _core) {
        core = LendingCore(_core);
    }

    /// @notice Get the current health factor of a position.
    /// @param params Market parameters.
    /// @param user The position owner.
    /// @return healthFactor Scaled by 1e18. >= 1e18 is healthy, < 1e18 is liquidatable.
    ///         Returns type(uint256).max if no debt.
    function getPositionHealth(MarketParams memory params, address user)
        external
        view
        returns (uint256 healthFactor)
    {
        bytes32 id = core.idOf(params);
        (uint256 supplyShares, uint256 borrowShares, uint256 collateral) = core.position(id, user);

        if (borrowShares == 0) return type(uint256).max;

        (uint256 totalSupplyAssets, uint256 totalSupplyShares, uint256 totalBorrowAssets, uint256 totalBorrowShares,) = core.market(id);

        uint256 borrowed = borrowShares.toAssetsUp(totalBorrowAssets, totalBorrowShares);
        uint256 price = OracleLib.fetchPrice(params.oracle, params.maxStaleness);
        uint256 maxBorrow = HealthMath.maxBorrow(collateral, price, params.lltv);

        // healthFactor = maxBorrow / borrowed, scaled by 1e18
        return (maxBorrow * 1e18) / borrowed;
    }

    /// @notice Get the maximum amount a user can borrow given their current collateral.
    /// @param params Market parameters.
    /// @param user The position owner.
    /// @return maxBorrowable The maximum additional loan assets the user can borrow.
    function getMaxBorrow(MarketParams memory params, address user)
        external
        view
        returns (uint256 maxBorrowable)
    {
        bytes32 id = core.idOf(params);
        (, uint256 borrowShares, uint256 collateral) = core.position(id, user);
        (,, uint256 totalBorrowAssets, uint256 totalBorrowShares,) = core.market(id);

        uint256 currentDebt = borrowShares.toAssetsUp(totalBorrowAssets, totalBorrowShares);
        uint256 price = OracleLib.fetchPrice(params.oracle, params.maxStaleness);
        uint256 maxDebt = HealthMath.maxBorrow(collateral, price, params.lltv);

        if (maxDebt <= currentDebt) return 0;
        return maxDebt - currentDebt;
    }

    /// @notice Get the price at which a position becomes liquidatable.
    /// @param params Market parameters.
    /// @param user The position owner.
    /// @return liquidationPrice The 1e36-scaled price at which health factor = 1.
    ///         Returns 0 if no debt, type(uint256).max if no collateral.
    function getLiquidationPrice(MarketParams memory params, address user)
        external
        view
        returns (uint256 liquidationPrice)
    {
        bytes32 id = core.idOf(params);
        (, uint256 borrowShares, uint256 collateral) = core.position(id, user);
        (,, uint256 totalBorrowAssets, uint256 totalBorrowShares,) = core.market(id);

        if (borrowShares == 0) return 0;
        if (collateral == 0) return type(uint256).max;

        uint256 borrowed = borrowShares.toAssetsUp(totalBorrowAssets, totalBorrowShares);

        // At liquidation: borrowed = collateral * price / 1e36 * lltv / 1e18
        // Solving for price: price = borrowed * 1e36 * 1e18 / (collateral * lltv)
        return (borrowed * 1e36 * 1e18) / (collateral * params.lltv);
    }

    /// @notice Get the user's supply balance in asset terms.
    /// @param params Market parameters.
    /// @param user The position owner.
    /// @return assets The current value of the user's supply shares.
    function getSupplyBalance(MarketParams memory params, address user)
        external
        view
        returns (uint256 assets)
    {
        bytes32 id = core.idOf(params);
        (uint256 supplyShares,,) = core.position(id, user);
        (uint256 totalSupplyAssets, uint256 totalSupplyShares,,,) = core.market(id);

        return supplyShares.toAssetsDown(totalSupplyAssets, totalSupplyShares);
    }

    /// @notice Get the user's borrow balance in asset terms.
    /// @param params Market parameters.
    /// @param user The position owner.
    /// @return assets The current debt owed by the user.
    function getBorrowBalance(MarketParams memory params, address user)
        external
        view
        returns (uint256 assets)
    {
        bytes32 id = core.idOf(params);
        (, uint256 borrowShares,) = core.position(id, user);
        (,, uint256 totalBorrowAssets, uint256 totalBorrowShares,) = core.market(id);

        return borrowShares.toAssetsUp(totalBorrowAssets, totalBorrowShares);
    }

    /// @notice Get the current utilization rate of a market.
    /// @param params Market parameters.
    /// @return utilization Scaled by 1e18 (0 to 1e18).
    function getUtilization(MarketParams memory params)
        external
        view
        returns (uint256 utilization)
    {
        bytes32 id = core.idOf(params);
        (uint256 totalSupplyAssets,, uint256 totalBorrowAssets,,) = core.market(id);

        if (totalSupplyAssets == 0) return 0;
        return (totalBorrowAssets * 1e18) / totalSupplyAssets;
    }

    /// @notice Get the current borrow APR for a market.
    /// @param params Market parameters.
    /// @return aprBps Annual percentage rate in basis points (1% = 100).
    function getBorrowAPR(MarketParams memory params)
        external
        view
        returns (uint256 aprBps)
    {
        bytes32 id = core.idOf(params);
        (uint256 totalSupplyAssets,, uint256 totalBorrowAssets,,) = core.market(id);

        uint256 utilization = totalSupplyAssets == 0 ? 0 : (totalBorrowAssets * 1e18) / totalSupplyAssets;
        uint256 ratePerSecond = params.irm.borrowRatePerSecond(utilization);

        // APR = rate * seconds per year * 10000 / 1e18
        return (ratePerSecond * 365 days * 10000) / 1e18;
    }

    /// @notice Get the current supply APR for a market.
    /// @param params Market parameters.
    /// @return aprBps Annual percentage rate in basis points (1% = 100).
    function getSupplyAPR(MarketParams memory params)
        external
        view
        returns (uint256 aprBps)
    {
        bytes32 id = core.idOf(params);
        (uint256 totalSupplyAssets,, uint256 totalBorrowAssets,,) = core.market(id);

        if (totalSupplyAssets == 0) return 0;

        uint256 utilization = (totalBorrowAssets * 1e18) / totalSupplyAssets;
        uint256 ratePerSecond = params.irm.borrowRatePerSecond(utilization);

        // Supply APR = Borrow APR * utilization (interest goes to suppliers)
        uint256 borrowApr = (ratePerSecond * 365 days * 10000) / 1e18;
        return (borrowApr * utilization) / 1e18;
    }
}

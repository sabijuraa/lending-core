// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {FixedPointMathLib} from "solady/utils/FixedPointMathLib.sol";

/// @title HealthMath
/// @notice The single solvency rule: a position is healthy when its debt does not
///         exceed its collateral value times the market's LLTV.
/// @dev Price is 1e36-scaled, LLTV is 1e18-scaled. Collateral value rounds down and is
///      compared against debt that has already been rounded up elsewhere, so every
///      rounding choice keeps a healthy position provably solvent rather than optimistic.
library HealthMath {
    uint256 internal constant WAD = 1e18;
    uint256 internal constant PRICE_SCALE = 1e36;

    /// @notice Maximum the position may owe while still healthy.
    /// @param collateral Units of collateral.
    /// @param price 1e36-scaled price of one collateral unit in loan-asset terms.
    /// @param lltv 1e18-scaled liquidation loan-to-value.
    function maxBorrow(uint256 collateral, uint256 price, uint256 lltv)
        internal
        pure
        returns (uint256)
    {
        // collateral * price / 1e36 gives collateral value in loan-asset units; times lltv.
        uint256 value = FixedPointMathLib.fullMulDiv(collateral, price, PRICE_SCALE);
        return FixedPointMathLib.fullMulDiv(value, lltv, WAD);
    }

    /// @notice True if `borrowed` is within the borrowing power of the collateral.
    function isHealthy(uint256 borrowed, uint256 collateral, uint256 price, uint256 lltv)
        internal
        pure
        returns (bool)
    {
        return borrowed <= maxBorrow(collateral, price, lltv);
    }
}

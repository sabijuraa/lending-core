// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {FixedPointMathLib} from "solady/utils/FixedPointMathLib.sol";

/// @title SharesMath
/// @notice Asset/share conversions for supply and debt accounting.
/// @dev Interest accrues to the share price, so positions revalue in O(1).
///      Rounding direction is chosen per call site: the protocol keeps the
///      remainder, never the caller. Virtual offsets neutralise the empty-market
///      inflation attack. Full 512-bit mulDiv means intermediate products never
///      overflow. See THREAT_MODEL.md.
library SharesMath {
    uint256 internal constant VIRTUAL_SHARES = 1e6;
    uint256 internal constant VIRTUAL_ASSETS = 1;

    function toSharesDown(uint256 assets, uint256 totalAssets, uint256 totalShares)
        internal pure returns (uint256)
    {
        return FixedPointMathLib.fullMulDiv(assets, totalShares + VIRTUAL_SHARES, totalAssets + VIRTUAL_ASSETS);
    }

    function toSharesUp(uint256 assets, uint256 totalAssets, uint256 totalShares)
        internal pure returns (uint256)
    {
        return FixedPointMathLib.fullMulDivUp(assets, totalShares + VIRTUAL_SHARES, totalAssets + VIRTUAL_ASSETS);
    }

    function toAssetsDown(uint256 shares, uint256 totalAssets, uint256 totalShares)
        internal pure returns (uint256)
    {
        return FixedPointMathLib.fullMulDiv(shares, totalAssets + VIRTUAL_ASSETS, totalShares + VIRTUAL_SHARES);
    }

    function toAssetsUp(uint256 shares, uint256 totalAssets, uint256 totalShares)
        internal pure returns (uint256)
    {
        return FixedPointMathLib.fullMulDivUp(shares, totalAssets + VIRTUAL_ASSETS, totalShares + VIRTUAL_SHARES);
    }
}

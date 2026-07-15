// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/// @title SharesMath
/// @notice Asset/share conversions for supply and debt accounting.
/// @dev Interest accrues to the share price, so positions revalue in O(1).
///      Rounding direction is chosen per call site: the protocol keeps the
///      remainder, never the caller. Virtual offsets neutralise the empty-market
///      inflation attack. See THREAT_MODEL.md.
library SharesMath {
    uint256 internal constant VIRTUAL_SHARES = 1e6;
    uint256 internal constant VIRTUAL_ASSETS = 1;

    /// @dev Issuing shares to a caller: they get no more than they paid for.
    function toSharesDown(uint256 assets, uint256 totalAssets, uint256 totalShares)
        internal
        pure
        returns (uint256)
    {
        return mulDivDown(assets, totalShares + VIRTUAL_SHARES, totalAssets + VIRTUAL_ASSETS);
    }

    /// @dev Burning a caller's shares to settle assets: they give up at least the value.
    function toSharesUp(uint256 assets, uint256 totalAssets, uint256 totalShares)
        internal
        pure
        returns (uint256)
    {
        return mulDivUp(assets, totalShares + VIRTUAL_SHARES, totalAssets + VIRTUAL_ASSETS);
    }

    /// @dev Paying assets out: the market pays no more than the shares are worth.
    function toAssetsDown(uint256 shares, uint256 totalAssets, uint256 totalShares)
        internal
        pure
        returns (uint256)
    {
        return mulDivDown(shares, totalAssets + VIRTUAL_ASSETS, totalShares + VIRTUAL_SHARES);
    }

    /// @dev Valuing debt: never understated.
    function toAssetsUp(uint256 shares, uint256 totalAssets, uint256 totalShares)
        internal
        pure
        returns (uint256)
    {
        return mulDivUp(shares, totalAssets + VIRTUAL_ASSETS, totalShares + VIRTUAL_SHARES);
    }

    function mulDivDown(uint256 x, uint256 y, uint256 d) internal pure returns (uint256) {
        return (x * y) / d;
    }

    function mulDivUp(uint256 x, uint256 y, uint256 d) internal pure returns (uint256) {
        return (x * y + (d - 1)) / d;
    }
}

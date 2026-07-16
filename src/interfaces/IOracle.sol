// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/// @notice Reports the price of one unit of collateral in terms of the loan asset.
/// @dev An untrusted input, never treated as truth. The core checks the result for
///      staleness and sanity before using it, and never derives price from its own
///      balances. See docs/adr/0006.
interface IOracle {
    /// @notice Price of 1 unit of collateral denominated in the loan asset, scaled by 1e36.
    /// @return price The price, 1e36-scaled.
    /// @return updatedAt Unix timestamp of the price's last update.
    function price() external view returns (uint256 price, uint256 updatedAt);
}

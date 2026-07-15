// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/// @notice Rate models are chosen per market from an approved set. The core calls
///         this and never unknown code. See docs/adr/0004.
interface IInterestRateModel {
    /// @notice Per-second borrow rate, scaled by 1e18, for a given utilization.
    /// @param utilization Fraction borrowed, scaled by 1e18 (0 to 1e18).
    function borrowRatePerSecond(uint256 utilization) external view returns (uint256);
}

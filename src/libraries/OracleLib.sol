// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IOracle} from "../interfaces/IOracle.sol";

/// @title OracleLib
/// @notice Reads an oracle and fails closed on any price it cannot trust.
/// @dev Failing closed protects against operating on a manipulated or stale price. It
///      also halts liquidations while the feed is bad, so during a fast crash with a
///      lagging feed a market can take bad debt. Conservative LLTVs are the
///      compensation. See docs/adr/0006.
library OracleLib {
    error StalePrice();
    error ZeroPrice();

    /// @notice Fetch a fresh, non-zero price or revert.
    /// @param oracle The market's oracle.
    /// @param maxStaleness Maximum age of a price, in seconds, before it is rejected.
    /// @return price The 1e36-scaled price.
    function fetchPrice(IOracle oracle, uint256 maxStaleness) internal view returns (uint256) {
        (uint256 price, uint256 updatedAt) = oracle.price();

        if (price == 0) revert ZeroPrice();
        // updatedAt in the future is treated as invalid, not fresh: a feed that reports
        // a timestamp ahead of the block is misbehaving and is not trusted.
        if (updatedAt > block.timestamp) revert StalePrice();
        if (block.timestamp - updatedAt > maxStaleness) revert StalePrice();

        return price;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IOracle} from "../interfaces/IOracle.sol";

/// @notice Chainlink's aggregator interface (subset we need).
interface IAggregatorV3 {
    function decimals() external view returns (uint8);
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

/// @title ChainlinkOracleAdapter
/// @notice Wraps two Chainlink feeds (collateral/USD and loan/USD) into a single
///         collateral/loan price, scaled to 1e36.
/// @dev Validates round completeness, sequence, and positive price. The lending
///      core adds staleness checks on top. Decimal normalization handles any
///      Chainlink feed (8, 18, etc.). See docs/adr/0006.
contract ChainlinkOracleAdapter is IOracle {
    error InvalidPrice();
    error IncompleteRound();

    IAggregatorV3 public immutable collateralFeed;
    IAggregatorV3 public immutable loanFeed;

    uint256 internal immutable collateralScale;
    uint256 internal immutable loanScale;

    /// @param _collateralFeed Chainlink feed for collateral/USD.
    /// @param _loanFeed Chainlink feed for loan/USD.
    constructor(address _collateralFeed, address _loanFeed) {
        collateralFeed = IAggregatorV3(_collateralFeed);
        loanFeed = IAggregatorV3(_loanFeed);

        collateralScale = 10 ** collateralFeed.decimals();
        loanScale = 10 ** loanFeed.decimals();
    }

    /// @inheritdoc IOracle
    function price() external view returns (uint256, uint256) {
        (uint256 collateralPrice, uint256 collateralUpdatedAt) = _fetchFeed(collateralFeed);
        (uint256 loanPrice, uint256 loanUpdatedAt) = _fetchFeed(loanFeed);

        // Price = (collateralPrice / collateralScale) / (loanPrice / loanScale)
        // Scaled by 1e36: price = collateralPrice * loanScale * 1e36 / (loanPrice * collateralScale)
        uint256 scaledPrice = (collateralPrice * loanScale * 1e36) / (loanPrice * collateralScale);

        // Return the older of the two timestamps so staleness check uses worst case.
        uint256 updatedAt = collateralUpdatedAt < loanUpdatedAt ? collateralUpdatedAt : loanUpdatedAt;

        return (scaledPrice, updatedAt);
    }

    function _fetchFeed(IAggregatorV3 feed) internal view returns (uint256 feedPrice, uint256 updatedAt) {
        (
            uint80 roundId,
            int256 answer,
            ,
            uint256 updatedAt_,
            uint80 answeredInRound
        ) = feed.latestRoundData();

        // Chainlink returns 0 for invalid rounds.
        if (answer <= 0) revert InvalidPrice();
        // answeredInRound must equal roundId for a complete round.
        if (answeredInRound < roundId) revert IncompleteRound();

        return (uint256(answer), updatedAt_);
    }
}

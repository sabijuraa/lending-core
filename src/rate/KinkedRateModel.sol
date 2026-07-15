// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IInterestRateModel} from "../interfaces/IInterestRateModel.sol";

/// @title KinkedRateModel
/// @notice Two-slope borrow curve. Gentle below a target utilization, steep above it.
/// @dev The steep upper slope is a control mechanism, not a fee: as a market runs out
///      of withdrawable liquidity the rate climbs hard, pushing borrowers to repay and
///      pulling suppliers in, which forces utilization back toward the kink. Parameters
///      are immutable. See docs/adr/0005.
contract KinkedRateModel is IInterestRateModel {
    uint256 internal constant WAD = 1e18;

    /// @notice Utilization at the kink, scaled by 1e18.
    uint256 public immutable kink;
    /// @notice Per-second rate at zero utilization, scaled by 1e18.
    uint256 public immutable baseRatePerSecond;
    /// @notice Per-second rate at the kink, scaled by 1e18.
    uint256 public immutable rateAtKinkPerSecond;
    /// @notice Per-second rate at full utilization, scaled by 1e18.
    uint256 public immutable rateAtMaxPerSecond;

    error KinkOutOfRange();
    error RatesNotMonotonic();

    constructor(
        uint256 _kink,
        uint256 _baseRatePerSecond,
        uint256 _rateAtKinkPerSecond,
        uint256 _rateAtMaxPerSecond
    ) {
        if (_kink == 0 || _kink >= WAD) revert KinkOutOfRange();
        // The curve must never bend downward, or higher utilization could cost less,
        // which inverts the control mechanism.
        if (_baseRatePerSecond > _rateAtKinkPerSecond || _rateAtKinkPerSecond > _rateAtMaxPerSecond) {
            revert RatesNotMonotonic();
        }
        kink = _kink;
        baseRatePerSecond = _baseRatePerSecond;
        rateAtKinkPerSecond = _rateAtKinkPerSecond;
        rateAtMaxPerSecond = _rateAtMaxPerSecond;
    }

    /// @inheritdoc IInterestRateModel
    function borrowRatePerSecond(uint256 utilization) external view returns (uint256) {
        if (utilization > WAD) utilization = WAD;

        if (utilization <= kink) {
            // Linear from base to the kink rate across [0, kink].
            uint256 slope = rateAtKinkPerSecond - baseRatePerSecond;
            return baseRatePerSecond + (slope * utilization) / kink;
        }

        // Linear from the kink rate to the max rate across [kink, WAD].
        uint256 upperSlope = rateAtMaxPerSecond - rateAtKinkPerSecond;
        uint256 excess = utilization - kink;
        return rateAtKinkPerSecond + (upperSlope * excess) / (WAD - kink);
    }
}

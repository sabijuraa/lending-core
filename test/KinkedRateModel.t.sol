// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {KinkedRateModel} from "../src/rate/KinkedRateModel.sol";

/// @dev The curve's job is to never bend downward and to hit its three anchor points
///      exactly. A downward bend anywhere would let higher utilization cost less, which
///      breaks the mechanism the whole model exists for.
contract KinkedRateModelTest is Test {
    uint256 constant WAD = 1e18;

    // A representative curve: kink at 80%, rising from a low base to a steep max.
    uint256 constant KINK = 0.8e18;
    uint256 constant BASE = 1e9;              // per-second
    uint256 constant AT_KINK = 5e9;
    uint256 constant AT_MAX = 200e9;

    KinkedRateModel model;

    function setUp() public {
        model = new KinkedRateModel(KINK, BASE, AT_KINK, AT_MAX);
    }

    function test_AnchorPoints() public view {
        assertEq(model.borrowRatePerSecond(0), BASE, "rate at zero utilization");
        assertEq(model.borrowRatePerSecond(KINK), AT_KINK, "rate at the kink");
        assertEq(model.borrowRatePerSecond(WAD), AT_MAX, "rate at full utilization");
    }

    function test_UtilizationAboveOneClampsToMax() public view {
        assertEq(model.borrowRatePerSecond(WAD + 1), AT_MAX, "over-full clamps to max");
    }

    function test_RejectsInvalidKink() public {
        vm.expectRevert(KinkedRateModel.KinkOutOfRange.selector);
        new KinkedRateModel(0, BASE, AT_KINK, AT_MAX);
        vm.expectRevert(KinkedRateModel.KinkOutOfRange.selector);
        new KinkedRateModel(WAD, BASE, AT_KINK, AT_MAX);
    }

    function test_RejectsDownwardCurve() public {
        vm.expectRevert(KinkedRateModel.RatesNotMonotonic.selector);
        new KinkedRateModel(KINK, AT_KINK, BASE, AT_MAX); // base > kink rate
    }

    /// forge-config: default.fuzz.runs = 10000
    function testFuzz_NeverBendsDownward(uint256 lower, uint256 higher) public view {
        lower = bound(lower, 0, WAD);
        higher = bound(higher, lower, WAD);
        // More utilization must never cost less. This is the property the whole model
        // exists to guarantee.
        assertGe(
            model.borrowRatePerSecond(higher),
            model.borrowRatePerSecond(lower),
            "rate fell as utilization rose"
        );
    }

    /// forge-config: default.fuzz.runs = 10000
    function testFuzz_StaysWithinAnchors(uint256 utilization) public view {
        utilization = bound(utilization, 0, WAD);
        uint256 rate = model.borrowRatePerSecond(utilization);
        assertGe(rate, BASE, "rate below base");
        assertLe(rate, AT_MAX, "rate above max");
    }

    /// forge-config: default.fuzz.runs = 5000
    function testFuzz_UpperSegmentIsSteeperThanLower(uint256 belowKink, uint256 aboveKink)
        public
        view
    {
        // A step of the same size costs more above the kink than below it. This is what
        // "steep above, gentle below" means, made into a checkable property.
        belowKink = bound(belowKink, 0, KINK - 1);
        aboveKink = bound(aboveKink, KINK, WAD - 1);

        uint256 step = 1e15; // 0.1% of utilization
        if (belowKink + step > KINK) belowKink = KINK - step;
        if (aboveKink + step > WAD) aboveKink = WAD - step;

        uint256 lowerRise =
            model.borrowRatePerSecond(belowKink + step) - model.borrowRatePerSecond(belowKink);
        uint256 upperRise =
            model.borrowRatePerSecond(aboveKink + step) - model.borrowRatePerSecond(aboveKink);

        assertGe(upperRise, lowerRise, "upper segment was not steeper than lower");
    }
}

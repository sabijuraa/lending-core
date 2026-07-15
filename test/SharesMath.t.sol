// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {SharesMath} from "../src/libraries/SharesMath.sol";

/// @dev Properties an attacker would try to break. Rounding that favours the caller
///      by one wei is a drain when the call is cheap and repeatable, so these assert
///      direction, not approximate value.
contract SharesMathTest is Test {
    uint256 constant MAX = 1e30;

    function test_InflationAttack_DonationCannotZeroOutTheNextDeposit() public pure {
        // Seed one wei of shares into an empty market, donate a large balance to inflate
        // the share price. Without virtual offsets the next deposit rounds to zero.
        uint256 attackerShares = SharesMath.toSharesDown(1, 0, 0);
        uint256 victimShares = SharesMath.toSharesDown(1e18, 1 + 1e18, attackerShares);

        assertGt(victimShares, 0, "victim received zero shares after a donation");
    }

    /// forge-config: default.fuzz.runs = 10000
    function testFuzz_RoundTripNeverReturnsMoreThanItTook(
        uint256 assets,
        uint256 totalAssets,
        uint256 totalShares
    ) public pure {
        assets = bound(assets, 1, MAX);
        totalAssets = bound(totalAssets, 0, MAX);
        totalShares = bound(totalShares, 0, MAX);

        uint256 shares = SharesMath.toSharesDown(assets, totalAssets, totalShares);
        uint256 returned =
            SharesMath.toAssetsDown(shares, totalAssets + assets, totalShares + shares);

        assertLe(returned, assets, "round trip returned more than it took in");
    }

    /// forge-config: default.fuzz.runs = 10000
    function testFuzz_DebtIsNeverValuedBelowAssets(
        uint256 shares,
        uint256 totalAssets,
        uint256 totalShares
    ) public pure {
        shares = bound(shares, 1, MAX);
        totalAssets = bound(totalAssets, 0, MAX);
        totalShares = bound(totalShares, shares, MAX);

        uint256 owed = SharesMath.toAssetsUp(shares, totalAssets, totalShares);
        uint256 paidOut = SharesMath.toAssetsDown(shares, totalAssets, totalShares);

        assertGe(owed, paidOut, "debt was valued below the pay-out");
        assertLe(owed - paidOut, 1, "rounding gap exceeded one wei");
    }

    /// forge-config: default.fuzz.runs = 10000
    function testFuzz_MoreAssetsNeverYieldFewerShares(
        uint256 smaller,
        uint256 larger,
        uint256 totalAssets,
        uint256 totalShares
    ) public pure {
        smaller = bound(smaller, 1, MAX);
        larger = bound(larger, smaller, MAX);
        totalAssets = bound(totalAssets, 0, MAX);
        totalShares = bound(totalShares, 0, MAX);

        // An inversion here would let a caller pay more and receive less, or the reverse.
        assertGe(
            SharesMath.toSharesDown(larger, totalAssets, totalShares),
            SharesMath.toSharesDown(smaller, totalAssets, totalShares),
            "a larger deposit produced fewer shares"
        );
    }

    /// forge-config: default.fuzz.runs = 10000
    function testFuzz_UpIsNeverBelowDown(
        uint256 assets,
        uint256 totalAssets,
        uint256 totalShares
    ) public pure {
        assets = bound(assets, 0, MAX);
        totalAssets = bound(totalAssets, 0, MAX);
        totalShares = bound(totalShares, 0, MAX);

        // The two directions must bracket the true value, never cross it.
        assertGe(
            SharesMath.toSharesUp(assets, totalAssets, totalShares),
            SharesMath.toSharesDown(assets, totalAssets, totalShares),
            "rounding up produced fewer shares than rounding down"
        );
    }
}

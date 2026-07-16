// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {HealthMath} from "../src/libraries/HealthMath.sol";

contract HealthMathTest is Test {
    function test_MaxBorrowWorkedExample() public pure {
        // 10 collateral, price 2000 (1e36-scaled), 80% LLTV.
        // value = 10 * 2000 = 20000; borrowing power = 20000 * 0.8 = 16000.
        uint256 max = HealthMath.maxBorrow(10e18, 2000e36, 0.8e18);
        assertEq(max, 16000e18, "borrowing power");
    }

    function test_HealthyAtTheLimit() public pure {
        uint256 max = HealthMath.maxBorrow(10e18, 2000e36, 0.8e18);
        assertTrue(HealthMath.isHealthy(max, 10e18, 2000e36, 0.8e18), "at limit should be healthy");
        assertFalse(HealthMath.isHealthy(max + 1, 10e18, 2000e36, 0.8e18), "one over is unhealthy");
    }

    /// forge-config: default.fuzz.runs = 10000
    function testFuzz_MoreCollateralNeverLowersBorrowingPower(
        uint256 less,
        uint256 more,
        uint256 price,
        uint256 lltv
    ) public pure {
        less = bound(less, 0, 1e30);
        more = bound(more, less, 1e30);
        price = bound(price, 1, 1e40);
        lltv = bound(lltv, 0, 1e18);

        assertGe(
            HealthMath.maxBorrow(more, price, lltv),
            HealthMath.maxBorrow(less, price, lltv),
            "more collateral gave less borrowing power"
        );
    }
}

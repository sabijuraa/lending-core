// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {OracleLib} from "../src/libraries/OracleLib.sol";
import {IOracle} from "../src/interfaces/IOracle.sol";

/// @dev A settable oracle standing in for a real feed, so the tests can drive it into
///      every bad state a real one could reach.
contract MockOracle is IOracle {
    uint256 public p;
    uint256 public t;

    function set(uint256 _p, uint256 _t) external {
        p = _p;
        t = _t;
    }

    function price() external view returns (uint256, uint256) {
        return (p, t);
    }
}

/// @dev Harness exposing the internal library through an external call, so vm.expectRevert
///      has a real call boundary to observe. Testing an internal function directly inlines
///      it and expectRevert cannot see the revert cleanly.
contract OracleHarness {
    function fetch(IOracle oracle, uint256 maxStaleness) external view returns (uint256) {
        return OracleLib.fetchPrice(oracle, maxStaleness);
    }
}

contract OracleLibTest is Test {
    MockOracle oracle;
    OracleHarness harness;
    uint256 constant STALENESS = 1 hours;

    function setUp() public {
        oracle = new MockOracle();
        harness = new OracleHarness();
        vm.warp(1_000_000);
    }

    function test_FreshPriceIsReturned() public {
        oracle.set(2000e36, block.timestamp);
        assertEq(harness.fetch(IOracle(address(oracle)), STALENESS), 2000e36);
    }

    function test_PriceAtExactStalenessBoundIsAccepted() public {
        oracle.set(2000e36, block.timestamp - STALENESS);
        assertEq(harness.fetch(IOracle(address(oracle)), STALENESS), 2000e36);
    }

    function test_RejectsZeroPrice() public {
        oracle.set(0, block.timestamp);
        vm.expectRevert(OracleLib.ZeroPrice.selector);
        harness.fetch(IOracle(address(oracle)), STALENESS);
    }

    function test_RejectsStalePrice() public {
        oracle.set(2000e36, block.timestamp - STALENESS - 1);
        vm.expectRevert(OracleLib.StalePrice.selector);
        harness.fetch(IOracle(address(oracle)), STALENESS);
    }

    function test_RejectsFutureTimestamp() public {
        oracle.set(2000e36, block.timestamp + 1);
        vm.expectRevert(OracleLib.StalePrice.selector);
        harness.fetch(IOracle(address(oracle)), STALENESS);
    }

    /// forge-config: default.fuzz.runs = 10000
    function testFuzz_OnlyFreshNonZeroPricesPass(uint256 price, uint256 age) public {
        price = bound(price, 0, type(uint128).max);
        age = bound(age, 0, 2 * STALENESS);
        oracle.set(price, block.timestamp - age);

        bool shouldPass = price != 0 && age <= STALENESS;

        if (shouldPass) {
            assertEq(harness.fetch(IOracle(address(oracle)), STALENESS), price);
        } else {
            vm.expectRevert();
            harness.fetch(IOracle(address(oracle)), STALENESS);
        }
    }
}

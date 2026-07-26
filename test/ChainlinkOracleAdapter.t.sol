// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {ChainlinkOracleAdapter, IAggregatorV3} from "../src/oracles/ChainlinkOracleAdapter.sol";

contract MockAggregator is IAggregatorV3 {
    uint8 public decimals_;
    int256 public answer_;
    uint256 public updatedAt_;
    uint80 public roundId_;
    uint80 public answeredInRound_;

    constructor(uint8 _decimals) {
        decimals_ = _decimals;
        roundId_ = 1;
        answeredInRound_ = 1;
    }

    function decimals() external view returns (uint8) {
        return decimals_;
    }

    function setAnswer(int256 _answer, uint256 _updatedAt) external {
        answer_ = _answer;
        updatedAt_ = _updatedAt;
        roundId_++;
        answeredInRound_ = roundId_;
    }

    function setIncompleteRound() external {
        answeredInRound_ = roundId_ - 1;
    }

    function latestRoundData()
        external
        view
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    {
        return (roundId_, answer_, block.timestamp, updatedAt_, answeredInRound_);
    }
}

contract ChainlinkOracleAdapterTest is Test {
    MockAggregator collateralFeed;
    MockAggregator loanFeed;
    ChainlinkOracleAdapter adapter;

    function setUp() public {
        collateralFeed = new MockAggregator(8); // ETH/USD has 8 decimals
        loanFeed = new MockAggregator(8);       // USDC/USD has 8 decimals

        adapter = new ChainlinkOracleAdapter(address(collateralFeed), address(loanFeed));
    }

    function test_PriceCalculation() public {
        // ETH = $2000, USDC = $1
        collateralFeed.setAnswer(2000e8, block.timestamp);
        loanFeed.setAnswer(1e8, block.timestamp);

        (uint256 price, uint256 updatedAt) = adapter.price();

        // Price should be 2000 * 1e36 (1 ETH = 2000 USDC, scaled by 1e36)
        assertEq(price, 2000e36, "wrong price");
        assertEq(updatedAt, block.timestamp, "wrong timestamp");
    }

    function test_DifferentDecimals() public {
        // Loan feed with 18 decimals
        MockAggregator loanFeed18 = new MockAggregator(18);
        ChainlinkOracleAdapter adapter18 = new ChainlinkOracleAdapter(address(collateralFeed), address(loanFeed18));

        collateralFeed.setAnswer(2000e8, block.timestamp);
        loanFeed18.setAnswer(1e18, block.timestamp);

        (uint256 price,) = adapter18.price();
        assertEq(price, 2000e36, "decimal normalization failed");
    }

    function test_ReturnsOlderTimestamp() public {
        collateralFeed.setAnswer(2000e8, block.timestamp - 60);
        loanFeed.setAnswer(1e8, block.timestamp);

        (, uint256 updatedAt) = adapter.price();
        assertEq(updatedAt, block.timestamp - 60, "should return older timestamp");
    }

    function test_RevertsOnZeroPrice() public {
        collateralFeed.setAnswer(0, block.timestamp);
        loanFeed.setAnswer(1e8, block.timestamp);

        vm.expectRevert(ChainlinkOracleAdapter.InvalidPrice.selector);
        adapter.price();
    }

    function test_RevertsOnNegativePrice() public {
        collateralFeed.setAnswer(-1, block.timestamp);
        loanFeed.setAnswer(1e8, block.timestamp);

        vm.expectRevert(ChainlinkOracleAdapter.InvalidPrice.selector);
        adapter.price();
    }

    function test_RevertsOnIncompleteRound() public {
        collateralFeed.setAnswer(2000e8, block.timestamp);
        loanFeed.setAnswer(1e8, block.timestamp);
        collateralFeed.setIncompleteRound();

        vm.expectRevert(ChainlinkOracleAdapter.IncompleteRound.selector);
        adapter.price();
    }

    /// forge-config: default.fuzz.runs = 1000
    function testFuzz_PriceNeverOverflows(uint128 collateralPrice, uint128 loanPrice) public {
        vm.assume(collateralPrice > 0);
        vm.assume(loanPrice > 0);

        collateralFeed.setAnswer(int256(uint256(collateralPrice)), block.timestamp);
        loanFeed.setAnswer(int256(uint256(loanPrice)), block.timestamp);

        // Should not revert due to overflow
        (uint256 price,) = adapter.price();
        assertGt(price, 0, "price should be positive");
    }
}

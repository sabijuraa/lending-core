// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IOracle} from "../interfaces/IOracle.sol";
import {IInterestRateModel} from "../interfaces/IInterestRateModel.sol";

/// @notice The immutable parameters that define a market. Their hash is the market id.
struct MarketParams {
    address loanToken;
    address collateralToken;
    IOracle oracle;
    IInterestRateModel irm;
    uint256 lltv; // liquidation loan-to-value, scaled by 1e18
    uint256 maxStaleness; // max oracle price age in seconds
}

/// @notice The mutable state of a market.
struct Market {
    uint256 totalSupplyAssets;
    uint256 totalSupplyShares;
    uint256 totalBorrowAssets;
    uint256 totalBorrowShares;
    uint256 lastAccrued; // timestamp of the last interest accrual
}

/// @notice A single account's position in a market.
struct Position {
    uint256 supplyShares;
    uint256 borrowShares;
    uint256 collateral;
}

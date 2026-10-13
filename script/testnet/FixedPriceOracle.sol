// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IOracle} from "../../src/interfaces/IOracle.sol";

/// @title FixedPriceOracle
/// @notice Owner-set price for testnet markets where no Chainlink feed exists.
/// @dev Prices follow the IOracle convention of 1e36 scaling between token units.
contract FixedPriceOracle is IOracle {
    error NotOwner();
    error ZeroPrice();

    /// @notice Emitted whenever the owner posts a new price.
    event PriceSet(uint256 price, uint256 updatedAt);

    address public immutable owner;
    uint256 internal _price;
    uint256 internal _updatedAt;

    constructor(address owner_, uint256 price_) {
        owner = owner_;
        _set(price_);
    }

    /// @notice Posts a new price and refreshes the timestamp.
    function setPrice(uint256 price_) external {
        if (msg.sender != owner) revert NotOwner();
        _set(price_);
    }

    /// @inheritdoc IOracle
    function price() external view returns (uint256, uint256) {
        return (_price, _updatedAt);
    }

    function _set(uint256 price_) internal {
        if (price_ == 0) revert ZeroPrice();
        _price = price_;
        _updatedAt = block.timestamp;
        emit PriceSet(price_, block.timestamp);
    }
}

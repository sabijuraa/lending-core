// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {SafeTransferLib} from "solady/utils/SafeTransferLib.sol";
import {SharesMath} from "./libraries/SharesMath.sol";
import {MarketParams, Market, Position} from "./types/Market.sol";

/// @title LendingCore
/// @notice Singleton holding every isolated market. A market is one loan asset, one
///         collateral asset, one oracle, one rate model, one LLTV. See docs/adr.
/// @dev This commit implements market creation, supply, and withdraw. Borrow, health,
///      and liquidation follow. Interest accrual is a hook here with no borrowers to
///      accrue from yet.
contract LendingCore {
    using SharesMath for uint256;

    mapping(bytes32 id => Market) public market;
    mapping(bytes32 id => mapping(address user => Position)) public position;
    mapping(bytes32 id => bool) public isCreated;

    error MarketAlreadyExists();
    error MarketNotCreated();
    error ZeroAssets();
    error ZeroAddress();
    error InsufficientLiquidity();

    event CreateMarket(bytes32 indexed id, MarketParams params);
    event Supply(bytes32 indexed id, address indexed caller, address indexed onBehalf, uint256 assets, uint256 shares);
    event Withdraw(bytes32 indexed id, address indexed caller, address indexed onBehalf, address receiver, uint256 assets, uint256 shares);

    /// @notice The id of a market is the hash of its immutable parameters.
    function idOf(MarketParams memory params) public pure returns (bytes32) {
        return keccak256(abi.encode(params));
    }

    /// @notice Create a market. Permissionless; parameter bounds are enforced elsewhere
    ///         (approved LLTV and rate model) and added with the borrow logic.
    function createMarket(MarketParams memory params) external {
        if (params.loanToken == address(0) || params.collateralToken == address(0)) {
            revert ZeroAddress();
        }
        bytes32 id = idOf(params);
        if (isCreated[id]) revert MarketAlreadyExists();

        isCreated[id] = true;
        market[id].lastAccrued = block.timestamp;

        emit CreateMarket(id, params);
    }

    /// @notice Supply loan assets to earn interest. Shares are minted to `onBehalf`.
    function supply(MarketParams memory params, uint256 assets, address onBehalf)
        external
        returns (uint256 shares)
    {
        bytes32 id = idOf(params);
        if (!isCreated[id]) revert MarketNotCreated();
        if (assets == 0) revert ZeroAssets();
        if (onBehalf == address(0)) revert ZeroAddress();

        _accrue(id);

        Market storage m = market[id];
        shares = assets.toSharesDown(m.totalSupplyAssets, m.totalSupplyShares);

        position[id][onBehalf].supplyShares += shares;
        m.totalSupplyShares += shares;
        m.totalSupplyAssets += assets;

        // Effect complete, then pull the tokens in.
        SafeTransferLib.safeTransferFrom(params.loanToken, msg.sender, address(this), assets);

        emit Supply(id, msg.sender, onBehalf, assets, shares);
    }

    /// @notice Withdraw supplied loan assets. Reverts if the market lacks free liquidity.
    function withdraw(MarketParams memory params, uint256 assets, address onBehalf, address receiver)
        external
        returns (uint256 shares)
    {
        bytes32 id = idOf(params);
        if (!isCreated[id]) revert MarketNotCreated();
        if (assets == 0) revert ZeroAssets();
        if (receiver == address(0)) revert ZeroAddress();

        _accrue(id);

        Market storage m = market[id];
        shares = assets.toSharesUp(m.totalSupplyAssets, m.totalSupplyShares);

        position[id][onBehalf].supplyShares -= shares;
        m.totalSupplyShares -= shares;
        m.totalSupplyAssets -= assets;

        // A supplier can only withdraw assets that are not currently borrowed out.
        if (m.totalBorrowAssets > m.totalSupplyAssets) revert InsufficientLiquidity();

        SafeTransferLib.safeTransfer(params.loanToken, receiver, assets);

        emit Withdraw(id, msg.sender, onBehalf, receiver, assets, shares);
    }

    /// @dev Accrue interest to the market's share price. No borrowers yet, so this is a
    ///      placeholder that only advances the clock. The rate math arrives with borrow.
    function _accrue(bytes32 id) internal {
        market[id].lastAccrued = block.timestamp;
    }
}

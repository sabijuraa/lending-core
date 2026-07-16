// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {SafeTransferLib} from "solady/utils/SafeTransferLib.sol";
import {SharesMath} from "./libraries/SharesMath.sol";
import {HealthMath} from "./libraries/HealthMath.sol";
import {OracleLib} from "./libraries/OracleLib.sol";
import {MarketParams, Market, Position} from "./types/Market.sol";

/// @title LendingCore
/// @notice Singleton holding every isolated market. See docs/adr.
/// @dev Implements create, supply, withdraw, collateral, borrow, repay, and the health
///      check. Liquidation follows in the next commit. Interest accrues to the share
///      price on every state-changing action.
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
    error Unhealthy();

    event CreateMarket(bytes32 indexed id, MarketParams params);
    event Supply(bytes32 indexed id, address indexed onBehalf, uint256 assets, uint256 shares);
    event Withdraw(bytes32 indexed id, address indexed onBehalf, address receiver, uint256 assets, uint256 shares);
    event SupplyCollateral(bytes32 indexed id, address indexed onBehalf, uint256 assets);
    event WithdrawCollateral(bytes32 indexed id, address indexed onBehalf, address receiver, uint256 assets);
    event Borrow(bytes32 indexed id, address indexed onBehalf, address receiver, uint256 assets, uint256 shares);
    event Repay(bytes32 indexed id, address indexed onBehalf, uint256 assets, uint256 shares);

    function idOf(MarketParams memory params) public pure returns (bytes32) {
        return keccak256(abi.encode(params));
    }

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

    // --- supply side ---------------------------------------------------------

    function supply(MarketParams memory params, uint256 assets, address onBehalf)
        external
        returns (uint256 shares)
    {
        bytes32 id = _live(params);
        if (assets == 0) revert ZeroAssets();
        if (onBehalf == address(0)) revert ZeroAddress();

        _accrue(params, id);

        Market storage m = market[id];
        shares = assets.toSharesDown(m.totalSupplyAssets, m.totalSupplyShares);
        position[id][onBehalf].supplyShares += shares;
        m.totalSupplyShares += shares;
        m.totalSupplyAssets += assets;

        SafeTransferLib.safeTransferFrom(params.loanToken, msg.sender, address(this), assets);
        emit Supply(id, onBehalf, assets, shares);
    }

    function withdraw(MarketParams memory params, uint256 assets, address onBehalf, address receiver)
        external
        returns (uint256 shares)
    {
        bytes32 id = _live(params);
        if (assets == 0) revert ZeroAssets();
        if (receiver == address(0)) revert ZeroAddress();

        _accrue(params, id);

        Market storage m = market[id];
        shares = assets.toSharesUp(m.totalSupplyAssets, m.totalSupplyShares);
        position[id][onBehalf].supplyShares -= shares;
        m.totalSupplyShares -= shares;
        m.totalSupplyAssets -= assets;

        if (m.totalBorrowAssets > m.totalSupplyAssets) revert InsufficientLiquidity();

        SafeTransferLib.safeTransfer(params.loanToken, receiver, assets);
        emit Withdraw(id, onBehalf, receiver, assets, shares);
    }

    // --- collateral ----------------------------------------------------------

    function supplyCollateral(MarketParams memory params, uint256 assets, address onBehalf)
        external
    {
        bytes32 id = _live(params);
        if (assets == 0) revert ZeroAssets();
        if (onBehalf == address(0)) revert ZeroAddress();

        // Collateral earns nothing, so it needs no accrual, but keep the market's clock
        // current so later actions accrue from the right point.
        _accrue(params, id);

        position[id][onBehalf].collateral += assets;
        SafeTransferLib.safeTransferFrom(params.collateralToken, msg.sender, address(this), assets);
        emit SupplyCollateral(id, onBehalf, assets);
    }

    function withdrawCollateral(
        MarketParams memory params,
        uint256 assets,
        address onBehalf,
        address receiver
    ) external {
        bytes32 id = _live(params);
        if (assets == 0) revert ZeroAssets();
        if (receiver == address(0)) revert ZeroAddress();

        _accrue(params, id);

        position[id][onBehalf].collateral -= assets;
        // The position must still be healthy after the collateral leaves.
        _requireHealthy(params, id, onBehalf);

        SafeTransferLib.safeTransfer(params.collateralToken, receiver, assets);
        emit WithdrawCollateral(id, onBehalf, receiver, assets);
    }

    // --- borrow side ---------------------------------------------------------

    function borrow(MarketParams memory params, uint256 assets, address onBehalf, address receiver)
        external
        returns (uint256 shares)
    {
        bytes32 id = _live(params);
        if (assets == 0) revert ZeroAssets();
        if (receiver == address(0)) revert ZeroAddress();

        _accrue(params, id);

        Market storage m = market[id];
        shares = assets.toSharesUp(m.totalBorrowAssets, m.totalBorrowShares);
        position[id][onBehalf].borrowShares += shares;
        m.totalBorrowShares += shares;
        m.totalBorrowAssets += assets;

        // Cannot borrow beyond available liquidity, nor beyond what collateral supports.
        if (m.totalBorrowAssets > m.totalSupplyAssets) revert InsufficientLiquidity();
        _requireHealthy(params, id, onBehalf);

        SafeTransferLib.safeTransfer(params.loanToken, receiver, assets);
        emit Borrow(id, onBehalf, receiver, assets, shares);
    }

    function repay(MarketParams memory params, uint256 assets, address onBehalf)
        external
        returns (uint256 shares)
    {
        bytes32 id = _live(params);
        if (assets == 0) revert ZeroAssets();
        if (onBehalf == address(0)) revert ZeroAddress();

        _accrue(params, id);

        Market storage m = market[id];
        shares = assets.toSharesDown(m.totalBorrowAssets, m.totalBorrowShares);
        position[id][onBehalf].borrowShares -= shares;
        m.totalBorrowShares -= shares;
        m.totalBorrowAssets -= assets;

        SafeTransferLib.safeTransferFrom(params.loanToken, msg.sender, address(this), assets);
        emit Repay(id, onBehalf, assets, shares);
    }

    // --- internals -----------------------------------------------------------

    function _live(MarketParams memory params) internal view returns (bytes32 id) {
        id = idOf(params);
        if (!isCreated[id]) revert MarketNotCreated();
    }

    /// @dev Accrue interest to the share price. Borrowers owe more, suppliers are owed
    ///      more, and the two grow by the same amount, so the market stays balanced.
    function _accrue(MarketParams memory params, bytes32 id) internal {
        Market storage m = market[id];
        uint256 elapsed = block.timestamp - m.lastAccrued;
        if (elapsed == 0) return;

        if (m.totalBorrowAssets != 0) {
            uint256 utilization = m.totalSupplyAssets == 0
                ? 0
                : (m.totalBorrowAssets * 1e18) / m.totalSupplyAssets;
            uint256 ratePerSecond = params.irm.borrowRatePerSecond(utilization);
            uint256 interest = (m.totalBorrowAssets * ratePerSecond * elapsed) / 1e18;

            m.totalBorrowAssets += interest;
            m.totalSupplyAssets += interest;
        }
        m.lastAccrued = block.timestamp;
    }

    /// @dev Revert unless the position's debt is within its collateral's borrowing power
    ///      at a fresh, trusted oracle price. A stale price fails closed here.
    function _requireHealthy(MarketParams memory params, bytes32 id, address user) internal view {
        Position storage p = position[id][user];
        if (p.borrowShares == 0) return; // no debt is always healthy

        Market storage m = market[id];
        uint256 borrowed = uint256(p.borrowShares).toAssetsUp(m.totalBorrowAssets, m.totalBorrowShares);
        uint256 price = OracleLib.fetchPrice(params.oracle, params.maxStaleness);

        if (!HealthMath.isHealthy(borrowed, p.collateral, price, params.lltv)) revert Unhealthy();
    }
}

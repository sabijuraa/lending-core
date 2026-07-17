// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {SafeTransferLib} from "solady/utils/SafeTransferLib.sol";
import {FixedPointMathLib} from "solady/utils/FixedPointMathLib.sol";
import {SharesMath} from "./libraries/SharesMath.sol";
import {HealthMath} from "./libraries/HealthMath.sol";
import {OracleLib} from "./libraries/OracleLib.sol";
import {MarketParams, Market, Position} from "./types/Market.sol";

/// @title LendingCore
/// @notice Singleton holding every isolated market. See docs/adr.
contract LendingCore {
    using SharesMath for uint256;

    uint256 internal constant WAD = 1e18;

    mapping(bytes32 id => Market) public market;
    mapping(bytes32 id => mapping(address user => Position)) public position;
    mapping(bytes32 id => bool) public isCreated;

    error MarketAlreadyExists();
    error MarketNotCreated();
    error ZeroAssets();
    error ZeroAddress();
    error InsufficientLiquidity();
    error Unhealthy();
    error PositionHealthy();
    error InvalidLiquidationBonus();

    event CreateMarket(bytes32 indexed id, MarketParams params);
    event Supply(bytes32 indexed id, address indexed onBehalf, uint256 assets, uint256 shares);
    event Withdraw(bytes32 indexed id, address indexed onBehalf, address receiver, uint256 assets, uint256 shares);
    event SupplyCollateral(bytes32 indexed id, address indexed onBehalf, uint256 assets);
    event WithdrawCollateral(bytes32 indexed id, address indexed onBehalf, address receiver, uint256 assets);
    event Borrow(bytes32 indexed id, address indexed onBehalf, address receiver, uint256 assets, uint256 shares);
    event Repay(bytes32 indexed id, address indexed onBehalf, uint256 assets, uint256 shares);
    event Liquidate(bytes32 indexed id, address indexed liquidator, address indexed borrower, uint256 debtRepaid, uint256 collateralSeized);
    event BadDebtRealized(bytes32 indexed id, address indexed borrower, uint256 badDebt);

    function idOf(MarketParams memory params) public pure returns (bytes32) {
        return keccak256(abi.encode(params));
    }

    function createMarket(MarketParams memory params) external {
        if (params.loanToken == address(0) || params.collateralToken == address(0)) {
            revert ZeroAddress();
        }
        // Bonus must be positive and leave some margin (capped at 20% to protect borrowers).
        if (params.liquidationBonus == 0 || params.liquidationBonus > 0.2e18) {
            revert InvalidLiquidationBonus();
        }
        bytes32 id = idOf(params);
        if (isCreated[id]) revert MarketAlreadyExists();
        isCreated[id] = true;
        market[id].lastAccrued = block.timestamp;
        emit CreateMarket(id, params);
    }

    // --- supply side ---------------------------------------------------------

    function supply(MarketParams memory params, uint256 assets, address onBehalf)
        external returns (uint256 shares)
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
        external returns (uint256 shares)
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
        _accrue(params, id);
        position[id][onBehalf].collateral += assets;
        SafeTransferLib.safeTransferFrom(params.collateralToken, msg.sender, address(this), assets);
        emit SupplyCollateral(id, onBehalf, assets);
    }

    function withdrawCollateral(MarketParams memory params, uint256 assets, address onBehalf, address receiver)
        external
    {
        bytes32 id = _live(params);
        if (assets == 0) revert ZeroAssets();
        if (receiver == address(0)) revert ZeroAddress();
        _accrue(params, id);
        position[id][onBehalf].collateral -= assets;
        _requireHealthy(params, id, onBehalf);
        SafeTransferLib.safeTransfer(params.collateralToken, receiver, assets);
        emit WithdrawCollateral(id, onBehalf, receiver, assets);
    }

    // --- borrow side ---------------------------------------------------------

    function borrow(MarketParams memory params, uint256 assets, address onBehalf, address receiver)
        external returns (uint256 shares)
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
        if (m.totalBorrowAssets > m.totalSupplyAssets) revert InsufficientLiquidity();
        _requireHealthy(params, id, onBehalf);
        SafeTransferLib.safeTransfer(params.loanToken, receiver, assets);
        emit Borrow(id, onBehalf, receiver, assets, shares);
    }

    function repay(MarketParams memory params, uint256 assets, address onBehalf)
        external returns (uint256 shares)
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

    // --- liquidation ---------------------------------------------------------

    /// @notice Liquidate an unhealthy position. The liquidator repays the full
    ///         debt and receives the borrower's collateral plus a bonus.
    ///         If collateral is insufficient to cover debt plus bonus, the
    ///         liquidator receives all remaining collateral and bad debt is
    ///         realized immediately against suppliers.
    function liquidate(MarketParams memory params, address borrower, address receiver)
        external returns (uint256 debtRepaid, uint256 collateralSeized)
    {
        bytes32 id = _live(params);
        if (receiver == address(0)) revert ZeroAddress();

        _accrue(params, id);

        Market storage m = market[id];
        Position storage pos = position[id][borrower];

        // Position must be unhealthy to liquidate.
        uint256 price = OracleLib.fetchPrice(params.oracle, params.maxStaleness);
        uint256 borrowed = uint256(pos.borrowShares).toAssetsUp(m.totalBorrowAssets, m.totalBorrowShares);

        if (HealthMath.isHealthy(borrowed, pos.collateral, price, params.lltv)) {
            revert PositionHealthy();
        }

        // The liquidator receives collateral worth (debt + bonus). Cap at available collateral.
        uint256 collateralValue = FixedPointMathLib.fullMulDiv(pos.collateral, price, 1e36);
        uint256 debtPlusBonusValue = FixedPointMathLib.fullMulDiv(borrowed, WAD + params.liquidationBonus, WAD);

        if (collateralValue >= debtPlusBonusValue) {
            // Normal liquidation: collateral covers debt plus bonus.
            // Liquidator pays the full debt, receives collateral worth (debt + bonus).
            debtRepaid = borrowed;
            collateralSeized = FixedPointMathLib.fullMulDiv(debtPlusBonusValue, 1e36, price);
        } else {
            // Bad-debt path: collateral is worth less than debt plus bonus.
            // Liquidator takes all collateral; bad debt is realized below.
            collateralSeized = pos.collateral;
            // Liquidator only pays what the collateral is worth (no bonus, no loss to liquidator).
            debtRepaid = FixedPointMathLib.fullMulDiv(collateralValue, WAD, WAD + params.liquidationBonus);
        }

        // EFFECTS: update borrower position.
        uint256 sharesRepaid = debtRepaid.toSharesDown(m.totalBorrowAssets, m.totalBorrowShares);
        pos.borrowShares -= sharesRepaid;
        pos.collateral -= collateralSeized;
        m.totalBorrowShares -= sharesRepaid;
        m.totalBorrowAssets -= debtRepaid;

        // Bad-debt realization: if collateral is now zero but borrow shares remain,
        // the outstanding debt will never be repaid. Write it down against suppliers now
        // rather than leaving a hidden liability on the books.
        if (pos.collateral == 0 && pos.borrowShares > 0) {
            uint256 badDebt = uint256(pos.borrowShares).toAssetsUp(m.totalBorrowAssets, m.totalBorrowShares);
            m.totalBorrowAssets -= badDebt;
            m.totalSupplyAssets -= badDebt;
            m.totalBorrowShares -= pos.borrowShares;
            emit BadDebtRealized(id, borrower, badDebt);
            pos.borrowShares = 0;
        }

        // INTERACTIONS: pull debt from liquidator, push collateral to receiver.
        SafeTransferLib.safeTransferFrom(params.loanToken, msg.sender, address(this), debtRepaid);
        SafeTransferLib.safeTransfer(params.collateralToken, receiver, collateralSeized);

        emit Liquidate(id, msg.sender, borrower, debtRepaid, collateralSeized);
    }

    // --- internals -----------------------------------------------------------

    function _live(MarketParams memory params) internal view returns (bytes32 id) {
        id = idOf(params);
        if (!isCreated[id]) revert MarketNotCreated();
    }

    function _accrue(MarketParams memory params, bytes32 id) internal {
        Market storage m = market[id];
        uint256 elapsed = block.timestamp - m.lastAccrued;
        if (elapsed == 0) return;
        if (m.totalBorrowAssets != 0) {
            uint256 utilization = m.totalSupplyAssets == 0
                ? 0
                : (m.totalBorrowAssets * WAD) / m.totalSupplyAssets;
            uint256 ratePerSecond = params.irm.borrowRatePerSecond(utilization);
            uint256 interest = (m.totalBorrowAssets * ratePerSecond * elapsed) / WAD;
            m.totalBorrowAssets += interest;
            m.totalSupplyAssets += interest;
        }
        m.lastAccrued = block.timestamp;
    }

    function _requireHealthy(MarketParams memory params, bytes32 id, address user) internal view {
        Position storage p = position[id][user];
        if (p.borrowShares == 0) return;
        Market storage m = market[id];
        uint256 borrowed = uint256(p.borrowShares).toAssetsUp(m.totalBorrowAssets, m.totalBorrowShares);
        uint256 price = OracleLib.fetchPrice(params.oracle, params.maxStaleness);
        if (!HealthMath.isHealthy(borrowed, p.collateral, price, params.lltv)) revert Unhealthy();
    }
}

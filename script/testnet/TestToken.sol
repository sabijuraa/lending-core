// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ERC20} from "solady/tokens/ERC20.sol";

/// @title TestToken
/// @notice Faucet token for testnet markets. Anyone can mint a capped amount per call.
contract TestToken is ERC20 {
    error MintTooLarge();

    /// @notice Emitted when the faucet mints tokens.
    event FaucetMint(address indexed to, uint256 amount);

    string private _name;
    string private _symbol;
    uint8 private immutable _decimals;
    uint256 public immutable maxMintPerCall;

    constructor(string memory name_, string memory symbol_, uint8 decimals_, uint256 maxMintPerCall_) {
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
        maxMintPerCall = maxMintPerCall_;
    }

    function name() public view override returns (string memory) {
        return _name;
    }

    function symbol() public view override returns (string memory) {
        return _symbol;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    /// @notice Mints up to `maxMintPerCall` tokens to `to`.
    function mint(address to, uint256 amount) external {
        if (amount > maxMintPerCall) revert MintTooLarge();
        _mint(to, amount);
        emit FaucetMint(to, amount);
    }
}

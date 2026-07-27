// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console2} from "forge-std/Script.sol";
import {LendingCore} from "../src/LendingCore.sol";
import {LendingCoreView} from "../src/LendingCoreView.sol";
import {KinkedRateModel} from "../src/rate/KinkedRateModel.sol";
import {ChainlinkOracleAdapter} from "../src/oracles/ChainlinkOracleAdapter.sol";

/// @title Deploy
/// @notice Deterministic deployment script for lending-core.
/// @dev Run with: forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast --verify
contract Deploy is Script {
    // Mainnet Chainlink feeds (example: ETH/USD and USDC/USD)
    address constant ETH_USD_FEED = 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419;
    address constant USDC_USD_FEED = 0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6;

    // Kinked rate model parameters (example: 80% kink, 0% base, 4% at kink, 100% at max)
    uint256 constant KINK = 0.8e18;
    uint256 constant BASE_RATE = 0;
    uint256 constant RATE_AT_KINK = 126839167; // ~4% APR
    uint256 constant RATE_AT_MAX = 3170979198; // ~100% APR

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("Deployer:", deployer);
        console2.log("Chain ID:", block.chainid);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy core
        LendingCore core = new LendingCore();
        console2.log("LendingCore:", address(core));

        // 2. Deploy view helper
        LendingCoreView view_ = new LendingCoreView(address(core));
        console2.log("LendingCoreView:", address(view_));

        // 3. Deploy rate model
        KinkedRateModel irm = new KinkedRateModel(KINK, BASE_RATE, RATE_AT_KINK, RATE_AT_MAX);
        console2.log("KinkedRateModel:", address(irm));

        // 4. Deploy oracle adapter (only on mainnet)
        if (block.chainid == 1) {
            ChainlinkOracleAdapter oracle = new ChainlinkOracleAdapter(ETH_USD_FEED, USDC_USD_FEED);
            console2.log("ChainlinkOracleAdapter (ETH/USDC):", address(oracle));
        }

        vm.stopBroadcast();

        // Post-deployment verification
        _verify(core, view_);
    }

    function _verify(LendingCore core, LendingCoreView view_) internal view {
        // Sanity checks
        require(address(view_.core()) == address(core), "View not linked to core");
        console2.log("Post-deployment verification passed");
    }
}

/// @title DeployTestnet
/// @notice Testnet deployment with mock oracles.
contract DeployTestnet is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        console2.log("Deploying to testnet, chain ID:", block.chainid);

        vm.startBroadcast(deployerPrivateKey);

        LendingCore core = new LendingCore();
        console2.log("LendingCore:", address(core));

        LendingCoreView view_ = new LendingCoreView(address(core));
        console2.log("LendingCoreView:", address(view_));

        KinkedRateModel irm = new KinkedRateModel(0.8e18, 0, 126839167, 3170979198);
        console2.log("KinkedRateModel:", address(irm));

        vm.stopBroadcast();
    }
}

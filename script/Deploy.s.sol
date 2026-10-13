// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console2} from "forge-std/Script.sol";
import {LendingCore} from "../src/LendingCore.sol";
import {LendingCoreView} from "../src/LendingCoreView.sol";
import {KinkedRateModel} from "../src/rate/KinkedRateModel.sol";
import {ChainlinkOracleAdapter} from "../src/oracles/ChainlinkOracleAdapter.sol";
import {IOracle} from "../src/interfaces/IOracle.sol";
import {IInterestRateModel} from "../src/interfaces/IInterestRateModel.sol";
import {MarketParams} from "../src/types/Market.sol";
import {TestToken} from "./testnet/TestToken.sol";
import {FixedPriceOracle} from "./testnet/FixedPriceOracle.sol";

/// @title Deploy
/// @notice Deterministic deployment script for lending-core.
/// @dev Signs with a Foundry keystore, for example
///      forge script script/Deploy.s.sol:Deploy --rpc-url $RPC_URL --account portfolio-deployer --broadcast --verify
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
        console2.log("Deployer:", msg.sender);
        console2.log("Chain ID:", block.chainid);

        vm.startBroadcast();

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

/// @title DeployBaseSepolia
/// @notice Testnet deployment with faucet tokens, owner-set oracles and two live markets.
/// @dev Writes every address to deployments/base-sepolia.json. Run with
///      forge script script/Deploy.s.sol:DeployBaseSepolia --rpc-url base_sepolia --account portfolio-deployer --broadcast --verify
contract DeployBaseSepolia is Script {
    // Kinked curve, 80% kink, 0% base, about 4% APR at the kink and 100% APR at full use.
    uint256 constant KINK = 0.8e18;
    uint256 constant RATE_AT_KINK = 126839167;
    uint256 constant RATE_AT_MAX = 3170979198;

    // Testnet oracles are refreshed by the owner, so staleness is generous.
    uint256 constant MAX_STALENESS = 7 days;

    struct Deployed {
        LendingCore core;
        LendingCoreView view_;
        KinkedRateModel irm;
        TestToken usdc;
        TestToken weth;
        TestToken wbtc;
        FixedPriceOracle wethOracle;
        FixedPriceOracle wbtcOracle;
        bytes32 wethMarket;
        bytes32 wbtcMarket;
    }

    function run() external returns (Deployed memory d) {
        vm.startBroadcast();
        d = deploy(msg.sender);
        vm.stopBroadcast();
        if (block.chainid == 84532) _write(d);
    }

    /// @notice Deploys and configures the whole testnet stack. Callable from tests.
    function deploy(address owner) public returns (Deployed memory d) {
        d.core = new LendingCore();
        d.view_ = new LendingCoreView(address(d.core));
        d.irm = new KinkedRateModel(KINK, 0, RATE_AT_KINK, RATE_AT_MAX);

        d.usdc = new TestToken("Test USD Coin", "USDC", 6, 100_000e6);
        d.weth = new TestToken("Test Wrapped Ether", "WETH", 18, 50e18);
        d.wbtc = new TestToken("Test Wrapped Bitcoin", "WBTC", 8, 2e8);

        // Price of one collateral unit in loan units, scaled by 1e36.
        // 1 WETH = 3,000 USDC and 1 WBTC = 60,000 USDC.
        d.wethOracle = new FixedPriceOracle(owner, 3000e6 * 1e36 / 1e18);
        d.wbtcOracle = new FixedPriceOracle(owner, 60_000e6 * 1e36 / 1e8);

        d.wethMarket = _market(d, address(d.weth), d.wethOracle, 0.86e18);
        d.wbtcMarket = _market(d, address(d.wbtc), d.wbtcOracle, 0.8e18);
    }

    function _market(Deployed memory d, address collateral, IOracle oracle, uint256 lltv)
        internal
        returns (bytes32)
    {
        MarketParams memory p = MarketParams({
            loanToken: address(d.usdc),
            collateralToken: collateral,
            oracle: oracle,
            irm: IInterestRateModel(address(d.irm)),
            lltv: lltv,
            liquidationBonus: 0.05e18,
            maxStaleness: MAX_STALENESS
        });
        d.core.createMarket(p);
        return d.core.idOf(p);
    }

    function _write(Deployed memory d) internal {
        string memory k = "deployment";
        vm.serializeUint(k, "chainId", block.chainid);
        vm.serializeAddress(k, "LendingCore", address(d.core));
        vm.serializeAddress(k, "LendingCoreView", address(d.view_));
        vm.serializeAddress(k, "KinkedRateModel", address(d.irm));
        vm.serializeAddress(k, "USDC", address(d.usdc));
        vm.serializeAddress(k, "WETH", address(d.weth));
        vm.serializeAddress(k, "WBTC", address(d.wbtc));
        vm.serializeAddress(k, "WETHOracle", address(d.wethOracle));
        vm.serializeAddress(k, "WBTCOracle", address(d.wbtcOracle));
        vm.serializeBytes32(k, "marketWETH_USDC", d.wethMarket);
        string memory json = vm.serializeBytes32(k, "marketWBTC_USDC", d.wbtcMarket);
        vm.writeJson(json, string.concat(vm.projectRoot(), "/deployments/base-sepolia.json"));
        console2.log("Wrote deployments/base-sepolia.json");
    }
}

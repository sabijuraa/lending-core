import { createConfig } from "@ponder/core";
import { http, type Abi } from "viem";
import LendingCoreAbi from "./abis/LendingCore.json";

export default createConfig({
  networks: {
    baseSepolia: {
      chainId: 84532,
      transport: http(process.env.PONDER_RPC_URL_84532 ?? "https://sepolia.base.org"),
    },
  },
  contracts: {
    LendingCore: {
      network: "baseSepolia",
      abi: LendingCoreAbi as Abi,
      // Fill both from deployments/base-sepolia.json after the deploy broadcasts.
      address: (process.env.LENDING_CORE_ADDRESS ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
      startBlock: Number(process.env.LENDING_CORE_START_BLOCK ?? 0),
    },
  },
});

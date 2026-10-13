# lending-core

A minimal, isolated-market lending protocol for EVM chains.

## Overview

Each market pairs exactly one collateral asset with one loan asset, one price oracle, and one set of risk parameters. Isolation is the first security decision: a compromised feed or collapsing asset can drain that market and no other. There is no shared pool for one bad market to contaminate.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         LendingCore                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Market    │  │   Market    │  │   Market    │   ...       │
│  │  ETH/USDC   │  │  WBTC/DAI   │  │  ARB/USDT   │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                     │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐             │
│  │   Oracle    │  │   Oracle    │  │   Oracle    │             │
│  │  Adapter    │  │  Adapter    │  │  Adapter    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

## Core Contracts

| Contract | Description |
|----------|-------------|
| `LendingCore` | Singleton holding all isolated markets. Supply, borrow, repay, liquidate. |
| `LendingCoreView` | Read-only helper for frontend queries (balances, APRs, health). |
| `KinkedRateModel` | Utilization-based interest rate with kink at target utilization. |
| `ChainlinkOracleAdapter` | Wraps two Chainlink feeds into collateral/loan price. |

## Libraries

| Library | Purpose |
|---------|---------|
| `SharesMath` | Asset/share conversions with virtual offsets against inflation attacks. |
| `HealthMath` | Position health, max borrow, liquidation calculations. |
| `OracleLib` | Price staleness and sanity validation. |

## Design Decisions

- **Isolated markets**: Each market is independent. No cross-market contagion.
- **Share-based accounting**: Interest accrues to share price, O(1) gas per user.
- **Protocol-favoring rounding**: No dust extraction via repeated calls.
- **Fail-closed oracle**: Stale or invalid prices halt operations, not return zero.

See [docs/adr/](./docs/adr/) for detailed architecture decision records.

## Build and Test

```bash
# Build
forge build

# Test (63 tests, 4 invariants)
forge test

# Coverage
forge coverage --ir-minimum --report summary

# Gas snapshot
forge snapshot
```

## Deploy

Deploys sign with a Foundry keystore, so no private key sits in the environment.

```bash
# Base Sepolia, with faucet tokens, owner-set oracles and two markets
forge script script/Deploy.s.sol:DeployBaseSepolia \
  --rpc-url base_sepolia \
  --account portfolio-deployer \
  --broadcast --verify
```

`DeployBaseSepolia` deploys LendingCore, LendingCoreView, KinkedRateModel, three test tokens (USDC, WETH, WBTC) and two oracles, then creates the WETH/USDC and WBTC/USDC markets. Addresses and market ids land in `deployments/base-sepolia.json`. `test/DeployBaseSepolia.t.sol` runs the same deploy in-process and drives supply, borrow, repay and liquidation through it.

The deployer is `0x9932B05213af8D82482c3Ce155AAA1DF4Bf9838B`. Nothing is broadcast yet because it holds no Base Sepolia ETH, so there are no live addresses to link.

`ETHERSCAN_API_KEY` enables verification through the Etherscan v2 API.

## Indexer

`indexer/` is a Ponder project that indexes every LendingCore event on Base Sepolia into markets, positions, transactions, liquidations and protocol totals. See [indexer/README.md](./indexer/README.md).

## Frontend

Next.js 16 app in `frontend/` with a light clinical design and the health factor gauge as its signature. Pages cover the landing story, markets, market detail, supply, borrow, dashboard, liquidations, analytics, how it works, docs, security and about.

All reads and writes go through a DataProvider. The mock provider ships illustrative data that changes as you act on it. The chain provider reads LendingCore with viem and writes through wagmi.

```bash
cd frontend
npm install
npm run dev                                  # demo data
NEXT_PUBLIC_DATA_SOURCE=chain npm run dev    # Base Sepolia, needs NEXT_PUBLIC_* addresses
```

## Security

- All tests pass (63/63)
- Invariant tests verify solvency, accounting, and share consistency
- Fuzz tests cover edge cases with 10,000+ runs
- No external dependencies beyond Solady math utilities

See [THREAT_MODEL.md](./THREAT_MODEL.md) for attack surface analysis.

## Metrics

See [METRICS.md](./METRICS.md) for coverage, gas benchmarks, and complexity analysis.

## License

MIT

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

```bash
# Testnet
forge script script/Deploy.s.sol:DeployTestnet \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify

# Mainnet
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify
```

Requires:
- `PRIVATE_KEY` environment variable
- `ETHERSCAN_API_KEY` for verification

## Frontend

Next.js 16 application with:
- Market overview and creation
- Supply/borrow/repay interfaces
- Portfolio tracking
- Liquidation monitoring
- Analytics dashboard

```bash
cd frontend
npm install
npm run dev
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

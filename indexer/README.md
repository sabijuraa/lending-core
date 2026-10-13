# lending-core indexer

Ponder indexer for LendingCore on Base Sepolia. It tracks markets, per-account positions, every supply, borrow, repay and withdraw, liquidations and protocol totals.

## Run

```bash
cd indexer
npm install
LENDING_CORE_ADDRESS=0x... LENDING_CORE_START_BLOCK=12345 npm run dev
```

Take the address and block from `deployments/base-sepolia.json` and the broadcast receipt. Ponder serves GraphQL on port 42069.

Totals follow principal flows from events. Interest accrual has no event, so live totals including interest come from `market(id)` on chain.

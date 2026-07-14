# lending-core

A minimal, isolated-market lending protocol for EVM chains.

Each market pairs exactly one collateral asset with one loan asset, one price
oracle, and one set of risk parameters. Isolation is the first security decision:
because a market touches only its own two assets and its own oracle, a
compromised feed or a collapsing asset can drain that market and no other. There
is no shared pool for one bad market to contaminate.

Suppliers deposit the loan asset to earn interest. Borrowers post collateral and
borrow against it. Four things have to be correct, and each is where value leaks
if they are not:

- **How much can be borrowed** — collateral value at the oracle price, times a
  loan-to-value factor.
- **What borrowing costs** — a utilization-based rate, accruing over time.
- **When a position is unsafe** — debt measured against a liquidation threshold.
- **What happens then** — a liquidator repays debt and seizes collateral at a
  bounded bonus.

## Design posture

- The oracle is an untrusted, bounded input behind the protocol's own interface,
  never treated as truth. Prices are checked for staleness and sanity, and the
  market never derives price from its own balances.
- Supply and debt use share-based accounting. Interest accrues to the share
  price, so there are no per-user loops and no unbounded gas.
- Every rounding decision favors the protocol. No repeated call extracts dust.
- Health and liquidation math lives in pure, exhaustively tested libraries.

## Status

Early. Building in the open, one layer at a time. See
[THREAT_MODEL.md](./THREAT_MODEL.md) for the attack surface, what is defended,
and what is explicitly out of scope.

## Build and test

```bash
forge build
forge test
```

## License

MIT

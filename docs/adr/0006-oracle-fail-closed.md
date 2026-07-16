# 6. The oracle fails closed on a price it cannot trust

## Context

A market needs a price to do two things: decide how much can be borrowed, and decide
when a position is unhealthy enough to liquidate. Both read the same oracle.

An oracle is an external contract. It can be stale, report zero, or be manipulated.
The single most common way lending protocols are drained is a price the protocol
believed and should not have.

## Decision

The oracle is treated as an untrusted input. Before any price is used it is checked:
a zero price is rejected, a price whose timestamp is in the future is rejected, and a
price older than the market's staleness threshold is rejected. On any of these the
call reverts. The protocol acts only on a price it can trust, or it does not act.

## Consequences

The protocol never borrows against, or liquidates on, a price it has reason to
distrust. This closes the largest attack surface a lending market has.

The cost is that failing closed halts both jobs at once. When the feed goes stale,
borrowing stops, which is fine, but liquidations stop too. The moment a feed is most
likely to lag is a violent market move, which is exactly when liquidations are most
needed. So in a fast crash with a stale feed, positions can slide underwater while
the market is frozen, and it takes bad debt it could not act to prevent.

We accept this rather than the alternative, which is acting on a price we do not
trust and being drained through the gap between the stale price and the real one. The
compensation is on the risk-parameter side, not here: a market's LLTV should be
conservative enough that a position can survive a plausible freeze window without
going underwater. A larger collateral cushion buys the time that failing closed costs.

The staleness threshold is per market, because how long a price stays valid depends
on how fast the asset moves. A stablecoin can tolerate a longer window than a volatile
collateral asset.

# Threat model

What this protocol defends against, what it does not, and who is trusted.

## Trust assumptions

**The oracle is not trusted.** It is an external contract that reports a price. It
can be stale, wrong, or actively manipulated. The protocol treats every price as an
untrusted input: bounded, checked, and never derived from the market's own balances.
A market's users bear the risk of the oracle that market was created with.

**No admin is trusted, because there is no admin.** Markets are immutable. There is
no key that can change a market's parameters, pause it, or move its funds.

**The loan and collateral tokens are trusted to behave like ERC-20s.** A token with
a transfer hook, a fee on transfer, a rebasing balance, or a blacklist can break
accounting assumptions. Markets created with such tokens are unsafe, and the
protocol does not attempt to make them safe.

## Attacks defended against

**Share price inflation on an empty market.** An attacker seeds one wei of shares,
donates a large balance directly to the market, and the next depositor's shares
round to zero. Virtual shares and assets are added to every conversion, so an empty
market prices deposits as if it were already established. Inflating the share price
far enough to zero out a real deposit costs more than it could steal.

**Rounding extraction.** Any conversion that rounds in the caller's favour by a
single wei is a drain if the call is cheap and repeatable. Every conversion rounds
so the protocol keeps the remainder. The direction is chosen per call site, never
left to a default.

**Interest accrual gas exhaustion.** Accruing interest by iterating positions is
O(n) and eventually unpayable. Interest accrues to the share price instead: assets
grow, shares stay fixed, and every position revalues in O(1).

**Cross-market contagion.** A market touches only its own two assets, its own
oracle, and its own parameters. A compromised feed or a collapsing asset drains that
market and no other.

## Accepted risks

**A bad market can exist.** Creation is permissionless. Someone can create a market
with a manipulable oracle. Isolation contains the damage to that market's own users,
but it does not prevent the market from existing.

**Immutability means bugs are permanent.** A flaw in market logic cannot be patched,
only abandoned. This is the price of having no admin key, and it is why the math is
fuzzed before anything is built on it.

**Fail-closed on a stale price halts liquidations too.** When the oracle is stale the
protocol refuses to act, which protects against operating on manipulated data. It also
means that during a fast crash with a lagging feed, positions slide underwater while
liquidations are frozen, and the market takes bad debt. Conservative LLTVs are the
compensation: a larger collateral cushion buys more time to survive the freeze.

## Out of scope

Governance attacks, since there is no governance. Upgrade attacks, since there is no
upgrade path. Admin key compromise, since there is no admin key.

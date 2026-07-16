# 1. Markets are immutable

## Context

A market holds user funds under a fixed set of rules: an oracle, an LLTV, a rate
model. Those rules are what a supplier or borrower agrees to when they enter.

An upgrade path would let us fix bugs after deployment. It would also let whoever
holds the upgrade key change the rules underneath positions that already exist,
and a stolen key would let an attacker replace the logic outright.

## Decision

Markets are immutable. No proxy, no admin, no upgrade path. Deployed parameters
are fixed for the life of the market.

## Consequences

A user can read a market's parameters once and rely on them permanently. There is
no key to steal and no governance action that can move the goalposts.

The cost is that a bug in market logic cannot be patched. Fixing one means
deploying a new market and asking users to migrate, which is slow and leaves the
flawed market live. This raises the bar on correctness: the math libraries are
fuzzed exhaustively before anything is built on them, because "we'll fix it later"
is not available to us.

# 3. All markets live in one contract

## Context

Markets can each be their own deployed contract, or all markets can live in a
single contract keyed by an ID.

Separate deployments give true code isolation: a bug in one deployment is a bug in
one market. They also cost gas to deploy and need a factory.

## Decision

A single contract holds every market. Markets are identified by the hash of their
parameters.

## Consequences

Creating a market costs a storage write rather than a deployment. Operations that
touch several markets happen in one call against one contract. The codebase stays
small enough to hold in your head and to audit properly.

The cost is shared fate: one bug in the core is a bug in every market at once. We
accept it because a small, exhaustively tested core is easier to get right than
many copies of a larger one, and because the mitigation is the same either way:
fuzz the math until it cannot be broken.

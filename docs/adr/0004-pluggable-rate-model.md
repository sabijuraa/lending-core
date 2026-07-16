# 4. The interest rate model is pluggable, from an approved set

## Context

A stablecoin market and a volatile-collateral market want different rate curves.
Hardcoding one curve forces a compromise on both. Letting a market supply any rate
model means the core makes an external call to code we did not write, which could
return absurd rates or attempt reentry.

## Decision

A market selects its rate model from an enumerated set of approved implementations,
behind a fixed interface.

## Consequences

Markets get curves suited to their assets, and new curves can be added without
touching the core.

The cost is an external call on the accrual path and a larger surface to reason
about. Restricting the choice to approved implementations means the core never
calls unknown code, which is what makes the external call acceptable.

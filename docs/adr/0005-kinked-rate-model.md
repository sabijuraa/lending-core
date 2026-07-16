# 5. A two-slope borrow rate with a kink

## Context

The borrow rate has one job beyond charging for capital: it keeps a market solvent
for withdrawals. Utilization is the fraction of supplied assets currently borrowed.
At 100% utilization a supplier cannot withdraw, because their assets are in a
borrower's hands and nothing forces early repayment. The rate is the only lever the
market has to pull utilization back down.

A single linear rate cannot do both jobs well. Set the slope gentle and the rate
barely moves as utilization approaches 100%, so there is no pressure to free up
liquidity. Set it steep and normal borrowing at moderate utilization is punished.

## Decision

Two linear segments joined at a kink. Below the kink the rate rises gently from a
base rate to a rate at the kink. Above the kink it rises sharply to a much higher
rate at full utilization. The kink is the market's target utilization: the level it
is content to sit at.

## Consequences

Below the kink, borrowing is cheap and the market is productive. Above it, the rate
climbs fast enough to push borrowers to repay and pull new suppliers in, which
restores withdrawable liquidity. The kink acts as a setpoint the market is steered
toward.

The cost is that the kink's placement and the upper slope are judgement calls, and
both directions have a downside. A kink set too low leaves the market half idle,
earning suppliers little. A kink set too high means the rate does not react until
withdrawable liquidity is already dangerously thin, and the correction may arrive
too late. An upper slope too gentle does not deter borrowers; too steep, and a brief
utilization spike hits an existing borrower with a rate shock they never chose,
possibly pushing an otherwise healthy position toward liquidation.

Because these are judgement calls rather than universal truths, the rate model is
chosen per market from an approved set rather than hardcoded, so a stablecoin market
and a volatile-collateral market can each use a curve suited to it.

The parameters are immutable once a model is deployed. A market that wants different
behaviour uses a different approved model, rather than having its curve changed
underneath existing positions.

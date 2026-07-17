# 7. Liquidation mechanics and bad-debt realization

## Context

When a position's debt exceeds the value of its collateral times the LLTV,
the protocol needs a mechanism to close it. Left open, an underwater position
accumulates as a liability that suppliers can never recover.

Two decisions sit here: how liquidation works, and what happens when collateral
is worth less than the debt so no liquidator will act.

## Decision — liquidation

Anyone can liquidate any unhealthy position. The liquidator repays the
borrower's full debt and receives the borrower's full collateral plus a bonus
percentage set at market creation. The bonus must be large enough to cover gas
and price risk, and small enough that it does not punish borrowers beyond the
loss they have already accepted by letting their position become unhealthy.

The full position is closed in one call rather than a partial close factor.
A partial close factor adds complexity without a clear benefit at this scale:
it slows liquidation (more calls needed to close a position) and introduces
game theory around how much to liquidate in each call.

## Decision — bad debt realization

When collateral is worth less than debt, a rational liquidator will not act
because they would pay more to repay the debt than they receive in collateral.
The position sits open indefinitely, accumulating as a hidden liability.

When this happens, the protocol realizes the bad debt immediately. The
outstanding borrow shares are burned, the shortfall is subtracted from total
supply assets, and the loss is distributed across all suppliers in proportion
to their shares. This is a visible, instantaneous loss rather than a slow
invisible drain.

## Consequences

Suppliers in a market accept that a severe price crash can result in a small
reduction in their supply balance. This is disclosed in the threat model. The
compensation is that the market's books are always accurate — there is no
hidden insolvency.

Bad debt realization is triggered inside the liquidation call when, after
seizing all collateral, the borrower still has outstanding debt. It can also
be triggered permissionlessly for any position where collateral has already
reached zero, so bad debt cannot be suppressed by refusing to liquidate.

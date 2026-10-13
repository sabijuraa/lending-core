import { ponder } from "@/generated";
import { market, position, transaction, liquidation, protocolMetrics } from "../ponder.schema";

const METRICS = "global";

// Totals here move with principal flows only. Accrued interest is not evented by the
// core, so read market() on chain when you need live totals including interest.

type Ctx = Parameters<Parameters<typeof ponder.on<"LendingCore:Supply">>[1]>[0]["context"];

async function metrics(db: Ctx["db"], change: { supplied?: bigint; borrowed?: bigint; badDebt?: bigint; markets?: number }) {
  await db
    .insert(protocolMetrics)
    .values({ id: METRICS, totalSupplied: 0n, totalBorrowed: 0n, totalBadDebt: 0n, markets: 0 })
    .onConflictDoNothing();
  await db.update(protocolMetrics, { id: METRICS }).set((row) => ({
    totalSupplied: row.totalSupplied + (change.supplied ?? 0n),
    totalBorrowed: row.totalBorrowed + (change.borrowed ?? 0n),
    totalBadDebt: row.totalBadDebt + (change.badDebt ?? 0n),
    markets: row.markets + (change.markets ?? 0),
  }));
}

async function touch(db: Ctx["db"], marketId: `0x${string}`, account: `0x${string}`) {
  await db
    .insert(position)
    .values({ marketId, account, supplyShares: 0n, borrowShares: 0n, collateral: 0n })
    .onConflictDoNothing();
}

ponder.on("LendingCore:CreateMarket", async ({ event, context }) => {
  const p = event.args.params;
  await context.db.insert(market).values({
    id: event.args.id,
    loanToken: p.loanToken,
    collateralToken: p.collateralToken,
    oracle: p.oracle,
    irm: p.irm,
    lltv: p.lltv,
    liquidationBonus: p.liquidationBonus,
    totalSupplyAssets: 0n,
    totalBorrowAssets: 0n,
    totalCollateral: 0n,
    badDebt: 0n,
    createdAt: event.block.timestamp,
  });
  await metrics(context.db, { markets: 1 });
});

ponder.on("LendingCore:Supply", async ({ event, context }) => {
  const { id, onBehalf, assets, shares } = event.args;
  await touch(context.db, id, onBehalf);
  await context.db.update(position, { marketId: id, account: onBehalf }).set((r) => ({ supplyShares: r.supplyShares + shares }));
  await context.db.update(market, { id }).set((r) => ({ totalSupplyAssets: r.totalSupplyAssets + assets }));
  await context.db.insert(transaction).values({ id: event.id, marketId: id, kind: "supply", account: onBehalf, assets, shares, hash: event.transaction.hash, timestamp: event.block.timestamp });
  await metrics(context.db, { supplied: assets });
});

ponder.on("LendingCore:Withdraw", async ({ event, context }) => {
  const { id, onBehalf, assets, shares } = event.args;
  await touch(context.db, id, onBehalf);
  await context.db.update(position, { marketId: id, account: onBehalf }).set((r) => ({ supplyShares: r.supplyShares - shares }));
  await context.db.update(market, { id }).set((r) => ({ totalSupplyAssets: r.totalSupplyAssets - assets }));
  await context.db.insert(transaction).values({ id: event.id, marketId: id, kind: "withdraw", account: onBehalf, assets, shares, hash: event.transaction.hash, timestamp: event.block.timestamp });
  await metrics(context.db, { supplied: -assets });
});

ponder.on("LendingCore:SupplyCollateral", async ({ event, context }) => {
  const { id, onBehalf, assets } = event.args;
  await touch(context.db, id, onBehalf);
  await context.db.update(position, { marketId: id, account: onBehalf }).set((r) => ({ collateral: r.collateral + assets }));
  await context.db.update(market, { id }).set((r) => ({ totalCollateral: r.totalCollateral + assets }));
  await context.db.insert(transaction).values({ id: event.id, marketId: id, kind: "supplyCollateral", account: onBehalf, assets, shares: 0n, hash: event.transaction.hash, timestamp: event.block.timestamp });
});

ponder.on("LendingCore:WithdrawCollateral", async ({ event, context }) => {
  const { id, onBehalf, assets } = event.args;
  await touch(context.db, id, onBehalf);
  await context.db.update(position, { marketId: id, account: onBehalf }).set((r) => ({ collateral: r.collateral - assets }));
  await context.db.update(market, { id }).set((r) => ({ totalCollateral: r.totalCollateral - assets }));
  await context.db.insert(transaction).values({ id: event.id, marketId: id, kind: "withdrawCollateral", account: onBehalf, assets, shares: 0n, hash: event.transaction.hash, timestamp: event.block.timestamp });
});

ponder.on("LendingCore:Borrow", async ({ event, context }) => {
  const { id, onBehalf, assets, shares } = event.args;
  await touch(context.db, id, onBehalf);
  await context.db.update(position, { marketId: id, account: onBehalf }).set((r) => ({ borrowShares: r.borrowShares + shares }));
  await context.db.update(market, { id }).set((r) => ({ totalBorrowAssets: r.totalBorrowAssets + assets }));
  await context.db.insert(transaction).values({ id: event.id, marketId: id, kind: "borrow", account: onBehalf, assets, shares, hash: event.transaction.hash, timestamp: event.block.timestamp });
  await metrics(context.db, { borrowed: assets });
});

ponder.on("LendingCore:Repay", async ({ event, context }) => {
  const { id, onBehalf, assets, shares } = event.args;
  await touch(context.db, id, onBehalf);
  await context.db.update(position, { marketId: id, account: onBehalf }).set((r) => ({ borrowShares: r.borrowShares - shares }));
  await context.db.update(market, { id }).set((r) => ({ totalBorrowAssets: r.totalBorrowAssets - assets }));
  await context.db.insert(transaction).values({ id: event.id, marketId: id, kind: "repay", account: onBehalf, assets, shares, hash: event.transaction.hash, timestamp: event.block.timestamp });
  await metrics(context.db, { borrowed: -assets });
});

ponder.on("LendingCore:Liquidate", async ({ event, context }) => {
  const { id, liquidator, borrower, debtRepaid, collateralSeized } = event.args;
  await touch(context.db, id, borrower);
  // A liquidation repays the whole debt, and any remainder is cleared by BadDebtRealized first.
  await context.db.update(position, { marketId: id, account: borrower }).set((r) => ({ borrowShares: 0n, collateral: r.collateral - collateralSeized }));
  await context.db.update(market, { id }).set((r) => ({ totalBorrowAssets: r.totalBorrowAssets - debtRepaid, totalCollateral: r.totalCollateral - collateralSeized }));
  await context.db.insert(liquidation).values({ id: event.id, marketId: id, liquidator, borrower, debtRepaid, collateralSeized, timestamp: event.block.timestamp });
  await metrics(context.db, { borrowed: -debtRepaid });
});

ponder.on("LendingCore:BadDebtRealized", async ({ event, context }) => {
  const { id, badDebt } = event.args;
  await context.db.update(market, { id }).set((r) => ({ badDebt: r.badDebt + badDebt, totalSupplyAssets: r.totalSupplyAssets - badDebt, totalBorrowAssets: r.totalBorrowAssets - badDebt }));
  await metrics(context.db, { supplied: -badDebt, borrowed: -badDebt, badDebt });
});

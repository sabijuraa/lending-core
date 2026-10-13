import { onchainTable, primaryKey } from "@ponder/core";

/** One row per isolated market, keyed by the market id hash. */
export const market = onchainTable("market", (t) => ({
  id: t.hex().primaryKey(),
  loanToken: t.hex().notNull(),
  collateralToken: t.hex().notNull(),
  oracle: t.hex().notNull(),
  irm: t.hex().notNull(),
  lltv: t.bigint().notNull(),
  liquidationBonus: t.bigint().notNull(),
  totalSupplyAssets: t.bigint().notNull(),
  totalBorrowAssets: t.bigint().notNull(),
  totalCollateral: t.bigint().notNull(),
  badDebt: t.bigint().notNull(),
  createdAt: t.bigint().notNull(),
}));

/** Running per-account balances in each market, in assets and shares. */
export const position = onchainTable(
  "position",
  (t) => ({
    marketId: t.hex().notNull(),
    account: t.hex().notNull(),
    supplyShares: t.bigint().notNull(),
    borrowShares: t.bigint().notNull(),
    collateral: t.bigint().notNull(),
  }),
  (table) => ({ pk: primaryKey({ columns: [table.marketId, table.account] }) }),
);

/** Every user action, one row per event. */
export const transaction = onchainTable("transaction", (t) => ({
  id: t.text().primaryKey(),
  marketId: t.hex().notNull(),
  kind: t.text().notNull(),
  account: t.hex().notNull(),
  assets: t.bigint().notNull(),
  shares: t.bigint().notNull(),
  hash: t.hex().notNull(),
  timestamp: t.bigint().notNull(),
}));

/** Liquidations with the seized collateral, kept apart for the liquidations page. */
export const liquidation = onchainTable("liquidation", (t) => ({
  id: t.text().primaryKey(),
  marketId: t.hex().notNull(),
  liquidator: t.hex().notNull(),
  borrower: t.hex().notNull(),
  debtRepaid: t.bigint().notNull(),
  collateralSeized: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
}));

/** Singleton row with protocol totals. */
export const protocolMetrics = onchainTable("protocol_metrics", (t) => ({
  id: t.text().primaryKey(),
  totalSupplied: t.bigint().notNull(),
  totalBorrowed: t.bigint().notNull(),
  totalBadDebt: t.bigint().notNull(),
  markets: t.integer().notNull(),
}));

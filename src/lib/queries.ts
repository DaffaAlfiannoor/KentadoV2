import "server-only";
import { sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

import { db } from "@/db";
import { admins, categories, items, transactions } from "@/db/schema";
import type { TransactionType } from "@/db/types";

type StockRow = { itemId: number; stock: number };

function getStockRows(): StockRow[] {
  return db
    .select({
      itemId: transactions.itemId,
      stock: sql<number>`coalesce(sum(case when ${transactions.type} = 'in' then ${transactions.qty} else -${transactions.qty} end), 0)`,
    })
    .from(transactions)
    .groupBy(transactions.itemId)
    .all();
}

export function getStockMap(): Map<number, number> {
  const map = new Map<number, number>();
  for (const row of getStockRows()) {
    map.set(row.itemId, row.stock);
  }
  return map;
}

export function getItemStock(itemId: number): number {
  const row = db
    .select({
      stock: sql<number>`coalesce(sum(case when ${transactions.type} = 'in' then ${transactions.qty} else -${transactions.qty} end), 0)`,
    })
    .from(transactions)
    .where(sql`${transactions.itemId} = ${itemId}`)
    .get();
  return row?.stock ?? 0;
}

export function getAdminByUsername(username: string) {
  return db.select().from(admins).where(sql`${admins.username} = ${username}`).get();
}

export function getCategories() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      createdAt: categories.createdAt,
      itemCount: sql<number>`(select count(*) from ${items} where ${items.categoryId} = ${categories.id})`,
    })
    .from(categories)
    .orderBy(categories.name)
    .all();
}

export function getItems() {
  const stock = getStockMap();
  return db
    .select({
      id: items.id,
      name: items.name,
      unit: items.unit,
      createdAt: items.createdAt,
      categoryId: items.categoryId,
      categoryName: categories.name,
    })
    .from(items)
    .innerJoin(categories, sql`${items.categoryId} = ${categories.id}`)
    .orderBy(categories.name, items.name)
    .all()
    .map((row) => ({ ...row, stock: stock.get(row.id) ?? 0 }));
}

export function getItemsByCategory(categoryId: number) {
  const stock = getStockMap();
  return db
    .select({ id: items.id, name: items.name, unit: items.unit, categoryId: items.categoryId })
    .from(items)
    .where(sql`${items.categoryId} = ${categoryId}`)
    .orderBy(items.name)
    .all()
    .map((row) => ({ ...row, stock: stock.get(row.id) ?? 0 }));
}

export type TransactionRow = {
  id: number;
  itemId: number;
  itemName: string;
  categoryName: string;
  type: TransactionType;
  qty: number;
  unitPrice: number | null;
  total: number | null;
  purpose: string | null;
  note: string | null;
  date: string;
  createdAt: string;
};

export type TransactionFilters = {
  categoryId?: number;
  itemId?: number;
  type?: TransactionType | "all";
  from?: string;
  to?: string;
};

export function getTransactions(filters: TransactionFilters = {}): TransactionRow[] {
  const conditions: SQL[] = [];
  if (filters.categoryId) conditions.push(sql`t.item_id IN (SELECT id FROM items WHERE category_id = ${filters.categoryId})`);
  if (filters.itemId) conditions.push(sql`t.item_id = ${filters.itemId}`);
  if (filters.type && filters.type !== "all") conditions.push(sql`t.type = ${filters.type}`);
  if (filters.from) conditions.push(sql`t.date >= ${filters.from}`);
  if (filters.to) conditions.push(sql`t.date <= ${filters.to}`);

  const where = conditions.length
    ? sql` WHERE ${sql.join(conditions, sql` AND `)}`
    : sql``;

  const query = sql`
    SELECT
      t.id AS id,
      t.item_id AS itemId,
      i.name AS itemName,
      c.name AS categoryName,
      t.type AS type,
      t.qty AS qty,
      t.unit_price AS unitPrice,
      t.total AS total,
      t.purpose AS purpose,
      t.note AS note,
      t.date AS date,
      t.created_at AS createdAt
    FROM transactions t
    JOIN items i ON i.id = t.item_id
    JOIN categories c ON c.id = i.category_id
    ${where}
    ORDER BY t.date DESC, t.id DESC
  `;
  return db.all<TransactionRow>(query);
}

export function getDashboardSummary() {
  const categoriesRows = getCategories();
  const stock = getStockMap();
  const itemsRows = getItems();

  return categoriesRows
    .map((cat) => {
      const catItems = itemsRows.filter((i) => i.categoryId === cat.id);
      const totalUnits = catItems.reduce((sum, i) => sum + (stock.get(i.id) ?? 0), 0);
      return {
        id: cat.id,
        name: cat.name,
        itemCount: cat.itemCount,
        totalUnits,
        items: catItems,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export type InventoryRow = {
  id: number;
  name: string;
  unit: string | null;
  categoryId: number;
  categoryName: string;
  stock: number;
  lastInPrice: number | null;
  value: number;
};

export type InventorySummary = {
  totalItems: number;
  totalUnits: number;
  totalValue: number;
  lowCount: number;
  outCount: number;
};

export function getInventory(): { rows: InventoryRow[]; summary: InventorySummary } {
  const query = sql`
    SELECT
      i.id AS id,
      i.name AS name,
      i.unit AS unit,
      i.category_id AS categoryId,
      c.name AS categoryName,
      coalesce((
        SELECT sum(case when t.type = 'in' then t.qty else -t.qty end)
        FROM transactions t WHERE t.item_id = i.id
      ), 0) AS stock,
      (
        SELECT t.unit_price FROM transactions t
        WHERE t.item_id = i.id AND t.type = 'in' AND t.unit_price IS NOT NULL
        ORDER BY t.id DESC LIMIT 1
      ) AS lastInPrice
    FROM items i
    JOIN categories c ON c.id = i.category_id
    ORDER BY i.name
  `;

  const raw = db.all<
    Omit<InventoryRow, "value"> & { lastInPrice: number | null }
  >(query);

  const rows: InventoryRow[] = raw.map((r) => ({
    ...r,
    value: r.stock * (r.lastInPrice ?? 0),
  }));

  const summary: InventorySummary = {
    totalItems: rows.length,
    totalUnits: rows.reduce((sum, r) => sum + r.stock, 0),
    totalValue: rows.reduce((sum, r) => sum + r.value, 0),
    lowCount: rows.filter((r) => r.stock > 0 && r.stock <= LOW_STOCK_THRESHOLD).length,
    outCount: rows.filter((r) => r.stock <= 0).length,
  };

  return { rows, summary };
}

export const LOW_STOCK_THRESHOLD = 20;

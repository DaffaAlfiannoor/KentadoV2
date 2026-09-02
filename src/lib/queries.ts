import "server-only";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

import { db } from "@/db";
import { admins, categories, items, transactions } from "@/db/schema";
import type { TransactionType } from "@/db/types";

type StockRow = { itemId: number | null; stock: number };

const stockExpr = sql<number>`coalesce(sum(case when ${transactions.type} = 'in' then ${transactions.qty} else -${transactions.qty} end), 0)::int`;

async function getStockRows(): Promise<StockRow[]> {
  return db
    .select({
      itemId: transactions.itemId,
      stock: stockExpr,
    })
    .from(transactions)
    .groupBy(transactions.itemId);
}

export async function getStockMap(): Promise<Map<number, number>> {
  const map = new Map<number, number>();
  for (const row of await getStockRows()) {
    if (row.itemId != null) {
      map.set(row.itemId, row.stock);
    }
  }
  return map;
}

export async function getItemStock(itemId: number): Promise<number> {
  const [row] = await db
    .select({ stock: stockExpr })
    .from(transactions)
    .where(eq(transactions.itemId, itemId));
  return row?.stock ?? 0;
}

export async function getAdminByUsername(username: string) {
  const [admin] = await db.select().from(admins).where(eq(admins.username, username));
  return admin;
}

export async function getCategories() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      createdAt: categories.createdAt,
      itemCount: sql<number>`(select count(*)::int from ${items} where ${items.categoryId} = ${categories.id})`,
    })
    .from(categories)
    .orderBy(asc(categories.name));
}

export async function getItems() {
  const stock = await getStockMap();
  const rows = await db
    .select({
      id: items.id,
      name: items.name,
      unit: items.unit,
      createdAt: items.createdAt,
      categoryId: items.categoryId,
      categoryName: categories.name,
    })
    .from(items)
    .innerJoin(categories, eq(items.categoryId, categories.id))
    .orderBy(asc(categories.name), asc(items.name));
  return rows.map((row) => ({ ...row, stock: stock.get(row.id) ?? 0 }));
}

export async function getItemsByCategory(categoryId: number) {
  const stock = await getStockMap();
  const rows = await db
    .select({ id: items.id, name: items.name, unit: items.unit, categoryId: items.categoryId })
    .from(items)
    .where(eq(items.categoryId, categoryId))
    .orderBy(asc(items.name));
  return rows.map((row) => ({ ...row, stock: stock.get(row.id) ?? 0 }));
}

export type TransactionRow = {
  id: number;
  itemId: number | null;
  itemName: string;
  categoryName: string | null;
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

export async function getTransactions(filters: TransactionFilters = {}): Promise<TransactionRow[]> {
  const conditions: SQL[] = [];
  if (filters.categoryId) conditions.push(eq(categories.id, filters.categoryId));
  if (filters.itemId) conditions.push(eq(transactions.itemId, filters.itemId));
  if (filters.type && filters.type !== "all") conditions.push(eq(transactions.type, filters.type));
  if (filters.from) conditions.push(gte(transactions.date, filters.from));
  if (filters.to) conditions.push(lte(transactions.date, filters.to));

  return db
    .select({
      id: transactions.id,
      itemId: transactions.itemId,
      itemName: sql<string>`coalesce(${transactions.itemName}, ${items.name})`,
      categoryName: categories.name,
      type: transactions.type,
      qty: transactions.qty,
      unitPrice: transactions.unitPrice,
      total: transactions.total,
      purpose: transactions.purpose,
      note: transactions.note,
      date: transactions.date,
      createdAt: transactions.createdAt,
    })
    .from(transactions)
    .leftJoin(items, eq(transactions.itemId, items.id))
    .leftJoin(categories, eq(items.categoryId, categories.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(transactions.date), desc(transactions.id));
}

export async function getDashboardSummary() {
  const [categoriesRows, stock, itemsRows] = await Promise.all([
    getCategories(),
    getStockMap(),
    getItems(),
  ]);

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

export async function getInventory(): Promise<{ rows: InventoryRow[]; summary: InventorySummary }> {
  const raw = await db
    .select({
      id: items.id,
      name: items.name,
      unit: items.unit,
      categoryId: items.categoryId,
      categoryName: categories.name,
      stock: sql<number>`coalesce((select sum(case when t.type = 'in' then t.qty else -t.qty end) from ${transactions} t where t.item_id = ${items.id}), 0)::int`,
      lastInPrice: sql<number | null>`(select t.unit_price from ${transactions} t where t.item_id = ${items.id} and t.type = 'in' and t.unit_price is not null order by t.id desc limit 1)`,
    })
    .from(items)
    .innerJoin(categories, eq(items.categoryId, categories.id))
    .orderBy(asc(items.name));

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

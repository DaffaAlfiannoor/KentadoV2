import { sql } from "drizzle-orm";
import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(now() AT TIME ZONE 'utc')::text`),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(now() AT TIME ZONE 'utc')::text`),
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  unit: text("unit"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(now() AT TIME ZONE 'utc')::text`),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "restrict" }),
  type: text("type", { enum: ["in", "out"] }).notNull(),
  qty: integer("qty").notNull(),
  unitPrice: integer("unit_price"),
  total: integer("total"),
  purpose: text("purpose"),
  note: text("note"),
  date: text("date").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(now() AT TIME ZONE 'utc')::text`),
});

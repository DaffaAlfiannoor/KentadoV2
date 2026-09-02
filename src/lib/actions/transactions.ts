"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { categories, items, transactions } from "@/db/schema";

const schema = z
  .object({
    type: z.enum(["in", "out"]),
    itemId: z.coerce.number().int().positive().optional(),
    itemName: z.string().trim().optional(),
    categoryId: z.coerce.number().int().positive(),
    qty: z.coerce.number().int().positive("Jumlah harus lebih dari 0."),
    unitPrice: z.coerce.number().int().nonnegative().optional(),
    purpose: z.string().trim().max(200).optional(),
    note: z.string().trim().max(200).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid."),
  })
  .superRefine((data, ctx) => {
    if (!data.itemId && !data.itemName) {
      ctx.addIssue({ code: "custom", message: "Pilih atau buat nama barang." });
    }
    if (data.type === "in" && data.itemName) {
      ctx.addIssue({ code: "custom", message: "Barang baru hanya bisa ditambahkan melalui form transaksi yang tersedia." });
    }
  });

export type TransactionActionResult = {
  error?: string;
  success?: boolean;
};

export async function createTransaction(
  _prev: TransactionActionResult,
  formData: FormData
): Promise<TransactionActionResult> {
  const parsed = schema.safeParse({
    type: formData.get("type"),
    itemId: formData.get("itemId") ? Number(formData.get("itemId")) : undefined,
    itemName: formData.get("itemName") || undefined,
    categoryId: formData.get("categoryId"),
    qty: formData.get("qty"),
    unitPrice: formData.get("unitPrice") ? Number(formData.get("unitPrice")) : undefined,
    purpose: formData.get("purpose") || undefined,
    note: formData.get("note") || undefined,
    date: formData.get("date"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data transaksi tidak valid." };
  }

  const { type, itemId, itemName, categoryId, qty, unitPrice, purpose, note, date } =
    parsed.data;

  const [categoryExists] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, categoryId));
  if (!categoryExists) {
    return { error: "Kategori tidak ditemukan." };
  }

  let resolvedItemId = itemId;
  if (!resolvedItemId && itemName) {
    const [found] = await db
      .select({ id: items.id })
      .from(items)
      .where(and(eq(items.categoryId, categoryId), eq(items.name, itemName)));
    if (found) {
      resolvedItemId = found.id;
    } else {
      const [inserted] = await db
        .insert(items)
        .values({ categoryId, name: itemName })
        .returning({ id: items.id });
      resolvedItemId = inserted.id;
    }
  }

  const [itemExists] = await db
    .select({ id: items.id })
    .from(items)
    .where(eq(items.id, resolvedItemId!));
  if (!itemExists) {
    return { error: "Barang tidak ditemukan." };
  }

  const total = type === "in" && unitPrice ? qty * unitPrice : null;

  await db.insert(transactions).values({
    itemId: resolvedItemId!,
    type,
    qty,
    unitPrice: type === "in" ? unitPrice ?? null : null,
    total,
    purpose: type === "out" ? (purpose ?? null) : null,
    note: note || null,
    date,
  });

  revalidatePath("/app/transactions");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/items");
  return { success: true };
}

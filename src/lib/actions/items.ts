"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { categories, items } from "@/db/schema";

const schema = z.object({
  id: z.coerce.number().optional(),
  categoryId: z.coerce.number().int().positive(),
  name: z.string().trim().min(1, "Nama barang wajib diisi.").max(80),
  unit: z.string().trim().max(20).optional(),
});

export type ItemActionResult = {
  error?: string;
  success?: boolean;
};

export async function upsertItem(
  _prev: ItemActionResult,
  formData: FormData
): Promise<ItemActionResult> {
  const parsed = schema.safeParse({
    id: formData.get("id") ? Number(formData.get("id")) : undefined,
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
    unit: formData.get("unit") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const { id, categoryId, name, unit } = parsed.data;

  const [categoryExists] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, categoryId));

  if (!categoryExists) {
    return { error: "Kategori tidak ditemukan." };
  }

  if (id) {
    await db
      .update(items)
      .set({ categoryId, name, unit: unit || null })
      .where(eq(items.id, id));
  } else {
    await db.insert(items).values({ categoryId, name, unit: unit || null });
  }

  revalidatePath("/app/items");
  revalidatePath("/app/dashboard");
  return { success: true };
}

export async function deleteItem(
  _prev: ItemActionResult,
  formData: FormData
): Promise<ItemActionResult> {
  const id = Number(formData.get("id"));
  if (!id) return { error: "Barang tidak ditemukan." };

  await db.delete(items).where(eq(items.id, id));
  revalidatePath("/app/items");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/transactions");
  return { success: true };
}

const inlineSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  name: z.string().trim().min(1, "Nama barang wajib diisi.").max(80),
  unit: z.string().trim().max(20).optional(),
});

export type InlineItemResult = {
  error?: string;
  id?: number;
  name?: string;
};

export async function addItemInline(
  _prev: InlineItemResult,
  formData: FormData
): Promise<InlineItemResult> {
  const parsed = inlineSchema.safeParse({
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
    unit: formData.get("unit") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const { categoryId, name, unit } = parsed.data;
  const [inserted] = await db
    .insert(items)
    .values({ categoryId, name, unit: unit || null })
    .returning({ id: items.id, name: items.name });

  revalidatePath("/app/items");
  revalidatePath("/app/dashboard");
  return { id: inserted.id, name: inserted.name };
}

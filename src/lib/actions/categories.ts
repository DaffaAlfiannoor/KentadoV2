"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { categories, items } from "@/db/schema";

const schema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().trim().min(1, "Nama kategori wajib diisi.").max(60),
});

export type CategoryActionResult = {
  error?: string;
  success?: boolean;
};

export async function upsertCategory(
  _prev: CategoryActionResult,
  formData: FormData
): Promise<CategoryActionResult> {
  const parsed = schema.safeParse({
    id: formData.get("id") ? Number(formData.get("id")) : undefined,
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const { id, name } = parsed.data;
  const existing = db
    .select()
    .from(categories)
    .where(eq(categories.name, name))
    .all()
    .find((c) => c.id !== id);

  if (existing) {
    return { error: "Nama kategori sudah digunakan." };
  }

  if (id) {
    db.update(categories).set({ name }).where(eq(categories.id, id)).run();
  } else {
    db.insert(categories).values({ name }).run();
  }

  revalidatePath("/app/categories");
  revalidatePath("/app/dashboard");
  return { success: true };
}

export async function deleteCategory(
  _prev: CategoryActionResult,
  formData: FormData
): Promise<CategoryActionResult> {
  const id = Number(formData.get("id"));
  if (!id) return { error: "Kategori tidak ditemukan." };

  const itemCount = db
    .select()
    .from(items)
    .where(eq(items.categoryId, id))
    .all().length;

  if (itemCount > 0) {
    return {
      error: `Kategori masih berisi ${itemCount} barang. Pindahkan atau hapus barangnya terlebih dahulu.`,
    };
  }

  db.delete(categories).where(eq(categories.id, id)).run();
  revalidatePath("/app/categories");
  revalidatePath("/app/dashboard");
  return { success: true };
}

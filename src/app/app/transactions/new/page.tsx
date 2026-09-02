import type { Metadata } from "next";

import { getCategories, getItems } from "@/lib/queries";
import { PageHeader } from "@/components/app/page-header";
import { TransactionForm } from "@/components/transactions/transaction-form";

export const metadata: Metadata = {
  title: "Tambah Transaksi",
};

export default async function NewTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; itemId?: string }>;
}) {
  const params = await searchParams;
  const categories = getCategories().map((c) => ({ id: c.id, name: c.name }));
  const items = getItems();

  const itemsByCategory = new Map<number, typeof items>();
  for (const item of items) {
    const list = itemsByCategory.get(item.categoryId) ?? [];
    list.push(item);
    itemsByCategory.set(item.categoryId, list);
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Tambah Transaksi"
        description="Catat barang masuk atau keluar."
      />
      <div className="max-w-2xl p-6">
        <TransactionForm
          categories={categories}
          itemsByCategory={itemsByCategory}
          initialCategoryId={params.categoryId ? Number(params.categoryId) : undefined}
          initialItemId={params.itemId ? Number(params.itemId) : undefined}
        />
      </div>
    </div>
  );
}

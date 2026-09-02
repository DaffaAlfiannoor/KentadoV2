import type { Metadata } from "next";

import { getCategories, getItems, getTransactions } from "@/lib/queries";
import { PageHeader } from "@/components/app/page-header";
import { TransactionsClient } from "@/components/transactions/transactions-client";

export const metadata: Metadata = {
  title: "Riwayat Transaksi",
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string }>;
}) {
  const params = await searchParams;
  const transactions = getTransactions();
  const categories = getCategories().map((c) => ({ id: c.id, name: c.name }));
  const items = getItems().map((i) => ({ id: i.id, name: i.name, categoryId: i.categoryId }));

  const initialCategoryId = params.categoryId ? Number(params.categoryId) : undefined;

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Riwayat Transaksi"
        description="Seluruh pergerakan barang masuk dan keluar."
      />
      <TransactionsClient
        transactions={transactions}
        categories={categories}
        items={items}
        initialCategoryId={initialCategoryId}
      />
    </div>
  );
}

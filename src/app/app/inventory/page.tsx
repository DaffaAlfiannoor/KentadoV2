import type { Metadata } from "next";

import { getCategories, getInventory, LOW_STOCK_THRESHOLD } from "@/lib/queries";
import { PageHeader } from "@/components/app/page-header";
import { InventoryClient } from "@/components/inventory/inventory-client";

export const metadata: Metadata = {
  title: "Inventori",
};

export default function InventoryPage() {
  const { rows, summary } = getInventory();
  const categories = getCategories().map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Inventori"
        description="Pantau stok seluruh barang berikut nilai dan statusnya."
      />
      <InventoryClient
        rows={rows}
        summary={summary}
        categories={categories}
        lowStockThreshold={LOW_STOCK_THRESHOLD}
      />
    </div>
  );
}

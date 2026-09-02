import type { Metadata } from "next";

import { getCategories, getItems } from "@/lib/queries";
import { PageHeader } from "@/components/app/page-header";
import { ItemsClient } from "@/components/items/items-client";

export const metadata: Metadata = {
  title: "Barang",
};

export default function ItemsPage() {
  const items = getItems();
  const categories = getCategories().map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="flex flex-col">
      <PageHeader title="Barang" description="Daftar barang beserta stok terkini." />
      <ItemsClient items={items} categories={categories} />
    </div>
  );
}

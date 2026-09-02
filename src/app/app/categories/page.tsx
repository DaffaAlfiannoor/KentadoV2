import type { Metadata } from "next";

import { getCategories } from "@/lib/queries";
import { PageHeader } from "@/components/app/page-header";
import { CategoriesClient } from "@/components/categories/categories-client";

export const metadata: Metadata = {
  title: "Kategori",
};

export default function CategoriesPage() {
  const categories = getCategories();

  return (
    <div className="flex flex-col">
      <PageHeader title="Kategori" description="Kelola pengelompokan jenis barang." />
      <CategoriesClient categories={categories} />
    </div>
  );
}

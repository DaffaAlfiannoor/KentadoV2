import Link from "next/link";
import { FolderSimple, Package, Warning } from "@phosphor-icons/react/dist/ssr";

import { getDashboardSummary } from "@/lib/queries";
import { formatNumber } from "@/lib/format";
import { PageHeader, EmptyState } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();
  const totalItems = summary.reduce((sum, c) => sum + c.itemCount, 0);
  const emptyItems = summary.flatMap((c) =>
    c.items.filter((i) => i.stock <= 0)
  );

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Ringkasan Stok"
        description="Gambaran stok terkini per kategori."
      />

      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FolderSimple size={16} weight="duotone" />
              Kategori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl font-semibold tracking-tight">
              {formatNumber(summary.length)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Package size={16} weight="duotone" />
              Jenis Barang
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl font-semibold tracking-tight">
              {formatNumber(totalItems)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Warning size={16} weight="duotone" />
              Stok Habis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl font-semibold tracking-tight">
              {formatNumber(emptyItems.length)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6 px-4 pb-10 sm:px-6">
        {summary.length === 0 ? (
          <EmptyState
            title="Belum ada kategori"
            description="Buat kategori terlebih dahulu untuk mulai mencatat barang."
            icon={<FolderSimple size={20} />}
          />
        ) : (
          summary.map((cat) => (
            <Card key={cat.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base font-semibold">
                  {cat.name}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {cat.itemCount} barang, {formatNumber(cat.totalUnits)} unit tersisa
                  </span>
                </CardTitle>
                <Link
                  href={`/app/transactions?categoryId=${cat.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Riwayat
                </Link>
              </CardHeader>
              <CardContent className="flex flex-col">
                {cat.items.length === 0 ? (
                  <p className="py-4 text-sm text-muted-foreground">
                    Belum ada barang dalam kategori ini.
                  </p>
                ) : (
                  <ul className="divide-y">
                    {cat.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between py-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {item.name}
                          </span>
                          {item.unit ? (
                            <span className="text-xs text-muted-foreground">
                              {item.unit}
                            </span>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2">
                          {item.stock <= 0 ? (
                            <Badge variant="destructive">Habis</Badge>
                          ) : (
                            <span className="font-mono text-sm font-semibold tabular-nums">
                              {formatNumber(item.stock)}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

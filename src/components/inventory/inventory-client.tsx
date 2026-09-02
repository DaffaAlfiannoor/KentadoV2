"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Basket,
  Coins,
  MagnifyingGlass,
  Package,
  Plus,
  Warning,
} from "@phosphor-icons/react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/app/page-header";
import { cn } from "@/lib/utils";
import { formatIDR, formatNumber } from "@/lib/format";
import type { InventoryRow, InventorySummary } from "@/lib/queries";

type Category = { id: number; name: string };

function StockStatus({ stock, threshold }: { stock: number; threshold: number }) {
  if (stock <= 0) {
    return (
      <span className="inline-flex h-5 w-fit items-center justify-center gap-1 rounded-4xl bg-destructive/10 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-destructive">
        Habis
      </span>
    );
  }
  if (stock <= threshold) {
    return (
      <span className="inline-flex h-5 w-fit items-center justify-center gap-1 rounded-4xl bg-amber-600/10 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-amber-800">
        Menipis
      </span>
    );
  }
  return (
    <span className="inline-flex h-5 w-fit items-center justify-center gap-1 rounded-4xl bg-secondary px-2 py-0.5 text-xs font-medium whitespace-nowrap text-secondary-foreground">
      Tersedia
    </span>
  );
}

function StatCard({
  icon,
  label,
  value,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon}
          {label}
        </div>
        <p className="font-mono text-2xl font-semibold tracking-tight tabular-nums text-foreground">
          {value}
          {suffix ? (
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              {suffix}
            </span>
          ) : null}
        </p>
      </div>
    </div>
  );
}

export function InventoryClient({
  rows,
  summary,
  categories,
  lowStockThreshold,
}: {
  rows: InventoryRow[];
  summary: InventorySummary;
  categories: Category[];
  lowStockThreshold: number;
}) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [sortAsc, setSortAsc] = useState(true);

  const categoryOptions = useMemo(
    () => [
      { value: "all", label: "Semua kategori" },
      ...categories.map((c) => ({ value: String(c.id), label: c.name })),
    ],
    [categories]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows;
    if (categoryId !== "all") {
      list = list.filter((r) => r.categoryId === Number(categoryId));
    }
    if (q) {
      list = list.filter(
        (r) => r.name.toLowerCase().includes(q) || r.categoryName.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) =>
      sortAsc ? a.stock - b.stock : b.stock - a.stock
    );
  }, [rows, query, categoryId, sortAsc]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Package size={16} weight="duotone" />}
          label="Jenis Barang"
          value={formatNumber(summary.totalItems)}
        />
        <StatCard
          icon={<Basket size={16} weight="duotone" />}
          label="Total Unit"
          value={formatNumber(summary.totalUnits)}
        />
        <StatCard
          icon={<Coins size={16} weight="duotone" />}
          label="Nilai Stok"
          value={formatIDR(summary.totalValue)}
        />
        <StatCard
          icon={<Warning size={16} weight="duotone" />}
          label="Menipis / Habis"
          value={formatNumber(summary.lowCount + summary.outCount)}
          suffix={`(${summary.outCount} habis)`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border bg-card p-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="inv-search">Cari barang atau kategori</Label>
          <div className="relative">
            <MagnifyingGlass
              size={16}
              weight="duotone"
              className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="inv-search"
              className="pl-8"
              placeholder="cth. Serbuk Teh Karate"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Filter kategori</Label>
          <Select
            items={categoryOptions}
            value={categoryId}
            onValueChange={(v) => setCategoryId(v ?? "all")}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua kategori</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length} barang ditampilkan
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortAsc((v) => !v)}
          title="Urutkan berdasarkan stok"
        >
          {sortAsc ? <ArrowUp size={15} /> : <ArrowDown size={15} />}
          Urut stok {sortAsc ? "terkecil" : "terbesar"}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak ada barang"
          description={
            rows.length === 0
              ? "Belum ada barang tercatat. Tambahkan barang untuk memantau stok di sini."
              : "Tidak ada barang yang cocok dengan pencarian atau filter ini."
          }
          icon={<Basket size={20} />}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead className="text-right">Stok</TableHead>
                  <TableHead className="text-right">Nilai (Rp)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.categoryName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.unit ?? "-"}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-mono font-semibold tabular-nums",
                        row.stock <= 0 && "text-destructive"
                      )}
                    >
                      {formatNumber(row.stock)}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                      {row.stock <= 0 ? "-" : formatIDR(row.value)}
                    </TableCell>
                    <TableCell>
                      <StockStatus stock={row.stock} threshold={lowStockThreshold} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/app/transactions/new?categoryId=${row.categoryId}&itemId=${row.id}`}
                        className="inline-flex h-7 items-center gap-1 rounded-[min(var(--radius-md),12px)] border px-2.5 text-[0.8rem] font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        <Plus size={14} weight="bold" />
                        Transaksi
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

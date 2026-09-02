"use client";

import { useMemo, useState } from "react";
import { ArrowsDownUp, Funnel, WarningCircle } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TransactionTypeBadge } from "@/components/app/transaction-type-badge";
import { EmptyState } from "@/components/app/page-header";
import { formatDate, formatIDR, formatNumber } from "@/lib/format";
import type { TransactionRow } from "@/lib/queries";
import type { TransactionType } from "@/db/types";

type Category = { id: number; name: string };
type Item = { id: number; name: string; categoryId: number };

export function TransactionsClient({
  transactions,
  categories,
  items,
  initialCategoryId,
}: {
  transactions: TransactionRow[];
  categories: Category[];
  items: Item[];
  initialCategoryId?: number;
}) {
  const [categoryId, setCategoryId] = useState<string>(
    initialCategoryId ? String(initialCategoryId) : "all"
  );
  const [itemId, setItemId] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const filteredItems = useMemo(
    () =>
      categoryId === "all"
        ? items
        : items.filter((i) => i.categoryId === Number(categoryId)),
    [categoryId, items]
  );

  const rows = useMemo(() => {
    return transactions.filter((t) => {
      if (categoryId !== "all" && t.categoryName !== categories.find((c) => c.id === Number(categoryId))?.name) {
        return false;
      }
      if (itemId !== "all" && t.itemId !== Number(itemId)) return false;
      if (type !== "all" && t.type !== (type as TransactionType)) return false;
      if (from && t.date < from) return false;
      if (to && t.date > to) return false;
      return true;
    });
  }, [transactions, categoryId, itemId, type, from, to, categories]);

  const reset = () => {
    setCategoryId("all");
    setItemId("all");
    setType("all");
    setFrom("");
    setTo("");
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="grid grid-cols-2 gap-4 rounded-xl border bg-card p-4 md:grid-cols-3 lg:grid-cols-6">
        <div className="col-span-2 flex flex-col gap-1.5 md:col-span-1">
          <Label>Kategori</Label>
          <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "all")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 flex flex-col gap-1.5 md:col-span-1">
          <Label>Barang</Label>
          <Select value={itemId} onValueChange={(v) => setItemId(v ?? "all")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              {filteredItems.map((i) => (
                <SelectItem key={i.id} value={String(i.id)}>
                  {i.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 flex flex-col gap-1.5 md:col-span-1">
          <Label>Tipe</Label>
          <Select value={type} onValueChange={(v) => setType(v ?? "all")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="in">Masuk</SelectItem>
              <SelectItem value="out">Keluar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="from">Dari</Label>
          <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="to">Sampai</Label>
          <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>

        <div className="flex items-end">
          <Button variant="outline" size="sm" onClick={reset} className="w-full">
            Reset
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowsDownUp size={16} weight="duotone" />
          {rows.length} transaksi
        </p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Funnel size={14} weight="duotone" />
          Filter aktif di atas
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="Tidak ada transaksi"
          description="Belum ada transaksi yang cocok dengan filter ini."
          icon={<WarningCircle size={20} />}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Barang</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead className="text-right">Harga Satuan</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Tujuan / Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDate(t.date)}
                    </TableCell>
                    <TableCell className="font-medium">{t.itemName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {t.categoryName}
                    </TableCell>
                    <TableCell>
                      <TransactionTypeBadge type={t.type} />
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {t.type === "out" ? "-" : ""}
                      {formatNumber(t.qty)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {t.unitPrice != null ? formatIDR(t.unitPrice) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {t.total != null ? formatIDR(t.total) : "-"}
                    </TableCell>
                    <TableCell className="max-w-56 text-muted-foreground">
                      <div className="flex flex-col">
                        {t.type === "out" ? (
                          <span className="text-xs">
                            {t.purpose === "terjual"
                              ? "Terjual"
                              : t.purpose === "produksi"
                                ? "Terpakai produksi"
                                : ""}
                          </span>
                        ) : null}
                        {t.note ? <span className="truncate">{t.note}</span> : null}
                      </div>
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

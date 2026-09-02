"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  MagnifyingGlass,
  Plus,
  WarningCircle,
} from "@phosphor-icons/react";

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { formatIDR, formatNumber, today } from "@/lib/format";
import { createTransaction } from "@/lib/actions/transactions";
import type { TransactionActionResult } from "@/lib/actions/transactions";
import { addItemInline } from "@/lib/actions/items";
import type { InlineItemResult } from "@/lib/actions/items";
import type { TransactionType } from "@/db/types";

type Category = { id: number; name: string };
type Item = { id: number; name: string; unit: string | null; stock: number };

type Props = {
  categories: Category[];
  itemsByCategory: Map<number, Item[]>;
  initialCategoryId?: number;
  initialItemId?: number;
};

const initialTxState: TransactionActionResult = {};
const initialAddState: InlineItemResult = {};

function findInitialItem(
  itemsByCategory: Map<number, Item[]>,
  itemId?: number
): Item | null {
  if (!itemId) return null;
  for (const list of itemsByCategory.values()) {
    const found = list.find((i) => i.id === itemId);
    if (found) return found;
  }
  return null;
}

export function TransactionForm({
  categories,
  itemsByCategory,
  initialCategoryId,
  initialItemId,
}: Props) {
  const [categoryId, setCategoryId] = useState<string>(
    initialCategoryId ? String(initialCategoryId) : ""
  );
  const [search, setSearch] = useState(
    () => findInitialItem(itemsByCategory, initialItemId)?.name ?? ""
  );
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(() =>
    findInitialItem(itemsByCategory, initialItemId)
  );
  const [mode, setMode] = useState<"select" | "add">("select");
  const [type, setType] = useState<TransactionType>("in");
  const [qty, setQty] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [purpose, setPurpose] = useState("");
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");

  const [txState, txAction, txPending] = useActionState(createTransaction, initialTxState);
  const [addState, addAction, addPending] = useActionState(addItemInline, initialAddState);

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: String(c.id), label: c.name })),
    [categories]
  );

  const categoryItems = useMemo(() => {
    const id = Number(categoryId);
    if (!id) return [];
    return itemsByCategory.get(id) ?? [];
  }, [categoryId, itemsByCategory]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categoryItems;
    return categoryItems.filter((i) => i.name.toLowerCase().includes(q));
  }, [search, categoryItems]);

  const noMatch = search.trim().length > 0 && filtered.length === 0;

  const qtyNum = Number(qty) || 0;
  const priceNum = Number(unitPrice) || 0;
  const total = type === "in" ? qtyNum * priceNum : null;
  const stock = selectedItem?.stock ?? 0;
  const overStock = type === "out" && selectedItem != null && qtyNum > stock;

  // Reset form state once the async transaction action reports success.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (txState.success) {
      setSelectedItem(null);
      setSearch("");
      setQty("");
      setUnitPrice("");
      setPurpose("");
      setNote("");
      setDate(today());
      setMode("select");
    }
  }, [txState.success]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Select the item just created by the inline-add action.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (addState.id && addState.name) {
      setSelectedItem({ id: addState.id, name: addState.name, unit: null, stock: 0 });
      setSearch(addState.name);
      setMode("select");
    }
  }, [addState.id, addState.name]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const selectCategory = (value: string | null) => {
    setCategoryId(value ?? "");
    setSelectedItem(null);
    setSearch("");
    setOpen(false);
    setMode("select");
  };

  const pickItem = (item: Item) => {
    setSelectedItem(item);
    setSearch(item.name);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <form action={txAction} className="flex flex-col gap-5 rounded-xl border bg-card p-6">
        {txState.error ? (
          <Alert variant="destructive">
            <AlertTitle>Gagal menyimpan transaksi</AlertTitle>
            <AlertDescription>{txState.error}</AlertDescription>
          </Alert>
        ) : null}
        {txState.success ? (
          <Alert>
            <AlertTitle>Transaksi tersimpan</AlertTitle>
            <AlertDescription>Stok telah diperbarui otomatis.</AlertDescription>
          </Alert>
        ) : null}

        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="categoryId" value={categoryId} />
        <input type="hidden" name="itemId" value={selectedItem?.id ?? ""} />

        <div className="flex flex-col gap-2">
          <Label>Tipe transaksi</Label>
          <div className="grid grid-cols-2 gap-1 rounded-lg border bg-muted/50 p-1">
            <button
              type="button"
              onClick={() => setType("in")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors",
                type === "in"
                  ? "bg-card text-emerald-700 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ArrowUp size={16} weight="bold" />
              Barang Masuk
            </button>
            <button
              type="button"
              onClick={() => setType("out")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors",
                type === "out"
                  ? "bg-card text-amber-800 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ArrowDown size={16} weight="bold" />
              Barang Keluar
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="category">Kategori</Label>
          <Select items={categoryOptions} value={categoryId} onValueChange={selectCategory}>
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {categoryId && mode === "select" ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="item-search">Nama barang</Label>
            <div className="relative">
              <MagnifyingGlass
                size={16}
                weight="duotone"
                className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="item-search"
                className="pl-8"
                placeholder="Cari barang..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
              />
              {selectedItem ? (
                <span className="absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center gap-1 text-xs text-emerald-700">
                  <Check size={14} weight="bold" />
                  Dipilih
                </span>
              ) : null}

              {open ? (
                <div className="absolute inset-x-0 top-full z-10 mt-1 max-h-64 overflow-y-auto rounded-lg border bg-popover p-1 shadow-md">
                  {categoryItems.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      Belum ada barang di kategori ini.
                    </p>
                  ) : (
                    <>
                      {filtered.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => pickItem(item)}
                          className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                        >
                          <span className="truncate">{item.name}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {item.unit ?? ""} {formatNumber(item.stock)}
                          </span>
                        </button>
                      ))}
                    </>
                  )}
                  {noMatch ? (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setMode("add");
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-md border-t px-3 py-2 text-left text-sm font-medium text-primary hover:bg-accent"
                    >
                      <Plus size={16} weight="bold" />
                      Tambah &ldquo;{search.trim()}&rdquo;
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
            {selectedItem ? (
              <p className="text-xs text-muted-foreground">
                Stok saat ini:{" "}
                <span className="font-mono font-semibold text-foreground">
                  {formatNumber(stock)}
                </span>{" "}
                {selectedItem.unit ?? ""}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="qty">Jumlah</Label>
            <Input
              id="qty"
              name="qty"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              required
            />
          </div>
          {type === "in" ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="unit-price">Harga per unit (Rp)</Label>
              <Input
                id="unit-price"
                name="unitPrice"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Label htmlFor="purpose">Tujuan (opsional)</Label>
              <Input
                id="purpose"
                name="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="cth. Terjual, dipakai produksi"
                maxLength={200}
              />
            </div>
          )}
        </div>

        {type === "in" ? (
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
            <span className="text-sm text-muted-foreground">Total harga</span>
            <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
              {formatIDR(total)}
            </span>
          </div>
        ) : null}

        {overStock ? (
          <Alert variant="default" className="border-amber-600/40 bg-amber-600/5">
            <AlertTitle className="flex items-center gap-1.5 text-amber-800">
              <WarningCircle size={16} weight="fill" />
              Melebihi stok tersedia
            </AlertTitle>
            <AlertDescription className="text-amber-800">
              Jumlah keluar ({formatNumber(qtyNum)}) melebihi stok ({formatNumber(stock)}).
              Transaksi tetap dapat disimpan atas konfirmasi Anda.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Tanggal</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="note">Catatan (opsional)</Label>
            <Input
              id="note"
              name="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="cth. batch, pemasok"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={txPending || !selectedItem || !categoryId}
          >
            {txPending ? "Menyimpan..." : "Simpan Transaksi"}
          </Button>
        </div>
      </form>

      {/* Inline add item form (sibling, shown when adding a new item) */}
      {categoryId && mode === "add" ? (
        <form
          action={addAction}
          className="flex flex-col gap-3 rounded-xl border bg-card p-6"
        >
          <input type="hidden" name="categoryId" value={categoryId} />
          {addState.error ? (
            <Alert variant="destructive">
              <AlertTitle>Gagal menambah barang</AlertTitle>
              <AlertDescription>{addState.error}</AlertDescription>
            </Alert>
          ) : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-item-name">Nama barang baru</Label>
            <Input
              id="new-item-name"
              name="name"
              defaultValue={search.trim()}
              placeholder="Nama barang"
              autoFocus
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-item-unit">Satuan (opsional)</Label>
            <Input id="new-item-unit" name="unit" placeholder="cth. kg, pack" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setMode("select")}>
              Batal
            </Button>
            <Button type="submit" disabled={addPending}>
              {addPending ? "Menyimpan..." : "Simpan barang"}
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

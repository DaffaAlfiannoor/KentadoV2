"use client";

import { useActionState, useEffect, useState } from "react";
import { PencilSimple, Plus, Trash, WarningCircle } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/format";
import { EmptyState } from "@/components/app/page-header";
import { deleteItem, upsertItem } from "@/lib/actions/items";
import type { ItemActionResult } from "@/lib/actions/items";

type ItemRow = {
  id: number;
  name: string;
  unit: string | null;
  categoryId: number;
  categoryName: string;
  stock: number;
};

type Category = { id: number; name: string };

const initialState: ItemActionResult = {};

function ItemForm({
  item,
  categories,
  onDone,
}: {
  item: ItemRow | null;
  categories: Category[];
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(upsertItem, initialState);
  const categoryOptions = categories.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

  useEffect(() => {
    if (state.success) onDone();
  }, [state.success, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? (
        <Alert variant="destructive">
          <AlertTitle>Gagal menyimpan</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      {item ? (
        <input type="hidden" name="id" value={item.id} />
      ) : null}
      <div className="flex flex-col gap-2">
        <Label>Kategori</Label>
        <Select
          name="categoryId"
          items={categoryOptions}
          defaultValue={item ? String(item.categoryId) : String(categories[0]?.id)}
        >
          <SelectTrigger className="w-full">
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
      <div className="flex flex-col gap-2">
        <Label htmlFor={`item-name-${item?.id ?? "new"}`}>Nama barang</Label>
        <Input
          id={`item-name-${item?.id ?? "new"}`}
          name="name"
          defaultValue={item?.name ?? ""}
          placeholder="cth. Serbuk Teh Karate"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`item-unit-${item?.id ?? "new"}`}>Satuan (opsional)</Label>
        <Input
          id={`item-unit-${item?.id ?? "new"}`}
          name="unit"
          defaultValue={item?.unit ?? ""}
          placeholder="cth. kg, pack, box"
        />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Simpan"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function DeleteForm({
  item,
  onDone,
}: {
  item: ItemRow;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(deleteItem, initialState);

  useEffect(() => {
    if (state.success) onDone();
  }, [state.success, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={item.id} />
      {state.error ? (
        <Alert variant="destructive">
          <AlertTitle>Gagal menghapus</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Batal
        </Button>
        <Button type="submit" variant="destructive" disabled={pending}>
          {pending ? "Menghapus..." : "Hapus"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ItemsClient({ items, categories }: { items: ItemRow[]; categories: Category[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ItemRow | null>(null);
  const [deleting, setDeleting] = useState<ItemRow | null>(null);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (item: ItemRow) => {
    setEditing(item);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length} barang terdaftar. Stok dihitung otomatis dari riwayat transaksi.
        </p>
        <Button size="sm" onClick={openNew}>
          <Plus weight="bold" />
          Tambah Barang
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Belum ada barang"
          description="Tambahkan barang untuk mulai mencatat stok."
          icon={<WarningCircle size={20} />}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead className="text-right">Stok</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.categoryName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.unit ?? "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        item.stock <= 0
                          ? "font-mono font-semibold text-destructive"
                          : "font-mono font-semibold tabular-nums"
                      }
                    >
                      {formatNumber(item.stock)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(item)}>
                        <PencilSimple />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive"
                        onClick={() => setDeleting(item)}
                      >
                        <Trash />
                        <span className="sr-only">Hapus</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit barang" : "Tambah barang"}</DialogTitle>
            <DialogDescription>
              {editing ? "Perbarui data barang di bawah." : "Tambahkan barang baru ke sistem."}
            </DialogDescription>
          </DialogHeader>
          {categories.length === 0 ? (
            <Alert>
              <AlertTitle>Belum ada kategori</AlertTitle>
              <AlertDescription>
                Buat kategori terlebih dahulu di halaman Kategori sebelum menambah barang.
              </AlertDescription>
            </Alert>
          ) : (
            <ItemForm
              item={editing}
              categories={categories}
              onDone={() => setDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {deleting ? (
        <Dialog open onOpenChange={(o) => !o && setDeleting(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus barang</DialogTitle>
              <DialogDescription>
                Yakin ingin menghapus barang ini? Tindakan tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <DeleteForm item={deleting} onDone={() => setDeleting(null)} />
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}

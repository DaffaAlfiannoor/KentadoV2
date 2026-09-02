"use client";

import { useActionState, useEffect, useState } from "react";
import { FolderSimple, PencilSimple, Plus, Trash } from "@phosphor-icons/react";

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatNumber } from "@/lib/format";
import { EmptyState } from "@/components/app/page-header";
import { deleteCategory, upsertCategory } from "@/lib/actions/categories";
import type { CategoryActionResult } from "@/lib/actions/categories";

type CategoryRow = {
  id: number;
  name: string;
  itemCount: number;
};

const initialState: CategoryActionResult = {};

function CategoryForm({
  category,
  onDone,
}: {
  category: CategoryRow | null;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(upsertCategory, initialState);

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
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <div className="flex flex-col gap-2">
        <Label htmlFor={`cat-name-${category?.id ?? "new"}`}>Nama kategori</Label>
        <Input
          id={`cat-name-${category?.id ?? "new"}`}
          name="name"
          defaultValue={category?.name ?? ""}
          placeholder="cth. Bahan Pokok, Aksesoris"
          required
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
  category,
  onDone,
}: {
  category: CategoryRow;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(deleteCategory, initialState);

  useEffect(() => {
    if (state.success) onDone();
  }, [state.success, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={category.id} />
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

export function CategoriesClient({ categories }: { categories: CategoryRow[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [deleting, setDeleting] = useState<CategoryRow | null>(null);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {categories.length} kategori. Kategori yang berisi barang tidak dapat dihapus.
        </p>
        <Button size="sm" onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus weight="bold" />
          Tambah Kategori
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          title="Belum ada kategori"
          description="Tambahkan kategori untuk mengelompokkan barang."
          icon={<FolderSimple size={20} />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex flex-col gap-3 rounded-xl border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-foreground">
                    {cat.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatNumber(cat.itemCount)} barang
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => { setEditing(cat); setDialogOpen(true); }}
                  >
                    <PencilSimple />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive"
                    onClick={() => setDeleting(cat)}
                  >
                    <Trash />
                    <span className="sr-only">Hapus</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit kategori" : "Tambah kategori"}</DialogTitle>
            <DialogDescription>
              Nama kategori harus unik.
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            category={editing}
            onDone={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {deleting ? (
        <Dialog open onOpenChange={(o) => !o && setDeleting(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus kategori</DialogTitle>
              <DialogDescription>
                Yakin ingin menghapus kategori ini? Tindakan tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <DeleteForm category={deleting} onDone={() => setDeleting(null)} />
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}

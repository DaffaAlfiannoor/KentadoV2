"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  Basket,
  ChartLineUp,
  FolderSimple,
  List,
  Package,
  Plus,
  SignOut,
  Tray,
  X,
} from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/login/actions";

const nav = [
  { href: "/app/dashboard", label: "Ringkasan", icon: ChartLineUp },
  { href: "/app/inventory", label: "Inventori", icon: Basket },
  { href: "/app/items", label: "Barang", icon: Package },
  { href: "/app/categories", label: "Kategori", icon: FolderSimple },
  { href: "/app/transactions", label: "Riwayat", icon: List },
];

function Brand() {
  return (
    <div className="flex h-16 shrink-0 items-center gap-2.5 border-b px-5">
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Tray size={18} weight="duotone" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-sm font-semibold tracking-tight text-foreground">
          KENTADO
        </span>
        <span className="text-xs text-muted-foreground">Inventaris</span>
      </div>
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
      <Link href="/app/transactions/new" onClick={onNavigate}>
        <Button className="mb-2 w-full" size="sm">
          <Plus weight="bold" />
          Tambah Transaksi
        </Button>
      </Link>
      {nav.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            )}
          >
            <Icon size={18} weight={active ? "fill" : "regular"} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logoutAction} className={className}>
      <Button variant="ghost" size="sm" className="w-full justify-start" type="submit">
        <SignOut size={18} />
        Keluar
      </Button>
    </form>
  );
}

export function Sidebar({ username }: { username: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden h-[100dvh] w-60 shrink-0 flex-col border-r bg-sidebar lg:flex">
        <Brand />
        <NavLinks />
        <div className="border-t p-3">
          <LogoutButton />
        </div>
      </aside>

      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-card/60 px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Buka menu"
            onClick={() => setOpen(true)}
          >
            <List size={20} />
          </Button>
          <Link href="/app/dashboard" className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Tray size={16} weight="duotone" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              KENTADO
            </span>
          </Link>
        </div>
        <span className="truncate text-sm text-muted-foreground">{username}</span>
      </header>

      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <DialogPrimitive.Popup className="fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-72 max-w-[85vw] flex-col bg-sidebar shadow-xl outline-none duration-150 data-open:animate-in data-open:slide-in-from-left-10 data-closed:animate-out data-closed:slide-out-to-left-10">
            <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Tray size={18} weight="duotone" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-sm font-semibold tracking-tight text-foreground">
                    KENTADO
                  </span>
                  <span className="text-xs text-muted-foreground">Inventaris</span>
                </div>
              </div>
              <DialogPrimitive.Close
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                aria-label="Tutup menu"
              >
                <X size={18} />
              </DialogPrimitive.Close>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <div className="border-t p-3">
              <LogoutButton />
            </div>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}

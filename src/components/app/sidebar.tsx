"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Basket,
  ChartLineUp,
  FolderSimple,
  List,
  Package,
  Plus,
  SignOut,
  Tray,
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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-[100dvh] w-60 shrink-0 flex-col border-r bg-sidebar">
      <div className="flex h-16 items-center gap-2.5 border-b px-5">
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

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        <Link href="/app/transactions/new">
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

      <div className="border-t p-3">
        <form action={logoutAction}>
          <Button variant="ghost" size="sm" className="w-full justify-start" type="submit">
            <SignOut size={18} />
            Keluar
          </Button>
        </form>
      </div>
    </aside>
  );
}

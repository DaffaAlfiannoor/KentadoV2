import type { Metadata } from "next";
import { Tray, Warehouse } from "@phosphor-icons/react/dist/ssr";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk | KENTADO",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-[100dvh] w-full items-center justify-center bg-background px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-8">
        <div className="flex flex-col gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Tray size={24} weight="duotone" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              KENTADO
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Manajemen produk dan inventaris. Masuk untuk mengelola stok, kategori,
              dan riwayat transaksi.
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <LoginForm />
        </div>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <Warehouse size={14} weight="duotone" />
          Produksi mandiri, tercatat rapi.
        </p>
      </div>
    </main>
  );
}

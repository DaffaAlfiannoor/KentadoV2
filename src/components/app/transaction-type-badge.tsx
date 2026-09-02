import { cn } from "@/lib/utils";
import type { TransactionType } from "@/db/types";

const labels: Record<TransactionType, string> = {
  in: "Masuk",
  out: "Keluar",
};

export function TransactionTypeBadge({ type }: { type: TransactionType }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit items-center justify-center gap-1 rounded-4xl px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        type === "in"
          ? "bg-emerald-600/10 text-emerald-700"
          : "bg-amber-600/10 text-amber-800"
      )}
    >
      {labels[type]}
    </span>
  );
}

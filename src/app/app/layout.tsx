import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";
import { Sidebar } from "@/components/app/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-[100dvh] w-full bg-background">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <div className="flex h-16 shrink-0 items-center justify-end border-b bg-card/60 px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{session.username}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}

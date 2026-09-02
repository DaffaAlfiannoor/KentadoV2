export default function AppLoading() {
  return (
    <div className="flex flex-col" aria-busy="true" aria-live="polite">
      <div className="flex flex-col gap-2 border-b px-4 py-6 sm:px-6">
        <div className="h-6 w-40 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="flex flex-col gap-4 p-4 sm:p-6">
        <div className="h-20 animate-pulse rounded-xl border bg-card" />
        <div className="h-64 animate-pulse rounded-xl border bg-card" />
      </div>
    </div>
  );
}

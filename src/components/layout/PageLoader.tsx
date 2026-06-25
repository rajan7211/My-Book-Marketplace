/** Full-screen fallback shown while a lazily-loaded route chunk downloads. */
export function PageLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-gray">
      <div
        className="h-10 w-10 animate-spin rounded-full border-[3px] border-gray-200 border-t-transparent"
        style={{ borderTopColor: "#f5a623" }}
      />
      <p className="text-sm font-medium text-gray-500">Loading…</p>
    </div>
  );
}

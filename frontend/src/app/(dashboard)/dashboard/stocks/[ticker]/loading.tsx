export default function StockLoading() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10 space-y-8 animate-pulse">
      <div className="space-y-4">
        <div className="h-3 w-24 bg-card-border rounded" />
        <div className="h-8 w-20 bg-card-border rounded-lg" />
        <div className="flex gap-1.5">
          <div className="h-8 w-16 bg-card-border rounded-full" />
          <div className="h-8 w-16 bg-card-border rounded-full" />
          <div className="h-8 w-16 bg-card-border rounded-full" />
        </div>
      </div>
      <div className="rounded-2xl border border-card-border bg-card p-5 space-y-4">
        <div className="h-3 w-28 bg-card-border rounded" />
        <div className="h-2 w-full bg-card-border rounded-full" />
        <div className="flex gap-4">
          <div className="h-3 w-20 bg-card-border rounded" />
          <div className="h-3 w-20 bg-card-border rounded" />
          <div className="h-3 w-20 bg-card-border rounded" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 w-28 bg-card-border rounded" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-card-border bg-card p-5 space-y-4"
          >
            <div className="flex gap-2.5">
              <div className="h-5 w-12 bg-card-border rounded" />
              <div className="h-5 w-16 bg-card-border rounded-full" />
            </div>
            <div className="h-4 w-full bg-card-border rounded" />
            <div className="h-4 w-3/4 bg-card-border rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

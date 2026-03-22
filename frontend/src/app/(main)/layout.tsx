import MainNav from "@/components/MainNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MainNav />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-card-border bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative flex flex-col gap-0.5">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <div className="w-2 h-2 rounded-full bg-accent/60" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              ClearMarket
            </span>
          </div>
          <span className="text-xs text-muted">
            Investing for those who want it simplified &copy; {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </>
  );
}

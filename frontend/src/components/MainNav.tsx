"use client";

import { useState } from "react";
import Link from "next/link";

export default function MainNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-card-border/40">
      <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 h-20">
        <div className="flex items-center gap-12">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground group"
          >
            <div className="relative flex flex-col gap-0.5">
              <div className="w-2.5 h-2.5 rounded-full bg-accent" />
              <div className="w-2.5 h-2.5 rounded-full bg-accent/60" />
            </div>
            <span className="text-xl font-medium tracking-tight">
              ClearMarket
            </span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-8">
            <Link
              href="/dashboard/analyze"
              className="flex items-center gap-1 text-[15px] font-medium text-foreground/90 hover:text-foreground transition-colors"
            >
              Analyze
            </Link>
            <Link
              href="/dashboard/stocks/AAPL"
              className="flex items-center gap-1 text-[15px] font-medium text-foreground/90 hover:text-foreground transition-colors"
            >
              Stocks
            </Link>
            <Link
              href="/dashboard/news"
              className="flex items-center gap-1 text-[15px] font-medium text-foreground/90 hover:text-foreground transition-colors"
            >
              News
            </Link>
            <Link
              href="/dashboard/paper-trading"
              className="flex items-center gap-1 text-[15px] font-medium text-foreground/90 hover:text-foreground transition-colors"
            >
              Paper Trading
            </Link>
            <Link
              href="/get-started"
              className="flex items-center gap-1 text-[15px] font-medium text-foreground/90 hover:text-foreground transition-colors"
            >
              About Us
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex h-10 items-center justify-center rounded-full bg-foreground px-6 text-[15px] font-medium text-background hover:bg-foreground/90 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/login"
            className="hidden sm:inline-flex h-10 items-center justify-center rounded-full border border-card-border/80 px-6 text-[15px] font-medium text-foreground hover:bg-surface transition-colors"
          >
            Sign up
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 -mr-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu, show/hide based on menu state. */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-card-border/40 bg-background">
          <div className="space-y-1 px-4 pb-4 pt-2">
            <Link
              href="/dashboard/analyze"
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-surface transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Analyze
            </Link>
            <Link
              href="/dashboard/stocks/AAPL"
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-surface transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Stocks
            </Link>
            <Link
              href="/dashboard/news"
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-surface transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              News
            </Link>
            <Link
              href="/dashboard/paper-trading"
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-surface transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Paper Trading
            </Link>
            <Link
              href="/get-started"
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-surface transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <div className="mt-4 flex flex-col gap-2 px-3 sm:hidden">
              <Link
                href="/login"
                className="flex w-full items-center justify-center rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/login"
                className="flex w-full items-center justify-center rounded-full border border-card-border/80 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
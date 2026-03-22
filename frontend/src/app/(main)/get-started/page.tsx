import Link from "next/link";

export default function GetStartedPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28 grid sm:grid-cols-2 gap-12 items-center">
          {/* Left: headline + CTAs */}
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-[52px] font-serif tracking-[-0.02em] leading-[1.1] text-foreground">
              Start investing
              <br />
              smarter today
            </h1>
            <p className="text-base text-muted leading-relaxed max-w-md">
              Build your portfolio with AI-powered analysis, paper trading, and
              simplified expert opinions. Sign up now and get started with
              $100,000 in simulated funds.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
              >
                Sign Up
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-full border border-card-border px-8 text-foreground text-sm font-medium hover:bg-surface transition-colors"
              >
                Log In
              </Link>
            </div>
          </div>

          {/* Right: phone mockup */}
          <div className="hidden sm:flex justify-center" aria-hidden>
            <div className="relative w-[280px]">
              {/* Phone frame */}
              <div className="rounded-[2.5rem] border-[6px] border-foreground/90 bg-background shadow-2xl overflow-hidden">
                {/* Status bar */}
                <div className="flex items-center justify-between px-6 pt-4 pb-2">
                  <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-xs font-mono font-medium text-muted">AAPL</span>
                  <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>

                {/* Stock info */}
                <div className="px-6 pb-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-positive/15">
                      <svg className="w-4 h-4 text-positive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </span>
                    <span className="text-sm font-semibold text-foreground">Apple Inc.</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground tracking-tight">$178.72</p>
                  <p className="text-xs font-medium text-positive flex items-center gap-1">
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-positive text-white text-[8px]">
                      &#9650;
                    </span>
                    +$3.28 (1.87%) today
                  </p>
                </div>

                {/* Chart area */}
                <div className="px-4 py-3">
                  <svg viewBox="0 0 240 100" className="w-full h-auto" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(0, 184, 83)" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="rgb(0, 184, 83)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 70 Q20 65, 40 55 T80 50 T120 35 T160 40 T200 25 T240 20"
                      fill="none"
                      stroke="rgb(0, 184, 83)"
                      strokeWidth="2"
                    />
                    <path
                      d="M0 70 Q20 65, 40 55 T80 50 T120 35 T160 40 T200 25 T240 20 L240 100 L0 100 Z"
                      fill="url(#chartGrad)"
                    />
                  </svg>
                </div>

                {/* Time range pills */}
                <div className="flex items-center justify-center gap-1 px-4 pb-4">
                  {["1D", "1W", "1M", "3M", "6M", "YTD", "1Y", "All"].map(
                    (range, i) => (
                      <span
                        key={range}
                        className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                          i === 0
                            ? "bg-positive text-white"
                            : "text-muted"
                        }`}
                      >
                        {range}
                      </span>
                    )
                  )}
                </div>

                {/* Bottom actions */}
                <div className="border-t border-card-border px-6 py-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">Sentiment</span>
                    <span className="text-positive font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-positive" />
                      Positive
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="rounded-full bg-surface border border-card-border px-2 py-0.5 text-[10px] text-muted">
                      Earnings
                    </span>
                    <span className="rounded-full bg-surface border border-card-border px-2 py-0.5 text-[10px] text-muted">
                      AI Analysis
                    </span>
                  </div>
                </div>

                {/* Home indicator */}
                <div className="flex justify-center pb-2 pt-1">
                  <div className="w-24 h-1 rounded-full bg-card-border" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="border-t border-card-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                title: "AI-Powered Analysis",
                description:
                  "Our AI translates complex financial jargon into plain language. Understand any analyst opinion in seconds.",
              },
              {
                title: "Paper Trading",
                description:
                  "Practice with $100,000 in simulated funds. Buy and sell stocks risk-free to build your confidence.",
              },
              {
                title: "Sentiment Tracking",
                description:
                  "See whether experts are bullish or bearish on any stock, with clear reason tags and context.",
              },
            ].map((feature) => (
              <div key={feature.title} className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-card-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center space-y-5">
          <h2 className="text-3xl sm:text-4xl font-serif tracking-[-0.02em] text-foreground">
            Ready to get started?
          </h2>
          <p className="text-muted text-sm max-w-md mx-auto">
            Create a free account to access all features including paper trading,
            AI analysis, and stock insights.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-full border border-card-border px-8 text-foreground text-sm font-medium hover:bg-surface transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

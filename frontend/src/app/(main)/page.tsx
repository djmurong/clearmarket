import Link from "next/link";
import { categoryLabels, getTimeAgo, NewsArticle } from "@/lib/mockNews";

const previewArticles: NewsArticle[] = [];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-background pt-24 pb-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-[1000px]">
            <h1 className="text-[60px] sm:text-[85px] lg:text-[110px] font-serif tracking-[-0.03em] leading-[0.95] text-foreground">
              <span className="text-foreground/30 block -mb-4 sm:-mb-6 lg:-mb-8">Investing for those</span>
              who want it simplified
            </h1>
          </div>

          <div className="mt-16 flex flex-col sm:flex-row sm:items-center justify-between gap-10">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-[15px] font-medium text-foreground">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Risk-free paper trading
              </div>
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Jargon-free analysis
              </div>
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Made for beginners
              </div>
            </div>

            <Link
              href="/login"
              className="inline-flex h-14 w-fit sm:w-auto items-center justify-center gap-2 rounded-full bg-foreground px-8 text-base font-medium text-background hover:bg-foreground/90 transition-colors"
            >
              Get Started
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </div>
          
          {/* Mockup */}
          <div className="mt-20 relative rounded-[2rem] bg-[#0a0a0a] overflow-hidden border border-card-border/10 shadow-2xl aspect-[16/9] max-h-[600px] flex items-end justify-center">
            {/* Soft glow */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[40%] h-[80%] bg-white/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="w-[85%] h-[90%] bg-background rounded-t-2xl shadow-2xl border border-card-border overflow-hidden flex flex-col transform perspective-1000 rotate-x-2">
              {/* Fake dashboard header */}
              <div className="h-14 border-b border-card-border flex items-center px-6 gap-6">
                <div className="flex items-center gap-1.5 text-accent font-semibold text-sm">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  ClearMarket
                </div>
                <div className="h-8 w-64 bg-surface rounded-md border border-card-border" />
                <div className="flex gap-4 text-xs font-medium text-muted ml-auto">
                  <span className="text-foreground">Portfolio</span>
                  <span>Markets</span>
                  <span>Invest</span>
                </div>
              </div>
              
              {/* Fake dashboard body */}
              <div className="flex-1 p-8 grid grid-cols-3 gap-8">
                <div className="col-span-2 space-y-6">
                  <div>
                    <h2 className="text-4xl font-bold text-foreground">$459,480.40</h2>
                    <p className="text-sm font-medium text-positive mt-1">+ $14,645.58 (+3.41%) today</p>
                  </div>
                  <div className="h-64 mt-10 relative">
                    <svg className="w-full h-full text-positive" preserveAspectRatio="none" viewBox="0 0 100 100" fill="none">
                      <path d="M0,80 L10,75 L20,85 L30,60 L40,70 L50,40 L60,50 L70,20 L80,35 L90,10 L100,25" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-8 flex justify-between items-center">
                    <span className="text-sm font-semibold">Updates</span>
                    <span className="text-xs text-muted">1 of 5 &gt;</span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl border border-card-border bg-surface/50 space-y-1">
                      <div className="flex gap-2 items-center text-xs font-medium text-muted">
                        <span className="w-5 h-5 rounded-full bg-neutral-sentiment/20 text-neutral-sentiment flex items-center justify-center">B</span>
                        BTC Price Alert
                      </div>
                      <p className="text-sm font-semibold">BTC up 5%</p>
                    </div>
                    <div className="p-4 rounded-xl border border-card-border bg-surface/50 space-y-1">
                      <div className="flex gap-2 items-center text-xs font-medium text-muted">
                        <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center">E</span>
                        AAPL Earnings
                      </div>
                      <p className="text-sm font-semibold">Q3 earnings beat by 3.1%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features row */}
      <section className="border-t border-card-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
                title: "Simplify expert opinions",
                description:
                  "Paste any analyst quote or financial headline. We translate Wall Street jargon into plain language instantly.",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: "Learn why the markets are moving",
                description:
                  "See whether an opinion is positive, negative, or neutral with color-coded sentiment indicators and reason tags.",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Understand the impact",
                description:
                  'Every analysis includes a "What this means" section so you understand how it could affect investors.',
              },
            ].map((feature) => (
              <div key={feature.title} className="space-y-3">
                <span className="text-accent">{feature.icon}</span>
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

      {/* How it works */}
      <section className="border-t border-card-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-lg space-y-4 mb-12">
            <p className="text-sm font-medium text-accent">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-serif tracking-[-0.02em] leading-tight text-foreground">
              Access powerful
              <br />
              investing tools
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-card-border bg-card p-8 space-y-4">
              <h3 className="text-base font-semibold text-foreground">
                Paste or fetch expert opinion
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Start with any professional financial opinion -- analyst summaries,
                upgrades/downgrades, or earnings call highlights. Just paste and go.
              </p>
            </div>
            <div className="rounded-2xl border border-card-border bg-card p-8 space-y-4">
              <h3 className="text-base font-semibold text-foreground">
                One-click simplification
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Get a simplified version, sentiment classification, reason tags, and
                beginner-friendly context explaining what the opinion means for investors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* News */}
      <section className="border-t border-card-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid sm:grid-cols-2 gap-12 items-start">
            <div className="space-y-4">
              <p className="text-sm font-medium text-accent">Stay informed</p>
              <h2 className="text-3xl sm:text-4xl font-serif tracking-[-0.02em] leading-tight text-foreground">
                Financial news,
                <br />
                simplified
              </h2>
              <p className="text-sm text-muted leading-relaxed max-w-md">
                Get the latest market headlines with one-click simplification and
                key takeaways -- so you always understand what&rsquo;s moving the markets.
              </p>
              <Link
                href="/dashboard/news"
                className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-7 text-white text-sm font-medium hover:bg-accent-hover transition-colors mt-2"
              >
                Read the news &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {previewArticles.map((article) => (
                <Link
                  key={article.id}
                  href="/dashboard/news"
                  className="flex gap-4 rounded-xl border border-card-border bg-card p-4 hover:shadow-sm hover:border-accent-border transition-all group"
                >
                  <div
                    className="hidden sm:flex flex-shrink-0 w-12 h-12 rounded-lg items-center justify-center"
                    style={{ background: `${article.imageColor}15` }}
                  >
                    <span
                      className="text-[10px] font-bold font-mono"
                      style={{ color: article.imageColor }}
                    >
                      {article.symbols[0] || categoryLabels[article.category].slice(0, 3).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 text-[10px] text-muted">
                      <span className="font-medium">{article.source}</span>
                      <span>&middot;</span>
                      <span>{getTimeAgo(article.publishedAt)}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-1 group-hover:text-accent transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-xs text-muted leading-relaxed line-clamp-1">
                      {article.summary}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-card-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center space-y-5">
          <h2 className="text-3xl sm:text-4xl font-serif tracking-[-0.02em] text-foreground">
            Start understanding the markets
          </h2>
          <p className="text-muted text-sm max-w-md mx-auto">
            Analyze financial opinions in seconds. No account required.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-8 text-white text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            Get started
          </Link>
        </div>
      </section>
    </div>
  );
}

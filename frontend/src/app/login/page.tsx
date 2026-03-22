"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/apiClient";

const features = [
  "AI-powered analysis",
  "Beginner-friendly summaries",
  "Real-time sentiment tracking",
  "Expert opinion translation",
];

const tags = [
  { label: "Stocks", highlight: false },
  { label: "Analyst Reports", highlight: false },
  { label: "Earnings", highlight: false },
  { label: "Crypto", highlight: false },
  { label: "Sentiment Analysis", highlight: true, badge: "AI" },
  { label: "ETFs", highlight: false },
  { label: "News", highlight: false },
  { label: "ELI12 Mode", highlight: true, badge: "New" },
  { label: "Macro Trends", highlight: false },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.login(email, password);
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("userId", response.user.id);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("401")) {
          setError("Invalid email or password");
        } else if (err.message.includes("503")) {
          setError("Server is temporarily unavailable");
        } else {
          setError(err.message || "Login failed. Please try again.");
        }
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left panel - dark branding */}
      <div className="hidden lg:flex lg:w-[48%] bg-[#0c0c1d] text-white flex-col justify-between p-12 xl:p-16 relative overflow-hidden">
        <div className="relative z-10 space-y-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#0c0c1d] text-xs font-bold">
              C
            </span>
            <span className="text-base font-semibold tracking-tight">
              ClearMarket
            </span>
          </Link>

          {/* Tagline */}
          <div className="space-y-6 max-w-md">
            <h1 className="text-[40px] xl:text-[46px] font-serif tracking-[-0.02em] leading-[1.1]">
              Investing insights
              <br />
              for those who
              <br />
              take it seriously
            </h1>

            {/* Feature list */}
            <div className="space-y-3.5 pt-2">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <span className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/10">
                    <svg className="w-3.5 h-3.5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-[15px] text-white/80">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product tags */}
          <div className="flex flex-wrap gap-2 max-w-md pt-2">
            {tags.map((tag) => (
              <span
                key={tag.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[13px] text-white/70"
              >
                <svg className="w-3 h-3 text-accent" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {tag.label}
                {tag.highlight && tag.badge && (
                  <span className="rounded-full bg-accent px-1.5 py-px text-[10px] font-medium text-white">
                    {tag.badge}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Subtle gradient overlay at bottom */}
        <div className="relative z-10 pt-12">
          <p className="text-xs text-white/30">
            Disclosures &middot; Terms &middot; Privacy
          </p>
        </div>

        {/* Background gradient decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c0c1d] via-[#12122e] to-[#1a1040] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 lg:px-20 py-12 bg-background">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-foreground text-background text-xs font-bold">
              C
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              ClearMarket
            </span>
          </Link>
        </div>

        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h2 className="text-[28px] font-serif tracking-[-0.02em] text-foreground">
              Log in
            </h2>
            <p className="text-sm text-muted">
              New to ClearMarket?{" "}
              <Link href="/signup" className="text-accent hover:underline font-medium">
                Create account &rsaquo;
              </Link>
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                disabled={loading}
                className="w-full h-12 rounded-xl border border-card-border bg-background px-4 text-sm text-foreground placeholder:text-muted-dim focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                disabled={loading}
                className="w-full h-12 rounded-xl border border-card-border bg-background px-4 pr-12 text-sm text-foreground placeholder:text-muted-dim focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-dim hover:text-muted transition-colors disabled:opacity-50"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>

            <div>
              <Link
                href="/forgot-password"
                className="text-sm text-accent hover:underline font-medium"
              >
                Forgot your password?
              </Link>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!email.trim() || !password.trim() || loading}
                className="h-11 rounded-full bg-foreground px-8 text-sm font-medium text-background hover:bg-foreground/85 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4M4.22 4.22l2.83 2.83m5.7 5.7l2.83 2.83M2 12h4m12 0h4m-10.78 9.78l2.83-2.83m5.7-5.7l2.83-2.83M4.22 19.78l2.83-2.83m5.7-5.7l2.83-2.83" />
                    </svg>
                    Logging in...
                  </>
                ) : (
                  "Log in"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

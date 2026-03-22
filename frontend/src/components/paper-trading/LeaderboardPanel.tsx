"use client";

import { useState, useEffect, useCallback } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

interface LeaderboardEntry {
  user_id: string;
  username: string;
  total_value: number;
  gain_amount: number;
  gain_percent: number;
  positions: { ticker: string; shares: number }[];
}

interface LeaderboardPanelProps {
  userId: string;
  onCopyComplete: () => void;
}

function fmt(n: number) {
  return Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function LeaderboardPanel({ userId, onCopyComplete }: LeaderboardPanelProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/leaderboard`);
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch {
      setMessage({ type: "error", text: "Failed to load leaderboard." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleCopy = async (targetUserId: string) => {
    setCopying(targetUserId);
    setConfirmId(null);
    setMessage(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/portfolio/copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, target_user_id: targetUserId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const summary = data.bought.map((b: { ticker: string; shares: number }) => `${b.shares}× ${b.ticker}`).join(", ");
      setMessage({ type: "success", text: `Copied! Bought: ${summary}. Cash left: $${fmt(data.remaining_cash)}` });
      onCopyComplete();
      fetchLeaderboard();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Copy failed" });
    } finally {
      setCopying(null);
    }
  };

  const medal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">Leaderboard</h3>
        <p className="text-xs text-muted">
          See who&apos;s performing best. Copy their portfolio allocation using your available cash.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-lg border p-3 text-xs ${
            message.type === "success"
              ? "border-positive/20 bg-positive-bg text-positive"
              : "border-negative/20 bg-negative-bg text-negative"
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-card-border animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-card-border/60 bg-card p-8 text-center text-muted text-sm">
          No users yet.
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, i) => {
            const isMe = entry.user_id === userId;
            const isUp = entry.gain_percent >= 0;
            const isConfirming = confirmId === entry.user_id;
            const isCopying = copying === entry.user_id;

            return (
              <div
                key={entry.user_id}
                className={`rounded-2xl border bg-card p-5 space-y-3 transition-colors ${
                  isMe ? "border-accent/40 bg-accent/5" : "border-card-border"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <span className="text-lg w-8 text-center shrink-0">
                    {typeof medal(i + 1) === "string" && medal(i + 1).startsWith("#") ? (
                      <span className="text-sm font-bold text-muted">{medal(i + 1)}</span>
                    ) : (
                      medal(i + 1)
                    )}
                  </span>

                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">{entry.username}</p>
                      {isMe && (
                        <span className="text-[10px] font-medium text-accent border border-accent/30 rounded-full px-1.5 py-px">
                          you
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted">${fmt(entry.total_value)} total value</p>
                  </div>

                  {/* Gain */}
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${isUp ? "text-positive" : "text-negative"}`}>
                      {isUp ? "+" : "-"}{fmt(entry.gain_percent)}%
                    </p>
                    <p className={`text-xs ${isUp ? "text-positive/70" : "text-negative/70"}`}>
                      {isUp ? "+" : "-"}${fmt(entry.gain_amount)}
                    </p>
                  </div>

                  {/* Copy button */}
                  {!isMe && (
                    <div className="shrink-0">
                      {isConfirming ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setConfirmId(null)}
                            className="text-xs text-muted hover:text-foreground"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleCopy(entry.user_id)}
                            className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent/90 transition-colors"
                          >
                            Confirm
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(entry.user_id)}
                          disabled={!!copying}
                          className="px-3 py-1.5 rounded-lg border border-card-border bg-surface text-xs font-medium text-foreground hover:bg-card transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCopying ? "Copying..." : "Copy"}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Positions */}
                {entry.positions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pl-12">
                    {entry.positions.map((pos) => (
                      <span
                        key={pos.ticker}
                        className="inline-flex items-center gap-1 rounded-full border border-card-border bg-surface px-2.5 py-0.5 text-xs"
                      >
                        <span className="font-mono font-bold text-foreground">{pos.ticker}</span>
                        <span className="text-muted">×{pos.shares}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={fetchLeaderboard}
        disabled={loading}
        className="text-xs text-muted hover:text-foreground transition-colors disabled:opacity-50"
      >
        ↻ Refresh
      </button>
    </div>
  );
}

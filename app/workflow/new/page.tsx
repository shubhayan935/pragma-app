"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Database, Lightbulb } from "lucide-react";
import Link from "next/link";

export default function NewWorkflow() {
  const router = useRouter();
  const [intent, setIntent] = useState("");
  const [schedule, setSchedule] = useState<"once" | "periodic">("once");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (intent.trim()) {
      // Navigate directly to planning page
      router.push(`/workflow/new/plan?intent=${encodeURIComponent(intent)}`);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      {/* <header className="border-b" style={{
        background: "var(--bg-secondary)",
        borderColor: "var(--border-default)"
      }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Build Your Enrichment Workflow
          </h1>
        </div>
      </header> */}

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          {/* <Link
            href="/"
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-elevated)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <ArrowLeft size={20} />
          </Link> */}
          <h2 className="text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Build Your Enrichment Workflow
          </h2>
          <p className="text-lg" style={{ color: "var(--text-tertiary)" }}>
            Describe what you want to enrich, and we'll handle it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Data Source Section */}
          <div className="p-5 rounded-xl border" style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border-default)"
          }}>
            <label className="block text-xs uppercase font-medium tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
              Data Source
            </label>
            <div className="p-3 rounded-lg flex items-center justify-between" style={{
              background: "var(--bg-tertiary)"
            }}>
              <div className="flex items-center gap-3">
                <Database size={20} style={{ color: "var(--text-tertiary)" }} />
                <div>
                  <p className="text-sm font-mono" style={{ color: "var(--text-primary)" }}>
                    postgres-prod.public.transactions
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                    2,450 rows • 12 columns
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-medium rounded border transition-colors"
                style={{
                  borderColor: "var(--border-default)",
                  color: "var(--text-secondary)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-elevated)";
                  e.currentTarget.style.borderColor = "var(--border-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "var(--border-default)";
                }}
              >
                Change
              </button>
            </div>
          </div>

          {/* Enrichment Intent Section */}
          <div className="p-5 rounded-xl border" style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border-default)"
          }}>
            <label
              htmlFor="intent"
              className="block text-xs uppercase font-medium tracking-wider mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              Enrichment Intent
            </label>
            <textarea
              id="intent"
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              placeholder="Clean up inconsistent merchant names and pull full product details for each SKU code..."
              rows={6}
              className="w-full p-3 rounded-lg border text-base resize-none focus:outline-none focus:ring-2 transition-all"
              style={{
                background: "var(--bg-tertiary)",
                borderColor: "var(--border-hover)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent-primary)";
                e.currentTarget.style.boxShadow = `0 0 0 3px rgba(249, 115, 22, 0.1)`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border-hover)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <div className="flex items-start gap-2 mt-3">
              <Lightbulb size={16} style={{ color: "var(--accent-primary)", marginTop: "2px" }} />
              <p className="text-xs italic" style={{ color: "var(--text-tertiary)" }}>
                Try: "Standardize company names" or "Fill missing contact info from LinkedIn"
              </p>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="p-5 rounded-xl border" style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border-default)"
          }}>
            <label className="block text-xs uppercase font-medium tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
              Schedule
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="schedule"
                  value="once"
                  checked={schedule === "once"}
                  onChange={(e) => setSchedule(e.target.value as "once" | "periodic")}
                  className="w-4 h-4 accent-orange-500"
                  style={{ accentColor: "var(--accent-primary)" }}
                />
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Run once
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="schedule"
                  value="periodic"
                  checked={schedule === "periodic"}
                  onChange={(e) => setSchedule(e.target.value as "once" | "periodic")}
                  className="w-4 h-4"
                  style={{ accentColor: "var(--accent-primary)" }}
                />
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Run periodically
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={!intent.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: intent.trim() ? "var(--accent-primary)" : "var(--border-default)",
                color: "var(--text-primary)"
              }}
              onMouseEnter={(e) => {
                if (intent.trim()) {
                  e.currentTarget.style.background = "var(--accent-hover)";
                }
              }}
              onMouseLeave={(e) => {
                if (intent.trim()) {
                  e.currentTarget.style.background = "var(--accent-primary)";
                }
              }}
            >
              Start Building
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

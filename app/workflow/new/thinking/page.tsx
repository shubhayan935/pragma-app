"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, Paperclip, Play } from "lucide-react";

interface ThinkingStep {
  title: string;
  content: string;
  duration: number; // ms to show this step
}

const thinkingSteps: ThinkingStep[] = [
  {
    title: "Analyzing Schema",
    content: `I've inspected your transactions table schema. Key columns identified: merchant_name (VARCHAR, high variance), sku_code (VARCHAR), product_name (VARCHAR, 40% null). I'll need to:

1. Run entity resolution on merchant_name to detect variants
2. Use sku_code as lookup key for product enrichment
3. Fill product_name, category, price from external sources`,
    duration: 4000,
  },
  {
    title: "Selecting Enrichment Strategy",
    content: `For merchant_name, I'll use fuzzy matching (Levenshtein distance < 0.85) combined with business name standardization rules. For sku_code, I'll prioritize:
1. Internal product catalog (if available)
2. Amazon Product API
3. Web search fallback for remaining SKUs

Estimated coverage: 95% for merchants, 88% for products`,
    duration: 6000,
  },
  {
    title: "Planning Workflow",
    content: `Building execution graph with 7 nodes:
→ Load & inspect data
→ Cluster merchant variants
→ Unify to canonical names
→ Extract SKU lookup keys
→ Fetch product metadata (parallel)
→ Merge enriched data
→ Write back results

Ready for your review.`,
    duration: 6000,
  },
];

export default function ThinkingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intent = searchParams.get("intent") || "Enrich data";

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [displayedSteps, setDisplayedSteps] = useState<ThinkingStep[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((t) => t + 0.1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Step progression
  useEffect(() => {
    if (currentStepIndex >= thinkingSteps.length) {
      setIsComplete(true);
      return;
    }

    const currentStep = thinkingSteps[currentStepIndex];
    const timer = setTimeout(() => {
      setDisplayedSteps((prev) => [...prev, currentStep]);
      setCurrentStepIndex((i) => i + 1);
    }, currentStepIndex === 0 ? 1000 : currentStep.duration);

    return () => clearTimeout(timer);
  }, [currentStepIndex]);

  const handleApprove = () => {
    router.push("/workflow/new/plan");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        {/* Query Card */}
        <div className="mb-8 p-4 rounded-lg" style={{ background: "var(--bg-elevated)" }}>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
            {intent}
          </p>
        </div>

        {/* Thinking Steps */}
        <div className="space-y-8">
          {displayedSteps.map((step, index) => (
            <div key={index} className="pb-8 border-b" style={{ borderColor: "var(--border-default)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {!isComplete && index === displayedSteps.length - 1 ? "Thinking..." : step.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-mono" style={{ color: "var(--text-tertiary)" }}>
                  <Clock size={14} />
                  <span>{elapsedTime.toFixed(1)}s</span>
                </div>
              </div>

              <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
                {step.content}
              </div>

              {/* Loading dots */}
              {!isComplete && index === displayedSteps.length - 1 && (
                <div className="flex items-center gap-1.5 mt-4">
                  <div
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{
                      background: "var(--text-tertiary)",
                      animationDelay: "0ms",
                      animationDuration: "1.4s"
                    }}
                  />
                  <div
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{
                      background: "var(--text-tertiary)",
                      animationDelay: "200ms",
                      animationDuration: "1.4s"
                    }}
                  />
                  <div
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{
                      background: "var(--text-tertiary)",
                      animationDelay: "400ms",
                      animationDuration: "1.4s"
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Completion State */}
        {isComplete && (
          <div className="mt-8 p-4 rounded-lg border text-center" style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--status-success)"
          }}>
            <p className="text-sm font-medium" style={{ color: "var(--status-success)" }}>
              ✓ Workflow plan ready for review
            </p>
          </div>
        )}
      </main>

      {/* Bottom Input/Action Bar */}
      <div className="sticky bottom-0 border-t" style={{
        background: "var(--bg-secondary)",
        borderColor: "var(--border-default)"
      }}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          {isComplete ? (
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg border font-medium transition-colors"
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
                Refine Plan
              </button>
              <button
                onClick={handleApprove}
                className="px-6 py-2 rounded-lg font-semibold transition-colors"
                style={{
                  background: "var(--accent-primary)",
                  color: "var(--text-primary)"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--accent-hover)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "var(--accent-primary)"}
              >
                Approve Plan
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Ask for refinements or new cohorts..."
                className="flex-1 px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all"
                style={{
                  background: "var(--bg-tertiary)",
                  borderColor: "var(--border-hover)",
                  color: "var(--text-primary)"
                }}
                disabled
              />
              <button
                className="p-2.5 rounded-lg transition-colors"
                style={{ color: "var(--text-tertiary)" }}
                disabled
              >
                <Paperclip size={20} />
              </button>
              <button
                className="p-2.5 rounded-lg transition-colors"
                style={{ color: "var(--text-tertiary)" }}
                disabled
              >
                <Play size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

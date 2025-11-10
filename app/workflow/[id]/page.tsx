"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Download, Info } from "lucide-react";

interface EnrichedRow {
  id: string;
  merchant: string;
  sku: string;
  product: string;
  category?: string;
}

const sampleData: EnrichedRow[] = [
  { id: "001", merchant: "Amazon.com", sku: "B08N5WRWNW", product: "Echo Dot 4th Generation", category: "Electronics" },
  { id: "002", merchant: "Amazon.com", sku: "B09B8RXYYH", product: "Fire TV Stick 4K", category: "Electronics" },
  { id: "003", merchant: "Walmart", sku: "55126890", product: "Great Value Coffee", category: "Grocery" },
  { id: "004", merchant: "Target", sku: "12345678", product: "Up & Up Paper Towels", category: "Household" },
  { id: "005", merchant: "Best Buy", sku: "6428324", product: "Samsung 55\" TV", category: "Electronics" },
];

interface ProvenanceTooltipProps {
  field: string;
  value: string;
  source: string;
  confidence: number;
  timestamp: string;
  unifiedFrom?: string[];
}

function ProvenanceTooltip({ field, value, source, confidence, timestamp, unifiedFrom }: ProvenanceTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <span
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {value}
      </span>

      {isVisible && (
        <div
          className="absolute left-0 top-full mt-2 z-50 w-80 p-3 rounded-lg shadow-lg border-l-4"
          style={{
            background: "var(--bg-elevated)",
            borderLeftColor: "var(--accent-primary)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="text-xs space-y-2">
            <div>
              <p className="uppercase font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                Provenance
              </p>
            </div>
            <div>
              <p className="font-mono mb-0.5" style={{ color: "var(--text-primary)" }}>
                {field}: "{value}"
              </p>
              {unifiedFrom && (
                <p className="text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>
                  → Unified from: {unifiedFrom.map(v => `"${v}"`).join(", ")}
                </p>
              )}
              <p style={{ color: "var(--text-tertiary)" }}>
                → Source: {source}
              </p>
              <p style={{ color: "var(--text-tertiary)" }}>
                → Fetched: {timestamp}
              </p>
              <p style={{ color: "var(--text-tertiary)" }}>
                → Confidence: {confidence}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkflowResults() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <header className="border-b" style={{
        background: "var(--bg-secondary)",
        borderColor: "var(--border-default)"
      }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-elevated)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Merchant Cleanup Results
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Status Banner */}
        <div className="mb-6 flex items-center gap-3 p-4 rounded-lg" style={{ background: "var(--bg-secondary)" }}>
          <CheckCircle2 size={20} style={{ color: "var(--status-success)" }} />
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Workflow Completed
            </p>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              Nov 9, 2025 3:42 PM • 8m 23s
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
            <p className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              2,450
            </p>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              ROWS ENRICHED
            </p>
          </div>
          <div className="p-4 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
            <p className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              240 → 85
            </p>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              MERCHANT VARIANTS UNIFIED
            </p>
          </div>
          <div className="p-4 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
            <p className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              88%
            </p>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              SKU COVERAGE
            </p>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-lg border overflow-hidden" style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border-default)"
        }}>
          <div className="flex items-center justify-between p-4 border-b" style={{
            borderColor: "var(--border-default)"
          }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              ENRICHED DATA
            </h3>
            <div className="flex gap-2">
              <button
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded border transition-colors"
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
                <Download size={14} />
                Export CSV
              </button>
              <button
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded border transition-colors"
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
                <Download size={14} />
                Export JSON
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border-default)" }}>
                  <th className="px-4 py-3 text-left text-xs uppercase font-medium tracking-wider" style={{ color: "var(--text-muted)" }}>
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs uppercase font-medium tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Merchant
                  </th>
                  <th className="px-4 py-3 text-left text-xs uppercase font-medium tracking-wider" style={{ color: "var(--text-muted)" }}>
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left text-xs uppercase font-medium tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs uppercase font-medium tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Category
                  </th>
                </tr>
              </thead>
              <tbody>
                {sampleData.map((row, index) => (
                  <tr
                    key={row.id}
                    className="border-b transition-colors"
                    style={{
                      borderColor: "var(--border-default)"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-elevated)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td className="px-4 py-3 text-sm font-mono" style={{ color: "var(--text-tertiary)" }}>
                      {row.id}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--text-primary)" }}>
                      {index === 0 ? (
                        <ProvenanceTooltip
                          field="merchant_name"
                          value={row.merchant}
                          source="Entity Resolution"
                          confidence={95}
                          timestamp="Nov 9, 2025 3:40 PM"
                          unifiedFrom={["Amazon.com", "amazon", "AMZN"]}
                        />
                      ) : (
                        row.merchant
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono" style={{ color: "var(--text-tertiary)" }}>
                      {row.sku}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--text-primary)" }}>
                      {index === 0 ? (
                        <ProvenanceTooltip
                          field="product_name"
                          value={row.product}
                          source="Amazon Product API"
                          confidence={98}
                          timestamp="Nov 9, 2025 3:40 PM"
                        />
                      ) : (
                        row.product
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {row.category}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 rounded-lg flex items-start gap-3" style={{
          background: "var(--bg-secondary)",
          borderLeft: "3px solid var(--accent-primary)"
        }}>
          <Info size={18} style={{ color: "var(--accent-primary)", marginTop: "2px" }} />
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Hover over any enriched field to see its provenance, source, and confidence level.
          </p>
        </div>
      </main>
    </div>
  );
}

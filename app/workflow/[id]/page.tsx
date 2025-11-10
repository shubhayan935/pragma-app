"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  CheckCircle2,
  ArrowLeft,
  Play,
  Download,
  Clock,
  Database,
  Search,
  FileText,
  Sparkles,
  Layers,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type NodeStatus = "pending" | "running" | "done" | "needs_input" | "error" | "propagating";

interface EnhancedNodeData extends Record<string, unknown> {
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  status?: NodeStatus;
  metrics?: { label: string; value: string }[];
  confidence?: number;
  progress?: number;
}

const reactFlowOptions = { hideAttribution: true };

// Create default React Flow nodes
const executedNodes: Node[] = [
  {
    id: "1",
    type: "input",
    position: { x: 250, y: 50 },
    data: { label: "Load Data" },
  },
  {
    id: "2",
    type: "default",
    position: { x: 250, y: 150 },
    data: { label: "Cluster Merchants" },
  },
  {
    id: "3",
    type: "default",
    position: { x: 250, y: 260 },
    data: { label: "Unify Names" },
  },
  {
    id: "4",
    type: "default",
    position: { x: 250, y: 370 },
    data: { label: "Extract SKUs" },
  },
  {
    id: "5a",
    type: "default",
    position: { x: 80, y: 480 },
    data: { label: "Catalog" },
  },
  {
    id: "5b",
    type: "default",
    position: { x: 250, y: 480 },
    data: { label: "API" },
  },
  {
    id: "5c",
    type: "default",
    position: { x: 420, y: 480 },
    data: { label: "Web Search" },
  },
  {
    id: "6",
    type: "default",
    position: { x: 250, y: 590 },
    data: { label: "Merge Data" },
  },
  {
    id: "7",
    type: "output",
    position: { x: 250, y: 690 },
    data: { label: "Write Back" },
  },
];

const executedEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", style: { stroke: "#5d5d5dff", strokeWidth: 1, opacity: 1 }, markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: "#5d5d5dff" } },
  { id: "e2-3", source: "2", target: "3", style: { stroke: "#5d5d5dff", strokeWidth: 1, opacity: 1 }, markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: "#5d5d5dff" } },
  { id: "e3-4", source: "3", target: "4", style: { stroke: "#5d5d5dff", strokeWidth: 1, opacity: 1 }, markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: "#5d5d5dff" } },
  { id: "e4-5a", source: "4", target: "5a", style: { stroke: "#5d5d5dff", strokeWidth: 1, opacity: 1 }, markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: "#5d5d5dff" } },
  { id: "e4-5b", source: "4", target: "5b", style: { stroke: "#5d5d5dff", strokeWidth: 1, opacity: 1 }, markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: "#5d5d5dff" } },
  { id: "e4-5c", source: "4", target: "5c", style: { stroke: "#5d5d5dff", strokeWidth: 1, opacity: 1 }, markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: "#5d5d5dff" } },
  { id: "e5a-6", source: "5a", target: "6", style: { stroke: "#5d5d5dff", strokeWidth: 1, opacity: 1 }, markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: "#5d5d5dff" } },
  { id: "e5b-6", source: "5b", target: "6", style: { stroke: "#5d5d5dff", strokeWidth: 1, opacity: 1 }, markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: "#5d5d5dff" } },
  { id: "e5c-6", source: "5c", target: "6", style: { stroke: "#5d5d5dff", strokeWidth: 1, opacity: 1 }, markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: "#5d5d5dff" } },
  { id: "e6-7", source: "6", target: "7", style: { stroke: "#5d5d5dff", strokeWidth: 1, opacity: 1 }, markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: "#5d5d5dff" } },
];

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;

  const [nodes, , onNodesChange] = useNodesState(executedNodes);
  const [edges, , onEdgesChange] = useEdgesState(executedEdges);
  const [showStats, setShowStats] = useState(true);
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-secondary)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-[var(--text-primary)]">
                Merchant Enrichment Workflow
              </h1>
              <p className="text-sm text-[var(--text-tertiary)] mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={14} className="text-green-500" />
                  Completed
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  Nov 10, 2025 00:26:07
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  104m 41s
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download size={16} className="mr-2" />
              Export Results
            </Button>
            <Button>
              <Play size={16} className="mr-2" />
              Duplicate Workflow
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel - React Flow Graph */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            style={{
              background: "var(--bg-primary)",
            }}
            proOptions={reactFlowOptions}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="rgba(255, 255, 255, 0.35)"
              style={{
                background: "var(--bg-primary)",
              }}
            />
          </ReactFlow>
        </div>

        {/* Right Panel - Execution Stats */}
        {showStats && (
          <div className="w-[600px] border-l border-[var(--border-default)] bg-[var(--bg-secondary)] overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Execution Summary */}
              <div>
                <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 uppercase tracking-wider">
                  Execution Summary
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--text-tertiary)]">Status</span>
                    <span className="text-sm font-medium text-green-500 flex items-center gap-1">
                      <CheckCircle2 size={14} />
                      Completed
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--text-tertiary)]">Duration</span>
                    <span className="text-sm font-mono text-[var(--text-primary)]">104m 41s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--text-tertiary)]">Steps</span>
                    <span className="text-sm font-mono text-[var(--text-primary)]">7/7</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--text-tertiary)]">Rows Processed</span>
                    <span className="text-sm font-mono text-[var(--text-primary)]">2,450</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--text-tertiary)]">Throughput</span>
                    <span className="text-sm font-mono text-[var(--text-primary)]">24.3 rows/sec</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--text-tertiary)]">Billable Actions</span>
                    <span className="text-sm font-mono text-[var(--text-primary)]">3,127</span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="border-t border-[var(--border-default)] pt-6">
                <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 uppercase tracking-wider">
                  Performance
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[var(--bg-elevated)]">
                    <div className="text-xs text-[var(--text-tertiary)] mb-1">Avg Read Latency</div>
                    <div className="text-lg font-bold text-[var(--text-primary)]">127ms</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--bg-elevated)]">
                    <div className="text-xs text-[var(--text-tertiary)] mb-1">Avg Write Latency</div>
                    <div className="text-lg font-bold text-[var(--text-primary)]">284ms</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--bg-elevated)]">
                    <div className="text-xs text-[var(--text-tertiary)] mb-1">Peak Memory</div>
                    <div className="text-lg font-bold text-[var(--text-primary)]">412MB</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--bg-elevated)]">
                    <div className="text-xs text-[var(--text-tertiary)] mb-1">Est. Cost</div>
                    <div className="text-lg font-bold text-[var(--text-primary)]">$0.14</div>
                  </div>
                </div>
              </div>

              {/* Decision Summary Table */}
              <div className="border-t border-[var(--border-default)] pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                    Decisions & Enrichments
                  </h2>
                  {selectedDecision && (
                    <button
                      onClick={() => setSelectedDecision(null)}
                      className="text-xs text-[var(--accent-primary)] hover:underline flex items-center gap-1"
                    >
                      <ArrowLeft size={12} />
                      Back to list
                    </button>
                  )}
                </div>

                {!selectedDecision ? (
                  <div className="space-y-2">
                    {/* Merchant Clustering Decision */}
                    <div
                      onClick={() => setSelectedDecision("merchant-clustering")}
                      className="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] cursor-pointer hover:border-[var(--accent-primary)] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Search size={14} className="text-[var(--accent-primary)]" />
                          <span className="text-sm font-medium text-[var(--text-primary)]">Merchant Clustering</span>
                        </div>
                        <span className="text-xs font-mono text-[var(--text-tertiary)]">Step 2</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[var(--text-tertiary)]">Algorithm</span>
                          <span className="text-[var(--text-primary)] font-mono">Fuzzy Match (85%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-tertiary)]">Variants Found</span>
                          <span className="text-[var(--accent-primary)] font-mono">240 → 85</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-tertiary)]">Confidence</span>
                          <span className="text-green-500 font-mono">95%</span>
                        </div>
                      </div>
                    </div>

                    {/* Product Enrichment from Catalog */}
                    <div
                      onClick={() => setSelectedDecision("internal-catalog")}
                      className="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] cursor-pointer hover:border-[var(--accent-primary)] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Database size={14} className="text-[var(--accent-primary)]" />
                          <span className="text-sm font-medium text-[var(--text-primary)]">Internal Catalog</span>
                        </div>
                        <span className="text-xs font-mono text-[var(--text-tertiary)]">Step 5a</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[var(--text-tertiary)]">SKUs Matched</span>
                          <span className="text-[var(--accent-primary)] font-mono">1,234 / 1,840</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-tertiary)]">Match Rate</span>
                          <span className="text-green-500 font-mono">67%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-tertiary)]">Fields Enriched</span>
                          <span className="text-[var(--text-primary)] font-mono">name, category, price</span>
                        </div>
                      </div>
                    </div>

                    {/* Product Enrichment from API */}
                    <div
                      onClick={() => setSelectedDecision("amazon-api")}
                      className="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] cursor-pointer hover:border-[var(--accent-primary)] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles size={14} className="text-[var(--accent-primary)]" />
                          <span className="text-sm font-medium text-[var(--text-primary)]">Amazon Product API</span>
                        </div>
                        <span className="text-xs font-mono text-[var(--text-tertiary)]">Step 5b</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[var(--text-tertiary)]">SKUs Matched</span>
                          <span className="text-[var(--accent-primary)] font-mono">312 / 606</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-tertiary)]">Match Rate</span>
                          <span className="text-[var(--accent-primary)] font-mono">51%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-tertiary)]">Billable Actions</span>
                          <span className="text-[var(--text-primary)] font-mono">606 requests</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-tertiary)]">Cost</span>
                          <span className="text-[var(--text-primary)] font-mono">$1.82</span>
                        </div>
                      </div>
                    </div>

                    {/* Product Enrichment from Web Search */}
                    <div
                      onClick={() => setSelectedDecision("web-search")}
                      className="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] cursor-pointer hover:border-[var(--accent-primary)] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Search size={14} className="text-[var(--accent-primary)]" />
                          <span className="text-sm font-medium text-[var(--text-primary)]">Web Search Fallback</span>
                        </div>
                        <span className="text-xs font-mono text-[var(--text-tertiary)]">Step 5c</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[var(--text-tertiary)]">SKUs Matched</span>
                          <span className="text-[var(--accent-primary)] font-mono">143 / 294</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-tertiary)]">Match Rate</span>
                          <span className="text-[var(--text-tertiary)] font-mono">49%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-tertiary)]">Search Queries</span>
                          <span className="text-[var(--text-primary)] font-mono">294 queries</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-tertiary)]">Avg Confidence</span>
                          <span className="text-[var(--text-tertiary)] font-mono">72%</span>
                        </div>
                      </div>
                    </div>

                    {/* Merge Strategy */}
                    <div
                      onClick={() => setSelectedDecision("merge-strategy")}
                      className="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] cursor-pointer hover:border-[var(--accent-primary)] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Layers size={14} className="text-[var(--accent-primary)]" />
                          <span className="text-sm font-medium text-[var(--text-primary)]">Data Merge Strategy</span>
                        </div>
                        <span className="text-xs font-mono text-[var(--text-tertiary)]">Step 6</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[var(--text-tertiary)]">Priority</span>
                          <span className="text-[var(--text-primary)] font-mono">Catalog → API → Web</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-tertiary)]">Conflicts Resolved</span>
                          <span className="text-[var(--accent-primary)] font-mono">87 cases</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-tertiary)]">Final Coverage</span>
                          <span className="text-green-500 font-mono">92%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Detailed view based on selected decision */}
                    {selectedDecision === "merchant-clustering" && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Search size={18} className="text-[var(--accent-primary)]" />
                          <h3 className="text-base font-semibold text-[var(--text-primary)]">Merchant Clustering</h3>
                          <span className="text-xs font-mono text-[var(--text-tertiary)] ml-auto">Step 2</span>
                        </div>

                        <div className="space-y-4">
                          <div className="p-4 rounded-lg bg-[var(--bg-elevated)]">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Decision Reasoning</h4>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                              Detected 240 unique merchant name variations with high similarity patterns. Applied Levenshtein distance algorithm with 85% threshold to identify and cluster merchant variants. This approach balances precision and recall for entity resolution.
                            </p>
                          </div>

                          <div className="p-4 rounded-lg bg-[var(--bg-elevated)]">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Algorithm Details</h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Method</span>
                                <span className="text-[var(--text-primary)] font-mono">Fuzzy String Matching</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Distance Function</span>
                                <span className="text-[var(--text-primary)] font-mono">Levenshtein</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Similarity Threshold</span>
                                <span className="text-[var(--accent-primary)] font-mono">85%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Processing Time</span>
                                <span className="text-[var(--text-primary)] font-mono">4.2s</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 rounded-lg bg-[var(--bg-elevated)]">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Results</h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Original Variants</span>
                                <span className="text-[var(--text-primary)] font-mono">240</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Unified Entities</span>
                                <span className="text-[var(--accent-primary)] font-mono">85</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Reduction Rate</span>
                                <span className="text-green-500 font-mono">65%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Confidence Score</span>
                                <span className="text-green-500 font-mono">95%</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 rounded-lg bg-[var(--bg-elevated)]">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Sample Clusters</h4>
                            <div className="space-y-3 text-xs">
                              <div className="p-2 rounded border border-[var(--border-default)]">
                                <div className="font-mono text-[var(--accent-primary)] mb-1">Walmart Inc.</div>
                                <div className="text-[var(--text-tertiary)] space-y-0.5">
                                  <div>• Walmart</div>
                                  <div>• Wal-Mart</div>
                                  <div>• Walmart Inc</div>
                                  <div>• Walmart Stores</div>
                                </div>
                              </div>
                              <div className="p-2 rounded border border-[var(--border-default)]">
                                <div className="font-mono text-[var(--accent-primary)] mb-1">Amazon.com</div>
                                <div className="text-[var(--text-tertiary)] space-y-0.5">
                                  <div>• Amazon</div>
                                  <div>• Amazon.com</div>
                                  <div>• Amazon Inc</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedDecision === "internal-catalog" && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Database size={18} className="text-[var(--accent-primary)]" />
                          <h3 className="text-base font-semibold text-[var(--text-primary)]">Internal Catalog Lookup</h3>
                          <span className="text-xs font-mono text-[var(--text-tertiary)] ml-auto">Step 5a</span>
                        </div>

                        <div className="space-y-4">
                          <div className="p-4 rounded-lg bg-[var(--bg-elevated)]">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Decision Reasoning</h4>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                              Internal catalog was prioritized as the first enrichment source due to highest data quality, zero latency cost, and complete ownership. 67% of SKUs were successfully matched, providing comprehensive product metadata.
                            </p>
                          </div>

                          <div className="p-4 rounded-lg bg-[var(--bg-elevated)]">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Lookup Strategy</h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Data Source</span>
                                <span className="text-[var(--text-primary)] font-mono">postgres-prod.products</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Match Key</span>
                                <span className="text-[var(--text-primary)] font-mono">sku_code (exact)</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Query Time</span>
                                <span className="text-[var(--text-primary)] font-mono">142ms</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Cache Strategy</span>
                                <span className="text-[var(--accent-primary)] font-mono">In-memory (Redis)</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 rounded-lg bg-[var(--bg-elevated)]">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Match Results</h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Total SKUs</span>
                                <span className="text-[var(--text-primary)] font-mono">1,840</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Matched SKUs</span>
                                <span className="text-[var(--accent-primary)] font-mono">1,234</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Match Rate</span>
                                <span className="text-green-500 font-mono">67%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Unmatched (fallback)</span>
                                <span className="text-[var(--text-tertiary)] font-mono">606</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 rounded-lg bg-[var(--bg-elevated)]">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Fields Enriched</h4>
                            <div className="space-y-2 text-xs">
                              <div className="p-2 rounded border border-[var(--border-default)]">
                                <div className="font-mono text-[var(--accent-primary)] mb-1">product_name</div>
                                <div className="text-[var(--text-tertiary)]">Full product title and description</div>
                              </div>
                              <div className="p-2 rounded border border-[var(--border-default)]">
                                <div className="font-mono text-[var(--accent-primary)] mb-1">category</div>
                                <div className="text-[var(--text-tertiary)]">Product taxonomy (L1, L2, L3)</div>
                              </div>
                              <div className="p-2 rounded border border-[var(--border-default)]">
                                <div className="font-mono text-[var(--accent-primary)] mb-1">price</div>
                                <div className="text-[var(--text-tertiary)]">MSRP and current price</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedDecision === "amazon-api" && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles size={18} className="text-[var(--accent-primary)]" />
                          <h3 className="text-base font-semibold text-[var(--text-primary)]">Amazon Product API</h3>
                          <span className="text-xs font-mono text-[var(--text-tertiary)] ml-auto">Step 5b</span>
                        </div>

                        <div className="space-y-4">
                          <div className="p-4 rounded-lg bg-[var(--bg-elevated)]">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Decision Reasoning</h4>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                              For the 606 SKUs not found in internal catalog, Amazon Product API was selected as the primary external enrichment source. With 51% match rate and comprehensive product data, it provided high-quality enrichment at reasonable API costs.
                            </p>
                          </div>

                          <div className="p-4 rounded-lg bg-[var(--bg-elevated)]">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">API Configuration</h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">API Endpoint</span>
                                <span className="text-[var(--text-primary)] font-mono">Product Advertising API v5</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Rate Limit</span>
                                <span className="text-[var(--text-primary)] font-mono">10 req/sec</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Batch Size</span>
                                <span className="text-[var(--text-primary)] font-mono">10 items/request</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Timeout</span>
                                <span className="text-[var(--text-primary)] font-mono">5s</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 rounded-lg bg-[var(--bg-elevated)]">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">API Performance</h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Total Requests</span>
                                <span className="text-[var(--text-primary)] font-mono">606</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Successful Matches</span>
                                <span className="text-[var(--accent-primary)] font-mono">312</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Match Rate</span>
                                <span className="text-[var(--accent-primary)] font-mono">51%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Avg Response Time</span>
                                <span className="text-[var(--text-primary)] font-mono">287ms</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Failed Requests</span>
                                <span className="text-[var(--text-tertiary)] font-mono">3 (retried)</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 rounded-lg bg-[var(--bg-elevated)]">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Cost Breakdown</h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">API Requests</span>
                                <span className="text-[var(--text-primary)] font-mono">606 × $0.0003</span>
                                <span className="text-[var(--text-primary)] font-mono">$0.182</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Cost per Match</span>
                                <span className="text-[var(--text-primary)] font-mono">$0.0058</span>
                              </div>
                              <div className="flex justify-between pt-2 border-t border-[var(--border-default)]">
                                <span className="text-[var(--text-primary)] font-medium">Total Cost</span>
                                <span className="text-[var(--accent-primary)] font-mono font-medium">$1.82</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 rounded-lg bg-[var(--bg-elevated)]">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Sample Enrichments</h4>
                            <div className="space-y-3 text-xs">
                              <div className="p-2 rounded border border-[var(--border-default)]">
                                <div className="flex justify-between mb-1">
                                  <span className="font-mono text-[var(--accent-primary)]">SKU-8472910</span>
                                  <span className="text-green-500">Matched</span>
                                </div>
                                <div className="text-[var(--text-secondary)]">Sony WH-1000XM5 Wireless Headphones</div>
                                <div className="text-[var(--text-tertiary)] mt-1">Electronics &gt; Audio &gt; Headphones</div>
                              </div>
                              <div className="p-2 rounded border border-[var(--border-default)]">
                                <div className="flex justify-between mb-1">
                                  <span className="font-mono text-[var(--accent-primary)]">SKU-3390145</span>
                                  <span className="text-green-500">Matched</span>
                                </div>
                                <div className="text-[var(--text-secondary)]">Kindle Paperwhite (11th Gen)</div>
                                <div className="text-[var(--text-tertiary)] mt-1">Electronics &gt; E-Readers</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedDecision === "web-search" && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Search size={18} className="text-[var(--accent-primary)]" />
                          <h3 className="text-base font-semibold text-[var(--text-primary)]">Web Search Fallback</h3>
                          <span className="text-xs font-mono text-[var(--text-tertiary)] ml-auto">Step 5c</span>
                        </div>

                        <div className="space-y-4">
                          <div className="p-4 rounded-lg bg-[var(--bg-elevated)]">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Decision Reasoning</h4>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                              For 294 remaining unmatched SKUs, web search was employed as the final fallback strategy. Using structured queries and content parsing, achieved 49% additional coverage with moderate confidence scores averaging 72%.
                            </p>
                          </div>

                          <div className="p-4 rounded-lg bg-[var(--bg-elevated)]">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Search Strategy</h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Search Engine</span>
                                <span className="text-[var(--text-primary)] font-mono">Google Custom Search API</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Query Template</span>
                                <span className="text-[var(--text-primary)] font-mono">&quot;SKU {code} product&quot;</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Results per Query</span>
                                <span className="text-[var(--text-primary)] font-mono">Top 5</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Parsing Method</span>
                                <span className="text-[var(--text-primary)] font-mono">Schema.org + heuristics</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 rounded-lg bg-[var(--bg-elevated)]">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Search Results</h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Queries Executed</span>
                                <span className="text-[var(--text-primary)] font-mono">294</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Successful Matches</span>
                                <span className="text-[var(--accent-primary)] font-mono">143</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Match Rate</span>
                                <span className="text-[var(--text-tertiary)] font-mono">49%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Avg Confidence</span>
                                <span className="text-[var(--text-tertiary)] font-mono">72%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Avg Search Time</span>
                                <span className="text-[var(--text-primary)] font-mono">1.2s</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 rounded-lg bg-[var(--bg-elevated)]">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Confidence Distribution</h4>
                            <div className="space-y-2 text-xs">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-[var(--text-tertiary)]">High (90-100%)</span>
                                  <span className="text-green-500 font-mono">34 matches</span>
                                </div>
                                <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500" style={{ width: "24%" }} />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-[var(--text-tertiary)]">Medium (70-89%)</span>
                                  <span className="text-[var(--accent-primary)] font-mono">67 matches</span>
                                </div>
                                <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                  <div className="h-full bg-[var(--accent-primary)]" style={{ width: "47%" }} />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-[var(--text-tertiary)]">Low (50-69%)</span>
                                  <span className="text-[var(--text-tertiary)] font-mono">42 matches</span>
                                </div>
                                <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                  <div className="h-full bg-[var(--text-tertiary)]" style={{ width: "29%" }} />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 rounded-lg bg-[var(--bg-elevated)]">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Sample Queries</h4>
                            <div className="space-y-3 text-xs">
                              <div className="p-2 rounded border border-[var(--border-default)]">
                                <div className="flex justify-between mb-1">
                                  <span className="font-mono text-[var(--accent-primary)]">SKU-9284761</span>
                                  <span className="text-green-500">89% confidence</span>
                                </div>
                                <div className="text-[var(--text-secondary)]">Query: &quot;SKU-9284761 product&quot;</div>
                                <div className="text-[var(--text-tertiary)] mt-1">Found: Logitech MX Master 3S Mouse</div>
                              </div>
                              <div className="p-2 rounded border border-[var(--border-default)]">
                                <div className="flex justify-between mb-1">
                                  <span className="font-mono text-[var(--accent-primary)]">SKU-4719203</span>
                                  <span className="text-[var(--text-tertiary)]">63% confidence</span>
                                </div>
                                <div className="text-[var(--text-secondary)]">Query: &quot;SKU-4719203 product&quot;</div>
                                <div className="text-[var(--text-tertiary)] mt-1">Found: Generic USB-C Cable (uncertain)</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedDecision === "merge-strategy" && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Layers size={18} className="text-[var(--accent-primary)]" />
                          <h3 className="text-base font-semibold text-[var(--text-primary)]">Data Merge Strategy</h3>
                          <span className="text-xs font-mono text-[var(--text-tertiary)] ml-auto">Step 6</span>
                        </div>

                        <div className="space-y-4">
                          <div className="p-4 rounded-lg bg-[var(--bg-elevated)]">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Decision Reasoning</h4>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                              With enrichments from three sources (Internal Catalog, Amazon API, Web Search), a priority-based merge strategy was implemented. Internal catalog data takes precedence due to highest confidence, followed by API data, then web search results.
                            </p>
                          </div>

                          <div className="p-4 rounded-lg bg-[var(--bg-elevated)]">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Merge Priority</h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs">
                                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">1</div>
                                <div className="flex-1">
                                  <div className="text-[var(--text-primary)] font-medium">Internal Catalog</div>
                                  <div className="text-[var(--text-tertiary)]">Highest quality, verified data</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center font-bold">2</div>
                                <div className="flex-1">
                                  <div className="text-[var(--text-primary)] font-medium">Amazon Product API</div>
                                  <div className="text-[var(--text-tertiary)]">Structured, reliable external data</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <div className="w-6 h-6 rounded-full bg-[var(--text-tertiary)] text-white flex items-center justify-center font-bold">3</div>
                                <div className="flex-1">
                                  <div className="text-[var(--text-primary)] font-medium">Web Search</div>
                                  <div className="text-[var(--text-tertiary)]">Best-effort fallback with lower confidence</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 rounded-lg bg-[var(--bg-elevated)]">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Conflict Resolution</h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Total Conflicts Detected</span>
                                <span className="text-[var(--accent-primary)] font-mono">87</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Resolved by Priority</span>
                                <span className="text-[var(--text-primary)] font-mono">78</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Manual Review Flagged</span>
                                <span className="text-[var(--text-tertiary)] font-mono">9</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-tertiary)]">Resolution Strategy</span>
                                <span className="text-[var(--text-primary)] font-mono">Priority-based</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 rounded-lg bg-[var(--bg-elevated)]">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Coverage Summary</h4>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-[var(--text-tertiary)]">Internal Catalog</span>
                                  <span className="text-green-500 font-mono">1,234 SKUs (67%)</span>
                                </div>
                                <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500" style={{ width: "67%" }} />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-[var(--text-tertiary)]">+ Amazon API</span>
                                  <span className="text-[var(--accent-primary)] font-mono">312 SKUs (+17%)</span>
                                </div>
                                <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                  <div className="h-full bg-[var(--accent-primary)]" style={{ width: "84%" }} />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-[var(--text-tertiary)]">+ Web Search</span>
                                  <span className="text-[var(--text-tertiary)] font-mono">143 SKUs (+8%)</span>
                                </div>
                                <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                  <div className="h-full bg-[var(--text-tertiary)]" style={{ width: "92%" }} />
                                </div>
                              </div>
                              <div className="pt-2 border-t border-[var(--border-default)]">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-[var(--text-primary)] font-medium">Final Coverage</span>
                                  <span className="text-green-500 font-mono font-medium">1,689 / 1,840 (92%)</span>
                                </div>
                                <div className="h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500" style={{ width: "92%" }} />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 rounded-lg bg-[var(--bg-elevated)]">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Field-Level Merge</h4>
                            <div className="space-y-2 text-xs">
                              <div className="p-2 rounded border border-[var(--border-default)]">
                                <div className="font-mono text-[var(--accent-primary)] mb-1">product_name</div>
                                <div className="text-[var(--text-tertiary)]">Prefer: Catalog → API → Web</div>
                                <div className="text-[var(--text-secondary)] mt-1">1,689 fields populated (92%)</div>
                              </div>
                              <div className="p-2 rounded border border-[var(--border-default)]">
                                <div className="font-mono text-[var(--accent-primary)] mb-1">category</div>
                                <div className="text-[var(--text-tertiary)]">Prefer: Catalog → API (Web unreliable)</div>
                                <div className="text-[var(--text-secondary)] mt-1">1,546 fields populated (84%)</div>
                              </div>
                              <div className="p-2 rounded border border-[var(--border-default)]">
                                <div className="font-mono text-[var(--accent-primary)] mb-1">price</div>
                                <div className="text-[var(--text-tertiary)]">Prefer: Catalog only (API prices outdated)</div>
                                <div className="text-[var(--text-secondary)] mt-1">1,234 fields populated (67%)</div>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 rounded-lg bg-[var(--bg-elevated)]">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Example Conflict Resolution</h4>
                            <div className="space-y-3 text-xs">
                              <div className="p-2 rounded border border-[var(--border-default)]">
                                <div className="font-mono text-[var(--accent-primary)] mb-2">SKU-7291048</div>
                                <div className="space-y-1">
                                  <div className="flex items-start gap-2">
                                    <div className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px] font-bold mt-0.5">1</div>
                                    <div className="flex-1">
                                      <div className="text-[var(--text-tertiary)]">Catalog</div>
                                      <div className="text-[var(--text-primary)]">Apple AirPods Pro (2nd Gen)</div>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <div className="w-4 h-4 rounded-full bg-gray-500 text-white flex items-center justify-center text-[10px] font-bold mt-0.5">2</div>
                                    <div className="flex-1">
                                      <div className="text-[var(--text-tertiary)]">API</div>
                                      <div className="text-gray-500 line-through">AirPods Pro 2nd Generation</div>
                                    </div>
                                  </div>
                                  <div className="pt-1 border-t border-[var(--border-default)] flex items-center gap-1">
                                    <CheckCircle2 size={12} className="text-green-500" />
                                    <span className="text-green-500">Resolved: Used Catalog (priority 1)</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Data Quality Metrics */}
              <div className="border-t border-[var(--border-default)] pt-6">
                <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 uppercase tracking-wider">
                  Data Quality
                </h2>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-[var(--text-tertiary)]">Merchant Match Rate</span>
                      <span className="text-sm font-mono text-[var(--accent-hover)]">95%</span>
                    </div>
                    <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--accent-primary)]" style={{ width: "95%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-[var(--text-tertiary)]">Product Coverage</span>
                      <span className="text-sm font-mono text-[var(--accent-hover)]">92%</span>
                    </div>
                    <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--accent-primary)]" style={{ width: "92%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-[var(--text-tertiary)]">Data Completeness</span>
                      <span className="text-sm font-mono text-[var(--accent-hover)]">98%</span>
                    </div>
                    <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--accent-primary)]" style={{ width: "98%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Enrichment Results */}
              <div className="border-t border-[var(--border-default)] pt-6">
                <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 uppercase tracking-wider">
                  Enrichment Results
                </h2>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-[var(--bg-elevated)]">
                    <div className="text-xs text-[var(--text-tertiary)] mb-1">Merchants Unified</div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">240 → 85</div>
                    <div className="text-xs text-green-500 mt-1">65% reduction</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--bg-elevated)]">
                    <div className="text-xs text-[var(--text-tertiary)] mb-1">Products Enriched</div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">1,689</div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-1">of 1,840 SKUs (92%)</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--bg-elevated)]">
                    <div className="text-xs text-[var(--text-tertiary)] mb-1">Missing Data</div>
                    <div className="text-2xl font-bold text-[var(--text-tertiary)]">151</div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-1">SKUs not found (8%)</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--bg-elevated)]">
                    <div className="text-xs text-[var(--text-tertiary)] mb-1">Output Table</div>
                    <div className="text-sm font-mono text-[var(--accent-primary)]">enriched_tx</div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-1">2,450 rows written</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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

interface StatusStyle {
  bg: string;
  border: string;
  opacity: string;
  text?: string;
  pulse?: boolean;
}

type StatusStyles = Record<NodeStatus, StatusStyle>;

const reactFlowOptions = { hideAttribution: true };

// Custom Node Components (same as plan page)
function ActionNode({ data }: { data: EnhancedNodeData }) {
  const Icon = data.icon || Database;
  const status: NodeStatus = data.status || "pending";
  const confidence = data.confidence || 0;
  const progress = data.progress || 0;

  const statusStyles: StatusStyles = {
    pending: {
      bg: "rgba(31, 41, 55, 0.35)",
      border: "rgba(107, 114, 128, 0.3)",
      opacity: "opacity-85",
      text: "text-gray-400",
    },
    running: {
      bg: "#161616",
      border: "#F97316",
      opacity: "opacity-100",
      text: "text-[var(--text-primary)]",
      pulse: true,
    },
    done: {
      bg: "#1F2937",
      border: "#10B981",
      opacity: "opacity-100",
      text: "text-[var(--text-primary)]",
    },
    needs_input: {
      bg: "#1F2937",
      border: "#F59E0B",
      opacity: "opacity-100",
      text: "text-[var(--text-primary)]",
    },
    error: {
      bg: "#1F2937",
      border: "#DC2626",
      opacity: "opacity-100",
      text: "text-[var(--text-primary)]",
    },
    propagating: {
      bg: "rgba(31, 41, 55, 0.5)",
      border: "rgba(249, 115, 22, 0.4)",
      opacity: "opacity-90",
      text: "text-[var(--text-secondary)]",
    },
  };

  const style = statusStyles[status];

  return (
    <div
      className={`relative ${style.opacity} transition-all duration-300`}
      style={{ width: "180px" }}
    >
      {/* Main node container */}
      <div
        className="rounded-[14px] overflow-hidden"
        style={{
          background: style.bg,
          border: `1.5px solid ${style.border}`,
        }}
      >
        {/* Top row: icon + title */}
        <div className="px-3 py-2.5 flex items-center gap-2">
          {/* Confidence ring */}
          <div className="relative">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(249, 115, 22, 0.1)",
                border: `2px solid transparent`,
                borderTopColor: confidence > 0 ? "#F97316" : "transparent",
                borderRightColor: confidence > 25 ? "#F97316" : "transparent",
                borderBottomColor: confidence > 50 ? "#F97316" : "transparent",
                borderLeftColor: confidence > 75 ? "#F97316" : "transparent",
              }}
            >
              <Icon size={12} className={style.text} />
            </div>
          </div>
          <span className={`text-[13px] font-semibold ${style.text} flex-1 truncate`}>
            {data.label}
          </span>
        </div>

        {/* Mid row: metrics */}
        {data.metrics && data.metrics.length > 0 && (
          <div className="px-3 pb-2 flex items-center gap-2 flex-wrap">
            {data.metrics.map((metric, idx) => (
              <div
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded"
                style={{
                  background: "rgba(249, 115, 22, 0.15)",
                  color: "#F97316",
                }}
              >
                {metric.label}: {metric.value}
              </div>
            ))}
          </div>
        )}

        {/* Bottom bar: status + progress */}
        <div
          className="px-3 py-1.5 flex items-center justify-between text-[11px]"
          style={{ background: "rgba(0, 0, 0, 0.2)" }}
        >
          <span className="text-gray-400 capitalize">{status.replace("_", " ")}</span>
          {status === "running" && progress > 0 && (
            <span className="text-[var(--accent-primary)] font-mono">{progress}%</span>
          )}
          {status === "done" && <CheckCircle2 size={12} className="text-green-500" />}
        </div>
      </div>

      {/* Port dots */}
      <div
        className="absolute w-1.5 h-1.5 rounded-full -left-1 top-1/2 -translate-y-1/2 transition-all hover:w-2 hover:h-2"
        style={{ background: "#6B7280" }}
      />
      <div
        className="absolute w-1.5 h-1.5 rounded-full -right-1 top-1/2 -translate-y-1/2 transition-all hover:w-2 hover:h-2"
        style={{ background: "#6B7280" }}
      />
    </div>
  );
}

function DataSourceNode({ data }: { data: EnhancedNodeData }) {
  const Icon = data.icon || Database;
  const status: NodeStatus = data.status || "pending";

  const statusStyles: StatusStyles = {
    pending: { bg: "rgba(31, 41, 55, 0.35)", border: "rgba(107, 114, 128, 0.3)", opacity: "opacity-85" },
    running: { bg: "#161616", border: "#F97316", opacity: "opacity-100", pulse: true },
    done: { bg: "#1F2937", border: "#10B981", opacity: "opacity-100" },
    needs_input: { bg: "#1F2937", border: "#F59E0B", opacity: "opacity-100" },
    error: { bg: "#1F2937", border: "#DC2626", opacity: "opacity-100" },
    propagating: { bg: "rgba(31, 41, 55, 0.5)", border: "rgba(249, 115, 22, 0.4)", opacity: "opacity-90" },
  };

  const style = statusStyles[status];

  return (
    <div className={`relative ${style.opacity}`} style={{ width: "160px" }}>
      {/* Pill shape with left inlet notch */}
      <div
        className="rounded-full overflow-hidden relative"
        style={{
          background: style.bg,
          border: `1.5px solid ${style.border}`,
          paddingLeft: "12px",
        }}
      >
        {/* Left notch */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-3"
          style={{
            background: style.bg,
            borderLeft: `1.5px solid ${style.border}`,
            borderTop: `1.5px solid ${style.border}`,
            borderBottom: `1.5px solid ${style.border}`,
            borderTopLeftRadius: "4px",
            borderBottomLeftRadius: "4px",
            marginLeft: "-1px",
          }}
        />

        <div className="px-3 py-2 flex items-center gap-2">
          <Icon size={14} className="text-[var(--text-primary)]" />
          <span className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
            {data.label}
          </span>
        </div>
      </div>

      {/* Port dot */}
      <div
        className="absolute w-1.5 h-1.5 rounded-full -right-1 top-1/2 -translate-y-1/2 transition-all hover:w-2 hover:h-2"
        style={{ background: "#6B7280" }}
      />
    </div>
  );
}

function OutputNode({ data }: { data: EnhancedNodeData }) {
  const Icon = data.icon || CheckCircle2;
  const status: NodeStatus = data.status || "pending";

  const statusStyles: StatusStyles = {
    pending: { bg: "rgba(31, 41, 55, 0.35)", border: "rgba(107, 114, 128, 0.3)", opacity: "opacity-85" },
    running: { bg: "#161616", border: "#F97316", opacity: "opacity-100" },
    done: { bg: "#1F2937", border: "#10B981", opacity: "opacity-100" },
    needs_input: { bg: "#1F2937", border: "#F59E0B", opacity: "opacity-100" },
    error: { bg: "#1F2937", border: "#DC2626", opacity: "opacity-100" },
    propagating: { bg: "rgba(31, 41, 55, 0.5)", border: "rgba(249, 115, 22, 0.4)", opacity: "opacity-90" },
  };

  const style = statusStyles[status];

  return (
    <div className={`relative ${style.opacity}`} style={{ width: "150px" }}>
      {/* Tabbed rect with right tab */}
      <div className="relative">
        <div
          className="rounded-lg overflow-hidden"
          style={{
            background: style.bg,
            border: `1.5px solid ${style.border}`,
          }}
        >
          <div className="px-3 py-2.5 flex items-center gap-2">
            <Icon size={14} className="text-[var(--text-primary)]" />
            <span className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
              {data.label}
            </span>
          </div>
        </div>

        {/* Right tab */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-5"
          style={{
            background: style.bg,
            borderRight: `1.5px solid ${style.border}`,
            borderTop: `1.5px solid ${style.border}`,
            borderBottom: `1.5px solid ${style.border}`,
            borderTopRightRadius: "4px",
            borderBottomRightRadius: "4px",
            marginRight: "-1px",
          }}
        />
      </div>

      {/* Port dot */}
      <div
        className="absolute w-1.5 h-1.5 rounded-full -left-1 top-1/2 -translate-y-1/2 transition-all hover:w-2 hover:h-2"
        style={{ background: "#6B7280" }}
      />
    </div>
  );
}

// Register custom node types
const nodeTypes = {
  action: ActionNode,
  dataSource: DataSourceNode,
  output: OutputNode,
};

// Create executed workflow nodes (all marked as "done")
const createExecutedNode = (
  id: string,
  type: "action" | "dataSource" | "output",
  data: EnhancedNodeData,
  x: number,
  y: number
): Node<EnhancedNodeData> => ({
  id,
  type,
  position: { x, y },
  data: { ...data, status: "done" },
  style: {
    opacity: 1,
  },
});

const executedNodes: Node<EnhancedNodeData>[] = [
  createExecutedNode("1", "dataSource", {
    label: "Load Data",
    icon: Database,
    metrics: [{ label: "Rows", value: "2.5k" }],
  }, 250, 50),

  createExecutedNode("2", "action", {
    label: "Cluster Merchants",
    icon: Search,
    metrics: [{ label: "Match", value: "85%" }],
    confidence: 85,
  }, 250, 150),

  createExecutedNode("3", "action", {
    label: "Unify Names",
    icon: FileText,
    metrics: [{ label: "Confidence", value: "95%" }],
    confidence: 95,
  }, 250, 260),

  createExecutedNode("4", "action", {
    label: "Extract SKUs",
    icon: Layers,
    metrics: [{ label: "SKUs", value: "1.8k" }],
    confidence: 90,
  }, 250, 370),

  createExecutedNode("5a", "dataSource", {
    label: "Catalog",
    icon: Database,
  }, 80, 480),

  createExecutedNode("5b", "dataSource", {
    label: "API",
    icon: Sparkles,
  }, 250, 480),

  createExecutedNode("5c", "dataSource", {
    label: "Web Search",
    icon: Search,
  }, 420, 480),

  createExecutedNode("6", "action", {
    label: "Merge Data",
    icon: Layers,
    metrics: [{ label: "Coverage", value: "92%" }],
    confidence: 92,
  }, 250, 590),

  createExecutedNode("7", "output", {
    label: "Write Back",
    icon: CheckCircle2,
  }, 250, 690),
];

const executedEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", style: { stroke: "#10B981", strokeWidth: 2, opacity: 1 } },
  { id: "e2-3", source: "2", target: "3", style: { stroke: "#10B981", strokeWidth: 2, opacity: 1 } },
  { id: "e3-4", source: "3", target: "4", style: { stroke: "#10B981", strokeWidth: 2, opacity: 1 } },
  { id: "e4-5a", source: "4", target: "5a", style: { stroke: "#10B981", strokeWidth: 2, opacity: 1 } },
  { id: "e4-5b", source: "4", target: "5b", style: { stroke: "#10B981", strokeWidth: 2, opacity: 1 } },
  { id: "e4-5c", source: "4", target: "5c", style: { stroke: "#10B981", strokeWidth: 2, opacity: 1 } },
  { id: "e5a-6", source: "5a", target: "6", style: { stroke: "#10B981", strokeWidth: 2, opacity: 1 } },
  { id: "e5b-6", source: "5b", target: "6", style: { stroke: "#10B981", strokeWidth: 2, opacity: 1 } },
  { id: "e5c-6", source: "5c", target: "6", style: { stroke: "#10B981", strokeWidth: 2, opacity: 1 } },
  { id: "e6-7", source: "6", target: "7", style: { stroke: "#10B981", strokeWidth: 2, opacity: 1 } },
];

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;

  const [nodes] = useNodesState(executedNodes);
  const [edges] = useEdgesState(executedEdges);
  const [showStats, setShowStats] = useState(true);

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
                  1m 41s
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
              Run Again
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
            nodeTypes={nodeTypes}
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
            <Controls />
          </ReactFlow>
        </div>

        {/* Right Panel - Execution Stats */}
        {showStats && (
          <div className="w-[400px] border-l border-[var(--border-default)] bg-[var(--bg-secondary)] overflow-y-auto">
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
                    <span className="text-sm font-mono text-[var(--text-primary)]">1m 41s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--text-tertiary)]">Steps</span>
                    <span className="text-sm font-mono text-[var(--text-primary)]">7/7</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--text-tertiary)]">Rows Processed</span>
                    <span className="text-sm font-mono text-[var(--text-primary)]">2,450</span>
                  </div>
                </div>
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
                      <span className="text-sm font-mono text-[var(--accent-primary)]">95%</span>
                    </div>
                    <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--accent-primary)]" style={{ width: "95%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-[var(--text-tertiary)]">Product Coverage</span>
                      <span className="text-sm font-mono text-[var(--accent-primary)]">92%</span>
                    </div>
                    <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--accent-primary)]" style={{ width: "92%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-[var(--text-tertiary)]">Data Completeness</span>
                      <span className="text-sm font-mono text-green-500">98%</span>
                    </div>
                    <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: "98%" }} />
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
                    <div className="text-xs text-[var(--text-tertiary)] mt-1">of 1,840 SKUs</div>
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

        {/* Toggle Stats Button */}
        <button
          onClick={() => setShowStats(!showStats)}
          className="absolute top-4 right-4 p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-elevated)] transition-colors z-10"
          style={{ right: showStats ? "416px" : "16px", transition: "right 300ms" }}
        >
          {showStats ? "→" : "←"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Edit,
  Play,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Send,
  Clock,
  Database,
  Search,
  FileText,
  Sparkles,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  isThinking?: boolean;
  isCollapsible?: boolean;
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: "completed" | "pending" | "in_progress";
  editable?: boolean;
  estimatedTime: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  details: {
    decisions: string[];
    queries: string[];
    reasoning: string;
  };
}

type NodeStatus = "pending" | "running" | "done" | "needs_input" | "error" | "propagating";

interface EnhancedNodeData extends Record<string, unknown> {
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  status?: NodeStatus;
  metrics?: { label: string; value: string }[];
  confidence?: number; // 0-100
  progress?: number; // 0-100
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

// Custom Node Components
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
      {/* Pulse ring for running state */}
      {style.pulse && (
        <div
          className="absolute inset-0 rounded-[14px] animate-pulse"
          style={{
            border: "2px solid rgba(249, 115, 22, 0.3)",
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        />
      )}

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

        {/* Progress bar for running state */}
        {status === "running" && progress > 0 && (
          <div className="h-0.5 w-full" style={{ background: "rgba(0, 0, 0, 0.3)" }}>
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: "var(--accent-primary)",
              }}
            />
          </div>
        )}
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

function DecisionNode({ data }: { data: EnhancedNodeData }) {
  const Icon = data.icon || Search;
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
    <div className={`relative ${style.opacity}`} style={{ width: "140px" }}>
      {/* Hexagon/chevron shape */}
      <div
        className="relative"
        style={{
          clipPath: "polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)",
          background: style.bg,
          border: `1.5px solid ${style.border}`,
        }}
      >
        <div className="px-4 py-3 flex flex-col items-center justify-center gap-1 text-center">
          <Icon size={14} className="text-[var(--text-primary)]" />
          <span className="text-[11px] font-semibold text-[var(--text-primary)]">
            {data.label}
          </span>
        </div>
      </div>

      {/* Port dots */}
      <div
        className="absolute w-1.5 h-1.5 rounded-full -left-1 top-1/2 -translate-y-1/2"
        style={{ background: "#6B7280" }}
      />
      <div
        className="absolute w-1.5 h-1.5 rounded-full -right-1 top-1/2 -translate-y-1/2"
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
  decision: DecisionNode,
  output: OutputNode,
};

// Thinking messages that appear as chat - pairs of thinking + result
const thinkingMessages: ChatMessage[] = [
  {
    role: "assistant",
    content: "Analyzing your data schema...",
    isThinking: true,
    isCollapsible: true,
  },
  {
    role: "assistant",
    content: "I've inspected your transactions table. Found key columns: merchant_name (VARCHAR, high variance), sku_code (VARCHAR), product_name (VARCHAR, 40% null).\n\nI'll need to:\n1. Run entity resolution on merchant_name to detect variants\n2. Use sku_code as lookup key for product enrichment\n3. Fill product_name, category, price from external sources",
  },
  {
    role: "assistant",
    content: "Exploring enrichment strategies...",
    isThinking: true,
    isCollapsible: true,
  },
  {
    role: "assistant",
    content: "For merchant_name, I'll use fuzzy matching (Levenshtein distance < 0.85) combined with business name standardization rules.\n\nFor sku_code, I'll prioritize:\n1. Internal product catalog (if available)\n2. Amazon Product API\n3. Web search fallback for remaining SKUs\n\nEstimated coverage: 95% for merchants, 88% for products",
  },
  {
    role: "assistant",
    content: "Building execution plan...",
    isThinking: true,
    isCollapsible: true,
  },
  {
    role: "assistant",
    content: "I've designed a 7-step workflow:\n→ Load & inspect data\n→ Cluster merchant variants\n→ Unify to canonical names\n→ Extract SKU lookup keys\n→ Fetch product metadata (parallel)\n→ Merge enriched data\n→ Write back results\n\nReady for your review!",
  },
];

const workflowSteps: WorkflowStep[] = [
  {
    id: "1",
    title: "Load & Inspect Data",
    description: "2,450 rows detected",
    status: "completed",
    estimatedTime: "~5s",
    icon: Database,
    details: {
      decisions: [
        "Use batch loading with 1000 row chunks for optimal memory usage",
        "Apply connection pooling to handle concurrent requests",
      ],
      queries: [
        "SELECT * FROM postgres-prod.public.transactions WHERE status = 'active'",
      ],
      reasoning: "Batch loading ensures we don't overwhelm memory while maintaining good throughput",
    },
  },
  {
    id: "2",
    title: "Cluster Merchant Variants",
    description: "Est. 240 variants → 85",
    status: "pending",
    editable: true,
    estimatedTime: "~15s",
    icon: Search,
    details: {
      decisions: [
        "Use fuzzy matching with 85% similarity threshold",
        "Apply regex patterns to detect common variations (Inc, LLC, Corp)",
      ],
      queries: [
        "SELECT merchant_name, COUNT(*) as frequency FROM transactions GROUP BY merchant_name",
      ],
      reasoning: "85% threshold balances precision and recall based on historical data",
    },
  },
  {
    id: "3",
    title: "Unify to Canonical Names",
    description: "Confidence: 95%",
    status: "pending",
    estimatedTime: "~10s",
    icon: FileText,
    details: {
      decisions: [
        "Use canonical name from enrichment source with highest confidence",
        "Fall back to most common variant if no external match",
      ],
      queries: [],
      reasoning: "Confidence-based selection ensures highest quality standardization",
    },
  },
  {
    id: "4",
    title: "Extract SKU Keys",
    description: "1,840 unique SKUs",
    status: "pending",
    estimatedTime: "~8s",
    icon: Layers,
    details: {
      decisions: [
        "Parse SKU patterns using learned regex",
        "Validate SKU format against known product catalogs",
      ],
      queries: [
        "SELECT DISTINCT sku_code FROM transactions WHERE sku_code IS NOT NULL",
      ],
      reasoning: "Pattern-based extraction ensures we capture all valid SKU formats",
    },
  },
  {
    id: "5",
    title: "Fetch Product Metadata",
    description: "3 sources (parallel)",
    status: "pending",
    editable: true,
    estimatedTime: "~45s",
    icon: Sparkles,
    details: {
      decisions: [
        "Query Catalog, API, and Web Search in parallel",
        "Implement exponential backoff for rate limiting",
        "Cache results for 30 days to reduce API costs",
      ],
      queries: [
        "GET https://catalog.internal.com/api/products?sku={sku}",
        "GET https://api.external.com/v1/products/{sku}",
        "SEARCH: product details for SKU {sku}",
      ],
      reasoning: "Multi-source parallel approach ensures comprehensive coverage and faster execution",
    },
  },
  {
    id: "6",
    title: "Merge Results",
    description: "Join on transaction_id",
    status: "pending",
    estimatedTime: "~10s",
    icon: Layers,
    details: {
      decisions: [
        "Use LEFT JOIN to preserve all transactions",
        "Prioritize data quality: Catalog > API > Web Search",
      ],
      queries: [
        "SELECT t.*, p.product_name, p.category FROM transactions t LEFT JOIN products p ON t.sku_code = p.sku",
      ],
      reasoning: "LEFT JOIN ensures no data loss while enriching with best available product info",
    },
  },
  {
    id: "7",
    title: "Write Back",
    description: "New table: enriched_tx",
    status: "pending",
    estimatedTime: "~8s",
    icon: CheckCircle2,
    details: {
      decisions: [
        "Use UPSERT to handle concurrent updates",
        "Create audit trail in enrichment_log table",
      ],
      queries: [
        "INSERT INTO enriched_tx (id, merchant_canonical, product_name, enriched_at) VALUES (...) ON CONFLICT (id) DO UPDATE SET...",
      ],
      reasoning: "UPSERT ensures idempotency and handles race conditions gracefully",
    },
  },
];

// Enhanced node creation
const createEnhancedNode = (
  id: string,
  type: "action" | "dataSource" | "decision" | "output",
  data: EnhancedNodeData,
  x: number,
  y: number
): Node<EnhancedNodeData> => ({
  id,
  type,
  position: { x, y },
  data,
  style: {
    opacity: 0,
    transition: "opacity 0.8s ease-in-out",
  },
});

const initialNodes: Node<EnhancedNodeData>[] = [
  createEnhancedNode("1", "dataSource", {
    label: "Load Data",
    icon: Database,
    status: "pending",
    metrics: [{ label: "Rows", value: "2.5k" }],
  }, 250, 50),

  createEnhancedNode("2", "action", {
    label: "Cluster Merchants",
    icon: Search,
    status: "pending",
    metrics: [{ label: "Match", value: "85%" }],
    confidence: 85,
  }, 250, 150),

  createEnhancedNode("3", "action", {
    label: "Unify Names",
    icon: FileText,
    status: "pending",
    metrics: [{ label: "Confidence", value: "95%" }],
    confidence: 95,
  }, 250, 260),

  createEnhancedNode("4", "action", {
    label: "Extract SKUs",
    icon: Layers,
    status: "pending",
    metrics: [{ label: "SKUs", value: "1.8k" }],
    confidence: 90,
  }, 250, 370),

  createEnhancedNode("5a", "dataSource", {
    label: "Catalog",
    icon: Database,
    status: "pending",
  }, 80, 480),

  createEnhancedNode("5b", "dataSource", {
    label: "API",
    icon: Sparkles,
    status: "pending",
  }, 250, 480),

  createEnhancedNode("5c", "dataSource", {
    label: "Web Search",
    icon: Search,
    status: "pending",
  }, 420, 480),

  createEnhancedNode("6", "action", {
    label: "Merge Data",
    icon: Layers,
    status: "pending",
    metrics: [{ label: "Coverage", value: "92%" }],
    confidence: 92,
  }, 250, 590),

  createEnhancedNode("7", "output", {
    label: "Write Back",
    icon: CheckCircle2,
    status: "pending",
  }, 250, 690),
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", style: { stroke: "var(--border-hover)", strokeWidth: 2, opacity: 0, transition: "opacity 0.5s ease-in-out" } },
  { id: "e2-3", source: "2", target: "3", style: { stroke: "var(--border-hover)", strokeWidth: 2, opacity: 0, transition: "opacity 0.5s ease-in-out" } },
  { id: "e3-4", source: "3", target: "4", style: { stroke: "var(--border-hover)", strokeWidth: 2, opacity: 0, transition: "opacity 0.5s ease-in-out" } },
  { id: "e4-5a", source: "4", target: "5a", style: { stroke: "var(--border-hover)", strokeWidth: 2, opacity: 0, transition: "opacity 0.5s ease-in-out" } },
  { id: "e4-5b", source: "4", target: "5b", style: { stroke: "var(--border-hover)", strokeWidth: 2, opacity: 0, transition: "opacity 0.5s ease-in-out" } },
  { id: "e4-5c", source: "4", target: "5c", style: { stroke: "var(--border-hover)", strokeWidth: 2, opacity: 0, transition: "opacity 0.5s ease-in-out" } },
  { id: "e5a-6", source: "5a", target: "6", style: { stroke: "var(--border-hover)", strokeWidth: 2, opacity: 0, transition: "opacity 0.5s ease-in-out" } },
  { id: "e5b-6", source: "5b", target: "6", style: { stroke: "var(--border-hover)", strokeWidth: 2, opacity: 0, transition: "opacity 0.5s ease-in-out" } },
  { id: "e5c-6", source: "5c", target: "6", style: { stroke: "var(--border-hover)", strokeWidth: 2, opacity: 0, transition: "opacity 0.5s ease-in-out" } },
  { id: "e6-7", source: "6", target: "7", style: { stroke: "var(--border-hover)", strokeWidth: 2, opacity: 0, transition: "opacity 0.5s ease-in-out" } },
];

export default function PlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intent = searchParams.get("intent") || "Enrich merchant data";

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);

  // Thinking phase state
  const [isThinking, setIsThinking] = useState(true);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState<ChatMessage[]>([
    {
      role: "user",
      content: intent,
    },
  ]);
  const [collapsedIndices, setCollapsedIndices] = useState<Set<number>>(new Set());
  const [elapsedTime, setElapsedTime] = useState(0);

  // UI state
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [showViewStepsTab, setShowViewStepsTab] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [chatInput, setChatInput] = useState("");

  // Timer for thinking phase
  useEffect(() => {
    if (!isThinking) return;

    const interval = setInterval(() => {
      setElapsedTime((t) => t + 0.1);
    }, 100);
    return () => clearInterval(interval);
  }, [isThinking]);

  // Message progression during thinking
  useEffect(() => {
    if (!isThinking) return;
    if (currentMessageIndex >= thinkingMessages.length) {
      // Thinking complete - reveal ALL nodes at once
      setTimeout(() => {
        revealAllNodes();
        setTimeout(() => {
          setIsThinking(false);
          setShowViewStepsTab(true);
          setActiveTab("steps");
        }, 800);
      }, 1000);
      return;
    }

    const currentMessage = thinkingMessages[currentMessageIndex];
    const delay = currentMessage.isThinking ? 800 : 2500;

    const timer = setTimeout(() => {
      setDisplayedMessages((prev) => [...prev, currentMessage]);

      // If this is a result message (not thinking) and previous was collapsible, collapse it
      if (!currentMessage.isThinking && currentMessageIndex > 0) {
        const prevMessage = thinkingMessages[currentMessageIndex - 1];
        if (prevMessage.isCollapsible) {
          setCollapsedIndices(prev => new Set(prev).add(currentMessageIndex));
        }
      }

      setCurrentMessageIndex((i) => i + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentMessageIndex, isThinking]);

  const toggleCollapse = (index: number) => {
    setCollapsedIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const revealAllNodes = () => {
    // Reveal all nodes at once
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        style: {
          ...node.style,
          opacity: 1,
        },
      }))
    );

    // Reveal all edges
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        style: {
          ...edge.style,
          opacity: 1,
        },
      }))
    );
  };

  const startExecution = () => {
    setIsExecuting(true);
    setExecutionStep(0);
  };

  // Animate execution
  useEffect(() => {
    if (!isExecuting || executionStep >= workflowSteps.length) {
      if (executionStep >= workflowSteps.length) {
        setTimeout(() => {
          router.push("/workflow/1");
        }, 1500);
      }
      return;
    }

    const timer = setTimeout(() => {
      const nodeId = (executionStep + 1).toString();
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId || node.id.startsWith(nodeId)) {
            // Current executing node - set to running status
            return {
              ...node,
              data: {
                ...node.data,
                status: "running" as NodeStatus,
                progress: 50,
              },
            };
          }
          const prevNodeNum = parseInt(node.id.replace(/[a-z]/g, ""));
          if (prevNodeNum <= executionStep) {
            // Previously executed nodes - set to done status
            return {
              ...node,
              data: {
                ...node.data,
                status: "done" as NodeStatus,
              },
            };
          }
          return node;
        })
      );

      setExecutionStep((s) => s + 1);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isExecuting, executionStep, setNodes, router]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isThinking) return;

    const newMessages: ChatMessage[] = [
      ...displayedMessages,
      { role: "user", content: chatInput },
      {
        role: "assistant",
        content: "I'm analyzing your question about the workflow. This workflow processes 2,450 transactions, standardizes merchant names using fuzzy matching, and enriches product data from three parallel sources.",
      },
    ];
    setDisplayedMessages(newMessages);
    setChatInput("");
  };

  const selectedStepData = workflowSteps.find((s) => s.id === selectedStep);

  const totalTime = workflowSteps.reduce((acc, step) => {
    const time = parseInt(step.estimatedTime.match(/\d+/)?.[0] || "0");
    return acc + time;
  }, 0);

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-secondary)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">
              {isThinking ? "Planning Workflow..." : "Workflow Plan"}
            </h1>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">
              {isThinking ? (
                <span className="flex items-center gap-2">
                  <Clock size={14} />
                  {elapsedTime.toFixed(1)}s
                </span>
              ) : (
                `7 STEPS • ~${totalTime} MINS ESTIMATED`
              )}
            </p>
          </div>
          {!isThinking && (
            <div className="flex items-center gap-3">
              <Button variant="outline" disabled={isExecuting}>
                <Edit size={16} className="mr-2" />
                Edit
              </Button>
              <Button onClick={startExecution} disabled={isExecuting}>
                <Play size={16} className="mr-2" />
                {isExecuting ? "Executing..." : "Approve"}
              </Button>
            </div>
          )}
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
          </ReactFlow>
        </div>

        {/* Right Panel - Collapsible Drawer with Tabs */}
        <div
          className={`border-l border-[var(--border-default)] bg-[var(--bg-secondary)] transition-all duration-300 flex flex-col ${
            isDrawerOpen ? "w-[480px]" : "w-0"
          }`}
          style={{ overflow: isDrawerOpen ? "visible" : "hidden" }}
        >
          {isDrawerOpen && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
              <div className="px-4 pt-4 flex-shrink-0">
                <TabsList className="w-full">
                  <TabsTrigger value="chat" className="flex-1">
                    Chat
                  </TabsTrigger>
                  {showViewStepsTab && (
                    <TabsTrigger value="steps" className="flex-1">
                      View Steps
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              {/* Chat Tab */}
              <TabsContent value="chat" className="flex-1 flex flex-col m-0 min-h-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {displayedMessages.map((msg, idx) => {
                    const isCollapsed = collapsedIndices.has(idx + 1);
                    const isCollapsibleThinking = msg.isCollapsible && msg.isThinking;

                    return (
                      <div
                        key={idx}
                        className={`flex ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg ${
                            msg.role === "user"
                              ? "bg-[var(--accent-primary)] text-white px-4 py-2"
                              : isCollapsibleThinking && isCollapsed
                              ? "bg-[var(--bg-tertiary)] border border-[var(--border-default)]"
                              : "bg-[var(--bg-elevated)] text-[var(--text-primary)] px-4 py-2"
                          }`}
                        >
                          {isCollapsibleThinking && isCollapsed ? (
                            <button
                              onClick={() => toggleCollapse(idx + 1)}
                              className="flex items-center gap-2 text-sm text-[var(--text-secondary)] py-2 px-3 w-full hover:text-[var(--text-primary)] transition-colors"
                            >
                              <ChevronDown size={16} />
                              <span>{msg.content}</span>
                            </button>
                          ) : (
                            <>
                              {isCollapsibleThinking && (
                                <button
                                  onClick={() => toggleCollapse(idx + 1)}
                                  className="flex items-center gap-2 mb-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                                >
                                  <ChevronUp size={16} />
                                  <span>Collapse</span>
                                </button>
                              )}
                              <p className="text-sm whitespace-pre-line">{msg.content}</p>
                              {msg.isThinking && idx === displayedMessages.length - 1 && (
                                <div className="flex items-center gap-1.5 mt-2">
                                  {[0, 200, 400].map((delay) => (
                                    <div
                                      key={delay}
                                      className="w-1.5 h-1.5 rounded-full animate-pulse bg-[var(--text-tertiary)]"
                                      style={{
                                        animationDelay: `${delay}ms`,
                                        animationDuration: "1.4s",
                                      }}
                                    />
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <form onSubmit={handleSendMessage} className="p-4 border-t border-[var(--border-default)] flex-shrink-0">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={isThinking ? "Planning in progress..." : "Ask about the workflow..."}
                      disabled={isThinking}
                      className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-primary)] disabled:opacity-50"
                    />
                    <Button type="submit" size="icon" disabled={isThinking}>
                      <Send size={18} />
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* View Steps Tab */}
              {showViewStepsTab && (
                <TabsContent value="steps" className="flex-1 overflow-y-auto m-0 p-4">
                  {!selectedStep ? (
                    <div className="space-y-3">
                      {workflowSteps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                          <button
                            key={step.id}
                            onClick={() => setSelectedStep(step.id)}
                            className={`w-full text-left p-4 rounded-lg border transition-all hover:border-[var(--border-hover)] cursor-pointer ${
                              index <= executionStep && isExecuting
                                ? "border-[var(--accent-primary)] bg-[var(--bg-elevated)]"
                                : "border-[var(--border-default)] bg-[var(--bg-tertiary)]"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-0.5 p-2 rounded-lg ${
                                  index < executionStep && isExecuting
                                    ? "bg-[var(--status-success)]"
                                    : index === executionStep && isExecuting
                                    ? "bg-[var(--accent-primary)]"
                                    : "bg-[var(--bg-secondary)]"
                                }`}
                              >
                                <Icon
                                  size={16}
                                  className={
                                    index <= executionStep && isExecuting
                                      ? "text-white"
                                      : "text-[var(--text-muted)]"
                                  }
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h3 className="font-medium text-[var(--text-primary)]">
                                    {index + 1}. {step.title}
                                  </h3>
                                  <ChevronRight size={18} className="text-[var(--text-tertiary)]" />
                                </div>
                                <p className="text-sm text-[var(--text-tertiary)]">
                                  {step.description}
                                </p>
                                <span className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-1 mt-2">
                                  <Clock size={12} />
                                  {step.estimatedTime}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <button
                        onClick={() => setSelectedStep(null)}
                        className="flex items-center gap-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        <ChevronLeft size={16} />
                        Back to all steps
                      </button>

                      {selectedStepData && (
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-start gap-3 mb-4">
                              <div
                                className={`p-3 rounded-lg ${
                                  selectedStepData.status === "completed"
                                    ? "bg-[var(--status-success)]"
                                    : selectedStepData.status === "in_progress"
                                    ? "bg-[var(--accent-primary)]"
                                    : "bg-[var(--bg-tertiary)]"
                                }`}
                              >
                                <selectedStepData.icon
                                  size={20}
                                  className={
                                    selectedStepData.status === "pending"
                                      ? "text-[var(--text-muted)]"
                                      : "text-white"
                                  }
                                />
                              </div>
                              <div>
                                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                  {selectedStepData.title}
                                </h2>
                                <p className="text-sm text-[var(--text-tertiary)] mt-1">
                                  {selectedStepData.description}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h3 className="text-xs uppercase font-medium tracking-wider text-[var(--text-muted)] mb-2">
                                Reasoning
                              </h3>
                              <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-elevated)] p-3 rounded-lg">
                                {selectedStepData.details.reasoning}
                              </p>
                            </div>

                            <div>
                              <h3 className="text-xs uppercase font-medium tracking-wider text-[var(--text-muted)] mb-2">
                                Decisions
                              </h3>
                              <ul className="space-y-2">
                                {selectedStepData.details.decisions.map((decision, idx) => (
                                  <li
                                    key={idx}
                                    className="text-sm text-[var(--text-secondary)] bg-[var(--bg-elevated)] p-3 rounded-lg flex items-start gap-2"
                                  >
                                    <CheckCircle2
                                      size={16}
                                      className="text-[var(--status-success)] mt-0.5 shrink-0"
                                    />
                                    <span>{decision}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {selectedStepData.details.queries.length > 0 && (
                              <div>
                                <h3 className="text-xs uppercase font-medium tracking-wider text-[var(--text-muted)] mb-2">
                                  Queries
                                </h3>
                                <div className="space-y-2">
                                  {selectedStepData.details.queries.map((query, idx) => (
                                    <pre
                                      key={idx}
                                      className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-tertiary)] p-3 rounded-lg overflow-x-auto whitespace-pre-wrap break-words"
                                    >
                                      {query}
                                    </pre>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>

        {/* Drawer Toggle Button */}
        {!isThinking && (
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="absolute top-1/2 -translate-y-1/2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-l-lg p-2 hover:bg-[var(--bg-elevated)] transition-colors z-10"
            style={{
              right: isDrawerOpen ? "480px" : "0",
              transition: "right 300ms",
            }}
          >
            {isDrawerOpen ? (
              <ChevronRight size={20} className="text-[var(--text-tertiary)]" />
            ) : (
              <ChevronLeft size={20} className="text-[var(--text-tertiary)]" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

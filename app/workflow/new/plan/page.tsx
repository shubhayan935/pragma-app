"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
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

const initialNodes: Node[] = [
  {
    id: "1",
    type: "default",
    position: { x: 250, y: 50 },
    data: { label: "Load Data" },
    style: {
      background: "var(--bg-elevated)",
      border: "2px solid var(--border-hover)",
      color: "var(--text-primary)",
      borderRadius: "8px",
      padding: "12px 20px",
      fontSize: "14px",
      fontWeight: "600",
    },
  },
  {
    id: "2",
    type: "default",
    position: { x: 250, y: 140 },
    data: { label: "Cluster Merchants" },
    style: {
      background: "var(--bg-secondary)",
      border: "2px solid var(--border-hover)",
      color: "var(--text-primary)",
      borderRadius: "8px",
      padding: "12px 20px",
      fontSize: "14px",
      fontWeight: "600",
      opacity: 0.5,
    },
  },
  {
    id: "3",
    type: "default",
    position: { x: 250, y: 230 },
    data: { label: "Unify Names" },
    style: {
      background: "var(--bg-secondary)",
      border: "2px solid var(--border-hover)",
      color: "var(--text-primary)",
      borderRadius: "8px",
      padding: "12px 20px",
      fontSize: "14px",
      fontWeight: "600",
      opacity: 0.4,
    },
  },
  {
    id: "4",
    type: "default",
    position: { x: 250, y: 320 },
    data: { label: "Extract SKUs" },
    style: {
      background: "var(--bg-secondary)",
      border: "2px solid var(--border-hover)",
      color: "var(--text-primary)",
      borderRadius: "8px",
      padding: "12px 20px",
      fontSize: "14px",
      fontWeight: "600",
      opacity: 0.4,
    },
  },
  {
    id: "5a",
    type: "default",
    position: { x: 100, y: 420 },
    data: { label: "Catalog" },
    style: {
      background: "var(--bg-secondary)",
      border: "2px solid var(--border-hover)",
      color: "var(--text-primary)",
      borderRadius: "8px",
      padding: "8px 16px",
      fontSize: "13px",
      fontWeight: "600",
      opacity: 0.4,
    },
  },
  {
    id: "5b",
    type: "default",
    position: { x: 250, y: 420 },
    data: { label: "API" },
    style: {
      background: "var(--bg-secondary)",
      border: "2px solid var(--border-hover)",
      color: "var(--text-primary)",
      borderRadius: "8px",
      padding: "8px 16px",
      fontSize: "13px",
      fontWeight: "600",
      opacity: 0.4,
    },
  },
  {
    id: "5c",
    type: "default",
    position: { x: 370, y: 420 },
    data: { label: "Web Search" },
    style: {
      background: "var(--bg-secondary)",
      border: "2px solid var(--border-hover)",
      color: "var(--text-primary)",
      borderRadius: "8px",
      padding: "8px 16px",
      fontSize: "13px",
      fontWeight: "600",
      opacity: 0.4,
    },
  },
  {
    id: "6",
    type: "default",
    position: { x: 250, y: 510 },
    data: { label: "Merge Data" },
    style: {
      background: "var(--bg-secondary)",
      border: "2px solid var(--border-hover)",
      color: "var(--text-primary)",
      borderRadius: "8px",
      padding: "12px 20px",
      fontSize: "14px",
      fontWeight: "600",
      opacity: 0.4,
    },
  },
  {
    id: "7",
    type: "default",
    position: { x: 250, y: 600 },
    data: { label: "Write Back" },
    style: {
      background: "var(--bg-secondary)",
      border: "2px solid var(--border-hover)",
      color: "var(--text-primary)",
      borderRadius: "8px",
      padding: "12px 20px",
      fontSize: "14px",
      fontWeight: "600",
      opacity: 0.4,
    },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", style: { stroke: "var(--border-hover)", strokeWidth: 2 } },
  { id: "e2-3", source: "2", target: "3", style: { stroke: "var(--border-hover)", strokeWidth: 2 } },
  { id: "e3-4", source: "3", target: "4", style: { stroke: "var(--border-hover)", strokeWidth: 2 } },
  { id: "e4-5a", source: "4", target: "5a", style: { stroke: "var(--border-hover)", strokeWidth: 2 } },
  { id: "e4-5b", source: "4", target: "5b", style: { stroke: "var(--border-hover)", strokeWidth: 2 } },
  { id: "e4-5c", source: "4", target: "5c", style: { stroke: "var(--border-hover)", strokeWidth: 2 } },
  { id: "e5a-6", source: "5a", target: "6", style: { stroke: "var(--border-hover)", strokeWidth: 2 } },
  { id: "e5b-6", source: "5b", target: "6", style: { stroke: "var(--border-hover)", strokeWidth: 2 } },
  { id: "e5c-6", source: "5c", target: "6", style: { stroke: "var(--border-hover)", strokeWidth: 2 } },
  { id: "e6-7", source: "6", target: "7", style: { stroke: "var(--border-hover)", strokeWidth: 2 } },
];

export default function PlanPage() {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I can help you understand this enrichment workflow. Ask me anything about the steps, decisions, or data sources.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

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
      // Update node opacity
      const nodeId = (executionStep + 1).toString();
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId || node.id.startsWith(nodeId)) {
            return {
              ...node,
              style: {
                ...node.style,
                opacity: 1,
                border: `2px solid var(--accent-primary)`,
                boxShadow: "0 0 12px rgba(249, 115, 22, 0.6)",
              },
            };
          }
          // Keep previously completed nodes fully opaque
          const prevNodeNum = parseInt(node.id.replace(/[a-z]/g, ""));
          if (prevNodeNum <= executionStep) {
            return {
              ...node,
              style: {
                ...node.style,
                opacity: 1,
                border: `2px solid var(--border-hover)`,
                boxShadow: "none",
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
    if (!chatInput.trim()) return;

    const newMessages: ChatMessage[] = [
      ...chatMessages,
      { role: "user", content: chatInput },
      {
        role: "assistant",
        content: "I'm analyzing your question about the workflow. This workflow processes 2,450 transactions, standardizes merchant names using fuzzy matching, and enriches product data from three parallel sources.",
      },
    ];
    setChatMessages(newMessages);
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
              Workflow Plan
            </h1>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">
              7 STEPS • ~{totalTime} SEC ESTIMATED
            </p>
          </div>
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
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="rgba(255, 255, 255, 0.05)"
              style={{
                background: "var(--bg-primary)",
              }}
            />
            <Controls
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                borderRadius: "8px",
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
            <Tabs defaultValue="steps" className="flex-1 flex flex-col h-full">
              <div className="border-b border-[var(--border-default)] px-4 pt-4 flex-shrink-0">
                <TabsList className="w-full">
                  <TabsTrigger value="chat" className="flex-1">
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="steps" className="flex-1">
                    View Enrichment Steps
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Chat Tab */}
              <TabsContent value="chat" className="flex-1 flex flex-col m-0 min-h-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-4 py-2 ${
                          msg.role === "user"
                            ? "bg-[var(--accent-primary)] text-white"
                            : "bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} className="p-4 border-t border-[var(--border-default)] flex-shrink-0">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask about the workflow..."
                      className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-primary)]"
                    />
                    <Button type="submit" size="icon">
                      <Send size={18} />
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* View Steps Tab */}
              <TabsContent value="steps" className="flex-1 overflow-y-auto m-0 p-4">
                {!selectedStep ? (
                  <div className="space-y-3">
                    {workflowSteps.map((step, index) => {
                      const Icon = step.icon;
                      return (
                        <button
                          key={step.id}
                          onClick={() => setSelectedStep(step.id)}
                          className={`w-full text-left p-4 rounded-lg border transition-all hover:border-[var(--border-hover)] ${
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
            </Tabs>
          )}
        </div>

        {/* Drawer Toggle Button */}
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
      </div>
    </div>
  );
}

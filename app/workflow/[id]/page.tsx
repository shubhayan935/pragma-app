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

// Node data for different states
interface NodePlanData {
  label: string;
  plan?: {
    decisions: string[];
    queries: string[];
    reasoning: string;
  };
  completed?: {
    decisions: string[];
    queries: string[];
    actions: string[];
  };
}

const nodePlans: Record<string, NodePlanData> = {
  "1": {
    label: "Load Data",
    completed: {
      decisions: [
        "Connected to postgres-prod.public.transactions using connection pool",
        "Validated schema compatibility (12 columns detected)",
        "Applied row limit of 2,450 for initial processing",
        "Detected merchant_name column with 89% fill rate",
        "Detected sku_code column with 73% fill rate",
      ],
      queries: [
        "SELECT * FROM postgres-prod.public.transactions LIMIT 2450",
        "SELECT COUNT(*), COUNT(DISTINCT merchant_name), COUNT(DISTINCT sku_code) FROM postgres-prod.public.transactions",
      ],
      actions: [
        "✓ Established database connection (127ms latency)",
        "✓ Loaded 2,450 rows into memory (145MB)",
        "✓ Validated data types and constraints",
        "✓ Created indexes on merchant_name and sku_code",
        "✓ Computed data quality metrics: 94% completeness",
      ],
    },
  },
  "2": {
    label: "Cluster Merchants",
    completed: {
      decisions: [
        "Selected Levenshtein distance algorithm with threshold 0.85",
        "Found 2,183 unique merchant name variants",
        "Clustered into 487 canonical merchant groups",
        "Applied business name normalization rules (Inc., LLC, Corp.)",
        "Resolved 156 ambiguous cases using frequency voting",
        "Average cluster size: 4.5 variants per canonical name",
      ],
      queries: [
        "SELECT DISTINCT merchant_name, COUNT(*) as frequency FROM transactions GROUP BY merchant_name",
        "-- Fuzzy matching using Levenshtein distance\nSELECT m1.merchant_name, m2.merchant_name, levenshtein(m1.merchant_name, m2.merchant_name) as distance\nFROM merchants m1, merchants m2\nWHERE levenshtein(m1.merchant_name, m2.merchant_name) < 3",
      ],
      actions: [
        "✓ Normalized 2,183 merchant names (removed special chars, lowercased)",
        "✓ Applied fuzzy matching algorithm (1.2s processing time)",
        "✓ Created 487 canonical merchant clusters",
        "✓ Resolved conflicts using frequency-based voting",
        "✓ Generated merchant mapping table with 95% confidence",
        "✓ Identified 23 edge cases requiring manual review",
      ],
    },
  },
  "3": {
    label: "Unify Names",
    plan: {
      decisions: [
        "Apply canonical names to all 2,450 merchant transactions",
        "Use frequency-based voting for conflict resolution",
        "Preserve original names in merchant_name_original column",
        "Update merchant_canonical column with standardized names",
        "Flag low-confidence matches (< 85%) for manual review",
      ],
      queries: [
        "ALTER TABLE transactions ADD COLUMN IF NOT EXISTS merchant_name_original VARCHAR(255)",
        "UPDATE transactions SET merchant_name_original = merchant_name",
        "UPDATE transactions t SET merchant_canonical = m.canonical_name FROM merchant_mapping m WHERE t.merchant_name = m.variant_name",
      ],
      reasoning: "Standardizing merchant names ensures consistency across the dataset and improves data quality for downstream analysis. By preserving original names, we maintain data lineage and can audit the transformation process. The frequency-based voting approach ensures that the most common variant becomes the canonical name, reducing the risk of selecting an incorrect or outdated name variant.",
    },
  },
  "4": {
    label: "Extract SKUs",
    plan: {
      decisions: [
        "Parse and extract SKU codes from sku_code column using regex patterns",
        "Apply data cleaning: trim whitespace, normalize case, remove invalid characters",
        "Validate SKU format against common patterns (alphanumeric, dashes, underscores)",
        "Filter out NULL, empty strings, and malformed SKU codes",
        "Create deduplicated list of unique SKUs for downstream enrichment",
        "Log extraction statistics: total SKUs, unique SKUs, invalid SKUs",
      ],
      queries: [
        "SELECT DISTINCT TRIM(UPPER(sku_code)) as sku_clean FROM transactions WHERE sku_code IS NOT NULL AND sku_code != ''",
        "-- Count unique vs total SKUs\nSELECT COUNT(*) as total_skus, COUNT(DISTINCT sku_code) as unique_skus, COUNT(*) - COUNT(DISTINCT sku_code) as duplicates FROM transactions WHERE sku_code IS NOT NULL",
        "-- Identify invalid SKU patterns\nSELECT sku_code, COUNT(*) as frequency FROM transactions WHERE sku_code !~ '^[A-Za-z0-9_-]+$' GROUP BY sku_code",
      ],
      reasoning: "Extracting and standardizing SKU codes is critical for successful product enrichment. By cleaning and validating SKUs upfront, we ensure higher match rates when querying external data sources (catalogs, APIs, web search). The deduplication step reduces unnecessary API calls and improves performance. Invalid SKUs are logged for manual review to identify potential data quality issues in the source system.",
    },
  },
  "5a": {
    label: "Catalog",
    plan: {
      decisions: [
        "Query internal product catalog (postgres-prod.products) as first priority",
        "Use exact SKU matching on indexed sku_code column for fast lookups",
        "Batch queries in groups of 100 SKUs to optimize database performance",
        "Extract product_name, category_l1, category_l2, category_l3, msrp, current_price",
        "Cache results in Redis with 30-day TTL to reduce database load",
        "Track match rate and identify SKUs not found in internal catalog",
      ],
      queries: [
        "SELECT sku_code, product_name, category_l1, category_l2, category_l3, msrp, current_price FROM postgres-prod.products WHERE sku_code = ANY($1)",
        "-- Verify cache hit rate\nSELECT COUNT(*) as cached_lookups FROM redis_stats WHERE key_pattern = 'catalog:sku:*' AND timestamp > NOW() - INTERVAL '1 hour'",
      ],
      reasoning: "Internal product catalog is the highest-quality data source with complete ownership, zero latency costs, and fastest query performance. By prioritizing internal data first, we maximize enrichment quality while minimizing external API costs. The Redis caching layer further optimizes performance for repeated lookups. Expected match rate is 65-70% based on historical catalog coverage, with remaining SKUs requiring external enrichment sources.",
    },
  },
  "5b": {
    label: "API",
    plan: {
      decisions: [
        "Use Amazon Product Advertising API v5 for SKUs not found in internal catalog",
        "Implement rate limiting: 10 requests/second with exponential backoff on 429 errors",
        "Batch requests: 10 items per API call to optimize quota usage",
        "Request fields: ItemInfo.Title, ItemInfo.Classifications, Offers.Listings[0].Price",
        "Set timeout to 5 seconds per request with 2 retry attempts",
        "Track API costs: $0.0003 per request, estimate total cost before execution",
        "Handle API errors gracefully: log failed SKUs for fallback to web search",
      ],
      queries: [
        "POST https://webservices.amazon.com/paapi5/searchitems\nContent-Type: application/json\nAuthorization: AWS4-HMAC-SHA256 ...\n\n{\n  \"PartnerTag\": \"enrichment-20\",\n  \"PartnerType\": \"Associates\",\n  \"Keywords\": \"{sku_code}\",\n  \"SearchIndex\": \"All\",\n  \"Resources\": [\"ItemInfo.Title\", \"ItemInfo.Classifications\", \"Offers.Listings\"]\n}",
      ],
      reasoning: "Amazon Product API provides comprehensive, structured product data for millions of SKUs with high reliability. While it incurs API costs (~$0.0003 per request), the data quality and coverage justify the expense for SKUs not in our internal catalog. The batch request approach optimizes quota usage and reduces total cost. Rate limiting and retry logic ensure we stay within API limits while maximizing successful enrichments. Expected match rate is 50-55% for consumer products.",
    },
  },
  "5c": {
    label: "Web Search",
    plan: {
      decisions: [
        "Use Google Custom Search API as final fallback for remaining unmatched SKUs",
        "Construct targeted queries: 'SKU {code} product specifications'",
        "Retrieve top 5 results per query, prioritize e-commerce and manufacturer sites",
        "Parse structured data: Schema.org Product markup, Open Graph tags, JSON-LD",
        "Apply heuristics for unstructured content: extract product name from title/h1 tags",
        "Assign confidence scores based on data source and parsing method (90%+ for Schema.org, 60-75% for heuristics)",
        "Filter low-confidence results (< 50%) to prevent incorrect enrichments",
      ],
      queries: [
        "GET https://www.googleapis.com/customsearch/v1?key={API_KEY}&cx={SEARCH_ENGINE_ID}&q=SKU+{sku_code}+product",
        "-- Parse Schema.org structured data\nEXTRACT JSON-LD WHERE @type = 'Product' FROM html_content",
        "-- Fallback heuristic parsing\nEXTRACT text FROM css_selector('h1.product-title, .product-name, #product-title')",
      ],
      reasoning: "Web search serves as the final fallback for long-tail SKUs not found in catalogs or APIs. While data quality is lower and confidence varies, it provides coverage for niche products and obscure SKUs. The structured data parsing approach (Schema.org, JSON-LD) ensures higher confidence when available. Heuristic parsing handles unstructured pages but requires confidence scoring to prevent bad matches. Expected match rate is 45-50% with average confidence of 70-75%. This multi-source enrichment strategy maximizes overall coverage while maintaining data quality standards.",
    },
  },
  "6": {
    label: "Merge Data",
    plan: {
      decisions: [
        "Implement priority-based merge strategy: Internal Catalog (priority 1) > Amazon API (priority 2) > Web Search (priority 3)",
        "Use LEFT JOIN to preserve all 2,450 transaction rows, even those without enrichment",
        "Handle field-level conflicts: prefer higher-priority source for each field independently",
        "For product_name: accept all sources (Catalog > API > Web)",
        "For category: only use Catalog and API data (Web search category data unreliable)",
        "For price: only use Catalog data (API prices often outdated, Web prices inconsistent)",
        "Track merge metadata: record data source and confidence score for each enriched field",
        "Resolve 87 detected conflicts using priority rules, flag 9 ambiguous cases for manual review",
      ],
      queries: [
        "-- Create staging table with all enrichment sources\nCREATE TEMP TABLE enrichment_staging AS\nSELECT t.id, t.sku_code, \n  COALESCE(c.product_name, a.product_name, w.product_name) as product_name,\n  COALESCE(c.category_l1, a.category_l1) as category_l1,\n  c.current_price as price,\n  CASE WHEN c.product_name IS NOT NULL THEN 'catalog' \n       WHEN a.product_name IS NOT NULL THEN 'api'\n       WHEN w.product_name IS NOT NULL THEN 'web' END as source\nFROM transactions t\nLEFT JOIN catalog_enrichments c ON t.sku_code = c.sku_code\nLEFT JOIN api_enrichments a ON t.sku_code = a.sku_code\nLEFT JOIN web_enrichments w ON t.sku_code = w.sku_code",
        "-- Identify and log conflicts\nSELECT id, sku_code, 'product_name' as field, \n  c.product_name as catalog_value, \n  a.product_name as api_value, \n  w.product_name as web_value\nFROM enrichment_staging\nWHERE c.product_name != a.product_name OR c.product_name != w.product_name",
      ],
      reasoning: "The priority-based merge strategy ensures we use the highest-quality data available for each transaction while maintaining complete dataset integrity through LEFT JOIN. By handling conflicts at the field level rather than row level, we can mix and match the best data from each source. The tiered priority system (Catalog > API > Web) reflects data quality and confidence levels. Metadata tracking (source, confidence) enables downstream auditing and quality analysis. The approach achieves 92% final enrichment coverage by cascading through multiple sources while maintaining data quality standards through selective field merging.",
    },
  },
  "7": {
    label: "Write Back",
    plan: {
      decisions: [
        "Write enriched data to postgres-prod.enriched_transactions table using UPSERT pattern",
        "Use ON CONFLICT (id) DO UPDATE to handle idempotency and concurrent workflow runs",
        "Include enrichment metadata: enriched_at timestamp, enrichment_source, confidence_score",
        "Preserve original transaction data in separate columns for auditing (merchant_name_original, sku_code_original)",
        "Create enrichment audit log in postgres-prod.enrichment_log with workflow_id, run_id, rows_processed, status",
        "Batch inserts in groups of 500 rows to optimize write performance",
        "Add composite index on (workflow_id, enriched_at) for efficient querying of enrichment history",
        "Validate write success: confirm 2,450 rows written, check for constraint violations",
      ],
      queries: [
        "INSERT INTO postgres-prod.enriched_transactions \n  (id, workflow_id, run_id, merchant_name_original, merchant_canonical, sku_code_original, sku_code_clean, product_name, category_l1, category_l2, price, enrichment_source, confidence_score, enriched_at)\nSELECT \n  t.id, $1 as workflow_id, $2 as run_id,\n  t.merchant_name as merchant_name_original,\n  m.canonical_name as merchant_canonical,\n  t.sku_code as sku_code_original,\n  e.sku_code_clean,\n  e.product_name, e.category_l1, e.category_l2, e.price,\n  e.source as enrichment_source,\n  e.confidence as confidence_score,\n  NOW() as enriched_at\nFROM transactions t\nLEFT JOIN merchant_mapping m ON t.merchant_name = m.variant_name\nLEFT JOIN enrichment_staging e ON t.id = e.id\nON CONFLICT (id) DO UPDATE SET\n  merchant_canonical = EXCLUDED.merchant_canonical,\n  product_name = EXCLUDED.product_name,\n  category_l1 = EXCLUDED.category_l1,\n  enriched_at = EXCLUDED.enriched_at",
        "-- Create audit log entry\nINSERT INTO postgres-prod.enrichment_log (workflow_id, run_id, rows_processed, rows_enriched, enrichment_rate, status, completed_at)\nVALUES ($1, $2, 2450, 2253, 0.92, 'completed', NOW())",
        "-- Verify write success\nSELECT COUNT(*) as total_rows, \n  COUNT(product_name) as enriched_product,\n  COUNT(merchant_canonical) as enriched_merchant\nFROM postgres-prod.enriched_transactions \nWHERE workflow_id = $1 AND run_id = $2",
      ],
      reasoning: "The UPSERT pattern ensures workflow idempotency, allowing safe re-runs without data duplication. By preserving original values alongside enriched values, we maintain complete data lineage for auditing and debugging. The enrichment metadata (source, confidence, timestamp) enables quality analysis and continuous improvement of enrichment strategies. Batched inserts optimize database performance for large datasets. The audit log provides workflow-level tracking for monitoring, alerting, and analytics. Index optimization ensures efficient querying of enrichment history for reporting and analysis. Final validation confirms successful write completion and data integrity before marking workflow as complete.",
    },
  },
};

// Running workflow component
function RunningWorkflowView({ workflowId }: { workflowId: string }) {
  const router = useRouter();

  // Current step is 3 (Unify Names) - steps 1-2 are done
  const currentStep = 3;

  // Create nodes with appropriate opacity and styling
  const runningNodes: Node[] = [
    {
      id: "1",
      type: "input",
      position: { x: 250, y: 50 },
      data: { label: "Load Data" },
      style: { opacity: 1 },
    },
    {
      id: "2",
      type: "default",
      position: { x: 250, y: 150 },
      data: { label: "Cluster Merchants" },
      style: { opacity: 1 },
    },
    {
      id: "3",
      type: "default",
      position: { x: 250, y: 260 },
      data: { label: "Unify Names" },
      style: { opacity: 1, border: "2px solid var(--accent-primary)", boxShadow: "0 0 0 3px rgba(140, 67, 208, 0.2)" },
    },
    {
      id: "4",
      type: "default",
      position: { x: 250, y: 370 },
      data: { label: "Extract SKUs" },
      style: { opacity: 0.4 },
    },
    {
      id: "5a",
      type: "default",
      position: { x: 80, y: 480 },
      data: { label: "Catalog" },
      style: { opacity: 0.4 },
    },
    {
      id: "5b",
      type: "default",
      position: { x: 250, y: 480 },
      data: { label: "API" },
      style: { opacity: 0.4 },
    },
    {
      id: "5c",
      type: "default",
      position: { x: 420, y: 480 },
      data: { label: "Web Search" },
      style: { opacity: 0.4 },
    },
    {
      id: "6",
      type: "default",
      position: { x: 250, y: 590 },
      data: { label: "Merge Data" },
      style: { opacity: 0.4 },
    },
    {
      id: "7",
      type: "output",
      position: { x: 250, y: 690 },
      data: { label: "Write Back" },
      style: { opacity: 0.4 },
    },
  ];

  const runningEdges: Edge[] = [
    { id: "e1-2", source: "1", target: "2", style: { stroke: "#5d5d5dff", strokeWidth: 1, opacity: 1 }, markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: "#5d5d5dff" } },
    { id: "e2-3", source: "2", target: "3", style: { stroke: "#5d5d5dff", strokeWidth: 1, opacity: 1 }, markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: "#5d5d5dff" } },
    { id: "e3-4", source: "3", target: "4", style: { stroke: "#5d5d5dff", strokeWidth: 1, opacity: 0.4 }, markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: "#5d5d5dff" } },
    { id: "e4-5a", source: "4", target: "5a", style: { stroke: "#5d5d5dff", strokeWidth: 1, opacity: 0.4 }, markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: "#5d5d5dff" } },
    { id: "e4-5b", source: "4", target: "5b", style: { stroke: "#5d5d5dff", strokeWidth: 1, opacity: 0.4 }, markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: "#5d5d5dff" } },
    { id: "e4-5c", source: "4", target: "5c", style: { stroke: "#5d5d5dff", strokeWidth: 1, opacity: 0.4 }, markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: "#5d5d5dff" } },
    { id: "e5a-6", source: "5a", target: "6", style: { stroke: "#5d5d5dff", strokeWidth: 1, opacity: 0.4 }, markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: "#5d5d5dff" } },
    { id: "e5b-6", source: "5b", target: "6", style: { stroke: "#5d5d5dff", strokeWidth: 1, opacity: 0.4 }, markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: "#5d5d5dff" } },
    { id: "e5c-6", source: "5c", target: "6", style: { stroke: "#5d5d5dff", strokeWidth: 1, opacity: 0.4 }, markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: "#5d5d5dff" } },
    { id: "e6-7", source: "6", target: "7", style: { stroke: "#5d5d5dff", strokeWidth: 1, opacity: 0.4 }, markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: "#5d5d5dff" } },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(runningNodes);
  const [edges, , onEdgesChange] = useEdgesState(runningEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [changeInput, setChangeInput] = useState("");
  const [isPropagating, setIsPropagating] = useState(false);

  const handleNodeClick = (event: any, node: Node) => {
    setSelectedNode(node.id);
    setDialogOpen(true);
    setChangeInput("");
  };

  const handlePropagateChanges = async () => {
    if (!changeInput.trim() || !selectedNode) return;

    setIsPropagating(true);
    setDialogOpen(false);

    // Show thinking state - update current node
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode
          ? { ...n, style: { ...n.style, border: "2px solid #F59E0B", boxShadow: "0 0 0 3px rgba(245, 158, 11, 0.2)" } }
          : n
      )
    );

    // Simulate AI thinking
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Detect specific change prompts and modify the graph accordingly
    const inputLower = changeInput.toLowerCase();

    // Hardcoded change detection for node 2 (Cluster Merchants)
    if (selectedNode === "2" && (inputLower.includes("threshold") || inputLower.includes("0.9") || inputLower.includes("90"))) {
      // User wants to increase clustering threshold to 0.9
      // Update node 2 data
      nodePlans["2"].completed!.decisions[0] = "Selected Levenshtein distance algorithm with threshold 0.90 (increased from 0.85)";
      nodePlans["2"].completed!.decisions[2] = "Clustered into 412 canonical merchant groups (reduced from 487 due to stricter matching)";
      nodePlans["2"].completed!.decisions[5] = "Average cluster size: 5.3 variants per canonical name (increased from 4.5)";

      // Update node 3 (Unify Names) to reflect the change
      nodePlans["3"].plan!.decisions[0] = "Apply canonical names from updated clustering (412 groups with 0.90 threshold)";
      nodePlans["3"].plan!.reasoning = "With the increased threshold of 0.90, clustering is more conservative, resulting in 412 canonical groups instead of 487. This means fewer aggressive merges, reducing the risk of incorrectly combining distinct merchants. The trade-off is slightly lower consolidation but higher accuracy. Manual review cases reduced to 15 (from 23) due to higher confidence threshold.";

      // Update node labels to show they've changed
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === "2") {
            return {
              ...n,
              data: { label: "Cluster Merchants (0.90)" },
              style: { opacity: 1, border: "2px solid #10B981", boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.2)" }
            };
          } else if (n.id === "3") {
            return {
              ...n,
              data: { label: "Unify Names (412 groups)" },
              style: { opacity: 0.5, border: "2px solid #F59E0B" }
            };
          } else if (parseInt(n.id.replace(/[a-z]/g, "")) > 3) {
            return { ...n, style: { ...n.style, opacity: 0.25 } };
          }
          return n;
        })
      );
    }
    // Hardcoded change detection for node 2 - different algorithm
    else if (selectedNode === "2" && (inputLower.includes("algorithm") || inputLower.includes("jaro") || inputLower.includes("soundex"))) {
      // User wants to use a different algorithm
      nodePlans["2"].completed!.decisions[0] = "Selected Jaro-Winkler distance algorithm with threshold 0.85 (changed from Levenshtein)";
      nodePlans["2"].completed!.decisions[2] = "Clustered into 501 canonical merchant groups (slightly more than Levenshtein due to phonetic bias)";
      nodePlans["2"].completed!.decisions[3] = "Applied business name normalization rules and phonetic matching (Inc., LLC, Corp.)";
      nodePlans["2"].completed!.actions[1] = "✓ Applied Jaro-Winkler algorithm with phonetic bias (1.4s processing time)";

      nodePlans["3"].plan!.decisions[0] = "Apply canonical names from Jaro-Winkler clustering (501 groups)";
      nodePlans["3"].plan!.reasoning = "Jaro-Winkler algorithm emphasizes prefix similarity and phonetic matching, which is better for catching typos and misspellings in merchant names. This results in 501 groups (vs 487 with Levenshtein), indicating slightly more conservative clustering. The phonetic component helps with names like 'Walmart' vs 'Wal-mart' or 'McDonald's' vs 'McDonalds'. Expected improvement in handling abbreviated vs full company names.";

      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === "2") {
            return {
              ...n,
              data: { label: "Cluster Merchants (Jaro-Winkler)" },
              style: { opacity: 1, border: "2px solid #10B981", boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.2)" }
            };
          } else if (n.id === "3") {
            return {
              ...n,
              data: { label: "Unify Names (501 groups)" },
              style: { opacity: 0.5, border: "2px solid #F59E0B" }
            };
          } else if (parseInt(n.id.replace(/[a-z]/g, "")) > 3) {
            return { ...n, style: { ...n.style, opacity: 0.25 } };
          }
          return n;
        })
      );
    }
    // Hardcoded change detection for node 3 (Unify Names)
    else if (selectedNode === "3" && (inputLower.includes("preserve") || inputLower.includes("keep original") || inputLower.includes("backup"))) {
      // User wants to ensure original data is preserved
      nodePlans["3"].plan!.decisions.push("Add merchant_name_backup column with original values before any transformation");
      nodePlans["3"].plan!.queries.push("CREATE TABLE merchant_history AS SELECT id, merchant_name, merchant_canonical, updated_at FROM transactions");
      nodePlans["3"].plan!.reasoning += " Additionally, a backup table (merchant_history) will be created to maintain a complete audit trail of all name transformations, enabling rollback if needed.";

      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === "3") {
            return {
              ...n,
              data: { label: "Unify Names (+ backup)" },
              style: { opacity: 1, border: "2px solid #10B981", boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.2)" }
            };
          } else if (parseInt(n.id.replace(/[a-z]/g, "")) > 3) {
            return { ...n, style: { ...n.style, opacity: 0.3 } };
          }
          return n;
        })
      );
    }
    // Hardcoded change detection for node 4 (Extract SKUs)
    else if (selectedNode === "4" && (inputLower.includes("validation") || inputLower.includes("strict") || inputLower.includes("validate more"))) {
      // User wants stricter SKU validation
      nodePlans["4"].plan!.decisions.push("Add checksum validation for SKUs with embedded check digits");
      nodePlans["4"].plan!.decisions.push("Cross-reference with known SKU formats from major retailers (Amazon, Walmart, Best Buy)");
      nodePlans["4"].plan!.queries.push("-- Validate against known SKU patterns\nSELECT sku_code FROM transactions WHERE sku_code ~ '^(AMZN|WMT|BBY)-[A-Z0-9]{8,12}$'");
      nodePlans["4"].plan!.reasoning += " Enhanced validation includes checksum verification and format matching against major retailer patterns, reducing false positives and improving downstream enrichment quality.";

      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === "4") {
            return {
              ...n,
              data: { label: "Extract SKUs (strict)" },
              style: { opacity: 1, border: "2px solid #10B981", boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.2)" }
            };
          } else if (parseInt(n.id.replace(/[a-z]/g, "")) > 4) {
            return { ...n, style: { ...n.style, opacity: 0.3 } };
          }
          return n;
        })
      );
    }
    // Hardcoded change detection for node 5b (API)
    else if ((selectedNode === "5b" || selectedNode === "5a" || selectedNode === "5c") && (inputLower.includes("skip") || inputLower.includes("remove") || inputLower.includes("don't use"))) {
      // User wants to skip a data source
      const nodeLabel = selectedNode === "5a" ? "Catalog" : selectedNode === "5b" ? "API" : "Web Search";

      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === selectedNode) {
            return {
              ...n,
              data: { label: `${nodeLabel} (Skipped)` },
              style: { opacity: 0.3, border: "2px solid #DC2626", boxShadow: "0 0 0 3px rgba(220, 38, 38, 0.2)" }
            };
          } else if (n.id === "6") {
            return {
              ...n,
              data: { label: "Merge Data (2 sources)" },
              style: { opacity: 0.5, border: "2px solid #F59E0B" }
            };
          } else if (parseInt(n.id.replace(/[a-z]/g, "")) > 6) {
            return { ...n, style: { ...n.style, opacity: 0.3 } };
          }
          return n;
        })
      );
    }
    // Generic change - just mark nodes as updated
    else {
      setNodes((nds) =>
        nds.map((n) => {
          const nodeNum = parseInt(n.id.replace(/[a-z]/g, ""));
          const selectedNum = parseInt(selectedNode.replace(/[a-z]/g, ""));

          if (n.id === selectedNode) {
            return {
              ...n,
              data: { label: n.data.label + " ✓" },
              style: { opacity: 1, border: "2px solid #10B981", boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.2)" }
            };
          } else if (nodeNum > selectedNum) {
            return { ...n, style: { ...n.style, opacity: 0.3 } };
          }
          return n;
        })
      );
    }

    setIsPropagating(false);
    setChangeInput("");
  };

  const selectedNodeData = selectedNode ? nodePlans[selectedNode] : null;
  const nodeNum = selectedNode ? parseInt(selectedNode.replace(/[a-z]/g, "")) : 0;
  const isDone = nodeNum < currentStep;

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-secondary)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-[var(--text-primary)]">
                Merchant Enrichment Workflow
              </h1>
              <p className="text-sm text-[var(--text-tertiary)] mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock size={14} className="text-orange-500 animate-pulse" />
                  Running
                </span>
                <span>Step {currentStep} of 7</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Just the graph */}
      <div className="flex-1 relative">
        {isPropagating && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-[var(--bg-secondary)] p-6 rounded-lg border border-[var(--border-default)]">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--accent-primary)]" />
                <span className="text-[var(--text-primary)]">Thinking and propagating changes...</span>
              </div>
            </div>
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          fitView
          style={{ background: "var(--bg-primary)" }}
          proOptions={reactFlowOptions}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="rgba(255, 255, 255, 0.35)"
            style={{ background: "var(--bg-primary)" }}
          />
        </ReactFlow>

        {/* Dialog */}
        {dialogOpen && selectedNodeData && (
          <div className="absolute top-0 right-0 h-full w-[500px] bg-[var(--bg-secondary)] border-l border-[var(--border-default)] shadow-2xl z-40 flex flex-col">
            {/* Dialog Header */}
            <div className="p-4 border-b border-[var(--border-default)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  {selectedNodeData.label}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)}>
                  <span className="text-[var(--text-tertiary)]">✕</span>
                </Button>
              </div>
              {isDone && (
                <p className="text-xs text-green-500 mt-1">✓ Completed</p>
              )}
              {!isDone && nodeNum === currentStep && (
                <p className="text-xs text-[var(--accent-primary)] mt-1 flex items-center gap-1">
                  <span className="animate-pulse">●</span> Currently Executing
                </p>
              )}
              {!isDone && nodeNum !== currentStep && (
                <p className="text-xs text-[var(--text-tertiary)] mt-1">○ Planning</p>
              )}
            </div>

            {/* Dialog Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isDone && selectedNodeData.completed ? (
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Decisions Made</h3>
                    <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
                      {selectedNodeData.completed.decisions.map((decision, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[var(--accent-primary)] mt-1">•</span>
                          <span>{decision}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Queries Executed</h3>
                    <div className="space-y-2">
                      {selectedNodeData.completed.queries.map((query, i) => (
                        <code key={i} className="block p-2 bg-[var(--bg-tertiary)] rounded text-xs text-[var(--text-primary)] font-mono">
                          {query}
                        </code>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Actions Taken</h3>
                    <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
                      {selectedNodeData.completed.actions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : nodeNum === currentStep ? (
                /* Currently executing step - show loading state */
                <>
                  <div className="p-4 rounded-lg bg-[var(--bg-elevated)] border border-[var(--accent-primary)]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--accent-primary)]" />
                      <h3 className="text-sm font-semibold text-[var(--accent-primary)]">Currently Executing</h3>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      This step is actively running. View the planned approach below.
                    </p>
                  </div>
                  {selectedNodeData.plan && (
                    <>
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Execution Plan</h3>
                        <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
                          {selectedNodeData.plan.decisions.map((decision, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-[var(--accent-primary)] mt-1">•</span>
                              <span>{decision}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Planned Queries</h3>
                        <div className="space-y-2">
                          {selectedNodeData.plan.queries.map((query, i) => (
                            <code key={i} className="block p-2 bg-[var(--bg-tertiary)] rounded text-xs text-[var(--text-primary)] font-mono">
                              {query}
                            </code>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Reasoning</h3>
                        <p className="text-sm text-[var(--text-secondary)]">{selectedNodeData.plan.reasoning}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-[var(--text-tertiary)]">Progress</span>
                          <span className="text-xs font-mono text-[var(--accent-primary)]">~45%</span>
                        </div>
                        <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--accent-primary)] transition-all duration-1000"
                            style={{ width: "45%", animation: "pulse 2s ease-in-out infinite" }}
                          />
                        </div>
                        <p className="text-xs text-[var(--text-tertiary)] mt-2">
                          Currently applying canonical names to transactions...
                        </p>
                      </div>
                    </>
                  )}
                </>
              ) : (
                /* Future steps - show plan */
                selectedNodeData.plan && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Planned Decisions</h3>
                      <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
                        {selectedNodeData.plan.decisions.map((decision, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[var(--accent-primary)] mt-1">•</span>
                            <span>{decision}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Planned Queries</h3>
                      <div className="space-y-2">
                        {selectedNodeData.plan.queries.map((query, i) => (
                          <code key={i} className="block p-2 bg-[var(--bg-tertiary)] rounded text-xs text-[var(--text-primary)] font-mono">
                            {query}
                          </code>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Reasoning</h3>
                      <p className="text-sm text-[var(--text-secondary)]">{selectedNodeData.plan.reasoning}</p>
                    </div>
                  </>
                )
              )}
            </div>

            {/* Dialog Footer - Only show for planned (not completed and not currently executing) nodes */}
            {!isDone && nodeNum !== currentStep && (
              <div className="p-4 border-t border-[var(--border-default)] space-y-3">
                <div>
                  <label className="text-xs text-[var(--text-tertiary)] mb-2 block">
                    What would you like to do differently?
                  </label>
                  <textarea
                    value={changeInput}
                    onChange={(e) => setChangeInput(e.target.value)}
                    placeholder="E.g., Use a different clustering algorithm, increase the threshold to 0.9..."
                    className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] resize-none"
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handlePropagateChanges}
                  disabled={!changeInput.trim()}
                  className="w-full"
                  style={{
                    background: changeInput.trim() ? "var(--accent-primary)" : "var(--bg-elevated)",
                    color: changeInput.trim() ? "white" : "var(--text-muted)",
                  }}
                >
                  Propagate Changes
                </Button>
              </div>
            )}

            {/* Special footer for currently executing step */}
            {nodeNum === currentStep && (
              <div className="p-4 border-t border-[var(--border-default)]">
                <div className="p-3 rounded-lg bg-[var(--bg-elevated)] text-center">
                  <p className="text-xs text-[var(--text-tertiary)]">
                    This step is currently executing. You can modify it after completion or cancel the workflow to make changes.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;

  // Check if this is a running workflow (IDs 1 or 2)
  const isRunning = workflowId === "1" || workflowId === "2";

  const [nodes, , onNodesChange] = useNodesState(executedNodes);
  const [edges, , onEdgesChange] = useEdgesState(executedEdges);
  const [showStats, setShowStats] = useState(true);
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);

  // Running workflow state
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [changeInput, setChangeInput] = useState("");
  const [isPropagating, setIsPropagating] = useState(false);

  // If this is a running workflow, show the running view
  if (isRunning) {
    return <RunningWorkflowView workflowId={workflowId} />;
  }

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

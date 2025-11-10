"use client";

import Link from "next/link";
import { RefreshCw, Plus, Filter, ChevronLeft, ChevronRight, Code, Download, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type WorkflowStatus = "running" | "completed" | "failed" | "timed_out" | "canceled" | "terminated";

interface Workflow {
  id: string;
  workflowId: string;
  runId: string;
  type: string;
  status: WorkflowStatus;
}

const statusCounts = {
  running: 2,
  timed_out: 45,
  completed: 1203,
  failed: 78,
  canceled: 2,
  terminated: 5,
};

const workflows: Workflow[] = [
  { id: "1", workflowId: "merchantCleanup:4092603", runId: "019a...dd36", type: "merchantEnrichment", status: "running" },
  { id: "2", workflowId: "merchantCleanup:3319723", runId: "019a...7d96", type: "merchantEnrichment", status: "running" },
  { id: "3", workflowId: "skuStandardization:1080967", runId: "019a...5535", type: "skuEnrichment", status: "completed" },
  { id: "4", workflowId: "batchEntityEnrichment.daily:2025-11-10T00:00:00Z", runId: "019a...8131", type: "batchEnrichment", status: "completed" },
  { id: "5", workflowId: "write:entityEnrichment", runId: "019a...6fdd", type: "entityEnrichment", status: "completed" },
  { id: "6", workflowId: "merchantCleanup:4233700", runId: "019a...dd81", type: "merchantEnrichment", status: "failed" },
  { id: "7", workflowId: "skuStandardization:4245852", runId: "019a...32cd", type: "skuEnrichment", status: "completed" },
  { id: "8", workflowId: "batchEntityEnrichment.daily:2025-11-09T23:00:00Z", runId: "019a...9fc7", type: "batchEnrichment", status: "completed" },
  { id: "9", workflowId: "write:entityEnrichment", runId: "019a...ac98", type: "entityEnrichment", status: "completed" },
  { id: "10", workflowId: "merchantCleanup:3160858", runId: "019a...aaba", type: "merchantEnrichment", status: "timed_out" },
];

const getStatusColor = (status: WorkflowStatus) => {
  switch (status) {
    case "running":
      return { bg: "#6366F1", text: "#FFFFFF" };
    case "completed":
      return { bg: "#10B981", text: "#FFFFFF" };
    case "failed":
      return { bg: "#DC2626", text: "#FFFFFF" };
    case "timed_out":
      return { bg: "#F59E0B", text: "#000000" };
    case "canceled":
      return { bg: "#6B7280", text: "#FFFFFF" };
    case "terminated":
      return { bg: "#EF4444", text: "#FFFFFF" };
  }
};

const getStatusLabel = (status: WorkflowStatus) => {
  return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

export default function Dashboard() {
  const totalWorkflows = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold text-[var(--text-primary)]">
                {totalWorkflows.toLocaleString()} Workflows
              </h1>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RefreshCw size={20} className="text-[var(--text-tertiary)]" />
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild>
                <Link href="/workflow/new">
                  <Plus className="size-4" />
                  Start Workflow
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs text-[var(--text-tertiary)]">
              2025-11-10 UTC 00:26:07:55
            </p>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge style={{ background: "#6366F1" }}>{statusCounts.running} Running</Badge>
            <Badge style={{ background: "#F59E0B", color: "#000" }}>{statusCounts.timed_out} Timed Out</Badge>
            <Badge className="bg-[var(--status-success)]">{statusCounts.completed} Completed</Badge>
            <Badge className="bg-[var(--status-error)]">{statusCounts.failed} Failed</Badge>
            <Badge style={{ background: "#6B7280" }}>{statusCounts.canceled} Canceled</Badge>
            <Badge style={{ background: "#EF4444" }}>{statusCounts.terminated} Terminated</Badge>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Filter size={18} />
            </Button>
            <Button variant="outline" size="sm">
              <Plus size={14} className="mr-2" />
              Add Filter
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Code size={18} />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto m-5 border border-[var(--border-default)] rounded-md">
        <Table>
          <TableHeader>
            <TableRow style={{ background: "#8C43D0CC" }}>
              <TableHead className="w-12">
                {/* <Checkbox /> */}
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Workflow ID</TableHead>
              <TableHead>Run ID</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workflows.map((workflow) => {
              const statusColor = getStatusColor(workflow.status);
              return (
                <TableRow key={workflow.id}>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <Badge style={{ background: statusColor.bg, color: statusColor.text }}>
                      {getStatusLabel(workflow.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/workflow/${workflow.id}`}
                      className="font-mono text-sm underline hover:no-underline text-[var(--text-primary)]"
                    >
                      {workflow.workflowId}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-[var(--text-tertiary)]">
                      {workflow.runId}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/type/${workflow.type}`}
                      className="font-mono text-sm underline hover:no-underline text-[var(--text-primary)]"
                    >
                      {workflow.type}
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select defaultValue="10">
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Download size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <SettingsIcon size={18} />
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft size={18} />
            </Button>
            <span className="text-sm font-mono text-[var(--text-secondary)]">
              1–10 of {totalWorkflows.toLocaleString()}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Cloud,
  Database,
  Workflow,
  Clock,
  Layers,
  Rocket,
  Share2,
  HelpCircle,
  FileText,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Cloud", href: "/cloud", icon: Cloud },
  { name: "Namespaces", href: "/namespaces", icon: Database },
  { name: "Workflows", href: "/", icon: Workflow },
  { name: "Schedules", href: "/schedules", icon: Clock },
  { name: "Batch", href: "/batch", icon: Layers },
  { name: "Deployments", href: "/deployments", icon: Rocket },
  { name: "Nexus", href: "/nexus", icon: Share2 },
];

const bottomNavigation = [
  { name: "Support", href: "/support", icon: HelpCircle },
  { name: "Docs", href: "/docs", icon: FileText },
  { name: "Welcome", href: "/welcome", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-[180px] flex-col border-r bg-[var(--sidebar)] border-[var(--sidebar-border)]">
      {/* Logo/Brand */}
      <div className="flex h-14 items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <Cloud size={20} className="text-[var(--sidebar-foreground)]" />
          <span className="text-sm font-semibold text-[var(--sidebar-foreground)]">
            Pragma
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]"
                  : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]/50"
              )}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-[var(--sidebar-border)] p-2 space-y-1">
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]"
                  : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]/50"
              )}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          );
        })}
        <div className="px-3 py-2">
          <p className="text-xs text-[var(--sidebar-foreground)] opacity-60">
            2.40.1
          </p>
        </div>
      </div>
    </div>
  );
}

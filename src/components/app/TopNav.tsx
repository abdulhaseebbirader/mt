import { CloudOff, RefreshCw, Store, UtensilsCrossed } from "lucide-react";

import { BRANCHES, type BranchId, type ModuleId } from "@/lib/domain";
import { cn } from "@/lib/utils";

type Props = {
  branch: BranchId;
  module: ModuleId;
  online: boolean;
  pending: number;
  refreshing: boolean;
  onBranch: (b: BranchId) => void;
  onModule: (m: ModuleId) => void;
  onRefresh: () => void;
};

export function TopNav({
  branch,
  module,
  online,
  pending,
  refreshing,
  onBranch,
  onModule,
  onRefresh,
}: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <UtensilsCrossed className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold leading-tight">Reconcile Hub</h1>
            <p className="truncate text-[11px] text-muted-foreground">
              Multi-branch sales &amp; inventory
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!online && (
            <span className="flex items-center gap-1 rounded-full bg-warning/20 px-2 py-1 text-[11px] font-medium text-warning-foreground">
              <CloudOff className="h-3.5 w-3.5" /> Offline
            </span>
          )}
          {pending > 0 && (
            <span className="rounded-full bg-accent px-2 py-1 text-[11px] font-semibold text-accent-foreground">
              {pending} queued
            </span>
          )}
          <button
            type="button"
            onClick={onRefresh}
            aria-label="Refresh from Google Sheets"
            className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition-colors active:bg-secondary"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-3 pt-3">
        <div className="flex rounded-2xl bg-secondary p-1">
          {BRANCHES.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => onBranch(b.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all",
                branch === b.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              <Store className="h-4 w-4" />
              {b.name}
            </button>
          ))}
        </div>

        <div className="mt-2 flex gap-2">
          {(
            [
              { id: "sales", label: "Daily Sales Closing" },
              { id: "inventory", label: "Inventory / Procurement" },
            ] as { id: ModuleId; label: string }[]
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onModule(m.id)}
              className={cn(
                "flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors",
                module === m.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

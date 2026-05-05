import * as React from "react";
import { cn } from "@/lib/utils";

const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg shimmer", className)}
      {...props}
    />
  )
);
Skeleton.displayName = "Skeleton";

// ─── SkeletonCard ──────────────────────────────────────────────────────────
const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn("bg-card rounded-xl border border-border card-shadow p-6 space-y-4", className)}>
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-4/5" />
    <Skeleton className="h-3 w-3/5" />
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-8 w-20 rounded-lg" />
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  </div>
);
SkeletonCard.displayName = "SkeletonCard";

// ─── SkeletonTableRow ──────────────────────────────────────────────────────
const SkeletonTableRow = ({ columns = 5, className }: { columns?: number; className?: string }) => (
  <tr className={cn("border-b border-border", className)}>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton
          className={cn(
            "h-4",
            i === 0 ? "w-8" : i === 1 ? "w-32" : i === columns - 1 ? "w-16" : "w-24"
          )}
        />
      </td>
    ))}
  </tr>
);
SkeletonTableRow.displayName = "SkeletonTableRow";

// ─── SkeletonStatCard ──────────────────────────────────────────────────────
const SkeletonStatCard = ({ className }: { className?: string }) => (
  <div className={cn("bg-card rounded-xl border border-border card-shadow-md p-6", className)}>
    <div className="flex items-start justify-between mb-4">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>
      <Skeleton className="h-12 w-12 rounded-xl" />
    </div>
    <div className="flex items-center gap-2">
      <Skeleton className="h-3 w-3 rounded-full" />
      <Skeleton className="h-3 w-28" />
    </div>
  </div>
);
SkeletonStatCard.displayName = "SkeletonStatCard";

export { Skeleton, SkeletonCard, SkeletonTableRow, SkeletonStatCard };

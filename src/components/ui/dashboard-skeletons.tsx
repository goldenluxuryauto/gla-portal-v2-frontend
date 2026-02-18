import { Skeleton } from "./skeleton";

/**
 * Stat Card Skeleton — for KPI/metric cards on dashboards
 */
export function StatCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-24 bg-muted/50" />
            <Skeleton className="h-8 w-8 rounded bg-muted/50" />
          </div>
          <Skeleton className="h-8 w-20 bg-muted/50 mb-1" />
          <Skeleton className="h-3 w-16 bg-muted/50" />
        </div>
      ))}
    </div>
  );
}

/**
 * Chart Skeleton — for graph/chart areas
 */
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-card p-6 rounded-lg border border-border ${className ?? ""}`}>
      <Skeleton className="h-6 w-40 mb-4 bg-muted/50" />
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 bg-muted/50 rounded-t"
            style={{ height: `${20 + Math.random() * 80}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Dashboard Page Skeleton — full dashboard loading state
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 bg-muted/50 mb-2" />
          <Skeleton className="h-4 w-64 bg-muted/50" />
        </div>
        <Skeleton className="h-10 w-32 bg-muted/50 rounded" />
      </div>

      {/* Stat Cards */}
      <StatCardSkeleton />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-4 border-b border-border">
          <Skeleton className="h-6 w-32 bg-muted/50" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full bg-muted/50" />
              <Skeleton className="h-4 flex-1 bg-muted/50" />
              <Skeleton className="h-4 w-20 bg-muted/50" />
              <Skeleton className="h-6 w-16 rounded-full bg-muted/50" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Fleet Dashboard Skeleton
 */
export function FleetDashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-56 bg-muted/50" />
      <StatCardSkeleton count={6} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card p-4 rounded-lg border border-border">
            <Skeleton className="h-40 w-full rounded bg-muted/50 mb-3" />
            <Skeleton className="h-5 w-3/4 bg-muted/50 mb-2" />
            <Skeleton className="h-4 w-1/2 bg-muted/50 mb-3" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full bg-muted/50" />
              <Skeleton className="h-6 w-16 rounded-full bg-muted/50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

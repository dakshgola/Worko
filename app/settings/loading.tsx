import React from "react";

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 border-r border-border bg-surface flex flex-col shrink-0 p-4 space-y-4">
        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
      </aside>

      {/* Main Settings Panel */}
      <main className="flex-grow min-w-0 p-6 lg:p-10 space-y-8 max-h-screen overflow-y-auto">
        <header className="space-y-2">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        </header>

        {/* Tab Headers Skeleton */}
        <div className="flex gap-2 border-b border-border pb-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 w-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>

        {/* Settings Body Card Skeleton */}
        <div className="bg-surface border border-border rounded-[24px] p-6 space-y-6 max-w-2xl animate-pulse">
          <div className="h-5 w-40 bg-muted rounded" />
          <div className="space-y-4 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <div className="space-y-1.5 flex-grow">
                  <div className="h-4 w-1/3 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
                <div className="h-6 w-11 bg-muted rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

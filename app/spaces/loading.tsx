import React from "react";

export default function SpacesLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 border-r border-border bg-surface flex flex-col shrink-0 p-4 space-y-4">
        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
      </aside>

      {/* Main Spaces Skeleton */}
      <main className="flex-grow min-w-0 p-6 lg:p-10 space-y-8 max-h-screen overflow-y-auto">
        <header className="flex justify-between items-end gap-4">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded-xl" />
        </header>

        {/* Space Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-[24px] p-6 space-y-4 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="size-10 rounded-xl bg-muted" />
                <div className="h-8 w-8 rounded-lg bg-muted" />
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-5 w-1/2 bg-muted rounded" />
                <div className="h-4 w-5/6 bg-muted rounded" />
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-4 w-12 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

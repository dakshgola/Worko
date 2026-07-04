import React from "react";

export default function CalendarLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Skeleton */}
      <aside className="w-full lg:w-64 border-r border-border bg-surface flex flex-col shrink-0 p-4 space-y-4">
        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
        <div className="space-y-3 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-full bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </aside>

      {/* Main Content Calendar Grid Skeleton */}
      <main className="flex-grow bg-background flex flex-col min-w-0 h-screen">
        <header className="h-[68px] border-b border-border bg-surface/80 flex items-center px-6 shrink-0 justify-between">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
          <div className="h-10 w-28 bg-muted animate-pulse rounded-xl" />
        </header>
        <div className="flex-1 p-6 grid grid-cols-7 grid-rows-5 gap-3 bg-background">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="border border-border bg-surface rounded-2xl p-2.5 flex flex-col justify-between">
              <div className="h-4 w-6 bg-muted animate-pulse rounded" />
              <div className="space-y-1.5 pt-4">
                {i % 4 === 0 && <div className="h-3 w-4/5 bg-muted animate-pulse rounded" />}
                {i % 6 === 0 && <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

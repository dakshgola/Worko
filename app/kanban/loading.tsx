import React from "react";

export default function KanbanLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Board Selector Skeleton */}
      <aside className="w-full lg:w-64 border-r border-border bg-surface flex flex-col shrink-0 p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="space-y-2 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-full bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </aside>

      {/* Main Columns Skeleton */}
      <main className="flex-grow bg-background flex flex-col min-w-0 h-screen">
        <header className="h-[68px] border-b border-border bg-surface/80 flex items-center px-6 shrink-0 justify-between">
          <div className="h-8 w-40 bg-muted animate-pulse rounded-lg" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded-xl" />
        </header>

        {/* Board Columns container */}
        <div className="flex-grow p-6 flex gap-6 overflow-x-auto bg-background">
          {[1, 2, 3].map((colIndex) => (
            <div key={colIndex} className="w-80 bg-surface rounded-[24px] p-4 flex flex-col shrink-0 border border-border">
              <div className="flex justify-between items-center pb-4">
                <div className="h-5 w-24 bg-muted animate-pulse rounded" />
                <div className="h-8 w-8 bg-muted animate-pulse rounded-lg" />
              </div>
              <div className="flex-1 space-y-3">
                {[1, 2].map((cardIndex) => (
                  <div key={cardIndex} className="p-4 bg-background border border-border rounded-2xl space-y-2">
                    <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-5 w-12 bg-muted animate-pulse rounded-full" />
                      <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

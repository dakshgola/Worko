import React from "react";

export default function WhiteboardLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar List Selector Skeleton */}
      <aside className="w-full lg:w-56 border-r border-border bg-surface flex flex-col shrink-0 p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="space-y-2 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 w-full bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </aside>

      {/* Canvas workspace area */}
      <main className="flex-grow bg-background flex flex-col min-w-0 h-screen relative">
        <div className="absolute top-4 left-4 h-11 w-44 bg-surface border border-border rounded-xl animate-pulse" />
        <div className="absolute top-4 right-4 h-11 w-56 bg-surface border border-border rounded-xl animate-pulse" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 h-12 w-64 bg-surface border border-border rounded-2xl animate-pulse" />
        
        {/* Gridded background representation */}
        <div className="w-full h-full opacity-10 flex items-center justify-center">
          <div className="h-full w-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>
      </main>
    </div>
  );
}

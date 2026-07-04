import React from "react";

export default function NotesLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Skeleton */}
      <aside className="w-full lg:w-64 border-r border-border bg-surface flex flex-col shrink-0 p-4 space-y-4">
        <div className="flex justify-between items-center pb-2">
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="h-8 w-full bg-muted animate-pulse rounded-lg" />
        <div className="flex-grow space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-xl">
              <div className="size-2 rounded-full bg-muted animate-pulse shrink-0" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Workspace Skeleton */}
      <main className="flex-grow bg-background flex flex-col min-w-0 h-screen">
        <div className="flex h-[64px] items-center gap-3 border-b border-border px-6 shrink-0 bg-surface/80">
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          <div className="ml-auto flex items-center gap-2">
            <div className="h-8 w-8 bg-muted animate-pulse rounded-lg" />
            <div className="h-8 w-8 bg-muted animate-pulse rounded-lg" />
            <div className="h-8 w-8 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
        <div className="flex-1 p-8 space-y-4 bg-surface max-w-none">
          <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
          <div className="h-4 w-1/4 bg-muted animate-pulse rounded" />
          <div className="space-y-2.5 pt-6">
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
            <div className="h-4 w-4/5 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </main>
    </div>
  );
}

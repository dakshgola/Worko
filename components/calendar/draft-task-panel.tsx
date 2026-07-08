"use client";

import { Archive, Inbox, Plus, Sparkles } from "lucide-react";
import { TaskCard } from "./task-card";
import type { CalendarTask } from "./types";

export function DraftTaskPanel({
  tasks,
  onAdd,
  onDragStart,
}: {
  tasks: CalendarTask[];
  onAdd: () => void;
  onDragStart: (taskId: string) => void;
}) {
  return (
    <aside className="flex min-h-0 flex-col rounded-[20px] border border-border bg-surface shadow-[var(--shadow-md)]">
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-warning-soft text-warning"><Inbox size={16} /></span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold tracking-[-0.02em]">Draft tasks</h2>
            <p className="mt-0.5 text-[10px] text-muted">Drag a task onto the calendar</p>
          </div>
          <span className="rounded-full bg-background text-muted px-2 py-1 text-[9px] font-bold">{tasks.length}</span>
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {tasks.map((task) => <TaskCard key={task.id} task={task} onDragStart={onDragStart} />)}
        {tasks.length === 0 && (
          <div className="grid place-items-center rounded-2xl border border-dashed border-border px-4 py-9 text-center">
            <Archive size={19} className="mb-2 text-muted/65" />
            <p className="text-[11px] font-bold text-foreground">Your drafts are clear</p>
            <p className="mt-1 text-[9px] leading-4 text-muted">Save an idea here when it is not ready for a date.</p>
          </div>
        )}
      </div>
      <div className="border-t border-border p-3">
        <button
          onClick={onAdd}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-xl btn-secondary text-[10px] font-bold transition hover:-translate-y-0.5"
        >
          <Plus size={13} /> Add draft task
        </button>
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-background border border-border p-2.5 text-[9px] leading-4 text-muted">
          <Sparkles size={11} className="mt-0.5 shrink-0 text-warning" />
          Drafts are perfect for ideas you want to shape later.
        </div>
      </div>
    </aside>
  );
}


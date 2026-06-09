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
    <aside className="flex min-h-0 flex-col rounded-[20px] border border-[#e7e4ee] bg-white shadow-[0_10px_32px_rgba(54,48,89,0.06)]">
      <div className="border-b border-[#eeeaf2] p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-[#fff2df] text-[#cf8730]"><Inbox size={16} /></span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold tracking-[-0.02em]">Draft tasks</h2>
            <p className="mt-0.5 text-[10px] text-[#9992a2]">Drag a task onto the calendar</p>
          </div>
          <span className="rounded-full bg-[#f3f1f6] px-2 py-1 text-[9px] font-bold text-[#827c8d]">{tasks.length}</span>
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {tasks.map((task) => <TaskCard key={task.id} task={task} onDragStart={onDragStart} />)}
        {tasks.length === 0 && (
          <div className="grid place-items-center rounded-2xl border border-dashed border-[#e7e2ed] px-4 py-9 text-center">
            <Archive size={19} className="mb-2 text-[#bbb4c4]" />
            <p className="text-[11px] font-bold text-[#7f7889]">Your drafts are clear</p>
            <p className="mt-1 text-[9px] leading-4 text-[#aaa3b1]">Save an idea here when it is not ready for a date.</p>
          </div>
        )}
      </div>
      <div className="border-t border-[#eeeaf2] p-3">
        <button
          onClick={onAdd}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-[#ded8f5] bg-[#f7f5ff] text-[10px] font-bold text-[#6253cb] transition hover:-translate-y-0.5 hover:bg-[#eeeaff]"
        >
          <Plus size={13} /> Add draft task
        </button>
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#faf8f3] p-2.5 text-[9px] leading-4 text-[#938b80]">
          <Sparkles size={11} className="mt-0.5 shrink-0 text-[#d79a45]" />
          Drafts are perfect for ideas you want to shape later.
        </div>
      </div>
    </aside>
  );
}


"use client";

import { Clock3, GripVertical, Repeat2 } from "lucide-react";
import { categoryStyles, type CalendarTask } from "./types";

export function TaskCard({
  task,
  compact = false,
  onDragStart,
}: {
  task: CalendarTask;
  compact?: boolean;
  onDragStart: (taskId: string) => void;
}) {
  const style = categoryStyles[task.category];

  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/task-id", task.id);
        onDragStart(task.id);
      }}
      className={`group flex cursor-grab items-start gap-1.5 rounded-[9px] border px-2 py-1.5 text-left shadow-[0_2px_8px_rgba(54,48,89,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing ${style.chip}`}
    >
      <GripVertical size={11} className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-50" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[10px] font-bold leading-4">{task.title}</span>
        {!compact && task.time && (
          <span className="mt-0.5 flex items-center gap-1 text-[9px] font-semibold opacity-65">
            <Clock3 size={9} /> {task.time}
          </span>
        )}
      </span>
      {task.recurring && <Repeat2 size={10} className="mt-0.5 shrink-0 opacity-60" />}
    </div>
  );
}


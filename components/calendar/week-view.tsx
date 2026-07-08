"use client";

import { Plus } from "lucide-react";
import { sameDay, toDateKey, weekDays } from "./date-utils";
import { TaskCard } from "./task-card";
import type { CalendarTask } from "./types";

export function WeekView({
  cursor,
  tasks,
  onAdd,
  onDropTask,
  onDragStart,
}: {
  cursor: Date;
  tasks: CalendarTask[];
  onAdd: (date: string) => void;
  onDropTask: (taskId: string, date: string) => void;
  onDragStart: (taskId: string) => void;
}) {
  const days = weekDays(cursor);
  const today = new Date();

  return (
    <div className="grid min-w-[760px] grid-cols-7">
      {days.map((day) => {
        const dateKey = toDateKey(day);
        const dayTasks = tasks.filter((task) => task.date === dateKey);
        const isToday = sameDay(day, today);

        return (
          <div
            key={dateKey}
            onDragOver={(event) => {
              event.preventDefault();
              event.currentTarget.classList.add("calendar-drop-active");
            }}
            onDragLeave={(event) => event.currentTarget.classList.remove("calendar-drop-active")}
            onDrop={(event) => {
              event.preventDefault();
              event.currentTarget.classList.remove("calendar-drop-active");
              onDropTask(event.dataTransfer.getData("text/task-id"), dateKey);
            }}
            className="min-h-[650px] border-r border-border bg-surface p-2 transition-colors last:border-r-0"
          >
            <div className={`mb-4 rounded-xl p-2 text-center ${isToday ? "bg-secondary-soft" : "bg-background"}`}>
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </p>
              <p className={`mt-1 text-xl font-bold ${isToday ? "text-secondary font-black" : "text-foreground"}`}>{day.getDate()}</p>
            </div>
            <button
              onClick={() => onAdd(dateKey)}
              className="mb-3 flex h-8 w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border text-[9px] font-bold text-muted transition hover:border-secondary hover:bg-secondary-soft hover:text-secondary"
            >
              <Plus size={11} /> Add task
            </button>
            <div className="space-y-2">
              {dayTasks.map((task) => <TaskCard key={task.id} task={task} onDragStart={onDragStart} />)}
              {dayTasks.length === 0 && (
                <div className="rounded-xl bg-background/50 border border-dashed border-border px-2 py-8 text-center text-[9px] font-medium text-muted">A clear day</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}


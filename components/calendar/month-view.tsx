"use client";

import { Plus } from "lucide-react";
import { monthDays, sameDay, toDateKey } from "./date-utils";
import { TaskCard } from "./task-card";
import type { CalendarTask } from "./types";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthView({
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
  const days = monthDays(cursor);
  const today = new Date();

  return (
    <div className="min-w-[760px]">
      <div className="grid grid-cols-7 border-b border-border bg-background">
        {weekdays.map((day) => (
          <div key={day} className="px-3 py-2 text-[9px] font-bold uppercase tracking-[0.13em] text-muted">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dateKey = toDateKey(day);
          const dayTasks = tasks.filter((task) => task.date === dateKey);
          const outside = day.getMonth() !== cursor.getMonth();
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
              className={`group/day relative min-h-[122px] border-b border-r border-border p-2 transition-colors ${
                outside ? "bg-background/70 text-muted" : "bg-surface"
              }`}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span
                  className={`grid size-6 place-items-center rounded-full text-[10px] font-bold ${
                    isToday ? "bg-secondary text-white shadow-[0_4px_12px_rgba(108,92,231,0.25)]" : ""
                  }`}
                >
                  {day.getDate()}
                </span>
                <div className="flex items-center gap-1">
                  {dayTasks.length > 0 && (
                    <span className="rounded-full bg-background text-muted px-1.5 py-0.5 text-[8px] font-bold">
                      {dayTasks.length}
                    </span>
                  )}
                  <button
                    onClick={() => onAdd(dateKey)}
                    aria-label={`Add task on ${dateKey}`}
                    className="grid size-5 place-items-center rounded-md text-muted opacity-0 transition hover:bg-secondary-soft hover:text-secondary group-hover/day:opacity-100 focus:opacity-100"
                  >
                    <Plus size={11} />
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map((task) => (
                  <TaskCard key={task.id} task={task} compact onDragStart={onDragStart} />
                ))}
                {dayTasks.length > 3 && (
                  <p className="px-1 text-[9px] font-semibold text-muted">+{dayTasks.length - 3} more</p>
                )}
                {dayTasks.length === 0 && !outside && (
                  <button
                    onClick={() => onAdd(dateKey)}
                    className="mt-4 hidden w-full rounded-lg border border-dashed border-border py-2 text-[9px] font-semibold text-muted transition hover:border-secondary hover:bg-secondary-soft hover:text-secondary group-hover/day:block"
                  >
                    Add a moment
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


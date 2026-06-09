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
      <div className="grid grid-cols-7 border-b border-[#eceaf1] bg-[#fbfafd]">
        {weekdays.map((day) => (
          <div key={day} className="px-3 py-2 text-[9px] font-bold uppercase tracking-[0.13em] text-[#aaa6b5]">
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
              className={`group/day relative min-h-[122px] border-b border-r border-[#efedf4] p-2 transition-colors ${
                outside ? "bg-[#fbfbfd]/75 text-[#b9b5c1]" : "bg-white"
              }`}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span
                  className={`grid size-6 place-items-center rounded-full text-[10px] font-bold ${
                    isToday ? "bg-[#6556db] text-white shadow-[0_4px_12px_rgba(101,86,219,0.3)]" : ""
                  }`}
                >
                  {day.getDate()}
                </span>
                <div className="flex items-center gap-1">
                  {dayTasks.length > 0 && (
                    <span className="rounded-full bg-[#f0eef5] px-1.5 py-0.5 text-[8px] font-bold text-[#858090]">
                      {dayTasks.length}
                    </span>
                  )}
                  <button
                    onClick={() => onAdd(dateKey)}
                    aria-label={`Add task on ${dateKey}`}
                    className="grid size-5 place-items-center rounded-md text-[#8f8999] opacity-0 transition hover:bg-[#eeeaff] hover:text-[#6556db] group-hover/day:opacity-100 focus:opacity-100"
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
                  <p className="px-1 text-[9px] font-semibold text-[#8e8998]">+{dayTasks.length - 3} more</p>
                )}
                {dayTasks.length === 0 && !outside && (
                  <button
                    onClick={() => onAdd(dateKey)}
                    className="mt-4 hidden w-full rounded-lg border border-dashed border-[#e8e4ef] py-2 text-[9px] font-semibold text-[#b1acb8] transition hover:border-[#cfc8f5] hover:bg-[#faf9ff] hover:text-[#7568ce] group-hover/day:block"
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


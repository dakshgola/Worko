"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Command,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  Plus,
  Search,
  Settings,
  Sparkles,
  SquareKanban,
  StickyNote,
  Zap,
  Bot,
  PenTool,
  PanelTop,
  WandSparkles,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import { DraftTaskPanel } from "./draft-task-panel";
import { formatMonth, toDateKey } from "./date-utils";
import { MonthView } from "./month-view";
import { TaskDialog } from "./task-dialog";
import type { CalendarTask, CalendarView, TaskFormData } from "./types";
import { WeekView } from "./week-view";
import { listEvents, createEvent, updateEvent, deleteEvent } from "@/lib/calendar/actions";
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar";

export function CalendarPage() {
  const [view, setView] = useState<CalendarView>("month");
  const [cursor, setCursor] = useState(new Date());
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDate, setDialogDate] = useState(toDateKey(new Date()));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  
  // Search state
  const [searchVal, setSearchVal] = useState("");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await listEvents();
      setTasks(res.map((ev: any) => ({
        id: ev.id,
        title: ev.title,
        description: ev.description || "",
        date: ev.date,
        time: ev.time || "09:00",
        category: ev.category as any,
        priority: ev.priority as any,
        notes: ev.notes || "",
        recurring: ev.recurring,
      })));
    } catch (e) {
      console.error("Failed to load events:", e);
    } finally {
      setView("month"); // wait, let's keep view state as is.
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const drafts = useMemo(() => tasks.filter((task) => !task.date), [tasks]);

  const filteredTasks = useMemo(() => {
    if (!searchVal.trim()) return tasks;
    return tasks.filter((t) => t.title.toLowerCase().includes(searchVal.toLowerCase()));
  }, [tasks, searchVal]);

  const openDialog = (date = "") => {
    setDialogDate(date);
    setDialogOpen(true);
  };

  const navigate = (direction: number) => {
    setCursor((current) => {
      const next = new Date(current);
      if (view === "month") next.setMonth(next.getMonth() + direction);
      else next.setDate(next.getDate() + direction * 7);
      return next;
    });
  };

  const dropTask = async (taskId: string, date: string) => {
    if (!taskId) return;
    try {
      await updateEvent(taskId, { date });
      setTasks((current) => current.map((task) => task.id === taskId ? { ...task, date } : task));
      setDraggingId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const saveTask = async (data: TaskFormData, asDraft: boolean) => {
    try {
      const newEv = await createEvent({
        title: data.title,
        description: data.description,
        date: asDraft ? undefined : data.date,
        time: data.time,
        category: data.category,
        priority: data.priority,
        notes: data.notes,
        recurring: data.recurring,
      });

      setTasks((current) => [
        ...current,
        {
          id: newEv.id,
          title: newEv.title,
          description: newEv.description || "",
          date: newEv.date,
          time: newEv.time || "09:00",
          category: newEv.category as any,
          priority: newEv.priority as any,
          notes: newEv.notes || "",
          recurring: newEv.recurring,
        },
      ]);
      setDialogOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveEvent = async (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent(id);
        setTasks((current) => current.filter((t) => t.id !== id));
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#2C2A29] flex">
      <WorkspaceSidebar active="Calendar" />

      <main className="flex-1 min-w-0 min-h-screen">
        <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 border-b border-[#EBE8E2] bg-[#FAF8F4]/80 px-4 backdrop-blur-xl lg:px-6">
          <div className="relative max-w-[330px] flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa3b1]" />
            <input
              placeholder="Search calendar title..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="h-10 w-full rounded-xl border border-[#EBE8E2] bg-white pl-9 pr-10 text-input-val outline-none focus:border-[#FF5A36]"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => { window.location.href = "/settings"; }}
              className="grid size-10 place-items-center rounded-xl border border-[#EBE8E2] bg-white text-[#5E5B5A] shadow-sm hover:text-[#FF5A36] transition"
            >
              <Settings size={15} />
            </button>
            <button onClick={() => openDialog(toDateKey(new Date()))} className="flex h-10 items-center gap-2 rounded-xl bg-[#FF5A36] hover:bg-[#ff7d5e] px-4 text-btn text-white shadow-sm transition hover:-translate-y-0.5"><Plus size={14} /><span className="hidden sm:inline">New task</span></button>
          </div>
        </header>

        <div className="mx-auto max-w-[1600px] p-4 lg:p-6">
          <section className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-1.5 text-overline text-[#aaa6b5] block">Calendar workspace</p>
              <h1 className="text-h2 text-[#2C2A29]">Plan with a little breathing room.</h1>
              <p className="mt-1.5 text-body-sm text-[#5E5B5A] font-semibold">Schedule key events and let AI manage reminders.</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[#EBE8E2] bg-white p-1 shadow-sm">
              <button onClick={() => setView("month")} className={`h-8 rounded-lg px-3 text-btn transition ${view === "month" ? "bg-[#FFE8E2] text-[#FF5A36] border border-[#EBE8E2] shadow-sm" : "text-[#5E5B5A] hover:bg-slate-150"}`}>Month</button>
              <button onClick={() => setView("week")} className={`h-8 rounded-lg px-3 text-btn transition ${view === "week" ? "bg-[#FFE8E2] text-[#FF5A36] border border-[#EBE8E2] shadow-sm" : "text-[#5E5B5A] hover:bg-slate-150"}`}>Week</button>
            </div>
          </section>

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-body-sm font-bold text-[#aaa6b5]">
              <Loader2 size={16} className="animate-spin text-[#FF5A36]" />
              Loading database events...
            </div>
          ) : (
            <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_250px]">
              <div className={`min-w-0 overflow-hidden rounded-[20px] border border-[#EBE8E2] bg-white shadow-sm ${draggingId ? "ring-2 ring-[#FF5A36]" : ""}`}>
                <div className="flex flex-wrap items-center gap-2 border-b border-[#EBE8E2] px-3 py-3 sm:px-4">
                  <button onClick={() => setCursor(new Date())} className="h-8 rounded-lg border border-[#EBE8E2] px-3 text-btn text-[#5E5B5A] hover:bg-[#FAF8F4]">Today</button>
                  <div className="flex gap-1">
                    <button onClick={() => navigate(-1)} aria-label="Previous period" className="grid size-8 place-items-center rounded-lg border border-[#EBE8E2] text-[#5E5B5A] hover:bg-[#FAF8F4]"><ChevronLeft size={13} /></button>
                    <button onClick={() => navigate(1)} aria-label="Next period" className="grid size-8 place-items-center rounded-lg border border-[#EBE8E2] text-[#5E5B5A] hover:bg-[#FAF8F4]"><ChevronRight size={13} /></button>
                  </div>
                  <h2 className="ml-1 text-h3 text-[#2C2A29]">{formatMonth(cursor)}</h2>
                  
                  {/* Delete indicator instruction helper */}
                  <div className="ml-auto text-caption text-[#aaa3b1] font-semibold">
                    Double-click task cell or click draft garbage to remove events.
                  </div>
                </div>
                <div className="overflow-x-auto">
                  {view === "month" ? (
                    <MonthView cursor={cursor} tasks={filteredTasks} onAdd={openDialog} onDropTask={dropTask} onDragStart={setDraggingId} />
                  ) : (
                    <WeekView cursor={cursor} tasks={filteredTasks} onAdd={openDialog} onDropTask={dropTask} onDragStart={setDraggingId} />
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <DraftTaskPanel tasks={drafts} onAdd={() => openDialog("")} onDragStart={setDraggingId} />
                
                {/* Draft deletes */}
                {drafts.length > 0 && (
                  <div className="bg-white border border-[#EBE8E2] p-3 rounded-2xl">
                    <p className="text-overline text-[#aaa6b5] mb-2 block">Trash Drafts</p>
                    <div className="space-y-1">
                      {drafts.map((d) => (
                        <div key={d.id} className="flex items-center justify-between text-body-sm p-1.5 hover:bg-[#fff0f3] rounded-lg font-semibold">
                          <span className="truncate">{d.title}</span>
                          <button onClick={() => handleRemoveEvent(d.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      <TaskDialog open={dialogOpen} initialDate={dialogDate} onClose={() => setDialogOpen(false)} onSave={saveTask} />
    </div>
  );
}

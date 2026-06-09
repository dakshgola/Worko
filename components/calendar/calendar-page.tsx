"use client";

import { useMemo, useState } from "react";
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
} from "lucide-react";
import { DraftTaskPanel } from "./draft-task-panel";
import { formatMonth, toDateKey } from "./date-utils";
import { MonthView } from "./month-view";
import { TaskDialog } from "./task-dialog";
import type { CalendarTask, CalendarView, TaskFormData } from "./types";
import { WeekView } from "./week-view";

const makeDate = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return toDateKey(date);
};

const mockTasks: CalendarTask[] = [
  { id: "1", title: "Product design sync", description: "Align on the new flow", date: makeDate(0), time: "10:30", category: "Meeting", priority: "High" },
  { id: "2", title: "Review launch copy", date: makeDate(0), time: "14:00", category: "Work", priority: "Medium" },
  { id: "3", title: "Plan weekly meals", date: makeDate(2), time: "18:00", category: "Personal", priority: "Low", recurring: true },
  { id: "4", title: "Send project update", date: makeDate(4), time: "09:30", category: "Reminder", priority: "High" },
  { id: "5", title: "Focus block: roadmap", date: makeDate(-2), time: "11:00", category: "Work", priority: "Medium" },
  { id: "d1", title: "Explore analytics ideas", date: null, category: "Work", priority: "Low" },
  { id: "d2", title: "Book dentist appointment", date: null, category: "Personal", priority: "Medium" },
  { id: "d3", title: "Outline Q3 workshop", date: null, category: "Meeting", priority: "High" },
];

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Calendar", icon: CalendarDays, active: true },
  { label: "Tasks", icon: SquareKanban },
  { label: "Notes", icon: StickyNote },
  { label: "AI Assistant", icon: Sparkles },
];

export function CalendarPage() {
  const [view, setView] = useState<CalendarView>("month");
  const [cursor, setCursor] = useState(new Date());
  const [tasks, setTasks] = useState<CalendarTask[]>(mockTasks);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDate, setDialogDate] = useState(toDateKey(new Date()));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const drafts = useMemo(() => tasks.filter((task) => !task.date), [tasks]);

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

  const dropTask = (taskId: string, date: string) => {
    if (!taskId) return;
    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, date } : task));
    setDraggingId(null);
  };

  const saveTask = (data: TaskFormData, asDraft: boolean) => {
    setTasks((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        title: data.title.trim(),
        description: data.description,
        date: asDraft ? null : data.date,
        time: data.time,
        category: data.category,
        priority: data.priority,
        notes: data.notes,
        recurring: data.recurring,
      },
    ]);
    setDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f8fb] text-[#292832]">
      <aside className={`fixed inset-y-0 left-0 z-40 w-[210px] border-r border-[#e8e7ef] bg-white transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[64px] items-center gap-3 border-b border-[#efedf4] px-4">
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#6c5ce7] to-[#8b5cf6] text-white shadow-[0_7px_18px_rgba(102,87,220,0.28)]"><Zap size={17} fill="currentColor" /></div>
          <div>
            <p className="text-[15px] font-bold tracking-[-0.04em]">Worko</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#aaa4b2]">Creative workspace</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto grid size-8 place-items-center rounded-lg text-[#9d96a6] hover:bg-[#f5f3f7] lg:hidden"><PanelLeftClose size={15} /></button>
        </div>
        <nav className="space-y-1 p-3">
          <p className="mb-2 px-2 text-[8px] font-bold uppercase tracking-[0.17em] text-[#aaa6b5]">Workspace</p>
          {navItems.map(({ label, icon: Icon, active }) => (
            <a key={label} href={label === "Dashboard" ? "/" : undefined} className={`relative flex h-10 items-center gap-3 rounded-xl px-2.5 text-[11px] font-bold transition ${active ? "bg-[#eeeaff] text-[#5849c6]" : "text-[#777181] hover:bg-[#f7f5f9] hover:text-[#3f3948]"}`}>
              {active && <span className="absolute -left-1 h-5 w-0.5 rounded-full bg-[#6c5ce7]" />}
              <span className={`grid size-7 place-items-center rounded-lg ${active ? "bg-white text-[#6556d6] shadow-sm" : "bg-[#f3f1f5] text-[#918a99]"}`}><Icon size={13} /></span>
              {label}
            </a>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full border-t border-[#efedf4] p-3">
          <button className="mb-2 flex h-9 w-full items-center gap-3 rounded-xl px-2 text-[10px] font-bold text-[#817a8a] hover:bg-[#f7f5f9]"><CircleHelp size={14} /> Help & support</button>
          <button className="flex w-full items-center gap-2 rounded-xl border border-[#ece8f1] bg-[#fcfbfd] p-2 text-left">
            <span className="grid size-8 place-items-center rounded-[10px] bg-gradient-to-br from-[#ffad72] to-[#ef6688] text-[9px] font-bold text-white">DG</span>
            <span className="min-w-0"><span className="block truncate text-[10px] font-bold">Daksh Gola</span><span className="block truncate text-[8px] text-[#a29ba9]">Personal workspace</span></span>
            <Settings size={12} className="ml-auto text-[#aaa3b1]" />
          </button>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-[210px]">
        <header className="sticky top-0 z-30 flex h-[64px] items-center gap-3 border-b border-[#e9e7ef] bg-[#f8f8fb]/88 px-4 backdrop-blur-xl lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="grid size-9 place-items-center rounded-xl border border-[#e5e2ed] bg-white text-[#777080] lg:hidden"><Menu size={16} /></button>
          <div className="relative hidden max-w-[330px] flex-1 sm:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa3b1]" />
            <input placeholder="Search your calendar..." className="h-9 w-full rounded-xl border border-[#e5e2ed] bg-white/85 pl-9 pr-10 text-[11px] outline-none focus:border-[#bdb4f1] focus:ring-4 focus:ring-[#ded9ff]/50" />
            <Command size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b0a9b7]" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="relative grid size-9 place-items-center rounded-xl border border-[#e5e2ed] bg-white text-[#7b7484] shadow-sm transition hover:-translate-y-0.5 hover:text-[#5b4dcc]"><Bell size={15} /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#ef6688] ring-2 ring-white" /></button>
            <button onClick={() => openDialog(toDateKey(new Date()))} className="flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-[#6556db] to-[#7b5fe7] px-3.5 text-[10px] font-bold text-white shadow-[0_6px_18px_rgba(103,87,220,0.25)] transition hover:-translate-y-0.5"><Plus size={14} /><span className="hidden sm:inline">New task</span></button>
          </div>
        </header>

        <div className="mx-auto max-w-[1600px] p-4 lg:p-6">
          <section className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#9f98a7]">Calendar workspace</p>
              <h1 className="text-2xl font-bold tracking-[-0.045em] text-[#302d38] sm:text-3xl">Plan with a little breathing room.</h1>
              <p className="mt-1.5 text-[11px] text-[#918a98]">Schedule the important things, and leave space for the rest.</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[#e5e1eb] bg-white p-1 shadow-sm">
              <button onClick={() => setView("month")} className={`h-8 rounded-lg px-3 text-[10px] font-bold transition ${view === "month" ? "bg-[#eeeaff] text-[#5b4dcc]" : "text-[#918999] hover:bg-[#f7f5f8]"}`}>Month</button>
              <button onClick={() => setView("week")} className={`h-8 rounded-lg px-3 text-[10px] font-bold transition ${view === "week" ? "bg-[#eeeaff] text-[#5b4dcc]" : "text-[#918999] hover:bg-[#f7f5f8]"}`}>Week</button>
            </div>
          </section>

          <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_250px]">
            <div className={`min-w-0 overflow-hidden rounded-[20px] border border-[#e7e4ee] bg-white shadow-[0_10px_32px_rgba(54,48,89,0.055)] ${draggingId ? "ring-2 ring-[#d9d2fb]" : ""}`}>
              <div className="flex flex-wrap items-center gap-2 border-b border-[#ece9f1] px-3 py-3 sm:px-4">
                <button onClick={() => setCursor(new Date())} className="h-8 rounded-lg border border-[#e6e2eb] px-3 text-[9px] font-bold text-[#756e7e] hover:bg-[#f8f6fa]">Today</button>
                <div className="flex gap-1">
                  <button onClick={() => navigate(-1)} aria-label="Previous period" className="grid size-8 place-items-center rounded-lg border border-[#e6e2eb] text-[#837c8c] hover:bg-[#f8f6fa]"><ChevronLeft size={13} /></button>
                  <button onClick={() => navigate(1)} aria-label="Next period" className="grid size-8 place-items-center rounded-lg border border-[#e6e2eb] text-[#837c8c] hover:bg-[#f8f6fa]"><ChevronRight size={13} /></button>
                </div>
                <h2 className="ml-1 text-sm font-bold tracking-[-0.025em] sm:text-base">{formatMonth(cursor)}</h2>
                <div className="ml-auto flex items-center gap-2 text-[9px] font-semibold text-[#a19aa8]"><span className="size-2 rounded-full bg-[#6556db]" /> Today</div>
              </div>
              <div className="overflow-x-auto">
                {view === "month" ? (
                  <MonthView cursor={cursor} tasks={tasks} onAdd={openDialog} onDropTask={dropTask} onDragStart={setDraggingId} />
                ) : (
                  <WeekView cursor={cursor} tasks={tasks} onAdd={openDialog} onDropTask={dropTask} onDragStart={setDraggingId} />
                )}
              </div>
            </div>
            <DraftTaskPanel tasks={drafts} onAdd={() => openDialog("")} onDragStart={setDraggingId} />
          </section>
        </div>
      </main>
      {sidebarOpen && <button aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-[#302a3d]/20 backdrop-blur-sm lg:hidden" />}
      <TaskDialog open={dialogOpen} initialDate={dialogDate} onClose={() => setDialogOpen(false)} onSave={saveTask} />
    </div>
  );
}


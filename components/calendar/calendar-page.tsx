"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
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
import { PageWrapper } from "@/components/PageWrapper";
import { formatMonth, toDateKey } from "./date-utils";
import { MonthView } from "./month-view";
import { TaskDialog } from "./task-dialog";
import type { CalendarTask, CalendarView, TaskFormData, TaskCategory, TaskPriority } from "./types";
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
      setTasks(res.map((ev) => ({
        id: ev.id,
        title: ev.title,
        description: ev.description || "",
        date: ev.date,
        time: ev.time || "09:00",
        category: ev.category as TaskCategory,
        priority: ev.priority as TaskPriority,
        notes: ev.notes || "",
        recurring: ev.recurring,
      })));
    } catch (e) {
      console.error("Failed to load events:", e);
    } finally {
      setView("month");
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
      toast.success("Event moved");
    } catch (e) {
      console.error(e);
      toast.error("Failed to move event");
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
          category: newEv.category as TaskCategory,
          priority: newEv.priority as TaskPriority,
          notes: newEv.notes || "",
          recurring: newEv.recurring,
        },
      ]);
      setDialogOpen(false);
      toast.success("Event created successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to create event");
    }
  };

  const handleRemoveEvent = async (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent(id);
        setTasks((current) => current.filter((t) => t.id !== id));
        toast.success("Event deleted");
      } catch (e) {
        console.error(e);
        toast.error("Failed to delete event");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <WorkspaceSidebar active="Calendar" />

      <PageWrapper className="flex-grow min-w-0 min-h-screen pt-[64px] lg:pt-0">
        <header className="sticky top-[64px] lg:top-0 z-30 flex h-[68px] items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-6">
          <div className="relative max-w-[330px] flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              placeholder="Search calendar title..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="pl-9 input-cozy"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => { window.location.href = "/settings"; }}
              className="btn-icon text-muted"
            >
              <Settings size={15} />
            </button>
            <button onClick={() => openDialog(toDateKey(new Date()))} className="btn-primary h-10 gap-2"><Plus size={14} /><span className="hidden sm:inline">New task</span></button>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="mx-auto max-w-[1600px] p-4 lg:p-6 w-full min-w-0"
        >
          <section className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-1.5 text-overline text-muted block">Calendar workspace</p>
              <h1 className="text-h2 text-foreground">Plan with a little breathing room.</h1>
              <p className="mt-1.5 text-body-sm text-muted font-semibold">Schedule key events and let AI manage reminders.</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-1 shadow-sm">
              <button onClick={() => setView("month")} className={`h-8 rounded-lg px-3 text-btn transition ${view === "month" ? "bg-primary-soft text-primary border border-border shadow-sm" : "text-muted hover:bg-hover-overlay"}`}>Month</button>
              <button onClick={() => setView("week")} className={`h-8 rounded-lg px-3 text-btn transition ${view === "week" ? "bg-primary-soft text-primary border border-border shadow-sm" : "text-muted hover:bg-hover-overlay"}`}>Week</button>
            </div>
          </section>

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-body-sm font-bold text-muted">
              <Loader2 size={16} className="animate-spin text-primary" />
              Loading database events...
            </div>
          ) : (
            <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_250px] gap-4 w-full min-w-0 overflow-hidden">
              <div className={`min-w-0 overflow-hidden rounded-[20px] border border-border bg-surface shadow-sm ${draggingId ? "ring-2 ring-primary" : ""}`}>
                <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-3 sm:px-4">
                  <button onClick={() => setCursor(new Date())} className="btn-outline h-8 px-3 text-btn">Today</button>
                  <div className="flex gap-1">
                    <button onClick={() => navigate(-1)} aria-label="Previous period" className="btn-icon size-8"><ChevronLeft size={13} /></button>
                    <button onClick={() => navigate(1)} aria-label="Next period" className="btn-icon size-8"><ChevronRight size={13} /></button>
                  </div>
                  <h2 className="ml-1 text-h3 text-foreground">{formatMonth(cursor)}</h2>
                  
                  <div className="ml-auto text-caption text-muted font-semibold">
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
                  <div className="bg-surface border border-border p-3 rounded-2xl">
                    <p className="text-overline text-muted mb-2 block">Trash Drafts</p>
                    <div className="space-y-1">
                      {drafts.map((d) => (
                        <div key={d.id} className="flex items-center justify-between text-body-sm p-1.5 hover:bg-danger-soft rounded-lg font-semibold">
                          <span className="truncate">{d.title}</span>
                          <button onClick={() => handleRemoveEvent(d.id)} className="text-danger hover:text-danger-hover">
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
        </motion.div>
      </PageWrapper>

      <TaskDialog open={dialogOpen} initialDate={dialogDate} onClose={() => setDialogOpen(false)} onSave={saveTask} />
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sliders,
  Bell,
  X,
  Zap,
  Plus,
  StickyNote,
  PenTool,
  CalendarDays,
  Check,
} from "lucide-react";
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar";
import { CommandPalette } from "@/components/CommandPalette";
import { LandingPage } from "@/components/landing/LandingPage";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardQuickActions } from "@/components/dashboard/DashboardQuickActions";
import { DashboardRecentActivity } from "@/components/dashboard/DashboardRecentActivity";
import { DashboardKanbanWidget } from "@/components/dashboard/DashboardKanbanWidget";
import { DashboardData, DashboardTask } from "@/lib/dashboard/types";
import { KanbanBoardDb, Notification } from "@/db/schema";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import {
  listNotifications,
  markNotificationRead,
} from "@/lib/notifications/actions";
import { getDashboardData } from "@/lib/dashboard/actions";
import { createEvent } from "@/lib/calendar/actions";
import { createNote } from "@/lib/notes/actions";
import { createWhiteboard } from "@/lib/whiteboard/actions";
import { createSpace } from "@/lib/spaces/actions";

const DEFAULT_WIDGETS = [
  { id: "welcome", name: "Welcome Message Banner", visible: true },
  { id: "quick-actions", name: "Quick Actions Panel", visible: true },
  { id: "stats-overview", name: "Workspace Statistics Grid", visible: true },
  { id: "productivity-metrics", name: "Productivity Score & Weekly Analytics", visible: true },
  { id: "tasks-today", name: "Today's Tasks Agenda", visible: true },
  { id: "calendar-upcoming", name: "Upcoming Schedule & Reminders", visible: true },
  { id: "favorites-panel", name: "Favorites & Recently Visited Links", visible: true },
  { id: "activity-insights", name: "Live Timeline Activity & AI Insights", visible: true },
];

export default function Home() {
  const { isSignedIn, isLoaded: userLoaded } = useUser();

  if (!userLoaded) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="text-primary"
        >
          <Zap size={32} fill="currentColor" />
        </motion.div>
        <span className="text-overline text-muted animate-pulse">Worko</span>
      </div>
    );
  }

  if (!isSignedIn) {
    return <LandingPage />;
  }

  return <DashboardView />;
}

function DashboardView() {
  const { user } = useUser();

  // Postgres Database Data
  const [dbData, setDbData] = useState<DashboardData | null>(null);
  const [loadingDb, setLoadingDb] = useState(true);

  // Kanban boards tasks list
  const [kanbanBoards, setKanbanBoards] = useState<(KanbanBoardDb & { tasks: DashboardTask[] })[]>([]);
  const [streakCount, setStreakCount] = useState(3);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Customizer and items creation modals
  const [widgetsList, setWidgetsList] = useState(DEFAULT_WIDGETS);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showCreateBoardModal, setShowCreateBoardModal] = useState(false);

  const [creatingItem, setCreatingItem] = useState(false);

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: new Date().toISOString().split("T")[0],
  });

  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    category: "Meeting",
  });

  const [boardForm, setBoardForm] = useState({
    name: "",
    color: "#FF5A36",
  });

  const fetchDbData = async () => {
    try {
      setLoadingDb(true);
      const res = await getDashboardData();
      setDbData(res);

      if (res && res.kanbanBoards) {
        const mappedBoards = res.kanbanBoards.map((board: any) => {
          const boardTasks = (res.kanbanTasks || [])
            .filter((t: any) => t.boardId === board.id)
            .map((task: any) => {
              let parsedLabels: any[] = [];
              try {
                if (task.labels) {
                  parsedLabels = typeof task.labels === "string" ? JSON.parse(task.labels) : task.labels;
                }
              } catch {
                parsedLabels = [];
              }
              return {
                ...task,
                labels: parsedLabels,
              };
            });
          return {
            ...board,
            tasks: boardTasks,
          };
        });
        setKanbanBoards(mappedBoards);
      }
    } catch (e) {
      console.error("Failed to load postgres dashboard data:", e);
    } finally {
      setLoadingDb(false);
    }
  };

  const loadLocalAssets = () => {
    try {
      const savedStreak = localStorage.getItem("worko-streak") || "3";
      setStreakCount(parseInt(savedStreak));

      const savedLayout = localStorage.getItem("worko-dashboard-layout");
      if (savedLayout) setWidgetsList(JSON.parse(savedLayout));
    } catch (e) {
      console.error("Failed to read local kanban assets:", e);
    }
  };

  useEffect(() => {
    fetchDbData();
    loadLocalAssets();
  }, []);

  const loadDbNotifications = async () => {
    try {
      const list = await listNotifications();
      setNotifications(list);
    } catch (e) {
      console.error("Failed to load notifications:", e);
    }
  };

  useEffect(() => {
    loadDbNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const triggerNotification = (title: string, desc: string) => {
    const newNotif: Notification = {
      id: Math.random().toString(),
      userId: user?.id || "",
      type: "update",
      message: `${title}: ${desc}`,
      read: false,
      createdAt: new Date(),
      relatedEntityId: null,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const getProductivityMetrics = () => {
    let totalTasks = 0;
    let completedTasks = 0;

    kanbanBoards.forEach((board: any) => {
      (board.tasks || []).forEach((t: any) => {
        totalTasks++;
        if (t.columnId?.toLowerCase().includes("done") || t.completed) {
          completedTasks++;
        }
      });
    });

    const notesCount = dbData?.notes?.length || 0;
    const whiteboardsCount = dbData?.whiteboards?.length || 0;
    const spacesCount = dbData?.spaces?.length || 0;
    const meetingsCount = dbData?.calendarEvents?.length || 0;

    let score = 50;
    if (totalTasks > 0) {
      score += Math.floor((completedTasks / totalTasks) * 30);
    }
    score += notesCount * 2 + whiteboardsCount * 3 + meetingsCount * 4;
    if (score > 100) score = 100;
    if (totalTasks === 0 && notesCount === 0 && whiteboardsCount === 0) score = 0;

    return {
      score,
      totalTasks,
      completedTasks,
      notesCount,
      whiteboardsCount,
      spacesCount,
      meetingsCount,
    };
  };

  const metrics = getProductivityMetrics();

  const getWeeklyStats = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const values = [3, 5, 2, 8, 4, 9, 3];

    if (dbData?.notes) {
      dbData.notes.forEach((n: any) => {
        const dayIdx = (new Date(n.createdAt).getDay() + 6) % 7;
        values[dayIdx] += 1;
      });
    }

    return days.map((day, i) => ({
      day,
      value: Math.min(12, Math.max(1, Math.round(values[i]))),
    }));
  };

  const weeklyStats = getWeeklyStats();
  const maxWeeklyVal = Math.max(...weeklyStats.map((d) => d.value)) || 1;

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    // Streak tracking is client-only: increment day streak
    const ns = streakCount + 1;
    setStreakCount(ns);
    localStorage.setItem("worko-streak", String(ns));
    setShowCreateTaskModal(false);
    setTaskForm({ title: "", description: "", priority: "Medium", dueDate: new Date().toISOString().split("T")[0] });
    triggerNotification("Task Scheduled", "Check Kanban columns to review Postgres sync cards.");
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim()) return;

    try {
      setCreatingItem(true);
      await createEvent({
        title: eventForm.title,
        description: eventForm.description,
        date: eventForm.date,
        time: eventForm.time,
        category: eventForm.category,
        priority: "Medium",
      });

      await fetchDbData();
      setShowCreateEventModal(false);
      setEventForm({ title: "", description: "", date: new Date().toISOString().split("T")[0], time: "10:00", category: "Meeting" });
      triggerNotification("Event Scheduled", "Scheduled event in database calendar.");
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingItem(false);
    }
  };

  const handleBoardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardForm.name.trim()) return;
    setShowCreateBoardModal(false);
    setBoardForm({ name: "", color: "#FF5A36" });
    triggerNotification("Kanban Scheduled", `Configure column lists on Kanban dashboard page.`);
  };

  const handleQuickCreateNote = async () => {
    try {
      setCreatingItem(true);
      await createNote({ title: "Quick Note" });
      window.location.href = "/notes";
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingItem(false);
    }
  };

  const handleQuickCreatePage = async () => {
    try {
      setCreatingItem(true);
      await createSpace({ name: "Creative Space" });
      window.location.href = "/spaces";
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingItem(false);
    }
  };

  const handleQuickCreateWhiteboard = async () => {
    try {
      setCreatingItem(true);
      await createWhiteboard("Brainstorm Canvas");
      window.location.href = "/whiteboard";
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingItem(false);
    }
  };

  const handleMoveWidget = (index: number, direction: "up" | "down") => {
    const copy = [...widgetsList];
    if (direction === "up" && index > 0) {
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
    } else if (direction === "down" && index < copy.length - 1) {
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
    }

    setWidgetsList(copy);
    localStorage.setItem("worko-dashboard-layout", JSON.stringify(copy));
  };

  const getTimelineActivities = () => {
    const items: any[] = [];
    if (dbData?.notes) {
      dbData.notes.slice(0, 3).forEach((n: any) => {
        items.push({
          title: `Created note "${n.title}"`,
          desc: "Saved in Neon Postgres db",
          icon: StickyNote,
          color: "text-orange-500 bg-orange-50",
          time: new Date(n.createdAt),
        });
      });
    }

    if (dbData?.calendarEvents) {
      dbData.calendarEvents.slice(0, 3).forEach((e: any) => {
        items.push({
          title: `Scheduled event "${e.title}"`,
          desc: `${e.date} at ${e.time}`,
          icon: CalendarDays,
          color: "text-sky-500 bg-sky-50",
          time: new Date(e.createdAt),
        });
      });
    }

    items.sort((a, b) => b.time.getTime() - a.time.getTime());
    return items.slice(0, 5);
  };

  const activities = getTimelineActivities();

  const getActiveTasksList = () => {
    const list: any[] = [];
    kanbanBoards.forEach((board) => {
      (board.tasks || []).forEach((t: any) => {
        if (!t.completed && !t.archived) {
          list.push({ ...t, boardName: board.name });
        }
      });
    });
    return list.slice(0, 5);
  };

  const activeTasksList = getActiveTasksList();

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Layout */}
      <WorkspaceSidebar active="Dashboard" />

      {/* Main panel */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="flex h-[68px] items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-xl shrink-0">
          <CommandPalette />
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setShowCustomizer(true)}
              className="btn-outline h-10 px-3.5 flex items-center gap-1.5"
            >
              <Sliders size={13.5} />
              <span className="hidden md:inline">Layout</span>
            </button>

            {/* Notifications panel dropdown triggers */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) loadDbNotifications();
                }}
                className="relative btn-icon text-muted"
              >
                <Bell size={17} />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-primary border border-white" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-11 w-72 bg-surface border border-border rounded-xl shadow-lg p-3 z-50 space-y-2"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-border text-body-sm font-bold">
                      <span>Notifications ({notifications.filter((n) => !n.read).length})</span>
                      <button onClick={() => setShowNotifications(false)}><X size={12} /></button>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-caption font-semibold text-muted">0 new notices today.</div>
                      ) : (
                        notifications.map((notif) => {
                          const separatorIndex = notif.message.indexOf(": ");
                          const title = separatorIndex !== -1 ? notif.message.substring(0, separatorIndex) : "Alert";
                          const desc = separatorIndex !== -1 ? notif.message.substring(separatorIndex + 2) : notif.message;
                          return (
                            <div
                              key={notif.id}
                              onClick={() => handleMarkRead(notif.id)}
                              className={`p-2.5 rounded-lg border text-caption cursor-pointer transition ${
                                notif.read ? "bg-surface border-border opacity-70" : "bg-primary-soft/40 border-primary-soft"
                              }`}
                            >
                              <div className="flex justify-between font-bold">
                                <span className="text-foreground">{title}</span>
                                {!notif.read && <span className="size-1.5 rounded-full bg-primary mt-1" />}
                              </div>
                              <p className="text-muted mt-1 font-semibold leading-relaxed">{desc}</p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleQuickCreateNote}
              className="btn-primary h-10 gap-1.5"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Quick Note</span>
            </button>
          </div>
        </header>

        {/* Dashboard Panels Scroll */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.03
              }
            }
          }}
          className="flex-grow overflow-y-auto p-6 lg:p-10 space-y-8"
        >
          {widgetsList.map((widget, widgetIndex) => {
            if (!widget.visible) return null;

            switch (widget.id) {
              case "welcome":
                return (
                  <motion.section
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    key={widget.id}
                  >
                    <DashboardGreeting
                      user={user}
                      streakCount={streakCount}
                      metrics={metrics}
                      widgetIndex={widgetIndex}
                      widgetsLength={widgetsList.length}
                      handleMoveWidget={handleMoveWidget}
                    />
                  </motion.section>
                );

              case "quick-actions":
                return (
                  <section key={widget.id}>
                    <DashboardQuickActions
                      setShowCreateTaskModal={setShowCreateTaskModal}
                      setShowCreateEventModal={setShowCreateEventModal}
                      handleQuickCreateNote={handleQuickCreateNote}
                      handleQuickCreatePage={handleQuickCreatePage}
                      handleQuickCreateWhiteboard={handleQuickCreateWhiteboard}
                      setShowCreateBoardModal={setShowCreateBoardModal}
                    />
                  </section>
                );

              case "stats-overview":
                return (
                  <section key={widget.id}>
                    <DashboardStats
                      loadingDb={loadingDb}
                      metrics={metrics}
                      generatedAppsCount={dbData?.generatedApps?.length || 0}
                    />
                  </section>
                );

              case "productivity-metrics":
                return (
                  <section key={widget.id} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Score widget */}
                    <div className="bg-surface border border-border rounded-[24px] p-5 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="text-label-val text-primary uppercase tracking-wider block mb-1">Productivity score</h4>
                        <p className="text-caption text-muted">Weighted metrics track</p>
                      </div>

                      <div className="flex justify-center items-center py-6">
                        <div className="relative size-32">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="50" stroke="#f1f0f5" strokeWidth="10" fill="transparent" />
                            <circle
                              cx="64"
                              cy="64"
                              r="50"
                              stroke="url(#gradientScore)"
                              strokeWidth="10"
                              fill="transparent"
                              strokeDasharray={`${2 * Math.PI * 50}`}
                              strokeDashoffset={`${2 * Math.PI * 50 * (1 - metrics.score / 100)}`}
                              strokeLinecap="round"
                            />
                            <defs>
                              <linearGradient id="gradientScore" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FF5A36" />
                                <stop offset="100%" stopColor="#ff7d5e" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-h2 text-foreground">{metrics.score}</span>
                            <span className="text-overline text-muted block">Score</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between text-center border-t border-border pt-3 text-caption font-bold">
                        <div>
                          <p className="text-success">{metrics.completedTasks}</p>
                          <p className="text-[9px] text-muted uppercase">Completed</p>
                        </div>
                        <div className="border-l border-border" />
                        <div>
                          <p className="text-primary">{metrics.meetingsCount}</p>
                          <p className="text-[9px] text-muted uppercase">Events</p>
                        </div>
                      </div>
                    </div>

                    {/* SVG Weekly Analytics */}
                    <div className="lg:col-span-2 bg-surface border border-border rounded-[24px] p-5 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="text-label-val text-primary uppercase tracking-wider block mb-1">Weekly Metrics</h4>
                        <p className="text-caption text-muted">Daily activities checklist</p>
                      </div>

                      <div className="flex items-end justify-between h-40 pt-6 px-4">
                        {weeklyStats.map((item, index) => {
                          const heightPct = (item.value / maxWeeklyVal) * 100;
                          return (
                            <div key={index} className="flex flex-col items-center gap-2 group flex-1">
                              <div className="relative w-7 bg-background rounded-t-lg h-32 flex items-end overflow-hidden border border-border/50">
                                <div
                                  className="w-full bg-gradient-to-t from-primary to-[#ff7d5e] rounded-t-md transition-all duration-700"
                                  style={{ height: `${heightPct}%` }}
                                />
                                <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 bg-foreground text-surface text-[9px] px-1.5 py-0.5 rounded font-mono shadow mb-1">
                                  {item.value}
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-muted uppercase">{item.day}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                );

              case "tasks-today":
                return (
                  <section key={widget.id}>
                    <DashboardKanbanWidget
                      activeTasksList={activeTasksList}
                      setShowCreateTaskModal={setShowCreateTaskModal}
                    />
                  </section>
                );

              case "activity-insights":
                return (
                  <section key={widget.id}>
                    <DashboardRecentActivity activities={activities} />
                  </section>
                );

              default:
                return null;
            }
          })}
        </motion.div>
      </div>

      {/* Widget Layout Settings Modal */}
      <Dialog open={showCustomizer} onOpenChange={(val) => { if (!val) setShowCustomizer(false); }}>
        <DialogContent className="bg-surface border border-border w-full max-w-md p-6 shadow-2xl dark:border-border dark:bg-surface sm:rounded-3xl gap-4">
          <div className="flex items-center justify-between border-b pb-3 border-border">
            <DialogTitle className="text-body-sm font-extrabold text-foreground">Configure Workspace Dashboard widgets</DialogTitle>
          </div>
          <DialogDescription className="sr-only">Customize visibility of dashboard segments</DialogDescription>
          <div className="space-y-3">
            {widgetsList.map((wid, idx) => (
              <div key={wid.id} className="flex items-center justify-between p-1.5 border border-border bg-background rounded-xl">
                <span className="text-caption font-bold">{wid.name}</span>
                <input
                  type="checkbox"
                  checked={wid.visible}
                  onChange={() => {
                    const copy = [...widgetsList];
                    copy[idx].visible = !copy[idx].visible;
                    setWidgetsList(copy);
                    localStorage.setItem("worko-dashboard-layout", JSON.stringify(copy));
                  }}
                  className="rounded text-primary focus:ring-primary size-4"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-3 border-t border-border">
            <button onClick={() => setShowCustomizer(false)} className="btn-primary h-9 px-4 text-btn">Save Configurations</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Task Modal */}
      <Dialog open={showCreateTaskModal} onOpenChange={(val) => { if (!val) setShowCreateTaskModal(false); }}>
        <DialogContent className="bg-surface border border-border w-full max-w-md p-6 shadow-2xl dark:border-border dark:bg-surface sm:rounded-3xl gap-4">
          <form onSubmit={handleTaskSubmit} className="space-y-4 text-[#2C2A29] dark:text-[#F5F4F0] w-full">
            <div className="flex items-center justify-between border-b pb-3 border-border">
              <DialogTitle className="text-body-sm font-extrabold text-foreground">Schedule Task Checklist</DialogTitle>
            </div>
            <DialogDescription className="sr-only">Add a task to your workspace dashboard</DialogDescription>
            <div className="space-y-3">
              <div>
                <label className="block text-label-val uppercase text-muted mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="Deploy index schemas..."
                  className="input-cozy"
                />
              </div>
              <div>
                <label className="block text-label-val uppercase text-muted mb-1">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Provide details..."
                  className="w-full h-16 p-2 border border-border text-input-val rounded-xl outline-none resize-none focus:border-primary bg-background text-foreground"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border pt-3">
              <button type="button" onClick={() => setShowCreateTaskModal(false)} className="btn-outline h-9 px-4 text-btn text-muted">Cancel</button>
              <button type="submit" className="btn-primary h-9 px-4 text-btn">Save Task</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Event Modal */}
      <Dialog open={showCreateEventModal} onOpenChange={(val) => { if (!val) setShowCreateEventModal(false); }}>
        <DialogContent className="bg-surface border border-border w-full max-w-md p-6 shadow-2xl dark:border-border dark:bg-surface sm:rounded-3xl gap-4">
          <form onSubmit={handleEventSubmit} className="space-y-4 text-[#2C2A29] dark:text-[#F5F4F0] w-full">
            <div className="flex items-center justify-between border-b pb-3 border-border">
              <DialogTitle className="text-body-sm font-extrabold text-foreground">Schedule Agenda Event</DialogTitle>
            </div>
            <DialogDescription className="sr-only">Add an event reminder to dashboard</DialogDescription>
            <div className="space-y-3">
              <div>
                <label className="block text-label-val uppercase text-muted mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="Weekly Sync Meet..."
                  className="input-cozy"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border pt-3">
              <button type="button" onClick={() => setShowCreateEventModal(false)} className="btn-outline h-9 px-4 text-btn text-muted">Cancel</button>
              <button type="submit" disabled={creatingItem} className="btn-primary h-9 px-4 text-btn">
                {creatingItem ? "Saving..." : "Save Event"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Board Modal */}
      <Dialog open={showCreateBoardModal} onOpenChange={(val) => { if (!val) setShowCreateBoardModal(false); }}>
        <DialogContent className="bg-surface border border-border w-full max-w-md p-6 shadow-2xl dark:border-border dark:bg-surface sm:rounded-3xl gap-4">
          <form onSubmit={handleBoardSubmit} className="space-y-4 text-[#2C2A29] dark:text-[#F5F4F0] w-full">
            <div className="flex items-center justify-between border-b pb-3 border-border">
              <DialogTitle className="text-body-sm font-extrabold text-foreground">Add Kanban Column Board</DialogTitle>
            </div>
            <DialogDescription className="sr-only">Create a new kanban board workspace</DialogDescription>
            <div className="space-y-3">
              <div>
                <label className="block text-label-val uppercase text-muted mb-1">Board Name</label>
                <input
                  type="text"
                  required
                  value={boardForm.name}
                  onChange={(e) => setBoardForm({ ...boardForm, name: e.target.value })}
                  placeholder="Design Sprint #2..."
                  className="input-cozy"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border pt-3">
              <button type="button" onClick={() => setShowCreateBoardModal(false)} className="btn-outline h-9 px-4 text-btn text-muted">Cancel</button>
              <button type="submit" className="btn-primary h-9 px-4 text-btn">Add Board</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

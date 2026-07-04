"use client";
import React from "react";
import { Zap, SquareKanban, CalendarDays, StickyNote, PanelTop, PenTool, Bot, WandSparkles, LayoutDashboard } from "lucide-react";

interface DashboardQuickActionsProps {
  setShowCreateTaskModal: (b: boolean) => void;
  setShowCreateEventModal: (b: boolean) => void;
  handleQuickCreateNote: () => void;
  handleQuickCreatePage: () => void;
  handleQuickCreateWhiteboard: () => void;
  setShowCreateBoardModal: (b: boolean) => void;
}

export function DashboardQuickActions({
  setShowCreateTaskModal,
  setShowCreateEventModal,
  handleQuickCreateNote,
  handleQuickCreatePage,
  handleQuickCreateWhiteboard,
  setShowCreateBoardModal,
}: DashboardQuickActionsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-overline text-primary block font-extrabold">
        <Zap size={13} className="text-primary inline mr-1" /> Fast Actions
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { title: "Create Task", action: () => setShowCreateTaskModal(true), icon: SquareKanban, bg: "bg-emerald-50 text-emerald-600 border-emerald-100" },
          { title: "Schedule Event", action: () => setShowCreateEventModal(true), icon: CalendarDays, bg: "bg-sky-50 text-sky-600 border-sky-100" },
          { title: "New Note", action: handleQuickCreateNote, icon: StickyNote, bg: "bg-orange-50 text-orange-600 border-orange-100" },
          { title: "New Page", action: handleQuickCreatePage, icon: PanelTop, bg: "bg-violet-50 text-violet-600 border-violet-100" },
          { title: "Whiteboard", action: handleQuickCreateWhiteboard, icon: PenTool, bg: "bg-pink-50 text-pink-600 border-pink-100" },
          { title: "AI Assistant", action: () => { window.location.href = "/ai-assistant"; }, icon: Bot, bg: "bg-amber-50 text-amber-600 border-amber-100" },
          { title: "Build App", action: () => { window.location.href = "/ai-template-builder"; }, icon: WandSparkles, bg: "bg-rose-50 text-rose-600 border-rose-100" },
          { title: "Add Board", action: () => setShowCreateBoardModal(true), icon: LayoutDashboard, bg: "bg-indigo-50 text-indigo-600 border-indigo-100" },
        ].map((act, i) => (
          <button
            key={i}
            onClick={act.action}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition hover:-translate-y-0.5 ${act.bg}`}
          >
            <span className="mb-2"><act.icon size={18} strokeWidth={2.25} /></span>
            <span className="text-label-val font-bold">{act.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

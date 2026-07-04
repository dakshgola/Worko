"use client";
import React from "react";
import { CheckSquare, Sparkles, Bot } from "lucide-react";

import { DashboardTask } from "@/lib/dashboard/types";

interface DashboardKanbanWidgetProps {
  activeTasksList: DashboardTask[];
  setShowCreateTaskModal: (b: boolean) => void;
}

export function DashboardKanbanWidget({
  activeTasksList,
  setShowCreateTaskModal,
}: DashboardKanbanWidgetProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-surface border border-border rounded-[24px] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h4 className="text-label-val text-primary uppercase tracking-wider block">Today&apos;s Focus Tasks</h4>
            <p className="text-caption text-muted">Important priorities agenda</p>
          </div>
          <button onClick={() => { window.location.href = "/kanban"; }} className="text-caption font-bold text-primary hover:underline">
            Open Kanban &rarr;
          </button>
        </div>

        {activeTasksList.length === 0 ? (
          <div className="text-center py-8 text-caption text-muted space-y-2 font-semibold">
            <CheckSquare size={32} className="mx-auto text-slate-350" />
            <p>No active tasks in columns. Add one below!</p>
            <button onClick={() => setShowCreateTaskModal(true)} className="text-primary font-semibold hover:underline">
              Add a task
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {activeTasksList.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 bg-background/50 border border-border rounded-xl hover:border-primary transition"
              >
                <CheckSquare size={16} className="text-emerald-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-body-sm font-bold truncate text-foreground">{task.title}</p>
                  <p className="text-caption text-muted truncate">{task.description || "No description"}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 bg-background text-muted text-caption rounded font-semibold border border-border">{task.dueDate}</span>
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-caption rounded font-bold uppercase">{task.priority}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI assistant box */}
      <div className="bg-gradient-to-br from-primary via-[#ff7d5e] to-pink-500 text-white rounded-[24px] p-5 shadow-lg flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-badge-val uppercase text-white/90">
              AI Assistant
            </span>
            <Sparkles size={16} className="text-[#ffe6a7] animate-pulse" />
          </div>
          <h3 className="text-h3 font-black tracking-tight leading-snug">
            Need to quickly write a documentation draft or schedule meetings syncs?
          </h3>
          <p className="text-caption text-white/80 font-medium leading-relaxed">
            Gemini parses natural sentences to coordinate calendars and note templates immediately.
          </p>
        </div>
        <button
          onClick={() => { window.location.href = "/ai-assistant"; }}
          className="w-full mt-4 h-9 bg-white hover:bg-slate-50 text-[#C23B1E] font-bold text-btn rounded-xl shadow-md flex items-center justify-center gap-1.5 transition"
        >
          <Bot size={13} /> Chat Orchestrator
        </button>
      </div>
    </div>
  );
}

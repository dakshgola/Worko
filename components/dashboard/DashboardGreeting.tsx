"use client";
import React from "react";
import { Flame } from "lucide-react";

import { ProductivityMetrics } from "@/lib/dashboard/types";

interface DashboardGreetingProps {
  user: { firstName?: string | null; } | null | undefined;
  streakCount: number;
  metrics: ProductivityMetrics;
  widgetIndex: number;
  widgetsLength: number;
  handleMoveWidget: (idx: number, dir: "up" | "down") => void;
}

export function DashboardGreeting({
  user,
  streakCount,
  metrics,
  widgetIndex,
  widgetsLength,
  handleMoveWidget,
}: DashboardGreetingProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-6 bg-surface border border-border rounded-[24px] p-6 shadow-sm">
      <div className="space-y-1">
        <p className="text-overline text-primary block font-extrabold">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
        </p>
        <h1 className="text-h2 text-foreground">
          {(() => {
            const hour = new Date().getHours();
            if (hour < 12) return "Good morning";
            if (hour < 17) return "Good afternoon";
            return "Good evening";
          })()}, {user?.firstName || "Daksh"} 👋
        </h1>
        <p className="text-body-sm text-muted font-semibold">
          Streak: <span className="font-extrabold text-amber-500 inline-flex items-center"><Flame size={12} fill="currentColor" className="mr-0.5" />{streakCount} days</span>. You have <span className="font-bold text-primary">{metrics.totalTasks - metrics.completedTasks} pending tasks</span> and <span className="font-bold text-primary">{metrics.meetingsCount} events</span> scheduled.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-overline text-muted">Layout</span>
        <div className="flex bg-background p-0.5 rounded-lg border border-border">
          <button
            onClick={() => handleMoveWidget(widgetIndex, "up")}
            disabled={widgetIndex === 0}
            className="p-1 text-muted hover:text-primary disabled:opacity-30 font-bold"
          >
            &uarr;
          </button>
          <button
            onClick={() => handleMoveWidget(widgetIndex, "down")}
            disabled={widgetIndex === widgetsLength - 1}
            className="p-1 text-muted hover:text-primary disabled:opacity-30 font-bold"
          >
            &darr;
          </button>
        </div>
      </div>
    </div>
  );
}

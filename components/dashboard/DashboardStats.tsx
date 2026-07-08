"use client";
import React from "react";
import { StickyNote, PenTool, PanelTop, WandSparkles } from "lucide-react";

import { ProductivityMetrics } from "@/lib/dashboard/types";

interface DashboardStatsProps {
  loadingDb: boolean;
  metrics: ProductivityMetrics;
  generatedAppsCount: number;
}

export function DashboardStats({ loadingDb, metrics, generatedAppsCount }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { title: "Notes", value: loadingDb ? "..." : metrics.notesCount, icon: StickyNote, color: "bg-orange-50 text-orange-600" },
        { title: "Whiteboards", value: loadingDb ? "..." : metrics.whiteboardsCount, icon: PenTool, color: "bg-pink-50 text-pink-600" },
        { title: "Document Spaces", value: loadingDb ? "..." : metrics.spacesCount, icon: PanelTop, color: "bg-violet-50 text-violet-600" },
        { title: "Template Apps", value: loadingDb ? "..." : generatedAppsCount, icon: WandSparkles, color: "bg-rose-50 text-rose-600" },
      ].map((st, i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 md:gap-4 bg-surface border border-border rounded-2xl p-3 md:p-4 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-150 ease-out hover:-translate-y-0.5"
        >
          <div className={`grid size-11 place-items-center rounded-xl shrink-0 ${st.color}`}>
            <st.icon size={18} strokeWidth={2.25} />
          </div>
          <div>
            <p className="text-h3 font-black text-foreground">{st.value}</p>
            <p className="text-label-val text-muted">{st.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

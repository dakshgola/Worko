"use client";
import React from "react";
import { Clock } from "lucide-react";

import { TimelineActivity } from "@/lib/dashboard/types";

interface DashboardRecentActivityProps {
  activities: TimelineActivity[];
}

export function DashboardRecentActivity({ activities }: DashboardRecentActivityProps) {
  return (
    <div className="bg-surface border border-border rounded-[24px] p-5 shadow-sm space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <div>
          <h4 className="text-body-sm font-extrabold text-foreground">Recent Activity Timeline</h4>
          <p className="text-caption text-muted font-semibold">Neon Postgres database audit logs</p>
        </div>
      </div>

      <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
        {activities.length === 0 ? (
          <div className="py-8 text-center text-caption font-semibold text-muted">0 activity entries logged today.</div>
        ) : (
          activities.map((act, i) => (
            <div key={i} className="flex gap-3 text-caption font-semibold text-muted">
              <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${act.color}`}>
                <act.icon size={13} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body-sm font-bold text-foreground truncate">{act.title}</p>
                <p className="truncate text-caption text-muted mt-0.5">{act.desc}</p>
              </div>
              <span className="text-[10px] text-slate-400 self-start mt-0.5 flex items-center gap-0.5">
                <Clock size={10} />
                {act.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

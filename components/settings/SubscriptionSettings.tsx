"use client";
import React from "react";
import { Zap } from "lucide-react";

export function SubscriptionSettings() {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-primary-soft border border-primary-soft rounded-2xl flex items-center justify-between">
        <div>
          <h4 className="text-body-sm font-extrabold text-primary flex items-center gap-1.5">
            <Zap size={14} fill="currentColor" /> Worko Free Tier
          </h4>
          <p className="text-caption text-muted mt-0.5 font-semibold">Workspace account initialized.</p>
        </div>
        <span className="px-3 py-1 bg-surface text-primary border border-border font-bold rounded-lg text-badge-val shadow-sm">
          Active
        </span>
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <h4 className="text-overline text-muted block mb-2">Limits Usage</h4>
        {[
          { label: "Notes limits usage", value: "Unlimited", usage: 15 },
          { label: "Visual canvas templates", value: "3 of 5", usage: 60 },
          { label: "Spaces folders limit", value: "2 of 3", usage: 66 },
        ].map((lim, i) => (
          <div key={i} className="space-y-1 text-caption font-semibold text-muted">
            <div className="flex justify-between">
              <span>{lim.label}</span>
              <span className="text-primary">{lim.value}</span>
            </div>
            <div className="h-1.5 bg-background border border-border rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${lim.usage}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";
import React from "react";

interface AISettingsProps {
  preferences: any;
  handleTogglePreference: (key: string) => void;
  handleSaveTextPreference: (key: string, val: string) => void;
}

export function AISettings({ preferences, handleTogglePreference, handleSaveTextPreference }: AISettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-label-val uppercase text-muted mb-1.5">AI Engine model</label>
        <select
          value={preferences.aiModel}
          onChange={(e) => handleSaveTextPreference("aiModel", e.target.value)}
          className="w-full h-9 px-2 border border-border bg-background text-foreground rounded-lg outline-none"
        >
          <option value="Gemini">Gemini 2.5 Flash</option>
          <option value="Pro">Gemini 2.5 Pro</option>
        </select>
      </div>

      <div className="border-t border-border pt-4 space-y-4">
        <h4 className="text-overline text-muted block mb-2">AI Assistant Preferences</h4>
        {[
          { key: "aiSummaries", label: "Perform auto-summarization on Note saves" },
          { key: "aiRefine", label: "Enable AI Refine sidebars" },
          { key: "aiWhiteboard", label: "Enable visual diagram generation layout" },
        ].map((pref) => (
          <label key={pref.key} className="flex items-center justify-between p-1 cursor-pointer text-muted font-semibold text-caption">
            <span>{pref.label}</span>
            <input
              type="checkbox"
              checked={preferences[pref.key]}
              onChange={() => handleTogglePreference(pref.key)}
              className="rounded text-primary focus:ring-primary size-4"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

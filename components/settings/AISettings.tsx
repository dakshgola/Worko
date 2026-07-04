"use client";
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
        <Select
          value={preferences.aiModel}
          onValueChange={(val) => handleSaveTextPreference("aiModel", val)}
        >
          <SelectTrigger className="w-full h-9 border border-border bg-background text-foreground rounded-lg focus:ring-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">
            <SelectValue placeholder="Select AI model" />
          </SelectTrigger>
          <SelectContent className="bg-surface border border-border">
            <SelectItem value="Gemini">Gemini 2.5 Flash</SelectItem>
            <SelectItem value="Pro">Gemini 2.5 Pro</SelectItem>
          </SelectContent>
        </Select>
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

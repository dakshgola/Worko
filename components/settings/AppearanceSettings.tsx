"use client";
import React from "react";

interface AppearanceSettingsProps {
  preferences: any;
  handleSaveTextPreference: (key: string, val: string) => void;
}

export function AppearanceSettings({ preferences, handleSaveTextPreference }: AppearanceSettingsProps) {
  return (
    <div>
      <label className="block text-label-val uppercase text-muted mb-1.5">Active Theme</label>
      <select
        value={preferences.theme}
        onChange={(e) => handleSaveTextPreference("theme", e.target.value)}
        className="w-full h-9 px-2 border border-border bg-background text-foreground rounded-lg outline-none"
      >
        <option value="system">System Default</option>
        <option value="light">Light Cozy Mode</option>
        <option value="dark">Dark Theme</option>
      </select>
    </div>
  );
}

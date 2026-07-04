"use client";
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AppearanceSettingsProps {
  preferences: any;
  handleSaveTextPreference: (key: string, val: string) => void;
}

export function AppearanceSettings({ preferences, handleSaveTextPreference }: AppearanceSettingsProps) {
  return (
    <div>
      <label className="block text-label-val uppercase text-muted mb-1.5">Active Theme</label>
      <Select
        value={preferences.theme}
        onValueChange={(val) => handleSaveTextPreference("theme", val)}
      >
        <SelectTrigger className="w-full h-9 border border-border bg-background text-foreground rounded-lg focus:ring-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">
          <SelectValue placeholder="Select active theme" />
        </SelectTrigger>
        <SelectContent className="bg-surface border border-border">
          <SelectItem value="system">System Default</SelectItem>
          <SelectItem value="light">Light Cozy Mode</SelectItem>
          <SelectItem value="dark">Dark Theme</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

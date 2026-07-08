"use client";
import React from "react";

interface NotificationSettingsProps {
  preferences: any;
  handleTogglePreference: (key: string) => void;
}

export function NotificationSettings({ preferences, handleTogglePreference }: NotificationSettingsProps) {
  return (
    <div className="border-t border-border pt-4 space-y-4">
      <h4 className="text-overline text-muted block mb-2">Workspace Notices</h4>
      {[
        { key: "emailNotifications", label: "Email alerts for task deadliness" },
        { key: "pushNotifications", label: "Receive push notices for events schedules" },
      ].map((pref) => (
        <label key={pref.key} className="flex items-center justify-between p-3 hover:bg-hover-overlay rounded-xl transition duration-150 cursor-pointer text-muted font-semibold text-caption">
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
  );
}

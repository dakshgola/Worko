"use client";
import React from "react";
import { LogOut } from "lucide-react";

interface ProfileSettingsProps {
  user: any;
  setShowLogoutConfirm: (show: boolean) => void;
}

export function ProfileSettings({ user, setShowLogoutConfirm }: ProfileSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-[#ffad72] to-[#ef6688] text-white text-lg font-black shadow-md">
          {user?.firstName ? user.firstName.substring(0, 2).toUpperCase() : "DG"}
        </div>
        <div>
          <h3 className="text-body-sm font-extrabold text-foreground">{user?.fullName || "Daksh Gola"}</h3>
          <p className="text-caption text-muted mt-0.5 font-semibold">{user?.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-label-val uppercase text-muted mb-1">First Name</label>
            <input type="text" readOnly value={user?.firstName || ""} className="w-full h-9 px-3 border border-border bg-background rounded-lg outline-none cursor-not-allowed text-input-val text-muted" />
          </div>
          <div>
            <label className="block text-label-val uppercase text-muted mb-1">Last Name</label>
            <input type="text" readOnly value={user?.lastName || ""} className="w-full h-9 px-3 border border-border bg-background rounded-lg outline-none cursor-not-allowed text-input-val text-muted" />
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-body-sm font-bold text-foreground">Manage Account</h4>
            <p className="text-caption text-muted mt-0.5 font-semibold">Securely sign out of your workspace session.</p>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            type="button"
            className="h-9 px-4 rounded-xl border border-danger-soft text-danger hover:bg-danger-soft text-btn flex items-center gap-1.5 transition"
          >
            <LogOut size={13.5} /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

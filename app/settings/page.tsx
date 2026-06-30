"use client";

import React, { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Bot,
  CalendarDays,
  SquareKanban,
  StickyNote,
  PenTool,
  PanelTop,
  WandSparkles,
  Settings,
  Plus,
  Loader2,
  Trash2,
  Check,
  Zap,
  Sliders,
  User,
  SlidersHorizontal,
  Bell,
  Lock,
  CreditCard,
  X,
  ChevronLeft,
  ChevronRight,
  Menu,
  PanelLeftClose,
  LogOut,
} from "lucide-react";
import {
  getUserPreferences,
  saveUserPreferences,
  listCategories,
  createCategory,
  deleteCategory,
} from "@/lib/settings/actions";
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar";

const sidebarNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "AI Assistant", icon: Bot, href: "/ai-assistant" },
  { label: "Calendar", icon: CalendarDays, href: "/calendar" },
  { label: "Tasks", icon: SquareKanban, href: "/kanban" },
  { label: "Notes", icon: StickyNote, href: "/notes" },
  { label: "Whiteboard", icon: PenTool, href: "/whiteboard" },
  { label: "Spaces", icon: PanelTop, href: "/spaces" },
  { label: "AI Builder", icon: WandSparkles, href: "/ai-template-builder" },
  { label: "Settings", icon: Settings, href: "/settings", active: true },
];

export default function SettingsPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Tabs: profile, preferences, categories, subscription
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "categories" | "subscription">("profile");

  // Preferences state
  const [preferences, setPreferences] = useState<any>(null);
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Categories state
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#6c5ce7");

  const loadPreferences = async () => {
    try {
      setLoadingPrefs(true);
      const res = await getUserPreferences();
      setPreferences(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPrefs(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoadingCats(true);
      const res = await listCategories();
      setCategories(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCats(false);
    }
  };

  useEffect(() => {
    loadPreferences();
    loadCategories();
  }, []);

  const handleTogglePreference = async (key: string) => {
    if (!preferences) return;
    try {
      setSavingPrefs(true);
      const nextVal = !preferences[key];
      setPreferences((prev: any) => ({ ...prev, [key]: nextVal }));
      await saveUserPreferences({ [key]: nextVal });
    } catch (e) {
      console.error(e);
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleSaveTextPreference = async (key: string, val: string) => {
    if (!preferences) return;
    try {
      setSavingPrefs(true);
      setPreferences((prev: any) => ({ ...prev, [key]: val }));
      await saveUserPreferences({ [key]: val });
    } catch (e) {
      console.error(e);
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleCreateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const cat = await createCategory({
        name: newCatName,
        color: newCatColor,
        icon: "Folder",
      });
      setCategories((prev) => [...prev, cat]);
      setNewCatName("");
      setNewCatColor("#6c5ce7");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Delete this workspace category?")) {
      try {
        await deleteCategory(id);
        setCategories((curr) => curr.filter((c) => c.id !== id));
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8fb] text-[#292832] flex">
      {/* Sidebar Navigation */}
      <WorkspaceSidebar active="Settings" />

      <main className="flex-1 min-w-0 p-6 lg:p-10 space-y-8 overflow-y-auto max-h-screen">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#9f98a7]">Workspace Settings</p>
            <h1 className="text-2xl font-bold tracking-[-0.045em] text-[#302d38] sm:text-3xl">Control your rhythm.</h1>
            <p className="mt-1.5 text-[11px] text-[#918a98]">Manage profile details, theme visual toggles, category labels, and AI assist parameters.</p>
          </div>
        </section>

        {/* Settings Tab headers */}
        <div className="flex gap-2 border-b border-[#efedf4] pb-3 text-xs font-bold shrink-0">
          {[
            { id: "profile", label: "Profile Info", icon: User },
            { id: "preferences", label: "App Preferences", icon: SlidersHorizontal },
            { id: "categories", label: "Work Categories", icon: Sliders },
            { id: "subscription", label: "Plan & Billing", icon: CreditCard },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
                activeTab === tab.id
                  ? "bg-[#eeeaff] text-[#6c5ce7] shadow-sm"
                  : "text-[#777281] hover:bg-[#fafafb]"
              }`}
            >
              <tab.icon size={13.5} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content panel */}
        <section className="max-w-2xl bg-white border border-[#efedf4] p-6 rounded-2xl shadow-sm">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-[#ffad72] to-[#ef6688] text-white text-lg font-black shadow-md">
                  {user?.firstName ? user.firstName.substring(0, 2).toUpperCase() : "DG"}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#282633]">{user?.fullName || "Daksh Gola"}</h3>
                  <p className="text-xs text-[#777281] mt-0.5">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>

              <div className="border-t border-[#efedf4] pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#b0a9bd] mb-1">First Name</label>
                    <input type="text" readOnly value={user?.firstName || ""} className="w-full h-9 px-3 border bg-[#f8f8fb] rounded-lg outline-none cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#b0a9bd] mb-1">Last Name</label>
                    <input type="text" readOnly value={user?.lastName || ""} className="w-full h-9 px-3 border bg-[#f8f8fb] rounded-lg outline-none cursor-not-allowed" />
                  </div>
                </div>
              </div>

              <div className="border-t border-[#efedf4] pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#282633]">Manage Account</h4>
                    <p className="text-[10px] text-[#777281] mt-0.5">Securely sign out of your workspace session.</p>
                  </div>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    type="button"
                    className="h-9 px-4 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <LogOut size={13.5} /> Log Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-6">
              {loadingPrefs ? (
                <div className="text-center py-6 text-xs text-[#aaa6b5]"><Loader2 size={12} className="animate-spin mr-1 inline" /> Loading...</div>
              ) : (
                <div className="space-y-4 text-xs font-semibold text-[#292832]">
                  {/* Dropdowns */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#b0a9bd] mb-1.5">Active Theme</label>
                      <select
                        value={preferences.theme}
                        onChange={(e) => handleSaveTextPreference("theme", e.target.value)}
                        className="w-full h-9 px-2 border rounded-lg outline-none"
                      >
                        <option value="system">System Default</option>
                        <option value="light">Light Cozy Mode</option>
                        <option value="dark">Dark Theme</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#b0a9bd] mb-1.5">AI Engine model</label>
                      <select
                        value={preferences.aiModel}
                        onChange={(e) => handleSaveTextPreference("aiModel", e.target.value)}
                        className="w-full h-9 px-2 border rounded-lg outline-none"
                      >
                        <option value="Gemini">Gemini 2.5 Flash</option>
                        <option value="Pro">Gemini 2.5 Pro</option>
                      </select>
                    </div>
                  </div>

                  {/* Toggle list */}
                  <div className="border-t border-[#efedf4] pt-4 space-y-4">
                    <h4 className="text-[10px] font-bold text-[#b0a9bd] uppercase tracking-wider mb-2">AI Assistant Preferences</h4>
                    {[
                      { key: "aiSummaries", label: "Perform auto-summarization on Note saves" },
                      { key: "aiRefine", label: "Enable AI Refine sidebars" },
                      { key: "aiWhiteboard", label: "Enable visual diagram generation layout" },
                    ].map((pref) => (
                      <label key={pref.key} className="flex items-center justify-between p-1 cursor-pointer">
                        <span>{pref.label}</span>
                        <input
                          type="checkbox"
                          checked={preferences[pref.key]}
                          onChange={() => handleTogglePreference(pref.key)}
                          className="rounded text-[#6c5ce7] focus:ring-[#6c5ce7] size-4"
                        />
                      </label>
                    ))}
                  </div>

                  <div className="border-t border-[#efedf4] pt-4 space-y-4">
                    <h4 className="text-[10px] font-bold text-[#b0a9bd] uppercase tracking-wider mb-2">Workspace Notices</h4>
                    {[
                      { key: "emailNotifications", label: "Email alerts for task deadliness" },
                      { key: "pushNotifications", label: "Receive push notices for events schedules" },
                    ].map((pref) => (
                      <label key={pref.key} className="flex items-center justify-between p-1 cursor-pointer">
                        <span>{pref.label}</span>
                        <input
                          type="checkbox"
                          checked={preferences[pref.key]}
                          onChange={() => handleTogglePreference(pref.key)}
                          className="rounded text-[#6c5ce7] focus:ring-[#6c5ce7] size-4"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "categories" && (
            <div className="space-y-6">
              <form onSubmit={handleCreateCategorySubmit} className="flex gap-3 items-end">
                <div className="flex-1 text-xs">
                  <label className="block text-[10px] font-bold uppercase text-[#b0a9bd] mb-1">New Category Label</label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Design Sync, Urgent Review..."
                    className="w-full h-9 px-3 border rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#b0a9bd] mb-1">Accent</label>
                  <select
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="h-9 px-2 border rounded-lg outline-none text-xs"
                  >
                    <option value="#6c5ce7">Purple Accent</option>
                    <option value="#3e9b68">Green Forest</option>
                    <option value="#ef6688">Pink Rose</option>
                    <option value="#e49a3a">Amber Yellow</option>
                  </select>
                </div>
                <button type="submit" className="h-9 px-4 bg-[#6c5ce7] hover:bg-[#5143bd] text-white rounded-xl text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                  Add Label
                </button>
              </form>

              <div className="border-t border-[#efedf4] pt-4 space-y-2">
                <h4 className="text-[10px] font-bold text-[#b0a9bd] uppercase tracking-wider mb-2">Existing Category Labels</h4>
                {loadingCats ? (
                  <div className="text-xs text-slate-400 py-3">Loading labels...</div>
                ) : categories.length === 0 ? (
                  <div className="text-xs text-slate-400 py-3">0 categories.</div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((c) => (
                      <div key={c.id} className="p-2.5 border border-[#efedf4] rounded-xl bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                          <span>{c.name}</span>
                        </div>
                        <button onClick={() => handleDeleteCategory(c.id)} className="text-slate-400 hover:text-red-500 transition">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "subscription" && (
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-[#5143bd] flex items-center gap-1.5">
                    <Zap size={14} fill="currentColor" /> Worko Free Tier
                  </h4>
                  <p className="text-[10px] text-[#777281] mt-0.5">Workspace account initialized.</p>
                </div>
                <span className="px-3 py-1 bg-white text-[#6c5ce7] font-bold rounded-lg text-[10px] shadow-sm uppercase tracking-wider">
                  Active
                </span>
              </div>

              <div className="border-t border-[#efedf4] pt-4 space-y-3">
                <h4 className="text-[10px] font-bold text-[#b0a9bd] uppercase tracking-wider mb-2">Limits Usage</h4>
                {[
                  { label: "Notes limits usage", value: "Unlimited", usage: 15 },
                  { label: "Visual canvas templates", value: "3 of 5", usage: 60 },
                  { label: "Spaces folders limit", value: "2 of 3", usage: 66 },
                ].map((lim, i) => (
                  <div key={i} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span>{lim.label}</span>
                      <span className="text-[#6c5ce7]">{lim.value}</span>
                    </div>
                    <div className="h-1.5 bg-[#f0ecfc] rounded-full overflow-hidden">
                      <div className="h-full bg-[#6c5ce7] rounded-full" style={{ width: `${lim.usage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
      {sidebarOpen && <button aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-[#302a3d]/20 backdrop-blur-sm lg:hidden" />}

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-2 border-red-200 w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-red-50">
              <h4 className="font-black text-sm text-[#282633] flex items-center gap-1.5">
                <LogOut size={16} className="text-red-500" />
                Confirm Log Out
              </h4>
              <button type="button" onClick={() => setShowLogoutConfirm(false)}><X size={15} /></button>
            </div>
            <p className="text-xs text-[#777281] leading-relaxed font-semibold">
              Are you sure you want to sign out of your Worko workspace? You will need to authenticate again to access your dashboard.
            </p>
            <div className="flex justify-end gap-2 border-t border-red-50 pt-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="h-8.5 px-4 bg-slate-50 border rounded-xl text-xs font-semibold text-[#777281]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  window.location.href = "/";
                }}
                className="h-8.5 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

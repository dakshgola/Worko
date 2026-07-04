"use client";

import React, { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Sliders,
  User,
  SlidersHorizontal,
  CreditCard,
  X,
  ChevronLeft,
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
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { AISettings } from "@/components/settings/AISettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { CategoriesSettings } from "@/components/settings/CategoriesSettings";
import { SubscriptionSettings } from "@/components/settings/SubscriptionSettings";

export default function SettingsPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoggingOut(true);
      await signOut({ redirectUrl: "/" });
    } catch (e) {
      console.error("Logout failed:", e);
      window.location.href = "/";
    } finally {
      setLoggingOut(false);
    }
  };

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
  const [newCatColor, setNewCatColor] = useState("#FF5A36");

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
      toast.success("Preferences updated");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update preferences");
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
      toast.success("Preferences updated");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update preferences");
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
      setNewCatColor("#FF5A36");
      toast.success("Category created successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Delete this workspace category?")) {
      try {
        await deleteCategory(id);
        setCategories((curr) => curr.filter((c) => c.id !== id));
        toast.success("Category deleted");
      } catch (e) {
        console.error(e);
        toast.error("Failed to delete category");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Navigation */}
      <WorkspaceSidebar active="Settings" />

      <main className="flex-grow min-w-0 p-6 lg:p-10 space-y-8 overflow-y-auto max-h-screen pt-[88px] lg:pt-10">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1.5 text-overline text-muted block">Workspace Settings</p>
            <h1 className="text-h2 text-foreground">Control your rhythm.</h1>
            <p className="mt-1.5 text-body-sm text-muted font-semibold">Manage profile details, theme visual toggles, category labels, and AI assist parameters.</p>
          </div>
        </section>

        {/* Settings Tab headers */}
        <div className="flex gap-2 border-b border-border pb-3 text-btn shrink-0 overflow-x-auto max-w-full no-scrollbar">
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
                  ? "bg-primary-soft text-primary border border-border shadow-sm"
                  : "text-muted hover:bg-hover-overlay"
              }`}
            >
              <tab.icon size={13.5} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content panel */}
        <section className="max-w-2xl bg-surface border border-border p-6 rounded-2xl shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "profile" && (
                <ProfileSettings user={user} setShowLogoutConfirm={setShowLogoutConfirm} />
              )}

              {activeTab === "preferences" && (
                <div className="space-y-6">
                  {loadingPrefs ? (
                    <div className="text-center py-6 text-caption font-semibold text-muted"><Loader2 size={12} className="animate-spin mr-1 inline" /> Loading...</div>
                  ) : (
                    <div className="space-y-6 text-input-val text-foreground">
                      <AppearanceSettings
                        preferences={preferences}
                        handleSaveTextPreference={handleSaveTextPreference}
                      />
                      <AISettings
                        preferences={preferences}
                        handleTogglePreference={handleTogglePreference}
                        handleSaveTextPreference={handleSaveTextPreference}
                      />
                      <NotificationSettings
                        preferences={preferences}
                        handleTogglePreference={handleTogglePreference}
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === "categories" && (
                <CategoriesSettings
                  categories={categories}
                  loadingCats={loadingCats}
                  newCatName={newCatName}
                  setNewCatName={setNewCatName}
                  newCatColor={newCatColor}
                  setNewCatColor={setNewCatColor}
                  handleCreateCategorySubmit={handleCreateCategorySubmit}
                  handleDeleteCategory={handleDeleteCategory}
                />
              )}

              {activeTab === "subscription" && (
                <SubscriptionSettings />
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="bg-surface rounded-2xl border border-border w-full max-w-sm p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3 border-red-50">
                <h4 className="text-body-sm font-black text-foreground flex items-center gap-1.5">
                  <LogOut size={16} className="text-danger" />
                  Confirm Log Out
                </h4>
                <button type="button" onClick={() => setShowLogoutConfirm(false)}><X size={15} /></button>
              </div>
              <p className="text-caption text-muted leading-relaxed font-semibold">
                Are you sure you want to sign out of your Worko workspace? You will need to authenticate again to access your dashboard.
              </p>
              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <button
                  type="button"
                  disabled={loggingOut}
                  onClick={() => setShowLogoutConfirm(false)}
                  className="btn-outline h-8.5 px-4 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loggingOut}
                  onClick={handleSignOut}
                  className="btn-danger h-8.5 px-4 text-center flex items-center justify-center gap-1.5 disabled:opacity-50 min-w-[90px]"
                >
                  {loggingOut ? (
                    <>
                      <Loader2 size={13} className="animate-spin text-white" /> Signing Out
                    </>
                  ) : (
                    "Sign Out"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

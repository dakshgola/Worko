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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="space-y-8 w-full">
          {/* Settings Tab headers */}
          <TabsList className="flex gap-2 border-b border-border pb-3 bg-transparent h-auto p-0 rounded-none w-full justify-start overflow-x-auto no-scrollbar">
            {[
              { id: "profile", label: "Profile Info", icon: User },
              { id: "preferences", label: "App Preferences", icon: SlidersHorizontal },
              { id: "categories", label: "Work Categories", icon: Sliders },
              { id: "subscription", label: "Plan & Billing", icon: CreditCard },
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl transition text-btn text-muted hover:bg-hover-overlay data-[state=active]:bg-primary-soft data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-border data-[state=active]:shadow-sm cursor-pointer shadow-none"
              >
                <tab.icon size={13.5} />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab content panel */}
          <section className="max-w-2xl bg-surface border border-border p-6 rounded-2xl shadow-sm mt-0">
            <TabsContent value="profile" className="mt-0 outline-none">
              <ProfileSettings user={user} setShowLogoutConfirm={setShowLogoutConfirm} />
            </TabsContent>

            <TabsContent value="preferences" className="mt-0 outline-none">
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
            </TabsContent>

            <TabsContent value="categories" className="mt-0 outline-none">
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
            </TabsContent>

            <TabsContent value="subscription" className="mt-0 outline-none">
              <SubscriptionSettings />
            </TabsContent>
          </section>
        </Tabs>
      </main>

      <Dialog open={showLogoutConfirm} onOpenChange={(val) => { if (!val) setShowLogoutConfirm(false); }}>
        <DialogContent className="bg-surface border border-border w-full max-w-sm p-6 shadow-2xl dark:border-border dark:bg-surface sm:rounded-2xl gap-4">
          <div className="flex items-center justify-between border-b pb-3 border-red-50 dark:border-border">
            <DialogTitle className="text-body-sm font-black text-foreground flex items-center gap-1.5">
              <LogOut size={16} className="text-danger" />
              Confirm Log Out
            </DialogTitle>
          </div>
          <DialogDescription className="text-caption text-muted leading-relaxed font-semibold">
            Are you sure you want to sign out of your Worko workspace? You will need to authenticate again to access your dashboard.
          </DialogDescription>
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
        </DialogContent>
      </Dialog>
    </div>
  );
}

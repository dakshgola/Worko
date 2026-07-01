"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
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
  Search,
  Bell,
  Trash2,
  Star,
  Activity,
  X,
  Sparkles,
  Check,
  Zap,
  Layout,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Menu,
  PanelLeftClose,
} from "lucide-react";
import {
  listGeneratedApps,
  createGeneratedApp,
  togglePinApp,
  deleteGeneratedApp,
} from "@/lib/ai-builder/actions";
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar";
import { motion, AnimatePresence } from "framer-motion";

export default function AiTemplateBuilderPage() {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // AI Builder states
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedConfig, setGeneratedConfig] = useState<any>(null);

  // DB templates states
  const [savedApps, setSavedApps] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchApps = async () => {
    try {
      setLoadingApps(true);
      const res = await listGeneratedApps();
      setSavedApps(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleGenerateTemplate = async () => {
    if (!prompt.trim()) return;
    try {
      setGenerating(true);
      setGeneratedConfig(null);

      const apiKey = process.env.GEMINI_API_KEY;
      const systemPrompt = `You are a product builder AI. The user will ask you to build a custom mini tracker application (e.g. Habit Tracker, Budget Tracker, Meal Planner).
Return ONLY a valid JSON object matching this schema:
{
  "appName": "Habit Tracker",
  "description": "A description of the tracker app",
  "icon": "Flame" | "Briefcase" | "Bell" | "Star" | "Zap",
  "color": "#hex_color",
  "columns": ["Column 1", "Column 2", "Column 3"],
  "items": [
    { "id": "1", "values": ["Sample cell 1", "Sample cell 2", "Sample cell 3"] },
    { "id": "2", "values": ["Sample cell A", "Sample cell B", "Sample cell C"] }
  ]
}
Output ONLY the raw JSON string. Do not wrap in markdown code blocks.`;

      // Simulating API call if key is missing
      if (!apiKey) {
        setTimeout(() => {
          setGeneratedConfig({
            appName: "Expense Tracker",
            description: "Manage monthly budgets and spend logs",
            icon: "Zap",
            color: "#FF5A36",
            columns: ["Expense Title", "Amount", "Category", "Date"],
            items: [
              { id: "1", values: ["Lunch sync", "$24.00", "Food", "2026-06-27"] },
              { id: "2", values: ["Uber ride", "$18.50", "Travel", "2026-06-27"] }
            ]
          });
          setGenerating(false);
        }, 1500);
        return;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\nUser request: ${prompt}` }] }],
          }),
        }
      );

      if (!response.ok) throw new Error("Gemini call failed");
      const resData = await response.json();
      let text = resData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

      let cleanJson = text;
      if (cleanJson.startsWith("```json")) cleanJson = cleanJson.slice(7);
      if (cleanJson.endsWith("```")) cleanJson = cleanJson.slice(0, -3);

      const parsed = JSON.parse(cleanJson.trim());
      setGeneratedConfig(parsed);
      setPrompt("");
    } catch (e) {
      console.error(e);
      alert("Failed to build app template. Please check prompt details.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!generatedConfig) return;
    try {
      setSaving(true);
      const app = await createGeneratedApp({
        appName: generatedConfig.appName,
        description: generatedConfig.description,
        icon: generatedConfig.icon,
        color: generatedConfig.color,
        jsonConfig: JSON.stringify(generatedConfig),
      });

      // Pin it by default for quick dashboard visibility
      await togglePinApp(app.id);

      setSavedApps((prev) => [app, ...prev]);
      setGeneratedConfig(null);
      alert("App template saved & pinned to your workspace sidebar!");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePin = async (appId: string) => {
    try {
      const res = await togglePinApp(appId);
      setSavedApps((curr) =>
        curr.map((a) => (a.id === appId ? { ...a, isPinned: res.isPinned } : a))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteApp = async (appId: string) => {
    if (confirm("Delete this generated app template?")) {
      try {
        await deleteGeneratedApp(appId);
        setSavedApps((curr) => curr.filter((a) => a.id !== appId));
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Navigation */}
      <WorkspaceSidebar active="AI Builder" />

      <motion.main
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="flex-grow min-w-0 p-6 lg:p-10 space-y-8 overflow-y-auto max-h-screen"
      >
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1.5 text-overline text-muted block">Workspace generator</p>
            <h1 className="text-h2 text-foreground">AI Custom App Builder</h1>
            <p className="mt-1.5 text-body-sm text-muted font-semibold">Describe a custom tracker or checklist app, and AI will build a single-page config template.</p>
          </div>
        </section>

        {/* Builder Inputs */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm space-y-3">
              <label className="block text-label-val uppercase text-muted mb-1">Describe your App Idea</label>
              <textarea
                placeholder="e.g. Build a Habit Tracker to track daily runs, hydration, reading sessions and Streaks..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-24 p-3 border border-border text-input-val rounded-xl outline-none resize-none focus:border-primary bg-background text-foreground font-semibold"
              />

              <button
                onClick={handleGenerateTemplate}
                disabled={generating || !prompt.trim()}
                className="btn-primary h-10 px-6 ml-auto gap-1.5"
              >
                {generating ? (
                  <div className="flex items-center justify-center gap-1 py-1.5 px-3">
                    <span className="ai-dot-indicator" />
                    <span className="ai-dot-indicator" />
                    <span className="ai-dot-indicator" />
                  </div>
                ) : (
                  <>
                    <Sparkles size={14} /> Generate App Template
                  </>
                )}
              </button>
            </div>

            {/* Generated template live preview render */}
            {generatedConfig && (
              <div className="bg-surface border-2 border-dashed border-primary p-6 rounded-2xl shadow-md space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-xl text-white shadow" style={{ backgroundColor: generatedConfig.color }}>
                      <WandSparkles size={17} />
                    </span>
                    <div>
                      <h3 className="text-h3 text-foreground">{generatedConfig.appName}</h3>
                      <p className="text-caption text-muted mt-0.5 font-semibold">{generatedConfig.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveTemplate}
                    disabled={saving}
                    className="btn-primary h-9 px-4 gap-1.5"
                  >
                    {saving ? <Loader2 size={12} className="animate-spin" /> : "Save & Mount App"}
                  </button>
                </div>

                {/* Preview columns grid */}
                <div className="overflow-x-auto border border-border rounded-xl bg-background/50 p-2">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-table-header text-muted font-bold">
                        {generatedConfig.columns.map((col: string, i: number) => (
                          <th key={i} className="p-3">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 text-table-cell text-foreground font-semibold">
                      {generatedConfig.items.map((item: any, rowIdx: number) => (
                        <tr key={rowIdx}>
                          {item.values.map((val: string, valIdx: number) => (
                            <td key={valIdx} className="p-3 bg-surface font-mono">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar saved list */}
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-overline text-primary block font-bold">Saved trackers ({savedApps.length})</h3>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {loadingApps ? (
                <div className="text-caption font-semibold text-muted py-4 text-center">Loading trackers...</div>
              ) : savedApps.length === 0 ? (
                <div className="text-caption font-semibold text-muted py-4 text-center">0 custom applications built.</div>
              ) : (
                savedApps.map((app) => (
                  <div key={app.id} className="p-3 border border-border bg-background rounded-xl flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: app.color }} />
                        <h4 className="text-body-sm font-bold text-foreground truncate">{app.appName}</h4>
                      </div>
                      <p className="text-caption text-muted truncate mt-0.5 font-semibold">{app.description}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleTogglePin(app.id)}
                        className={`p-1 rounded-lg border transition ${
                          app.isPinned ? "border-amber-150 bg-amber-50/20 text-amber-600" : "border-border text-muted hover:text-foreground bg-surface"
                        }`}
                      >
                        <Star size={11} fill={app.isPinned ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={() => handleDeleteApp(app.id)}
                        className="btn-icon size-6 text-muted hover:text-danger border border-border flex items-center justify-center bg-surface"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </motion.main>
    </div>
  );
}

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

const sidebarNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "AI Assistant", icon: Bot, href: "/ai-assistant" },
  { label: "Calendar", icon: CalendarDays, href: "/calendar" },
  { label: "Tasks", icon: SquareKanban, href: "/kanban" },
  { label: "Notes", icon: StickyNote, href: "/notes" },
  { label: "Whiteboard", icon: PenTool, href: "/whiteboard" },
  { label: "Spaces", icon: PanelTop, href: "/spaces" },
  { label: "AI Builder", icon: WandSparkles, href: "/ai-template-builder", active: true },
  { label: "Settings", icon: Settings, href: "/settings" },
];

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
            color: "#6c5ce7",
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
    <div className="min-h-screen bg-[#f8f8fb] text-[#292832] flex">
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[210px] border-r border-[#e8e7ef] bg-white transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[64px] items-center gap-3 border-b border-[#efedf4] px-4">
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#6c5ce7] to-[#8b5cf6] text-white shadow-[0_7px_18px_rgba(102,87,220,0.28)]"><Zap size={17} fill="currentColor" /></div>
          <div>
            <p className="text-[15px] font-bold tracking-[-0.04em]">Worko</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#aaa4b2]">Creative workspace</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto grid size-8 place-items-center rounded-lg text-[#9d96a6] hover:bg-[#f5f3f7] lg:hidden"><PanelLeftClose size={15} /></button>
        </div>
        <nav className="space-y-1 p-3 overflow-y-auto max-h-[calc(100vh-140px)]">
          <p className="mb-2 px-2 text-[8px] font-bold uppercase tracking-[0.17em] text-[#aaa6b5]">Workspace</p>
          {sidebarNav.map(({ label, icon: Icon, href, active }) => (
            <a key={label} href={href} className={`relative flex h-10 items-center gap-3 rounded-xl px-2.5 text-[11px] font-bold transition ${active ? "bg-[#eeeaff] text-[#5849c6]" : "text-[#777181] hover:bg-[#f7f5f9] hover:text-[#3f3948]"}`}>
              {active && <span className="absolute -left-1 h-5 w-0.5 rounded-full bg-[#6c5ce7]" />}
              <span className={`grid size-7 place-items-center rounded-lg ${active ? "bg-white text-[#6556d6] shadow-sm" : "bg-[#f3f1f5] text-[#918a99]"}`}><Icon size={13} /></span>
              {label}
            </a>
          ))}
        </nav>
      </aside>

      <main className="flex-grow min-w-0 lg:ml-[210px] p-6 lg:p-10 space-y-8 overflow-y-auto max-h-screen">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#9f98a7]">Workspace generator</p>
            <h1 className="text-2xl font-bold tracking-[-0.045em] text-[#302d38] sm:text-3xl">AI Custom App Builder</h1>
            <p className="mt-1.5 text-[11px] text-[#918a98]">Describe a custom tracker or checklist app, and AI will build a single-page config template.</p>
          </div>
        </section>

        {/* Builder Inputs */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-[#efedf4] p-5 rounded-2xl shadow-sm space-y-3">
              <label className="block text-[11px] font-extrabold uppercase text-[#b0a9bd] tracking-wider">Describe your App Idea</label>
              <textarea
                placeholder="e.g. Build a Habit Tracker to track daily runs, hydration, reading sessions andStreaks..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-24 p-3 border border-[#e5e2ed] text-xs rounded-xl outline-none resize-none focus:border-[#bdb4f1]"
              />

              <button
                onClick={handleGenerateTemplate}
                disabled={generating || !prompt.trim()}
                className="h-10 px-6 bg-gradient-to-r from-[#6c5ce7] to-[#8b5cf6] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition ml-auto shadow-sm"
              >
                {generating ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Generating Config
                  </>
                ) : (
                  <>
                    <Sparkles size={14} /> Generate App Template
                  </>
                )}
              </button>
            </div>

            {/* Generated template live preview render */}
            {generatedConfig && (
              <div className="bg-white border-2 border-dashed border-[#6c5ce7] p-6 rounded-2xl shadow-md space-y-5">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-xl text-white shadow" style={{ backgroundColor: generatedConfig.color }}>
                      <WandSparkles size={17} />
                    </span>
                    <div>
                      <h3 className="font-black text-sm text-[#282633]">{generatedConfig.appName}</h3>
                      <p className="text-[10px] text-[#777281] mt-0.5">{generatedConfig.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveTemplate}
                    disabled={saving}
                    className="h-9 px-4 bg-[#6c5ce7] text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1 shadow"
                  >
                    {saving ? <Loader2 size={12} className="animate-spin" /> : "Save & Pin App"}
                  </button>
                </div>

                {/* Render app grid config */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#efedf4]">
                        {(generatedConfig.columns || []).map((col: string, idx: number) => (
                          <th key={idx} className="py-2.5 text-[10px] font-bold text-[#b0a9bd] uppercase tracking-wider px-2">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(generatedConfig.items || []).map((item: any, rowIdx: number) => (
                        <tr key={rowIdx} className="border-b border-[#efedf4]/60">
                          {item.values.map((val: string, colIdx: number) => (
                            <td key={colIdx} className="py-2.5 text-xs text-[#282633] px-2 font-semibold">
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* List of previously generated apps */}
          <div className="bg-white border border-[#efedf4] p-5 rounded-2xl shadow-sm space-y-4">
            <div>
              <h4 className="text-xs font-bold text-[#5143bd] uppercase tracking-wider">Your Custom Apps</h4>
              <p className="text-[10px] text-[#777281] mt-0.5">Manage previously generated mini apps:</p>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {loadingApps ? (
                <div className="text-center py-6 text-xs text-[#aaa6b5]"><Loader2 size={12} className="animate-spin mr-1 inline" /> Loading...</div>
              ) : savedApps.length === 0 ? (
                <p className="text-xs text-[#aaa6b5] text-center py-4">0 apps generated.</p>
              ) : (
                savedApps.map((app) => (
                  <div key={app.id} className="p-3 bg-[#f8f8fb] border border-[#efedf4] rounded-xl flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate text-[#282633]">{app.appName}</p>
                      <p className="text-[9px] text-[#777281] truncate">{app.description}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleTogglePin(app.id)}
                        className={`p-1 rounded-lg border transition ${
                          app.isPinned ? "bg-amber-50 border-amber-100 text-amber-500" : "border-[#e5e2ed] text-slate-400"
                        }`}
                        title={app.isPinned ? "Unpin app" : "Pin to sidebar"}
                      >
                        <Star size={11} fill={app.isPinned ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={() => handleDeleteApp(app.id)}
                        className="p-1 rounded-lg border border-red-100 text-red-400 hover:bg-red-50"
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
      </main>
      {sidebarOpen && <button aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-[#302a3d]/20 backdrop-blur-sm lg:hidden" />}
    </div>
  );
}

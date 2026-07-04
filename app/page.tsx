"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
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
  ArrowRight,
  Flame,
  CheckSquare,
  ArrowUpRight,
  Sliders,
  Info,
  ShieldAlert,
  HelpCircle,
  Play,
  Heart,
  Github,
  ChevronRight,
  ChevronLeft,
  Mic,
  MousePointer,
} from "lucide-react";
import { getDashboardData } from "@/lib/dashboard/actions";
import { createNote } from "@/lib/notes/actions";
import { createWhiteboard } from "@/lib/whiteboard/actions";
import { createSpace, createPage } from "@/lib/spaces/actions";
import { createEvent } from "@/lib/calendar/actions";
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar";

const DEFAULT_WIDGETS = [
  { id: "welcome", name: "Welcome Message Banner", visible: true },
  { id: "quick-actions", name: "Quick Actions Panel", visible: true },
  { id: "stats-overview", name: "Workspace Statistics Grid", visible: true },
  { id: "productivity-metrics", name: "Productivity Score & Weekly Analytics", visible: true },
  { id: "tasks-today", name: "Today's Tasks Agenda", visible: true },
  { id: "calendar-upcoming", name: "Upcoming Schedule & Reminders", visible: true },
  { id: "favorites-panel", name: "Favorites & Recently Visited Links", visible: true },
  { id: "activity-insights", name: "Live Timeline Activity & AI Insights", visible: true },
];

export default function Home() {
  const { isSignedIn, isLoaded: userLoaded } = useUser();

  if (!userLoaded) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="text-primary"
        >
          <Zap size={32} fill="currentColor" />
        </motion.div>
        <span className="text-overline text-muted animate-pulse">Worko</span>
      </div>
    );
  }

  if (!isSignedIn) {
    return <LandingPage />;
  }

  return <DashboardView />;
}

// ==========================================
// 1. PORTFOLIO-GRADE SaaS LANDING PAGE
// ==========================================
const LANDING_FEATURES = [
  { title: "AI Conversational Assistant", desc: "Speak or chat with Gemini to query metrics, write documentation drafts, or outline database tasks.", icon: Bot, bg: "from-amber-500 to-orange-600", accent: "rgba(245, 176, 92, 0.15)" },
  { title: "Neon Postgres Calendar", desc: "Drag-and-drop meetings agendas directly synced to your real-time database.", icon: CalendarDays, bg: "from-sky-500 to-indigo-600", accent: "rgba(96, 165, 250, 0.15)" },
  { title: "Collaborative Kanban Tasks", desc: "Organize check-lists, track deadliness, and drag tasks between customizable boards columns.", icon: SquareKanban, bg: "from-emerald-500 to-teal-600", accent: "rgba(82, 194, 136, 0.15)" },
  { title: "TipTap Specs Wiki Documents", desc: "Structure rich-text specs documents and sub-pages to build team-shared knowledge bases.", icon: StickyNote, bg: "from-orange-500 to-red-600", accent: "rgba(255, 90, 54, 0.15)" },
  { title: "SVG Whiteboards", desc: "Draw mindmaps, flows, and shapes with collaborative pointers on an infinite canvas sheet.", icon: PenTool, bg: "from-pink-500 to-rose-600", accent: "rgba(244, 139, 164, 0.15)" },
  { title: "Voice Notes Dictation", desc: "Dictate transcriptions directly at cursor using AssemblyAI streaming sockets.", icon: StickyNote, bg: "from-violet-500 to-purple-600", accent: "rgba(135, 120, 255, 0.15)" },
  { title: "AI Custom App Builder", desc: "Describe custom trackers app layouts and compile schema JSONs config immediately.", icon: WandSparkles, bg: "from-rose-500 to-pink-600", accent: "rgba(244, 139, 164, 0.15)" },
];

const LANDING_FAQS = [
  { q: "What is Worko and how does the AI assist?", a: "Worko combines your notes, tasks, calendar agendas, and creative whiteboards into a single collaborative workspace. The built-in AI orchestrator automates your routine tasks: scheduling calendar meetings, structuring task lists, creating pages templates, and analyzing notes automatically." },
  { q: "Is the real-time collaboration feature secure?", a: "Yes, absolutely. Worko uses secure WebSockets and PostgreSQL schemas to sync documents, whiteboards, and canvas elements instantly with clerk-protected authentication." },
  { q: "Can I self-host Worko or run it locally?", a: "Worko is fully open-source and easy to run. You can clone the GitHub repository, plug in your Neon DB credentials and Gemini API Key, and spin it up in seconds." },
  { q: "How does the voice-to-text notes dictation work?", a: "Worko integrates AssemblyAI streaming sockets to transcribe audio directly at your cursor in real-time. Simply click the microphone icon and start speaking." }
];

function LandingPage() {
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<"dashboard" | "ai" | "voice" | "collab" | "whiteboard">("dashboard");
  const [faqOpenIdx, setFaqOpenIdx] = useState<number | null>(null);

  // AI Prompt Showcase State
  const [aiShowcaseQuery, setAiShowcaseQuery] = useState("");
  const [aiShowcaseOutput, setAiShowcaseOutput] = useState("Hello! Select a query or type ideas below to simulate real-time AI responses.");
  const [aiShowcaseTyping, setAiShowcaseTyping] = useState(false);

  // Soundwave voice state
  const [simulatedRecording, setSimulatedRecording] = useState(false);
  const [dictatedText, setDictatedText] = useState("");

  const triggerAiShowcase = (query: string) => {
    if (aiShowcaseTyping) return;
    setAiShowcaseQuery(query);
    setAiShowcaseTyping(true);
    setAiShowcaseOutput("");

    const response = query.includes("checklist")
      ? "AI: Created task board config for Sprint Launch! Generated columns: [Backlog, Build, Launch]. Added 3 tasks."
      : "AI: I've summarized your strategic notes. Key points: 1) Deploy next Monday, 2) Sync calendar items, 3) Track limits metrics.";

    let idx = 0;
    const interval = setInterval(() => {
      setAiShowcaseOutput((prev) => prev + response.charAt(idx));
      idx++;
      if (idx >= response.length) {
        clearInterval(interval);
        setAiShowcaseTyping(false);
      }
    }, 25);
  };

  const triggerVoiceDictation = () => {
    if (simulatedRecording) {
      setSimulatedRecording(false);
      return;
    }
    setSimulatedRecording(true);
    setDictatedText("");
    const speechText = "Draft: Let's launch the custom template builder app on Monday at 10:00. Check calendar sync and verify database indexes.";
    let idx = 0;
    const interval = setInterval(() => {
      setDictatedText((prev) => prev + speechText.charAt(idx));
      idx++;
      if (idx >= speechText.length) {
        clearInterval(interval);
        setSimulatedRecording(false);
      }
    }, 35);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-[#FFE8E2] selection:text-[#C23B1E] overflow-hidden relative pb-10">
      
      {/* Dynamic Animated Mesh Gradients Backdrop */}
      <div className="absolute top-[-10%] left-[-15%] w-[80%] h-[70%] rounded-full bg-gradient-to-br from-primary/8 via-secondary/4 to-transparent blur-[160px] pointer-events-none animate-pulse duration-[8s]" />
      <div className="absolute top-[30%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-accent-soft via-primary/5 to-transparent blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-20%] w-[70%] h-[60%] rounded-full bg-gradient-to-tr from-secondary/5 via-[#ff9b84]/5 to-transparent blur-[160px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 z-[-2] pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(var(--foreground) 1px, transparent 1px)`,
          backgroundSize: "24px 24px"
        }}
      />

      {/* Navigation header */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-surface/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-9.5 place-items-center rounded-xl bg-gradient-to-br from-primary to-[#ff7d5e] text-white shadow-sm ring-1 ring-white/20">
            <Zap size={16} fill="currentColor" />
          </div>
          <div>
            <span className="text-h4 text-foreground font-black tracking-tight">Worko</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-nav text-muted font-semibold">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#showcase" className="hover:text-primary transition-colors">Workspace Showcase</a>
          <a href="#pricing" className="hover:text-primary transition-colors">Pricing Plans</a>
          <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
          <a href="https://github.com/dakshgola/Worko" target="_blank" className="hover:text-primary transition flex items-center gap-1">
            <Github size={13} /> GitHub
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a href="/sign-in" className="text-btn text-muted hover:text-foreground transition-colors px-3 py-2">
            Sign In
          </a>
          <a
            href="/sign-up"
            className="flex items-center gap-1.5 h-10 rounded-xl bg-primary hover:bg-primary-hover px-4.5 text-btn text-white shadow-md transition hover:-translate-y-0.5"
          >
            Get Started <ArrowRight size={13} />
          </a>
        </div>
      </header>

      {/* 1. Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 lg:pt-24 text-center space-y-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary-soft/50 text-primary text-badge-val font-bold">
            <Sparkles size={10} className="animate-spin duration-[3s]" />
            Introducing Worko Workspace 2.0
          </div>

          <h1 className="display-lg text-foreground tracking-tight max-w-4xl mx-auto leading-[1.05]">
            Where ideas connect, plans align, and{" "}
            <span className="bg-gradient-to-r from-primary via-[#ff7d5e] to-secondary bg-clip-text text-transparent">
              AI drives collaboration.
            </span>
          </h1>

          <p className="text-body-lg text-muted max-w-2xl mx-auto font-medium">
            Bring your team's wiki specifications, task lists, calendar planning agendas, infinite drawings whiteboard canvas, and AssemblyAI dictation together in a premium cohesive workflow hub.
          </p>

          <div className="flex justify-center gap-3.5 pt-2">
            <a
              href="/sign-up"
              className="h-11 px-7 rounded-xl bg-primary hover:bg-primary-hover text-btn text-white shadow-lg flex items-center justify-center hover:-translate-y-0.5 transition duration-200"
            >
              Get Started Free <ArrowRight size={14} className="ml-1" />
            </a>
            <a
              href="#showcase"
              className="h-11 px-7 rounded-xl bg-surface border border-border text-btn text-muted flex items-center justify-center gap-1.5 hover:bg-slate-50 transition duration-200"
            >
              <Play size={11} fill="currentColor" /> Live Showcase
            </a>
          </div>
        </motion.div>
      </section>

      {/* 2. Interactive / Animated Dashboard Showcase Panel */}
      <section id="showcase" className="max-w-5xl mx-auto px-6 pt-16 pb-12">
        <div className="bg-surface border border-border/80 rounded-[32px] p-2.5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          
          {/* Tabs switch selectors header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 px-4 pt-3.5 relative z-10">
            <div className="flex items-center gap-1.5 bg-background p-1.5 rounded-2xl border border-border">
              {[
                { id: "dashboard", label: "Dashboard Widget", icon: LayoutDashboard },
                { id: "ai", label: "Gemini AI assistant", icon: Bot },
                { id: "voice", label: "Voice note waveforms", icon: StickyNote },
                { id: "collab", label: "Realtime Collab", icon: Activity },
                { id: "whiteboard", label: "Mindmap Whiteboard", icon: PenTool }
              ].map((tb) => (
                <button
                  key={tb.id}
                  onClick={() => setActiveShowcaseTab(tb.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-caption font-bold transition-all ${
                    activeShowcaseTab === tb.id
                      ? "bg-surface text-primary shadow-sm border border-border"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <tb.icon size={11} />
                  {tb.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 text-caption text-muted font-bold">
              <span className="size-2 rounded-full bg-success animate-pulse" /> Live Simulation
            </div>
          </div>

          {/* Interactive tabs preview body */}
          <div className="p-6 bg-background/50 rounded-[24px] min-h-[360px] flex flex-col justify-between relative z-10">
            <AnimatePresence mode="wait">
              {activeShowcaseTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 text-left"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-h3 text-foreground font-black">Workspace Reflection</h4>
                      <p className="text-caption text-muted font-semibold">Toggled dashboard layout preview</p>
                    </div>
                    <span className="px-3.5 py-1 rounded-xl bg-primary-soft text-primary text-badge-val font-bold border border-primary/10">Active Agendas</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { title: "Weekly productivty Score", value: "94%", detail: "+4% vs last week", color: "text-success bg-success-soft" },
                      { title: "Completed Agile cards", value: "32 Tasks", detail: "Sprint deadline met", color: "text-primary bg-primary-soft" },
                      { title: "Next strategic Sync", value: "10:00 AM", detail: "Tomorrow schedule", color: "text-[#6c5ce7] bg-[#eeeaff]" }
                    ].map((st, i) => (
                      <div key={i} className="bg-surface border border-border p-4 rounded-2xl shadow-sm space-y-2">
                        <span className="text-label-val text-muted block">{st.title}</span>
                        <h5 className="text-h2 text-foreground font-extrabold">{st.value}</h5>
                        <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${st.color}`}>
                          {st.detail}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-surface border border-border rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="size-2.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-body-sm font-bold">Strategic launch sync scheduled.</span>
                    </div>
                    <a href="/calendar" className="text-caption text-primary hover:underline font-bold flex items-center gap-0.5">Go to Calendar <ArrowUpRight size={10} /></a>
                  </div>
                </motion.div>
              )}

              {activeShowcaseTab === "ai" && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 text-left max-w-2xl mx-auto"
                >
                  <div>
                    <h4 className="text-h3 text-foreground font-black flex items-center gap-2">
                      <Bot size={20} className="text-primary" />
                      Orchestrator Gemini Prompt Simulator
                    </h4>
                    <p className="text-caption text-muted font-semibold">Select quick ideas below to watch typewriter responses:</p>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => triggerAiShowcase("Draft launch checklist tasks")} className="px-3 py-1 rounded-lg border border-border bg-surface text-caption font-bold hover:border-primary text-foreground transition-all">
                      &quot;Draft sprint launch task checklist&quot;
                    </button>
                    <button onClick={() => triggerAiShowcase("Summarize weekly team reflection notes")} className="px-3 py-1 rounded-lg border border-border bg-surface text-caption font-bold hover:border-primary text-foreground transition-all">
                      &quot;Summarize strategic specs wiki&quot;
                    </button>
                  </div>

                  <div className="p-4 bg-surface border border-border rounded-2xl min-h-[140px] text-body-sm font-medium leading-relaxed font-mono relative flex flex-col justify-between">
                    {aiShowcaseTyping && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="ai-dot-indicator" />
                        <span className="ai-dot-indicator" />
                        <span className="ai-dot-indicator" />
                      </div>
                    )}
                    <div className="flex-1 text-[#2C2A29] dark:text-[#F5F4F0]">
                      {aiShowcaseOutput}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeShowcaseTab === "voice" && (
                <motion.div
                  key="voice"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 text-left max-w-xl mx-auto"
                >
                  <div>
                    <h4 className="text-h3 text-foreground font-black">AssemblyAI Waveforms Stream</h4>
                    <p className="text-caption text-muted font-semibold">Trigger speech recording to watch audio wave translation:</p>
                  </div>

                  <button
                    onClick={triggerVoiceDictation}
                    className={`w-full h-11 rounded-xl font-bold flex items-center justify-center gap-2 border shadow-sm transition ${
                      simulatedRecording ? "bg-red-500 text-white animate-pulse" : "btn-secondary"
                    }`}
                  >
                    <Mic size={14} />
                    {simulatedRecording ? "Recording Speech... Click to Stop" : "Record Dictation Simulation"}
                  </button>

                  {simulatedRecording && (
                    <div className="flex justify-center py-2.5">
                      <div className="voice-wave-container">
                        <span className="voice-wave-bar" />
                        <span className="voice-wave-bar" />
                        <span className="voice-wave-bar" />
                        <span className="voice-wave-bar" />
                        <span className="voice-wave-bar" />
                      </div>
                    </div>
                  )}

                  {dictatedText && (
                    <div className="p-4 bg-surface border border-dashed border-border rounded-xl italic text-body-sm font-semibold leading-relaxed">
                      &quot;{dictatedText}&quot;
                    </div>
                  )}
                </motion.div>
              )}

              {activeShowcaseTab === "collab" && (
                <motion.div
                  key="collab"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5 text-left relative"
                >
                  <div>
                    <h4 className="text-h3 text-foreground font-black">Multiplayer Document Sync</h4>
                    <p className="text-caption text-muted font-semibold">Cursors outline check lists dynamically:</p>
                  </div>

                  {/* Simulated cursors */}
                  <div className="absolute top-[80px] left-[40%] bg-indigo-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow z-20 flex items-center gap-1 animate-bounce">
                    <MousePointer size={10} /> Jessica
                  </div>
                  <div className="absolute top-[160px] right-[25%] bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow z-20 flex items-center gap-1 animate-pulse">
                    <MousePointer size={10} /> Marcus
                  </div>

                  <div className="bg-surface border border-border rounded-2xl p-5 space-y-3.5 max-w-md mx-auto">
                    <span className="text-overline text-muted">Specifications checklist</span>
                    <div className="space-y-2.5">
                      {[
                        { text: "Launch database indexes on Neon", checked: true, user: "Jessica" },
                        { text: "Confirm Clerk user hooks trigger", checked: true, user: "Marcus" },
                        { text: "Check static paths page builder renders", checked: false, user: "You" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-body-sm p-1">
                          <div className="flex items-center gap-2">
                            <span className={`grid size-4 place-items-center rounded border ${
                              item.checked ? "bg-success text-white border-success" : "border-border"
                            }`}>
                              {item.checked && <Check size={10} strokeWidth={3} />}
                            </span>
                            <span className={item.checked ? "line-through text-muted" : "font-bold"}>{item.text}</span>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 bg-background rounded border text-muted font-semibold">{item.user}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeShowcaseTab === "whiteboard" && (
                <motion.div
                  key="whiteboard"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 text-left"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-h3 text-foreground font-black">SVG Infinite Canvas</h4>
                      <p className="text-caption text-muted font-semibold">Predefined flowchart vector templates</p>
                    </div>
                  </div>

                  <div className="bg-surface border border-border rounded-2xl p-6 min-h-[220px] flex items-center justify-center gap-6 relative">
                    <div className="p-4 border border-primary bg-primary-soft/50 rounded-xl font-bold text-center w-36 shadow-sm">
                      <p className="text-overline text-primary">Input</p>
                      <p className="text-caption mt-1">Dictation</p>
                    </div>
                    <span className="text-muted text-lg">&rarr;</span>
                    <div className="p-4 border border-secondary bg-[#eeeaff] rounded-xl font-bold text-center w-36 shadow-sm">
                      <p className="text-overline text-[#6c5ce7]">Process</p>
                      <p className="text-caption mt-1">AI Transcribe</p>
                    </div>
                    <span className="text-muted text-lg">&rarr;</span>
                    <div className="p-4 border border-success bg-success-soft rounded-xl font-bold text-center w-36 shadow-sm animate-pulse">
                      <p className="text-overline text-success">Output</p>
                      <p className="text-caption mt-1">Calendar Sync</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 3. Features Grid */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center space-y-2.5 max-w-xl mx-auto">
          <span className="text-label-val text-primary uppercase tracking-wider block font-bold">Uncapped parameters</span>
          <h2 className="text-h2 text-foreground font-extrabold leading-tight">
            All your collaborative tools packed in one workspace hub
          </h2>
          <p className="text-body-sm text-muted font-semibold">
            Cut down multiple dashboard tools subscriptions. Focus on shipping features instead.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {LANDING_FEATURES.map((feat, i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-[24px] p-6 shadow-sm hover:shadow-md transition hover:-translate-y-0.5 flex flex-col justify-between min-h-[190px] group"
            >
              <div className="space-y-3">
                <div className={`size-10 rounded-xl bg-gradient-to-br ${feat.bg} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition duration-200`}>
                  <feat.icon size={16} strokeWidth={2.25} />
                </div>
                <h4 className="text-body-sm font-extrabold text-foreground">{feat.title}</h4>
                <p className="text-caption text-muted leading-relaxed font-semibold">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Pricing Plans Section */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center space-y-2.5 max-w-xl mx-auto">
          <span className="text-label-val text-primary uppercase tracking-wider block font-bold">Flexible Plans</span>
          <h2 className="text-h2 text-foreground font-black">Cozy prices for every organization</h2>
          <p className="text-body-sm text-muted font-semibold">Get started free of charge, upgrade tiers as limits usage scale.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { plan: "Workspace Free", price: "$0", desc: "For developers seeking local specs wikis.", features: ["Infinite Tiptap note saves", "Up to 5 Whiteboards templates", "Clerk authentication protecting", "Basic dashboard widget layout"] },
            { plan: "Cozy Pro", price: "$12", desc: "Best for growing creators teams.", features: ["Uncapped whiteboards drawing", "Priority AI refinement assists", "Speech waveforms dictation", "Custom widgets order save"] },
            { plan: "Enterprise Team", price: "Custom", desc: "Tailored to larger corporate groups.", features: ["Uncapped workspace entries", "SAML SSO custom auth setups", "Dedicated Postgres support", "Custom metrics analytics logs"] }
          ].map((prc, idx) => (
            <div
              key={idx}
              className={`bg-surface border rounded-[28px] p-6.5 space-y-6 flex flex-col justify-between hover:shadow-md transition relative ${
                idx === 1 ? "border-2 border-primary shadow-sm shadow-primary/5" : "border-border"
              }`}
            >
              {idx === 1 && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-primary to-[#ff7d5e] text-white text-badge-val uppercase rounded-full font-bold">
                  Recommended Choice
                </span>
              )}
              <div className="space-y-4 text-left">
                <span className="text-overline text-slate-450 block font-bold">{prc.plan}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-h1 text-foreground font-black">{prc.price}</span>
                  {idx !== 2 && <span className="text-caption text-muted font-bold">/ month</span>}
                </div>
                <p className="text-caption text-muted leading-relaxed font-semibold">{prc.desc}</p>
                <div className="border-t border-border my-3" />
                <ul className="space-y-2.5 text-caption font-semibold text-muted">
                  {prc.features.map((feat, fidx) => (
                    <li key={fidx} className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-primary" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href="/sign-up"
                className={`h-9.5 w-full font-bold text-btn rounded-xl flex items-center justify-center transition ${
                  idx === 1 ? "bg-primary text-white hover:bg-primary-hover" : "bg-[#f3f1f6] text-[#5E5B5A] hover:bg-slate-100"
                }`}
              >
                Choose {prc.plan}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Testimonials Section */}
      <section className="bg-surface border-y border-border/80 py-20 text-center space-y-10">
        <div className="max-w-lg mx-auto space-y-2 px-6">
          <span className="text-label-val text-primary uppercase tracking-wider block font-bold">Wall of Love</span>
          <h3 className="text-h2 text-foreground font-black">Trusted by creators globally</h3>
        </div>

        <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto px-6">
          {[
            { name: "Jessica Carter", role: "Product Manager, Stripe", text: "The TipTap autosave and Excalidraw whiteboards are flawless. The AI Template builder helps us prototype structures in minutes." },
            { name: "Marcus Chen", role: "Frontend Architect, Vercel", text: "Worko compiles beautifully on React 19. The PostgreSQL calendar events sync dynamically without sluggish API calls." }
          ].map((tst, i) => (
            <div key={i} className="max-w-md bg-background border border-border rounded-2xl p-5 text-left space-y-3.5 shadow-sm flex-grow">
              <p className="text-body-sm text-[#5E5B5A] italic font-semibold leading-relaxed">
                &quot;{tst.text}&quot;
              </p>
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <div className="size-8 rounded-full bg-primary-soft text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                  {tst.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h5 className="text-label-val text-foreground font-bold">{tst.name}</h5>
                  <p className="text-caption text-muted font-semibold">{tst.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center space-y-2.5">
          <span className="text-label-val text-primary uppercase tracking-wider block font-bold">FAQ Section</span>
          <h2 className="text-h2 text-foreground font-black">Frequently Asked Questions</h2>
          <p className="text-body-sm text-muted font-semibold">Everything you need to know about setting up and running your Worko workspaces.</p>
        </div>

        <div className="space-y-3 text-left">
          {LANDING_FAQS.map((fq, idx) => {
            const isOpen = faqOpenIdx === idx;
            return (
              <div key={idx} className="bg-surface border border-border rounded-2xl overflow-hidden transition-all shadow-sm">
                <button
                  onClick={() => setFaqOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4.5 text-body-sm font-bold text-foreground hover:bg-background/20"
                >
                  <span>{fq.q}</span>
                  <span className={`text-muted transition-transform duration-200 ${isOpen ? "rotate-90 text-primary" : ""}`}>
                    &rarr;
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-border bg-background/10"
                    >
                      <p className="p-4.5 text-caption text-[#5E5B5A] leading-relaxed font-semibold">
                        {fq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Dramatic Call to Action Section */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-primary via-[#ff7d5e] to-secondary rounded-[32px] p-8 md:p-12 text-center text-white relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.15),transparent)]" />
          <div className="relative z-10 space-y-6">
            <h3 className="text-h2 font-black leading-tight">Ready to orchestrate your workspace?</h3>
            <p className="text-body-sm opacity-90 max-w-lg mx-auto font-medium">
              Join thousands of developers and managers deploying specs notes, agile tasks, interactive whiteboards, and calendar syncs in seconds.
            </p>
            <div className="flex justify-center pt-2">
              <a
                href="/sign-up"
                className="h-11 px-8 bg-white hover:bg-slate-50 text-[#C23B1E] font-bold text-btn rounded-xl shadow-md flex items-center justify-center hover:-translate-y-0.5 transition duration-200"
              >
                Get Started Instantly
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Modern Multi-Column Footer */}
      <footer className="border-t border-border/80 bg-surface/50 py-16 px-6 mt-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-left">
          
          {/* Logo stack */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-primary to-[#ff7d5e] text-white">
                <Zap size={14} fill="currentColor" />
              </div>
              <span className="text-h4 text-foreground font-black">Worko</span>
            </div>
            <p className="text-caption text-muted font-semibold leading-relaxed">
              The premium knowledge hub and AI workspace manager designed for high-performance builders.
            </p>
          </div>

          {/* Nav columns */}
          <div>
            <h5 className="text-overline text-foreground mb-3.5 font-bold">Workspace modules</h5>
            <ul className="space-y-2 text-caption font-semibold text-muted">
              <li><a href="/notes" className="hover:text-primary transition-colors">Specifications Wiki</a></li>
              <li><a href="/kanban" className="hover:text-primary transition-colors">Kanban Tasks</a></li>
              <li><a href="/calendar" className="hover:text-primary transition-colors">Neon Calendars</a></li>
              <li><a href="/whiteboard" className="hover:text-primary transition-colors">Infinite Whiteboard</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-overline text-foreground mb-3.5 font-bold">Generators</h5>
            <ul className="space-y-2 text-caption font-semibold text-muted">
              <li><a href="/ai-assistant" className="hover:text-primary transition-colors">Gemini Orchestrator</a></li>
              <li><a href="/ai-template-builder" className="hover:text-primary transition-colors">AI Apps Builders</a></li>
              <li><a href="https://github.com/dakshgola/Worko" target="_blank" className="hover:text-primary transition-colors">GitHub Sources</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-overline text-foreground mb-3.5 font-bold">Account</h5>
            <ul className="space-y-2 text-caption font-semibold text-muted">
              <li><a href="/settings" className="hover:text-primary transition-colors">Preferences</a></li>
              <li><a href="/settings" className="hover:text-primary transition-colors">Plans Billing</a></li>
              <li><a href="/sign-in" className="hover:text-primary transition-colors">Sign In</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-border mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-caption font-semibold text-[#c0bac8]">
          <p>&copy; {new Date().getFullYear()} Worko Corp. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="https://github.com/dakshgola/Worko" target="_blank" className="hover:text-primary transition-colors flex items-center gap-1"><Github size={12} /> GitHub Repository</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ==========================================
// 2. AUTHENTICATED SaaS DASHBOARD VIEW
// ==========================================
function DashboardView() {
  const { user } = useUser();

  // Postgres Database Data
  const [dbData, setDbData] = useState<any>(null);
  const [loadingDb, setLoadingDb] = useState(true);

  // LocalStorage / Kanban Store Data
  const [kanbanBoards, setKanbanBoards] = useState<any[]>([]);
  const [streakCount, setStreakCount] = useState(3);

  // Search & Notifications
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Modals visibility toggles
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showCreateBoardModal, setShowCreateBoardModal] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);

  // Widget customizer settings
  const [widgetsList, setWidgetsList] = useState<any[]>(DEFAULT_WIDGETS);

  // Modals Form States
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "Medium", dueDate: new Date().toISOString().split("T")[0] });
  const [eventForm, setEventForm] = useState({ title: "", description: "", date: new Date().toISOString().split("T")[0], time: "10:00", category: "Meeting" });
  const [boardForm, setBoardForm] = useState({ name: "", color: "#FF5A36" });

  const [creatingItem, setCreatingItem] = useState(false);

  // Load Postgres DB metrics
  const fetchDbData = async () => {
    try {
      setLoadingDb(true);
      const res = await getDashboardData();
      if (res.success) {
        setDbData(res);
      }
    } catch (e) {
      console.error("Failed to load postgres dashboard data:", e);
    } finally {
      setLoadingDb(false);
    }
  };

  // Load local kanban assets
  const loadLocalAssets = () => {
    try {
      const savedKanban = localStorage.getItem("worko-kanban");
      if (savedKanban) {
        const parsed = JSON.parse(savedKanban);
        if (parsed.state && parsed.state.boards) {
          setKanbanBoards(parsed.state.boards);
        }
      }

      const savedStreak = localStorage.getItem("worko-streak") || "3";
      setStreakCount(parseInt(savedStreak));

      const savedLayout = localStorage.getItem("worko-dashboard-layout");
      if (savedLayout) setWidgetsList(JSON.parse(savedLayout));
    } catch (e) {
      console.error("Failed to read local kanban assets:", e);
    }
  };

  useEffect(() => {
    fetchDbData();
    loadLocalAssets();
  }, []);

  // Update notifications from database events
  useEffect(() => {
    const notifyList: any[] = [];
    const todayStr = new Date().toISOString().split("T")[0];
    
    if (dbData?.calendarEvents) {
      const todayEvents = dbData.calendarEvents.filter((ev: any) => ev.date === todayStr);
      todayEvents.forEach((ev: any) => {
        notifyList.push({
          id: ev.id,
          title: `Today: ${ev.title}`,
          desc: `Starts at ${ev.time || "12:00"}`,
          type: "calendar",
        });
      });
    }

    if (notifyList.length === 0) {
      notifyList.push({
        id: "welcome_notice",
        title: "Welcome to Worko",
        desc: "Ready to coordinate notes, calendar plans, and collaborative whiteboards.",
        type: "system",
      });
    }

    setNotifications(notifyList);
  }, [dbData]);

  // Global search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const matches: any[] = [];
    const query = searchQuery.toLowerCase();

    if (dbData?.notes) {
      dbData.notes.forEach((n: any) => {
        if (n.title.toLowerCase().includes(query) || (n.plainText && n.plainText.toLowerCase().includes(query))) {
          matches.push({ type: "Note", name: n.title, link: "/notes", id: n.id });
        }
      });
    }

    if (dbData?.pages) {
      dbData.pages.forEach((p: any) => {
        if (p.title.toLowerCase().includes(query)) {
          matches.push({ type: "Page", name: p.title, link: `/spaces`, id: p.id });
        }
      });
    }

    if (dbData?.whiteboards) {
      dbData.whiteboards.forEach((w: any) => {
        if (w.name.toLowerCase().includes(query)) {
          matches.push({ type: "Whiteboard", name: w.name, link: "/whiteboard", id: w.id });
        }
      });
    }

    kanbanBoards.forEach((board: any) => {
      (board.tasks || []).forEach((t: any) => {
        if (t.title.toLowerCase().includes(query)) {
          matches.push({ type: "Kanban Task", name: t.title, link: "/kanban", id: t.id });
        }
      });
    });

    setSearchResults(matches.slice(0, 8));
    setShowSearchResults(true);
  }, [searchQuery, dbData, kanbanBoards]);

  const triggerNotification = (title: string, desc: string) => {
    setNotifications((prev) => [
      { id: Math.random().toString(), title, desc, type: "update" },
      ...prev,
    ]);
  };

  const getProductivityMetrics = () => {
    let totalTasks = 0;
    let completedTasks = 0;

    kanbanBoards.forEach((board: any) => {
      (board.tasks || []).forEach((t: any) => {
        totalTasks++;
        if (t.columnId.toLowerCase().includes("done") || t.completed) {
          completedTasks++;
        }
      });
    });

    const notesCount = dbData?.notes?.length || 0;
    const whiteboardsCount = dbData?.whiteboards?.length || 0;
    const spacesCount = dbData?.spaces?.length || 0;
    const meetingsCount = dbData?.calendarEvents?.length || 0;

    let score = 50;
    if (totalTasks > 0) {
      score += Math.floor((completedTasks / totalTasks) * 30);
    }
    score += notesCount * 2 + whiteboardsCount * 3 + meetingsCount * 4;
    if (score > 100) score = 100;
    if (totalTasks === 0 && notesCount === 0 && whiteboardsCount === 0) score = 0;

    return {
      score,
      totalTasks,
      completedTasks,
      notesCount,
      whiteboardsCount,
      spacesCount,
      meetingsCount,
    };
  };

  const metrics = getProductivityMetrics();

  const getWeeklyStats = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const values = [3, 5, 2, 8, 4, 9, 3];

    if (dbData?.notes) {
      dbData.notes.forEach((n: any) => {
        const dayIdx = (new Date(n.createdAt).getDay() + 6) % 7;
        values[dayIdx] += 1;
      });
    }

    return days.map((day, i) => ({
      day,
      value: Math.min(12, Math.max(1, Math.round(values[i]))),
    }));
  };

  const weeklyStats = getWeeklyStats();
  const maxWeeklyVal = Math.max(...weeklyStats.map((d) => d.value)) || 1;

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    try {
      const saved = localStorage.getItem("worko-kanban");
      let storeState = saved ? JSON.parse(saved) : { state: { boards: [] } };
      let boards = storeState.state?.boards || [];

      if (boards.length === 0) {
        boards = [{
          id: "board_default",
          name: "Main Project",
          color: "#FF5A36",
          icon: "Rocket",
          columns: [
            { id: "todo", title: "Todo", color: "#a78bfa" },
            { id: "inprogress", title: "In Progress", color: "#60a5fa" },
            { id: "done", title: "Done", color: "#34d399" }
          ],
          tasks: []
        }];
      }

      const defaultBoard = boards[0];
      const newTask = {
        id: "task_" + crypto.randomUUID(),
        columnId: defaultBoard.columns[0].id,
        title: taskForm.title,
        description: taskForm.description,
        dueDate: taskForm.dueDate,
        priority: taskForm.priority,
        labels: [],
        checklist: [],
        completed: false,
        createdAt: new Date().toISOString()
      };

      defaultBoard.tasks.push(newTask);
      storeState.state.boards = boards;
      localStorage.setItem("worko-kanban", JSON.stringify(storeState));
      setKanbanBoards(boards);

      const ns = streakCount + 1;
      setStreakCount(ns);
      localStorage.setItem("worko-streak", String(ns));

      setShowCreateTaskModal(false);
      setTaskForm({ title: "", description: "", priority: "Medium", dueDate: new Date().toISOString().split("T")[0] });
      triggerNotification("Task Created", `"${newTask.title}" added to Kanban board.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim()) return;

    try {
      setCreatingItem(true);
      await createEvent({
        title: eventForm.title,
        description: eventForm.description,
        date: eventForm.date,
        time: eventForm.time,
        category: eventForm.category,
      });

      await fetchDbData();
      setShowCreateEventModal(false);
      setEventForm({ title: "", description: "", date: new Date().toISOString().split("T")[0], time: "10:00", category: "Meeting" });
      triggerNotification("Event Scheduled", "Scheduled event in database calendar.");
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingItem(false);
    }
  };

  const handleBoardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardForm.name.trim()) return;

    try {
      const saved = localStorage.getItem("worko-kanban");
      let storeState = saved ? JSON.parse(saved) : { state: { boards: [] } };
      let boards = storeState.state?.boards || [];

      const newBoard = {
        id: "board_" + crypto.randomUUID(),
        name: boardForm.name,
        color: boardForm.color,
        icon: "Briefcase",
        columns: [
          { id: "todo_" + crypto.randomUUID(), title: "Todo", color: "#a78bfa" },
          { id: "inprogress_" + crypto.randomUUID(), title: "In Progress", color: "#60a5fa" },
          { id: "done_" + crypto.randomUUID(), title: "Done", color: "#34d399" }
        ],
        tasks: []
      };

      boards.push(newBoard);
      storeState.state.boards = boards;
      localStorage.setItem("worko-kanban", JSON.stringify(storeState));
      setKanbanBoards(boards);

      setShowCreateBoardModal(false);
      setBoardForm({ name: "", color: "#FF5A36" });
      triggerNotification("Kanban Created", `Created Board: "${newBoard.name}"`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickCreateNote = async () => {
    try {
      setCreatingItem(true);
      await createNote({ title: "Quick Note" });
      window.location.href = "/notes";
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingItem(false);
    }
  };

  const handleQuickCreateWhiteboard = async () => {
    try {
      setCreatingItem(true);
      await createWhiteboard("Quick Drawing");
      window.location.href = "/whiteboard";
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingItem(false);
    }
  };

  const handleQuickCreatePage = async () => {
    try {
      setCreatingItem(true);
      let targetSpaceId = "";
      if (dbData?.spaces && dbData.spaces.length > 0) {
        targetSpaceId = dbData.spaces[0].id;
      } else {
        const space = await createSpace({ name: "Personal Work", color: "Purple" });
        targetSpaceId = space.id;
      }
      await createPage(targetSpaceId, "Draft Plan", "Blank Page");
      window.location.href = `/spaces`;
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingItem(false);
    }
  };

  const handleToggleWidget = (id: string) => {
    const updated = widgetsList.map((w) => w.id === id ? { ...w, visible: !w.visible } : w);
    setWidgetsList(updated);
    localStorage.setItem("worko-dashboard-layout", JSON.stringify(updated));
  };

  const handleMoveWidget = (idx: number, dir: "up" | "down") => {
    const nextIdx = dir === "up" ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= widgetsList.length) return;

    const copy = [...widgetsList];
    const tmp = copy[idx];
    copy[idx] = copy[nextIdx];
    copy[nextIdx] = tmp;

    setWidgetsList(copy);
    localStorage.setItem("worko-dashboard-layout", JSON.stringify(copy));
  };

  const getTimelineActivities = () => {
    const items: any[] = [];
    if (dbData?.notes) {
      dbData.notes.slice(0, 3).forEach((n: any) => {
        items.push({
          title: `Created note "${n.title}"`,
          desc: "Saved in Neon Postgres db",
          icon: StickyNote,
          color: "text-orange-500 bg-orange-50",
          time: new Date(n.createdAt),
        });
      });
    }

    if (dbData?.calendarEvents) {
      dbData.calendarEvents.slice(0, 3).forEach((e: any) => {
        items.push({
          title: `Scheduled event "${e.title}"`,
          desc: `${e.date} at ${e.time}`,
          icon: CalendarDays,
          color: "text-sky-500 bg-sky-50",
          time: new Date(e.createdAt),
        });
      });
    }

    items.sort((a, b) => b.time.getTime() - a.time.getTime());
    return items.slice(0, 5);
  };

  const activities = getTimelineActivities();

  const getActiveTasksList = () => {
    const list: any[] = [];
    kanbanBoards.forEach((board) => {
      (board.tasks || []).forEach((t: any) => {
        if (!t.completed && !t.archived) {
          list.push({ ...t, boardName: board.name });
        }
      });
    });
    return list.slice(0, 5);
  };

  const activeTasksList = getActiveTasksList();

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Layout */}
      <WorkspaceSidebar active="Dashboard" />

      {/* Main panel */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="flex h-[68px] items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-xl shrink-0">
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setShowCustomizer(true)}
              className="btn-outline h-10 px-3.5 flex items-center gap-1.5"
            >
              <Sliders size={13.5} />
              <span className="hidden md:inline">Layout</span>
            </button>

            {/* Notifications panel dropdown triggers */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative btn-icon text-muted"
              >
                <Bell size={17} />
                {notifications.length > 0 && (
                  <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-primary border border-white" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-11 w-72 bg-surface border border-border rounded-xl shadow-lg p-3 z-50 space-y-2"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-border text-body-sm font-bold">
                      <span>Notifications ({notifications.length})</span>
                      <button onClick={() => setShowNotifications(false)}><X size={12} /></button>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {notifications.map((n) => (
                        <div key={n.id} className="p-2 bg-background rounded-lg border border-border text-caption leading-relaxed font-semibold">
                          <div className="font-bold text-primary">{n.title}</div>
                          <div className="text-muted mt-0.5">{n.desc}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleQuickCreateNote}
              className="btn-primary h-10 gap-1.5"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Quick Note</span>
            </button>
          </div>
        </header>

        {/* Dashboard Panels Scroll */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.03
              }
            }
          }}
          className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8"
        >
          {widgetsList.map((widget, widgetIndex) => {
            if (!widget.visible) return null;

            switch (widget.id) {
              case "welcome":
                return (
                  <motion.section
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    key={widget.id}
                    className="flex flex-wrap items-center justify-between gap-6 bg-surface border border-border rounded-[24px] p-6 shadow-sm"
                  >
                    <div className="space-y-1">
                      <p className="text-overline text-primary block font-extrabold">
                        {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                      </p>
                      <h1 className="text-h2 text-foreground">
                        {(() => {
                          const hour = new Date().getHours();
                          if (hour < 12) return "Good morning";
                          if (hour < 17) return "Good afternoon";
                          return "Good evening";
                        })()}, {user?.firstName || "Daksh"} 👋
                      </h1>
                      <p className="text-body-sm text-muted font-semibold">
                        Streak: <span className="font-extrabold text-amber-500 inline-flex items-center"><Flame size={12} fill="currentColor" className="mr-0.5" />{streakCount} days</span>. You have <span className="font-bold text-primary">{metrics.totalTasks - metrics.completedTasks} pending tasks</span> and <span className="font-bold text-primary">{metrics.meetingsCount} events</span> scheduled.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-overline text-muted">Layout</span>
                      <div className="flex bg-background p-0.5 rounded-lg border border-border">
                        <button
                          onClick={() => handleMoveWidget(widgetIndex, "up")}
                          disabled={widgetIndex === 0}
                          className="p-1 text-muted hover:text-primary disabled:opacity-30 font-bold"
                        >
                          &uarr;
                        </button>
                        <button
                          onClick={() => handleMoveWidget(widgetIndex, "down")}
                          disabled={widgetIndex === widgetsList.length - 1}
                          className="p-1 text-muted hover:text-primary disabled:opacity-30 font-bold"
                        >
                          &darr;
                        </button>
                      </div>
                    </div>
                  </motion.section>
                );

              case "quick-actions":
                return (
                  <section key={widget.id} className="space-y-3">
                    <h3 className="text-overline text-primary block font-extrabold">
                      <Zap size={13} className="text-primary inline mr-1" /> Fast Actions
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                      {[
                        { title: "Create Task", action: () => setShowCreateTaskModal(true), icon: SquareKanban, bg: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                        { title: "Schedule Event", action: () => setShowCreateEventModal(true), icon: CalendarDays, bg: "bg-sky-50 text-sky-600 border-sky-100" },
                        { title: "New Note", action: handleQuickCreateNote, icon: StickyNote, bg: "bg-orange-50 text-orange-600 border-orange-100" },
                        { title: "New Page", action: handleQuickCreatePage, icon: PanelTop, bg: "bg-violet-50 text-violet-600 border-violet-100" },
                        { title: "Whiteboard", action: handleQuickCreateWhiteboard, icon: PenTool, bg: "bg-pink-50 text-pink-600 border-pink-100" },
                        { title: "AI Assistant", action: () => { window.location.href = "/ai-assistant"; }, icon: Bot, bg: "bg-amber-50 text-amber-600 border-amber-100" },
                        { title: "Build App", action: () => { window.location.href = "/ai-template-builder"; }, icon: WandSparkles, bg: "bg-rose-50 text-rose-600 border-rose-100" },
                        { title: "Add Board", action: () => setShowCreateBoardModal(true), icon: LayoutDashboard, bg: "bg-indigo-50 text-indigo-600 border-indigo-100" },
                      ].map((act, i) => (
                        <button
                          key={i}
                          onClick={act.action}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition hover:-translate-y-0.5 ${act.bg}`}
                        >
                          <span className="mb-2"><act.icon size={18} strokeWidth={2.25} /></span>
                          <span className="text-label-val font-bold">{act.title}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                );

              case "stats-overview":
                return (
                  <section key={widget.id} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { title: "Notes", value: loadingDb ? "..." : metrics.notesCount, icon: StickyNote, color: "bg-orange-50 text-orange-600" },
                      { title: "Whiteboards", value: loadingDb ? "..." : metrics.whiteboardsCount, icon: PenTool, color: "bg-pink-50 text-pink-600" },
                      { title: "Document Spaces", value: loadingDb ? "..." : metrics.spacesCount, icon: PanelTop, color: "bg-violet-50 text-violet-600" },
                      { title: "Template Apps", value: loadingDb ? "..." : dbData?.generatedApps?.length || 0, icon: WandSparkles, color: "bg-rose-50 text-rose-600" },
                    ].map((st, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 bg-surface border border-border rounded-2xl p-4 shadow-sm"
                      >
                        <div className={`grid size-11 place-items-center rounded-xl shrink-0 ${st.color}`}>
                          <st.icon size={18} strokeWidth={2.25} />
                        </div>
                        <div>
                          <p className="text-h3 font-black text-foreground">{st.value}</p>
                          <p className="text-label-val text-muted">{st.title}</p>
                        </div>
                      </div>
                    ))}
                  </section>
                );

              case "productivity-metrics":
                return (
                  <section key={widget.id} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Score widget */}
                    <div className="bg-surface border border-border rounded-[24px] p-5 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="text-label-val text-primary uppercase tracking-wider block mb-1">Productivity score</h4>
                        <p className="text-caption text-muted">Weighted metrics track</p>
                      </div>

                      <div className="flex justify-center items-center py-6">
                        <div className="relative size-32">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="50" stroke="#f1f0f5" strokeWidth="10" fill="transparent" />
                            <circle
                              cx="64"
                              cy="64"
                              r="50"
                              stroke="url(#gradientScore)"
                              strokeWidth="10"
                              fill="transparent"
                              strokeDasharray={`${2 * Math.PI * 50}`}
                              strokeDashoffset={`${2 * Math.PI * 50 * (1 - metrics.score / 100)}`}
                              strokeLinecap="round"
                            />
                            <defs>
                              <linearGradient id="gradientScore" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FF5A36" />
                                <stop offset="100%" stopColor="#ff7d5e" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-h2 text-foreground">{metrics.score}</span>
                            <span className="text-overline text-muted block">Score</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between text-center border-t border-border pt-3 text-caption font-bold">
                        <div>
                          <p className="text-success">{metrics.completedTasks}</p>
                          <p className="text-[9px] text-muted uppercase">Completed</p>
                        </div>
                        <div className="border-l border-border" />
                        <div>
                          <p className="text-primary">{metrics.meetingsCount}</p>
                          <p className="text-[9px] text-muted uppercase">Events</p>
                        </div>
                      </div>
                    </div>

                    {/* SVG Weekly Analytics */}
                    <div className="lg:col-span-2 bg-surface border border-border rounded-[24px] p-5 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="text-label-val text-primary uppercase tracking-wider block mb-1">Weekly Metrics</h4>
                        <p className="text-caption text-muted">Daily activities checklist</p>
                      </div>

                      <div className="flex items-end justify-between h-40 pt-6 px-4">
                        {weeklyStats.map((item, index) => {
                          const heightPct = (item.value / maxWeeklyVal) * 100;
                          return (
                            <div key={index} className="flex flex-col items-center gap-2 group flex-1">
                              <div className="relative w-7 bg-background rounded-t-lg h-32 flex items-end overflow-hidden border border-border/50">
                                <div
                                  className="w-full bg-gradient-to-t from-primary to-[#ff7d5e] rounded-t-md transition-all duration-700"
                                  style={{ height: `${heightPct}%` }}
                                />
                                <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 bg-foreground text-surface text-[9px] px-1.5 py-0.5 rounded font-mono shadow mb-1">
                                  {item.value}
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-muted uppercase">{item.day}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                );

              case "tasks-today":
                return (
                  <section key={widget.id} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-surface border border-border rounded-[24px] p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <div>
                          <h4 className="text-label-val text-primary uppercase tracking-wider block">Today&apos;s Focus Tasks</h4>
                          <p className="text-caption text-muted">Important priorities agenda</p>
                        </div>
                        <button onClick={() => { window.location.href = "/kanban"; }} className="text-caption font-bold text-primary hover:underline">
                          Open Kanban &rarr;
                        </button>
                      </div>

                      {activeTasksList.length === 0 ? (
                        <div className="text-center py-8 text-caption text-muted space-y-2 font-semibold">
                          <CheckSquare size={32} className="mx-auto text-slate-350" />
                          <p>No active tasks in columns. Add one below!</p>
                          <button onClick={() => setShowCreateTaskModal(true)} className="text-primary font-semibold hover:underline">
                            Add a task
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {activeTasksList.map((task) => (
                            <div
                              key={task.id}
                              className="flex items-center gap-3 p-3 bg-background/50 border border-border rounded-xl hover:border-primary transition"
                            >
                              <CheckSquare size={16} className="text-emerald-500 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-body-sm font-bold truncate text-foreground">{task.title}</p>
                                <p className="text-caption text-muted truncate">{task.description || "No description"}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="px-2 py-0.5 bg-background text-muted text-caption rounded font-semibold border border-border">{task.dueDate}</span>
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-caption rounded font-bold uppercase">{task.priority}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* AI assistant box */}
                    <div className="bg-gradient-to-br from-primary via-[#ff7d5e] to-pink-500 text-white rounded-[24px] p-5 shadow-lg flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-white/10 px-2.5 py-1 text-badge-val uppercase text-white/90">
                            AI Assistant
                          </span>
                          <Sparkles size={16} className="text-[#ffe6a7] animate-pulse" />
                        </div>
                        <h3 className="text-h3 font-black tracking-tight leading-snug">
                          Cozy command suggestions
                        </h3>
                        <p className="text-caption leading-relaxed text-white/70">
                          Query files, templates, or tasks with voice stream assistant:
                        </p>
                      </div>

                      <div className="space-y-1.5 my-4">
                        {[
                          "Summarize note reflections",
                          "Plan today's Kanban board",
                          "Review scheduled meeting notes",
                        ].map((rec, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              window.location.href = `/ai-assistant?prompt=${encodeURIComponent(rec)}`;
                            }}
                            className="w-full text-left bg-white/10 hover:bg-white/15 px-3 py-2 rounded-xl text-caption font-bold text-white transition flex items-center justify-between"
                          >
                            <span>{rec}</span>
                            <ArrowUpRight size={11} className="text-white/60" />
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => { window.location.href = "/ai-assistant"; }}
                        className="h-8.5 w-full bg-white text-primary font-bold rounded-xl text-btn flex items-center justify-center gap-1 hover:bg-[#f6f3ff] transition"
                      >
                        Ask AI Assistant
                      </button>
                    </div>
                  </section>
                );

              case "calendar-upcoming":
                return (
                  <section key={widget.id} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-surface border border-border rounded-[24px] p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <div>
                          <h4 className="text-label-val text-primary uppercase tracking-wider block">Upcoming Schedule</h4>
                          <p className="text-caption text-muted">Upcoming meetings &amp; reminders</p>
                        </div>
                        <button onClick={() => { window.location.href = "/calendar"; }} className="text-caption font-bold text-primary hover:underline">
                          Open Calendar &rarr;
                        </button>
                      </div>

                      {!dbData?.calendarEvents || dbData.calendarEvents.length === 0 ? (
                        <div className="text-center py-8 text-caption text-muted space-y-2 font-semibold">
                          <CalendarDays size={32} className="mx-auto text-slate-350" />
                          <p>No calendar events found.</p>
                          <button onClick={() => setShowCreateEventModal(true)} className="text-primary font-semibold hover:underline">
                            Schedule event
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {dbData.calendarEvents.slice(0, 4).map((ev: any) => (
                            <div key={ev.id} className="p-3 bg-background/40 border border-border rounded-xl flex flex-col justify-between">
                              <div>
                                <span className="px-2 py-0.5 bg-sky-50 text-sky-600 border border-sky-100 text-badge-val rounded mb-2 inline-block">
                                  {ev.category}
                                </span>
                                <h5 className="text-body-sm font-bold text-foreground truncate">{ev.title}</h5>
                                <p className="text-caption text-muted mt-0.5 line-clamp-1">{ev.description || "No description"}</p>
                              </div>
                              <div className="flex items-center justify-between border-t border-border/50 pt-2 mt-3 text-caption font-bold text-muted">
                                <span>{ev.date} at {ev.time}</span>
                                <span className="text-[8px] bg-red-50 text-red-600 px-1.5 rounded">{ev.priority}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-label-val text-primary uppercase tracking-wider block">AI Insights</h4>
                        <p className="text-caption text-muted">Daily deduced deductions</p>
                      </div>
                      <div className="space-y-3">
                        {[
                          { text: `You completed ${metrics.completedTasks} tasks recently.`, icon: Info },
                          { text: `Your notes database contains ${metrics.notesCount} entries.`, icon: Info },
                          { text: `You have ${metrics.meetingsCount} events this month.`, icon: Info },
                        ].map((ins, i) => (
                          <div key={i} className="flex gap-2.5 items-start text-caption bg-background p-2.5 rounded-xl border border-border">
                            <ins.icon size={14} className="text-primary shrink-0 mt-0.5" />
                            <p className="text-foreground font-semibold">{ins.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                );

              case "favorites-panel":
                return (
                  <section key={widget.id} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-surface border border-border rounded-[24px] p-5 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-label-val text-primary uppercase tracking-wider block">Recently Visited</h4>
                        <p className="text-caption text-muted">Pick up where you left off</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {dbData?.notes?.slice(0, 2).map((n: any) => (
                          <button key={n.id} onClick={() => { window.location.href = "/notes"; }} className="flex items-center gap-2.5 p-2.5 bg-background/50 border border-border hover:bg-background rounded-xl text-body-sm font-bold transition">
                            <StickyNote size={14} className="text-orange-500 shrink-0" />
                            <span className="truncate flex-1 text-left">{n.title}</span>
                          </button>
                        ))}
                        {dbData?.whiteboards?.slice(0, 2).map((w: any) => (
                          <button key={w.id} onClick={() => { window.location.href = "/whiteboard"; }} className="flex items-center gap-2.5 p-2.5 bg-background/50 border border-border hover:bg-background rounded-xl text-body-sm font-bold transition">
                            <PenTool size={14} className="text-pink-500 shrink-0" />
                            <span className="truncate flex-1 text-left">{w.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-surface border border-border rounded-[24px] p-5 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-label-val text-primary uppercase tracking-wider block">Favorites &amp; Pins</h4>
                        <p className="text-caption text-muted">Favorited notes/apps</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {dbData?.notes?.filter((n: any) => n.isFavorite).slice(0, 2).map((fav: any) => (
                          <button key={fav.id} onClick={() => { window.location.href = "/notes"; }} className="flex items-center gap-2.5 p-2.5 bg-yellow-50/20 border border-yellow-100 rounded-xl text-body-sm font-bold text-yellow-800 transition">
                            <Star size={13.5} fill="#e49a3a" className="text-[#e49a3a] shrink-0" />
                            <span className="truncate flex-1 text-left">{fav.title}</span>
                          </button>
                        ))}
                        {dbData?.generatedApps?.filter((a: any) => a.isPinned).slice(0, 2).map((app: any) => (
                          <button key={app.id} onClick={() => { window.location.href = "/ai-template-builder"; }} className="flex items-center gap-2.5 p-2.5 bg-[#eeeaff]/40 border border-[#cfc8f5] rounded-xl text-body-sm font-bold text-primary transition">
                            <WandSparkles size={13.5} className="text-primary shrink-0" />
                            <span className="truncate flex-1 text-left">{app.appName}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>
                );

              case "activity-insights":
                return (
                  <section key={widget.id} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-surface border border-border rounded-[24px] p-5 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-label-val text-primary uppercase tracking-wider block">Activity Log Timeline</h4>
                        <p className="text-caption text-muted">Real-time operations timeline</p>
                      </div>
                      {activities.length === 0 ? (
                        <p className="text-body-sm text-muted italic font-semibold">No recent timeline activities.</p>
                      ) : (
                        <div className="relative border-l border-border pl-4 ml-2.5 space-y-4">
                          {activities.map((act, i) => (
                            <div key={i} className="relative">
                              <span className="absolute -left-7 top-0.5 size-5 rounded-full border border-white bg-white shadow-sm flex items-center justify-center">
                                <act.icon size={11} className="text-[#5E5B5A]" />
                              </span>
                              <div className="text-caption font-semibold">
                                <p className="font-bold text-foreground">{act.title}</p>
                                <p className="text-slate-400 mt-0.5">{act.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* AI Chat History */}
                    <div className="bg-surface border border-border rounded-[24px] p-5 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-label-val text-primary uppercase tracking-wider block">AI Chats</h4>
                        <p className="text-caption text-muted">Conversational archives</p>
                      </div>
                      {!dbData?.chats || dbData.chats.length === 0 ? (
                        <div className="text-caption text-muted text-center py-6 font-semibold">No recent chats.</div>
                      ) : (
                        <div className="space-y-2">
                          {dbData.chats.slice(0, 3).map((chat: any) => (
                            <div key={chat.id} className="p-3 bg-background border border-border rounded-xl flex items-center justify-between">
                              <p className="text-body-sm font-bold truncate flex-1 pr-2">{chat.title}</p>
                              <button onClick={() => { window.location.href = "/ai-assistant"; }} className="px-2.5 py-1 bg-primary-soft text-primary rounded-lg text-badge-val font-bold">
                                Continue
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>
                );

              default:
                return null;
            }
          })}
        </motion.div>
      </div>

      {/* Widget Layout Customizer Drawer */}
      <AnimatePresence>
        {showCustomizer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="w-[320px] bg-surface h-full shadow-2xl p-6 flex flex-col justify-between border-l border-border"
            >
              <div>
                <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                  <div>
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <Sliders size={16} className="text-primary" />
                      Dashboard Widgets
                    </h3>
                    <p className="text-[10px] text-muted mt-0.5 font-semibold">Toggle visibilities &amp; layout order</p>
                  </div>
                  <button onClick={() => setShowCustomizer(false)} className="p-1 rounded-lg text-muted hover:bg-slate-100">
                    <X size={15} />
                  </button>
                </div>

                <div className="space-y-2.5 overflow-y-auto max-h-[70vh] pr-1">
                  {widgetsList.map((w, index) => (
                    <div key={w.id} className="p-3 bg-background border border-border rounded-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={w.visible}
                          onChange={() => handleToggleWidget(w.id)}
                          className="rounded text-primary focus:ring-primary size-4"
                        />
                        <span className="text-body-sm font-semibold text-foreground">{w.name}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button onClick={() => handleMoveWidget(index, "up")} disabled={index === 0} className="p-1 text-muted hover:text-primary disabled:opacity-30 font-bold">
                          &uarr;
                        </button>
                        <button onClick={() => handleMoveWidget(index, "down")} disabled={index === widgetsList.length - 1} className="p-1 text-muted hover:text-primary disabled:opacity-30 font-bold">
                          &darr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => setShowCustomizer(false)} className="w-full btn-primary">
                Save Dashboard Layout
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creation forms dialog popups */}
      <AnimatePresence>
        {showCreateTaskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.form
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleTaskSubmit}
              className="bg-surface rounded-2xl border-2 border-primary w-full max-w-md p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h4 className="font-black text-sm text-foreground flex items-center gap-1.5">
                  <SquareKanban size={16} className="text-primary" />
                  Create Kanban Task
                </h4>
                <button type="button" onClick={() => setShowCreateTaskModal(false)}><X size={15} /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-label-val uppercase text-muted mb-1">Task Title</label>
                  <input
                    type="text"
                    required
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    placeholder="Review pricing structure..."
                    className="input-cozy"
                  />
                </div>
                <div>
                  <label className="block text-label-val uppercase text-muted mb-1">Description</label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    placeholder="Detail notes..."
                    className="w-full h-16 p-2 rounded-lg border border-border bg-background text-input-val outline-none resize-none focus:border-primary text-foreground"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-label-val uppercase text-muted mb-1">Due Date</label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      className="w-full h-10 px-2 rounded-lg border border-border bg-background text-input-val outline-none text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-label-val uppercase text-muted mb-1">Priority</label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                      className="w-full h-10 px-2 rounded-lg border border-border bg-background text-input-val outline-none text-[#5E5B5A]"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <button type="button" onClick={() => setShowCreateTaskModal(false)} className="btn-outline h-9 px-4 text-btn text-muted">Cancel</button>
                <button type="submit" className="btn-primary h-9 px-4 text-btn">Add Task</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateEventModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.form
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleEventSubmit}
              className="bg-surface rounded-2xl border-2 border-primary w-full max-w-md p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h4 className="font-black text-sm text-foreground flex items-center gap-1.5">
                  <CalendarDays size={16} className="text-primary" />
                  Schedule Calendar Event
                </h4>
                <button type="button" onClick={() => setShowCreateEventModal(false)}><X size={15} /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-label-val uppercase text-muted mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    placeholder="Strategic roadmap sync..."
                    className="input-cozy"
                  />
                </div>
                <div>
                  <label className="block text-label-val uppercase text-muted mb-1">Description</label>
                  <input
                    type="text"
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    placeholder="Sync link details..."
                    className="input-cozy"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-label-val uppercase text-muted mb-1">Date</label>
                    <input
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className="w-full h-10 px-2 rounded-lg border border-border bg-background text-input-val outline-none text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-label-val uppercase text-muted mb-1">Time</label>
                    <input
                      type="text"
                      value={eventForm.time}
                      onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                      placeholder="10:00"
                      className="w-full h-10 px-2 rounded-lg border border-border bg-background text-input-val outline-none text-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-label-val uppercase text-muted mb-1">Category</label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    className="w-full h-10 px-2 rounded-lg border border-border bg-background text-input-val outline-none text-[#5E5B5A]"
                  >
                    <option value="Meeting">Meeting</option>
                    <option value="Reminder">Reminder</option>
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <button type="button" onClick={() => setShowCreateEventModal(false)} className="btn-outline h-9 px-4 text-btn text-muted">Cancel</button>
                <button type="submit" disabled={creatingItem} className="btn-primary h-9 px-4 text-btn">
                  {creatingItem ? <Loader2 size={12} className="animate-spin" /> : "Add Event"}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateBoardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.form
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleBoardSubmit}
              className="bg-surface rounded-2xl border-2 border-primary w-full max-w-sm p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h4 className="font-black text-sm text-foreground flex items-center gap-1.5">
                  <LayoutDashboard size={16} className="text-primary" />
                  Create Kanban Board
                </h4>
                <button type="button" onClick={() => setShowCreateBoardModal(false)}><X size={15} /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-label-val uppercase text-muted mb-1">Board Name</label>
                  <input
                    type="text"
                    required
                    value={boardForm.name}
                    onChange={(e) => setBoardForm({ ...boardForm, name: e.target.value })}
                    placeholder="Design Sprint #2..."
                    className="input-cozy"
                  />
                </div>
                <div>
                  <label className="block text-label-val uppercase text-muted mb-1">Accent Color</label>
                  <div className="flex gap-2">
                    {["#FF5A36", "#3e9b68", "#ef6688", "#e49a3a", "#3b82f6"].map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setBoardForm({ ...boardForm, color: hex })}
                        className="size-6 rounded-full border border-white relative flex items-center justify-center"
                        style={{ backgroundColor: hex }}
                      >
                        {boardForm.color === hex && <Check size={11} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <button type="button" onClick={() => setShowCreateBoardModal(false)} className="btn-outline h-9 px-4 text-btn text-muted">Cancel</button>
                <button type="submit" className="btn-primary h-9 px-4 text-btn">Add Board</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

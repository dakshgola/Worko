"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
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
  Check,
  Clock,
  Sparkles,
  ArrowUpRight,
  X,
  Info,
  Flame,
  CheckSquare,
  Globe,
  Users,
  Layers,
  Sparkle,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Play,
  Heart,
  Github,
  ChevronRight,
  ChevronLeft,
  Sliders,
  Star,
} from "lucide-react";
import { getDashboardData } from "@/lib/dashboard/actions";
import { createNote } from "@/lib/notes/actions";
import { createWhiteboard } from "@/lib/whiteboard/actions";
import { createSpace, createPage } from "@/lib/spaces/actions";
import { createEvent } from "@/lib/calendar/actions";

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
      <div className="min-h-screen bg-[#f8f8fb] flex flex-col items-center justify-center gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="text-[#6c5ce7]"
        >
          <Zap size={32} fill="currentColor" />
        </motion.div>
        <span className="text-xs font-semibold text-[#8b879c] animate-pulse">Initializing Worko...</span>
      </div>
    );
  }

  if (!isSignedIn) {
    return <LandingPage />;
  }

  return <DashboardView />;
}

// ==========================================
// 1. PUBLIC LANDING PAGE
// ==========================================
function LandingPage() {
  const [demoActiveTab, setDemoActiveTab] = useState<"notes" | "whiteboard" | "kanban">("notes");
  const [aiChatVal, setAiChatVal] = useState("");
  const [aiReplies, setAiReplies] = useState<string[]>([
    "Hello! I can compile today's schedules, refine notes, or generate mini habit tracker apps. Describe your request."
  ]);
  const [typing, setTyping] = useState(false);

  const handleDemoAiSubmit = () => {
    if (!aiChatVal.trim()) return;
    const userQuery = aiChatVal;
    setAiReplies((prev) => [...prev, `User: ${userQuery}`]);
    setAiChatVal("");
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      setAiReplies((prev) => [
        ...prev,
        `AI: Understood! I have processed "${userQuery}" and set up a workspace reflection layout inside your dashboard.`
      ]);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#fafafc] text-[#292832] font-sans selection:bg-[#ded9ff] selection:text-[#3f3690] overflow-hidden relative">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-[#c7d2fe]/30 to-[#f472b6]/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#d8b4fe]/25 to-[#818cf8]/25 blur-[120px] pointer-events-none" />

      {/* Navigation header */}
      <header className="sticky top-0 z-50 border-b border-[#efedf4] bg-white/75 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#6c5ce7] to-[#8b5cf6] text-white shadow-[0_6px_16px_rgba(108,92,231,0.25)]">
            <Zap size={16} fill="currentColor" />
          </div>
          <div>
            <span className="font-extrabold text-[17px] tracking-tight text-[#282633]">Worko</span>
            <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-[#6c5ce7]/10 text-[#6c5ce7] text-[8.5px] font-bold uppercase tracking-wider">AI Hub</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#716c7d]">
          <a href="#features" className="hover:text-[#5143bd] transition">Features</a>
          <a href="#demo" className="hover:text-[#5143bd] transition">Interactive Showcase</a>
          <a href="#pricing" className="hover:text-[#5143bd] transition">Pricing</a>
          <a href="https://github.com/dakshgola/Worko" target="_blank" className="hover:text-[#5143bd] transition flex items-center gap-1">
            <Github size={13} /> GitHub
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a href="/sign-in" className="text-xs font-extrabold text-[#716c7d] hover:text-[#282633] transition px-3 py-2">
            Sign In
          </a>
          <a
            href="/sign-up"
            className="flex items-center gap-1.5 h-9.5 rounded-xl bg-gradient-to-r from-[#6c5ce7] to-[#8b5cf6] px-4.5 text-xs font-bold text-white shadow-[0_6px_16px_rgba(102,87,220,0.22)] transition hover:-translate-y-0.5"
          >
            Get Started <ArrowRight size={13} />
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 lg:pt-24 text-center space-y-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="mx-auto max-w-fit rounded-full bg-white border border-[#e8e7ef] px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#6c5ce7] shadow-sm flex items-center gap-1.5 animate-pulse">
            <Sparkles size={11} fill="currentColor" /> Workspace 2.0 is Live
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.08] text-[#282633] max-w-4xl mx-auto">
            The AI Workspace Built For{" "}
            <span className="bg-gradient-to-r from-[#6c5ce7] via-[#8b5cf6] to-[#f472b6] bg-clip-text text-transparent">
              Modern Teams
            </span>
          </h1>

          <p className="text-sm md:text-[16px] leading-relaxed text-[#777281] font-semibold max-w-2xl mx-auto">
            Plan projects, manage tasks, collaborate in real-time, generate AI workflows, take notes, build whiteboards, chat with AI and organize everything in one beautiful workspace.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-3 pt-2"
        >
          <a
            href="/sign-up"
            className="h-11 px-7 rounded-xl bg-gradient-to-r from-[#6c5ce7] to-[#8b5cf6] font-extrabold text-xs text-white shadow-lg flex items-center justify-center hover:-translate-y-0.5 transition"
          >
            Get Started Free
          </a>
          <a
            href="#demo"
            className="h-11 px-7 rounded-xl bg-white border border-[#e5e2ed] font-extrabold text-xs text-[#716c7d] flex items-center justify-center gap-1.5 hover:bg-slate-50 transition"
          >
            <Play size={12} fill="currentColor" /> Watch Interactive Demo
          </a>
        </motion.div>

        {/* Dashboard Preview Mock Container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative max-w-5xl mx-auto pt-10"
        >
          <div className="rounded-2xl border-4 border-white bg-white/40 backdrop-blur-xl shadow-2xl overflow-hidden aspect-[16/10] border-slate-200/50 flex flex-col">
            {/* Header window control */}
            <div className="h-8.5 bg-slate-50/80 border-b border-[#efedf4] px-4 flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-red-400" />
              <span className="size-2.5 rounded-full bg-yellow-400" />
              <span className="size-2.5 rounded-full bg-green-400" />
              <div className="mx-auto text-[9.5px] font-bold text-slate-400 uppercase tracking-widest bg-white border border-slate-100 px-3 py-0.5 rounded-md">
                preview.worko.app
              </div>
            </div>
            
            {/* Mock Dashboard Layout */}
            <div className="flex-1 flex bg-[#f8f8fb]">
              <aside className="w-40 border-r border-[#efedf4] bg-white p-3 space-y-2 hidden sm:block text-left">
                <span className="block text-[8px] font-black tracking-widest text-[#aaa6b5] uppercase mb-3">Workspace</span>
                {["Overview", "AI Assistant", "Calendar", "Notes", "Whiteboard"].map((lnk, i) => (
                  <div key={lnk} className={`h-8 rounded-lg flex items-center gap-2 px-2 text-[10px] font-extrabold ${i === 0 ? "bg-[#eeeaff] text-[#6c5ce7]" : "text-[#777281]"}`}>
                    <span className="size-1.5 rounded-full bg-[#6c5ce7]" />
                    {lnk}
                  </div>
                ))}
              </aside>

              <main className="flex-grow p-4 text-left space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Dashboard preview</span>
                    <h4 className="text-sm font-black text-[#282633]">Good morning, Team! 👋</h4>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded font-extrabold">Active project</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white border border-[#efedf4] p-3 rounded-xl shadow-sm space-y-1">
                    <span className="text-[9px] font-bold text-slate-400">Total Notes</span>
                    <p className="text-lg font-black text-[#282633]">12</p>
                  </div>
                  <div className="bg-white border border-[#efedf4] p-3 rounded-xl shadow-sm space-y-1">
                    <span className="text-[9px] font-bold text-slate-400">Whiteboards</span>
                    <p className="text-lg font-black text-[#282633]">4</p>
                  </div>
                  <div className="bg-white border border-[#efedf4] p-3 rounded-xl shadow-sm space-y-1">
                    <span className="text-[9px] font-bold text-slate-400">Productivity Score</span>
                    <p className="text-lg font-black text-[#6c5ce7]">84%</p>
                  </div>
                </div>

                <div className="bg-white border border-[#efedf4] p-4 rounded-xl shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>Weekly activity analytics</span>
                    <span>Note logs</span>
                  </div>
                  <div className="flex items-end justify-between h-20 pt-2">
                    {[3, 5, 2, 8, 4, 9, 3].map((val, idx) => (
                      <div key={idx} className="w-6 bg-slate-50 border border-slate-100 rounded-t h-full flex items-end">
                        <div className="w-full bg-gradient-to-t from-[#6c5ce7] to-[#8b5cf6] rounded-t" style={{ height: `${val * 10}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </main>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Badges badges system */}
      <section className="bg-white border-y border-[#efedf4] py-8 mt-16 text-center">
        <div className="max-w-6xl mx-auto px-6 space-y-4">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#b0a9bd]">
            Built with modern architecture stack
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Next.js", "React 19", "TypeScript", "Tailwind CSS", "Clerk Security",
              "Drizzle ORM", "Liveblocks", "AssemblyAI", "Gemini AI"
            ].map((tech) => (
              <span
                key={tech}
                className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-[#e5e2ed] text-[10.5px] font-black text-[#6f6b7b] hover:border-[#6c5ce7] hover:text-[#6c5ce7] hover:bg-[#eeeaff]/30 transition"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-[10px] font-extrabold text-[#6c5ce7] uppercase tracking-wider">Features grid</span>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[#282633]">
            Everything you need in a unified knowledge workspace
          </h2>
          <p className="text-xs text-[#777281]">
            Ditch multiple application subscriptions. Access everything inside Worko.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "AI Assistant", desc: "Streaming conversational answers and instant database actions.", icon: Bot, bg: "bg-amber-500" },
            { title: "Neon Calendar", desc: "Interactive drag-and-drop agendas synced directly to PostgreSQL.", icon: CalendarDays, bg: "bg-sky-500" },
            { title: "Kanban Board", desc: "Task tracking, priorities levels, and check-list logs.", icon: SquareKanban, bg: "bg-emerald-500" },
            { title: "Collab Notes", desc: "TipTap rich text editor with auto-saves, favors and duplication.", icon: StickyNote, bg: "bg-orange-500" },
            { title: "Whiteboard Canvas", desc: "Interactive SVG vectors drawing tool with templates and layouts.", icon: PenTool, bg: "bg-pink-500" },
            { title: "Spaces Wiki", desc: "Nest folder-like spaces and sub-pages to build wikis.", icon: PanelTop, bg: "bg-violet-500" },
            { title: "AI Builder", desc: "Describe custom trackers and generate structural JSON configs.", icon: WandSparkles, bg: "bg-rose-500" },
            { title: "Global Search", desc: "Instant matching overlay across notes, pages, and checklists.", icon: Search, bg: "bg-indigo-500" },
          ].map((feat, i) => (
            <div
              key={i}
              className="bg-white border border-[#efedf4] rounded-2xl p-5 shadow-sm hover:shadow-md transition hover:-translate-y-0.5 space-y-3 group"
            >
              <div className={`size-10 rounded-xl flex items-center justify-center text-white ${feat.bg} shadow-sm group-hover:scale-105 transition`}>
                <feat.icon size={18} strokeWidth={2.25} />
              </div>
              <h4 className="font-extrabold text-sm text-[#282633]">{feat.title}</h4>
              <p className="text-[11px] text-[#777281] leading-relaxed font-semibold">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Showcase */}
      <section id="demo" className="max-w-6xl mx-auto px-6 py-16 space-y-8 bg-white border border-[#efedf4] rounded-3xl shadow-sm">
        <div className="text-center space-y-2 max-w-lg mx-auto">
          <span className="text-[10px] font-extrabold text-[#6c5ce7] uppercase tracking-wider">Showcase</span>
          <h3 className="text-2xl font-black tracking-tight text-[#282633]">Try the AI Assistant simulation</h3>
          <p className="text-xs text-[#777281]">Type query ideas to simulate instant voice translation streams.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-4xl mx-auto pt-4">
          <div className="space-y-4">
            <h4 className="text-base font-black text-[#282633]">Unified AI Assistant interface</h4>
            <p className="text-[11.5px] text-[#6f6b7b] leading-relaxed font-semibold">
              Speak into your microphone or key in commands. Worko AI Assistant transcribes, processes workspace requests, and generates dynamic confirmations on the fly.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setAiChatVal("Schedule strategic planning tomorrow at 10:00")}
                className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-lg hover:bg-amber-100 transition"
              >
                &quot;Schedule sync&quot;
              </button>
              <button
                onClick={() => setAiChatVal("Create a priority research note draft")}
                className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold rounded-lg hover:bg-indigo-100 transition"
              >
                &quot;Create note&quot;
              </button>
            </div>
          </div>

          <div className="bg-[#f8f8fb] border border-[#efedf4] rounded-2xl p-4 space-y-3 text-left">
            <div className="flex items-center gap-2 pb-2 border-b border-[#efedf4]">
              <span className="grid size-7 place-items-center rounded-lg bg-amber-100 text-amber-600"><Bot size={13} /></span>
              <span className="text-[10.5px] font-extrabold text-[#282633]">Worko Bot</span>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto text-[10.5px] leading-relaxed">
              {aiReplies.map((r, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl font-semibold ${
                    r.startsWith("User:") ? "bg-[#6c5ce7] text-white ml-6" : "bg-white border border-[#efedf4] mr-6"
                  }`}
                >
                  {r}
                </div>
              ))}
              {typing && <div className="text-[9.5px] text-slate-400 italic">Gemini is typing...</div>}
            </div>

            <div className="flex gap-2 border-t border-[#efedf4] pt-2">
              <input
                type="text"
                placeholder="Ask simulator..."
                value={aiChatVal}
                onChange={(e) => setAiChatVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDemoAiSubmit()}
                className="flex-1 bg-white border border-[#e5e2ed] rounded-lg px-2 text-xs outline-none focus:border-[#bdb4f1]"
              />
              <button
                onClick={handleDemoAiSubmit}
                className="px-3.5 bg-[#6c5ce7] hover:bg-[#5143bd] text-white font-bold rounded-lg text-xs"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-[10px] font-extrabold text-[#6c5ce7] uppercase tracking-wider">Pricing plan</span>
          <h3 className="text-2xl md:text-3xl font-black tracking-tight text-[#282633]">Pricing plans designed for everyone</h3>
          <p className="text-xs text-[#777281]">Start free, scale boundaries as your group processes grow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { plan: "Free Tier", price: "$0", desc: "Perfect to kickstart wiki entries & notes database.", features: ["Unlimited collaborative notes", "Up to 5 Whiteboards", "Postgres Calendar Events"] },
            { plan: "Pro Plan", price: "$12", desc: "Best for growing teams seeking custom layouts.", features: ["Everything in Free Tier", "Unlimited AI Assist actions", "Uncapped spaces & custom app templates", "Priority support"] },
            { plan: "Enterprise", price: "Custom", desc: "Tailored to larger collaborative businesses.", features: ["Uncapped usage", "Dedicated account managers", "Custom analytics integrations", "SAML SSO auth configurations"] }
          ].map((prc, idx) => (
            <div
              key={idx}
              className={`bg-white border rounded-3xl p-6 space-y-6 flex flex-col justify-between hover:shadow-md transition relative ${
                idx === 1 ? "border-2 border-[#6c5ce7] shadow-sm" : "border-[#efedf4]"
              }`}
            >
              {idx === 1 && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-[#6c5ce7] to-[#8b5cf6] text-white text-[8px] font-black uppercase rounded-full tracking-widest">
                  Popular Choice
                </span>
              )}
              <div className="space-y-4">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{prc.plan}</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-[#282633]">{prc.price}</span>
                  {idx !== 2 && <span className="text-[11px] text-[#777281] font-bold">/ month</span>}
                </div>
                <p className="text-[11px] text-[#777281] font-semibold">{prc.desc}</p>
                <div className="border-t border-[#efedf4]/80 my-3" />
                <ul className="space-y-2.5 text-[11px] font-semibold text-[#6f6b7b]">
                  {prc.features.map((feat, fidx) => (
                    <li key={fidx} className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-[#6c5ce7]" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href="/sign-up"
                className={`h-9.5 w-full font-extrabold text-xs rounded-xl flex items-center justify-center transition ${
                  idx === 1 ? "bg-[#6c5ce7] text-white" : "bg-[#f3f1f6] text-[#716c7d] hover:bg-slate-100"
                }`}
              >
                Choose {prc.plan}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white border-y border-[#efedf4] py-16 text-center space-y-10">
        <div className="max-w-lg mx-auto space-y-2 px-6">
          <span className="text-[10px] font-extrabold text-[#6c5ce7] uppercase tracking-wider">Wall of Love</span>
          <h3 className="text-xl md:text-2xl font-black text-[#282633]">Trusted by developers globally</h3>
        </div>

        <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto px-6">
          {[
            { name: "Jessica Carter", role: "Product Manager, Stripe", text: "The TipTap autosave and Excalidraw whiteboards are flawless. The AI Template builder helps us prototype structures in minutes." },
            { name: "Marcus Chen", role: "Frontend Architect, Vercel", text: "Worko compiles beautifully on React 19. The PostgreSQL calendar events sync dynamically without sluggish API calls." }
          ].map((tst, i) => (
            <div key={i} className="max-w-md bg-[#fafafc] border border-[#efedf4] rounded-2xl p-5 text-left space-y-3 shadow-sm flex-grow">
              <p className="text-[11px] leading-relaxed text-[#6f6b7b] font-semibold italic">
                &quot;{tst.text}&quot;
              </p>
              <div className="flex items-center gap-2 pt-2 border-t border-[#efedf4]">
                <div className="size-8 rounded-full bg-[#eeeaff] text-[#6c5ce7] font-bold text-[10px] flex items-center justify-center shrink-0">
                  {tst.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h5 className="text-[11px] font-bold text-[#282633]">{tst.name}</h5>
                  <p className="text-[9px] text-[#aaa6b5] font-semibold">{tst.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#efedf4] bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#aaa6b5] font-bold">
          <div className="flex items-center gap-2.5">
            <div className="grid size-7 place-items-center rounded-lg bg-[#6c5ce7] text-white">
              <Zap size={13} fill="currentColor" />
            </div>
            <span className="text-[#282633]">Worko</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            <a href="https://github.com/dakshgola/Worko" target="_blank" className="hover:text-[#6c5ce7] transition">GitHub</a>
            <a href="#features" className="hover:text-[#6c5ce7] transition">Features</a>
            <a href="#pricing" className="hover:text-[#6c5ce7] transition">Pricing</a>
            <a href="/settings" className="hover:text-[#6c5ce7] transition">Settings</a>
          </div>

          <p className="text-[11px] font-medium text-[#c0bac8]">
            &copy; {new Date().getFullYear()} Worko Corp. Built with love and cozy gradients.
          </p>
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
  const [collapsed, setCollapsed] = useState(false);

  // Postgres Database Data
  const [dbData, setDbData] = useState<any>(null);
  const [loadingDb, setLoadingDb] = useState(true);

  // LocalStorage / Kanban Store Data
  const [kanbanBoards, setKanbanBoards] = useState<any[]>([]);
  const [streakCount, setStreakCount] = useState(3);
  const [focusTime, setFocusTime] = useState("6.5h");

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
  const [boardForm, setBoardForm] = useState({ name: "", color: "#6c5ce7" });

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

    // 1. Search Notes
    if (dbData?.notes) {
      dbData.notes.forEach((n: any) => {
        if (n.title.toLowerCase().includes(query) || (n.plainText && n.plainText.toLowerCase().includes(query))) {
          matches.push({ type: "Note", name: n.title, link: "/notes", id: n.id });
        }
      });
    }

    // 2. Search Pages
    if (dbData?.pages) {
      dbData.pages.forEach((p: any) => {
        if (p.title.toLowerCase().includes(query)) {
          matches.push({ type: "Page", name: p.title, link: `/spaces`, id: p.id });
        }
      });
    }

    // 3. Search Whiteboards
    if (dbData?.whiteboards) {
      dbData.whiteboards.forEach((w: any) => {
        if (w.name.toLowerCase().includes(query)) {
          matches.push({ type: "Whiteboard", name: w.name, link: "/whiteboard", id: w.id });
        }
      });
    }

    // 4. Search Kanban Tasks
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

  // Compute Productivity Score metrics
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

  // Weekly analytics helper
  const getWeeklyStats = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const values = [3, 5, 2, 8, 4, 9, 3]; // mock baselines

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

  // Submit handers
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
          color: "#6c5ce7",
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

      // Increment streak
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
      setBoardForm({ name: "", color: "#6c5ce7" });
      triggerNotification("Kanban Created", `Created Board: "${newBoard.name}"`);
    } catch (err) {
      console.error(err);
    }
  };

  // Quick creations
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

  // Reorder layouts
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

  // Collect active log activity
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

  // Tasks checklist
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
    <div className="min-h-screen bg-[#f8f8fb] text-[#292832] flex">
      {/* Sidebar Layout */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex shrink-0 flex-col border-r border-[#e8e7ef] bg-[linear-gradient(180deg,#ffffff_0%,#fbfaff_52%,#fffaf8_100%)] shadow-[6px_0_30px_rgba(50,46,92,0.035)] transition-all duration-300 ${
          collapsed ? "w-[68px]" : "w-[224px]"
        }`}
      >
        <div className="flex h-[64px] items-center border-b border-[#efedf4] px-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-[12px] bg-gradient-to-br from-[#6c5ce7] via-[#6757dc] to-[#8b5cf6] text-white shadow-[0_7px_18px_rgba(102,87,220,0.28)] ring-1 ring-white/30 transition duration-300 hover:scale-105 hover:rotate-[-3deg]">
              <Zap size={17} fill="currentColor" strokeWidth={1.8} />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-[16px] font-bold tracking-[-0.045em] text-[#282633]">Worko</p>
                <p className="truncate text-[9px] font-bold uppercase tracking-[0.15em] text-[#9b97a8]">
                  Creative workspace
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 py-3">
          {[
            {
              label: "Overview",
              items: [
                { label: "Dashboard", icon: LayoutDashboard, color: "text-indigo-600", iconBg: "bg-indigo-100", active: true },
                { label: "AI Assistant", icon: Bot, color: "text-amber-600", iconBg: "bg-amber-100" },
                { label: "Calendar", icon: CalendarDays, color: "text-sky-600", iconBg: "bg-sky-100" },
              ],
            },
            {
              label: "Create",
              items: [
                { label: "Task / Kanban", icon: SquareKanban, color: "text-emerald-600", iconBg: "bg-emerald-100" },
                { label: "Notes", icon: StickyNote, color: "text-orange-600", iconBg: "bg-orange-100" },
                { label: "Whiteboard", icon: PenTool, color: "text-pink-600", iconBg: "bg-pink-100" },
                { label: "Pages / Spaces", icon: PanelTop, color: "text-violet-600", iconBg: "bg-violet-100" },
              ],
            },
            {
              label: "Tools",
              items: [
                { label: "AI Template Builder", icon: WandSparkles, color: "text-rose-600", iconBg: "bg-rose-100" },
                { label: "Settings", icon: Settings, color: "text-slate-600", iconBg: "bg-slate-100" },
              ],
            },
          ].map((section, idx) => (
            <div key={section.label} className={idx === 0 ? "" : "mt-4"}>
              {!collapsed && (
                <p className="mb-1.5 px-2.5 text-[9px] font-bold uppercase tracking-[0.17em] text-[#aaa6b5]">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map(({ label, icon: Icon, color, iconBg, active }) => (
                  <button
                    key={label}
                    onClick={() => {
                      if (label === "Dashboard") window.location.href = "/";
                      if (label === "AI Assistant") window.location.href = "/ai-assistant";
                      if (label === "Calendar") window.location.href = "/calendar";
                      if (label === "Task / Kanban") window.location.href = "/kanban";
                      if (label === "Notes") window.location.href = "/notes";
                      if (label === "Whiteboard") window.location.href = "/whiteboard";
                      if (label === "Pages / Spaces") window.location.href = "/spaces";
                      if (label === "AI Template Builder") window.location.href = "/ai-template-builder";
                      if (label === "Settings") window.location.href = "/settings";
                    }}
                    className={`group relative flex h-9.5 w-full items-center gap-2.5 rounded-[10px] px-2 text-[12px] font-semibold transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-[#eeeaff] to-[#f6f3ff] text-[#5143bd] shadow-[inset_0_0_0_1px_rgba(103,87,220,0.08)]"
                        : "text-[#6f6b7b] hover:translate-x-0.5 hover:bg-white hover:text-[#302d3a] hover:shadow-[0_4px_14px_rgba(54,48,89,0.06)]"
                    } ${collapsed ? "justify-center px-0" : ""}`}
                  >
                    {active && <span className="absolute left-0 h-4 w-0.5 rounded-full bg-[#6c5ce7]" />}
                    <span className={`grid size-6 shrink-0 place-items-center rounded-[7px] ${iconBg}`}>
                      <Icon size={13.5} className={color} />
                    </span>
                    {!collapsed && <span>{label}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Render custom template pins in the navigation */}
          {!collapsed && dbData?.generatedApps && dbData.generatedApps.filter((a: any) => a.isPinned).length > 0 && (
            <div className="mt-4">
              <p className="mb-1.5 px-2.5 text-[9px] font-bold uppercase tracking-[0.17em] text-[#aaa6b5]">
                Custom Apps
              </p>
              <div className="space-y-0.5">
                {dbData.generatedApps.filter((a: any) => a.isPinned).map((app: any) => (
                  <button
                    key={app.id}
                    onClick={() => { window.location.href = `/ai-template-builder`; }}
                    className="group relative flex h-9.5 w-full items-center gap-2.5 rounded-[10px] px-2 text-[12px] font-semibold text-[#6f6b7b] hover:translate-x-0.5 hover:bg-white hover:text-[#302d3a]"
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-[7px] text-white" style={{ backgroundColor: app.color }}>
                      <Zap size={11} fill="currentColor" />
                    </span>
                    <span>{app.appName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="border-t border-[#efedf4] p-2.5">
          <button
            onClick={() => { window.location.href = "/settings"; }}
            className={`mb-1.5 flex h-9 w-full items-center gap-2.5 rounded-[10px] px-2 text-[12px] font-semibold text-[#777281] transition hover:bg-white hover:text-[#5143bd] ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <span className="grid size-6 place-items-center rounded-[7px] bg-slate-100"><Settings size={13.5} className="text-slate-600" /></span>
            {!collapsed && <span>Settings</span>}
          </button>
          
          <div className="flex items-center gap-2.5 rounded-xl border border-[#ece9f2] bg-white p-1.5 shadow-[0_4px_14px_rgba(54,48,89,0.045)]">
            <div className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-gradient-to-br from-[#ffad72] to-[#ef6688] text-[10px] font-bold text-white">
              {user?.firstName ? user.firstName.substring(0, 2).toUpperCase() : "DG"}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{user?.fullName || "Daksh Gola"}</p>
                <p className="truncate text-[9px] text-[#aaa6b5] font-bold uppercase tracking-wider">Personal space</p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-3 top-[78px] grid size-6 place-items-center rounded-full border border-[#e3e0eb] bg-white text-[#858091] shadow-sm hover:scale-105"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Main panel */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden" style={{ paddingLeft: collapsed ? "68px" : "224px" }}>
        
        {/* Top Header */}
        <header className="flex h-[68px] items-center gap-4 border-b border-[#e9e7ef] bg-[#f8f8fb]/85 px-6 backdrop-blur-xl shrink-0">
          <div className="relative max-w-[420px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a39d93]" />
            <input
              type="text"
              placeholder="Search workspaces (notes, pages, boards)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchResults(true)}
              className="h-9.5 w-full rounded-xl border border-[#e5e2ed] bg-white pl-10 pr-10 text-sm shadow-sm outline-none transition-all placeholder:text-[#aaa6b4] focus:border-[#bdb4f1]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa6b4] hover:text-[#292832]">
                <X size={14} />
              </button>
            )}

            {/* Global Search overlays dropdown matches list */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-11 bg-white border border-[#e5e2ed] rounded-xl shadow-lg p-2 max-h-[300px] overflow-y-auto z-50">
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#efedf4] text-[9px] font-bold text-[#b0a9bd] uppercase tracking-wider mb-1">
                  <span>Search Matches</span>
                  <button onClick={() => setShowSearchResults(false)}><X size={11} /></button>
                </div>
                {searchResults.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => { window.location.href = item.link; }}
                    className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-[#eeeaff]/40 rounded-lg text-xs font-semibold text-[#292832] text-left"
                  >
                    <span>{item.name}</span>
                    <span className="px-1.5 py-0.5 bg-[#f0ecfc] text-[#6c5ce7] text-[8.5px] rounded font-bold uppercase tracking-wider shrink-0">{item.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setShowCustomizer(true)}
              className="flex h-9.5 items-center gap-1.5 rounded-xl border border-[#e5e2ed] bg-white px-3.5 text-xs font-bold text-[#716c7d] hover:text-[#5143bd] shadow-sm transition"
            >
              <Sliders size={13.5} />
              <span className="hidden md:inline">Layout</span>
            </button>

            {/* Notifications panel dropdown triggers */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative grid size-9.5 place-items-center rounded-xl border border-[#e5e2ed] bg-white text-[#716c7d] shadow-sm"
              >
                <Bell size={17} />
                {notifications.length > 0 && (
                  <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-red-400 border border-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-11 w-72 bg-white border border-[#e5e2ed] rounded-xl shadow-lg p-3 z-50 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-[#efedf4] text-xs font-bold">
                    <span>Notifications ({notifications.length})</span>
                    <button onClick={() => setShowNotifications(false)}><X size={12} /></button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2 bg-[#f8f8fb] rounded-lg border border-[#efedf4] text-[11px] leading-relaxed">
                        <div className="font-bold text-[#5143bd]">{n.title}</div>
                        <div className="text-[#6f6b7b] mt-0.5">{n.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleQuickCreateNote}
              className="flex h-9.5 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6c5ce7] to-[#8b5cf6] px-4 text-xs font-bold text-white shadow-sm"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Quick Note</span>
            </button>
          </div>
        </header>

        {/* Dashboard Panels Scroll */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8">
          {widgetsList.map((widget, widgetIndex) => {
            if (!widget.visible) return null;

            switch (widget.id) {
              case "welcome":
                return (
                  <section
                    key={widget.id}
                    className="flex flex-wrap items-center justify-between gap-6 bg-gradient-to-br from-white via-[#fbfaff] to-[#fffaf8] border border-[#efedf4] rounded-2xl p-6 shadow-sm"
                  >
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-[#8e877e] tracking-wider uppercase">
                        {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                      </p>
                      <h1 className="text-2xl font-black tracking-tight text-[#282633]">
                        {(() => {
                          const hour = new Date().getHours();
                          if (hour < 12) return "Good morning";
                          if (hour < 17) return "Good afternoon";
                          return "Good evening";
                        })()}, {user?.firstName || "Daksh"} 👋
                      </h1>
                      <p className="text-xs text-[#777281] font-medium">
                        Streak: <span className="font-extrabold text-amber-500 inline-flex items-center"><Flame size={12} fill="currentColor" className="mr-0.5" />{streakCount} days</span>. You have <span className="font-bold text-[#5143bd]">{metrics.totalTasks - metrics.completedTasks} pending tasks</span> and <span className="font-bold text-[#5143bd]">{metrics.meetingsCount} events</span> scheduled.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#aaa399] uppercase tracking-wider">Layout</span>
                      <div className="flex bg-[#f3f1f6] p-0.5 rounded-lg border border-[#e5e2ed]">
                        <button
                          onClick={() => handleMoveWidget(widgetIndex, "up")}
                          disabled={widgetIndex === 0}
                          className="p-1 text-[#aaa399] hover:text-[#5143bd] disabled:opacity-30"
                        >
                          &uarr;
                        </button>
                        <button
                          onClick={() => handleMoveWidget(widgetIndex, "down")}
                          disabled={widgetIndex === widgetsList.length - 1}
                          className="p-1 text-[#aaa399] hover:text-[#5143bd] disabled:opacity-30"
                        >
                          &darr;
                        </button>
                      </div>
                    </div>
                  </section>
                );

              case "quick-actions":
                return (
                  <section key={widget.id} className="space-y-3">
                    <h3 className="text-xs font-bold text-[#b0a9bd] uppercase tracking-wider flex items-center gap-1.5">
                      <Zap size={13} className="text-[#6c5ce7]" /> Fast Actions
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
                          <span className="text-[10px] font-bold tracking-tight">{act.title}</span>
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
                        className="flex items-center gap-4 bg-white border border-[#efedf4] rounded-2xl p-4 shadow-sm"
                      >
                        <div className={`grid size-11 place-items-center rounded-xl shrink-0 ${st.color}`}>
                          <st.icon size={18} strokeWidth={2.25} />
                        </div>
                        <div>
                          <p className="text-[18px] font-black tracking-tight text-[#282633]">{st.value}</p>
                          <p className="text-[10px] font-bold text-[#777281]">{st.title}</p>
                        </div>
                      </div>
                    ))}
                  </section>
                );

              case "productivity-metrics":
                return (
                  <section key={widget.id} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Score widget */}
                    <div className="bg-white border border-[#efedf4] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-[#5143bd] uppercase tracking-wider mb-1">Productivity score</h4>
                        <p className="text-[10px] text-[#777281]">Weighted metrics track</p>
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
                                <stop offset="0%" stopColor="#6c5ce7" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-[#282633]">{metrics.score}</span>
                            <span className="text-[9px] text-[#aaa6b5] font-bold uppercase tracking-wider">Score</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between text-center border-t border-[#efedf4] pt-3 text-[11px]">
                        <div>
                          <p className="font-bold text-[#3e9b68]">{metrics.completedTasks}</p>
                          <p className="text-[9px] text-[#aaa6b5] font-semibold uppercase">Completed</p>
                        </div>
                        <div className="border-l border-[#efedf4]" />
                        <div>
                          <p className="font-bold text-[#6556d6]">{metrics.meetingsCount}</p>
                          <p className="text-[9px] text-[#aaa6b5] font-semibold uppercase">Events</p>
                        </div>
                      </div>
                    </div>

                    {/* SVG Weekly Analytics */}
                    <div className="lg:col-span-2 bg-white border border-[#efedf4] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-[#5143bd] uppercase tracking-wider mb-1">Weekly Metrics</h4>
                        <p className="text-[10px] text-[#777281]">Daily activities checklist</p>
                      </div>

                      <div className="flex items-end justify-between h-40 pt-6 px-4">
                        {weeklyStats.map((item, index) => {
                          const heightPct = (item.value / maxWeeklyVal) * 100;
                          return (
                            <div key={index} className="flex flex-col items-center gap-2 group flex-1">
                              <div className="relative w-7 bg-[#f8f8fb] rounded-t-lg h-32 flex items-end overflow-hidden border border-[#efedf4]/50">
                                <div
                                  className="w-full bg-gradient-to-t from-[#6c5ce7] to-[#8b5cf6] rounded-t-md transition-all duration-700"
                                  style={{ height: `${heightPct}%` }}
                                />
                                <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 bg-[#292832] text-white text-[9px] px-1.5 py-0.5 rounded font-mono shadow mb-1">
                                  {item.value}
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-[#8b879c] uppercase">{item.day}</span>
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
                    <div className="lg:col-span-2 bg-white border border-[#efedf4] rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-[#efedf4] pb-3">
                        <div>
                          <h4 className="text-xs font-bold text-[#5143bd] uppercase tracking-wider">Today&apos;s Focus Tasks</h4>
                          <p className="text-[10px] text-[#777281]">Important priorities agenda</p>
                        </div>
                        <button onClick={() => { window.location.href = "/kanban"; }} className="text-[10px] font-bold text-[#6c5ce7] hover:underline">
                          Open Kanban &rarr;
                        </button>
                      </div>

                      {activeTasksList.length === 0 ? (
                        <div className="text-center py-8 text-xs text-[#aaa6b5] space-y-2">
                          <CheckSquare size={32} className="mx-auto" />
                          <p>No active tasks in columns. Add one below!</p>
                          <button onClick={() => setShowCreateTaskModal(true)} className="text-[#6c5ce7] font-semibold hover:underline">
                            Add a task
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {activeTasksList.map((task) => (
                            <div
                              key={task.id}
                              className="flex items-center gap-3 p-3 bg-[#fbfaff]/50 border border-[#efedf4] rounded-xl hover:border-[#cfc8f5] transition"
                            >
                              <CheckSquare size={16} className="text-emerald-500 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold truncate text-[#282633]">{task.title}</p>
                                <p className="text-[9px] text-[#777281] truncate">{task.description || "No description"}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="px-2 py-0.5 bg-[#f3f1f6] text-[#777281] text-[9px] rounded font-semibold">{task.dueDate}</span>
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[9px] rounded font-bold uppercase">{task.priority}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* AI assistant box */}
                    <div className="bg-gradient-to-br from-[#5143bd] via-[#6556db] to-[#7b5fe7] text-white rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/90">
                            AI Assistant
                          </span>
                          <Sparkles size={16} className="text-[#ffe6a7] animate-pulse" />
                        </div>
                        <h3 className="text-[17px] font-black tracking-tight leading-snug">
                          Cozy command suggestions
                        </h3>
                        <p className="text-[11px] leading-relaxed text-white/70">
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
                            className="w-full text-left bg-white/10 hover:bg-white/15 px-3 py-2 rounded-xl text-[10.5px] font-bold text-white transition flex items-center justify-between"
                          >
                            <span>{rec}</span>
                            <ArrowUpRight size={11} className="text-white/60" />
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => { window.location.href = "/ai-assistant"; }}
                        className="h-8.5 w-full bg-white text-[#5143bd] font-bold rounded-xl text-xs flex items-center justify-center gap-1 hover:bg-[#f6f3ff] transition"
                      >
                        Ask AI Assistant
                      </button>
                    </div>
                  </section>
                );

              case "calendar-upcoming":
                return (
                  <section key={widget.id} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white border border-[#efedf4] rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-[#efedf4] pb-3">
                        <div>
                          <h4 className="text-xs font-bold text-[#5143bd] uppercase tracking-wider">Upcoming Schedule</h4>
                          <p className="text-[10px] text-[#777281]">Upcoming meetings &amp; reminders</p>
                        </div>
                        <button onClick={() => { window.location.href = "/calendar"; }} className="text-[10px] font-bold text-[#6c5ce7] hover:underline">
                          Open Calendar &rarr;
                        </button>
                      </div>

                      {!dbData?.calendarEvents || dbData.calendarEvents.length === 0 ? (
                        <div className="text-center py-8 text-xs text-[#aaa6b5] space-y-2">
                          <CalendarDays size={32} className="mx-auto" />
                          <p>No calendar events found.</p>
                          <button onClick={() => setShowCreateEventModal(true)} className="text-[#6c5ce7] font-semibold hover:underline">
                            Schedule event
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {dbData.calendarEvents.slice(0, 4).map((ev: any) => (
                            <div key={ev.id} className="p-3 bg-[#fbfaff]/40 border border-[#efedf4] rounded-xl flex flex-col justify-between">
                              <div>
                                <span className="px-2 py-0.5 bg-sky-50 text-sky-600 border border-sky-100 text-[8px] font-black uppercase rounded mb-2 inline-block">
                                  {ev.category}
                                </span>
                                <h5 className="text-xs font-bold text-[#282633] truncate">{ev.title}</h5>
                                <p className="text-[10px] text-[#777281] mt-0.5 line-clamp-1">{ev.description || "No description"}</p>
                              </div>
                              <div className="flex items-center justify-between border-t border-[#efedf4]/50 pt-2 mt-3 text-[10px] font-bold text-[#6f6b7b]">
                                <span>{ev.date} at {ev.time}</span>
                                <span className="text-[8px] bg-red-50 text-red-600 px-1.5 rounded">{ev.priority}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-white border border-[#efedf4] rounded-2xl p-5 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-[#5143bd] uppercase tracking-wider">AI Insights</h4>
                        <p className="text-[10px] text-[#777281]">Daily deduced deductions</p>
                      </div>
                      <div className="space-y-3">
                        {[
                          { text: `You completed ${metrics.completedTasks} tasks recently.`, icon: Info },
                          { text: `Your notes database contains ${metrics.notesCount} entries.`, icon: Info },
                          { text: `You have ${metrics.meetingsCount} events this month.`, icon: Info },
                        ].map((ins, i) => (
                          <div key={i} className="flex gap-2.5 items-start text-xs bg-[#f8f8fb] p-2.5 rounded-xl border border-[#efedf4]">
                            <ins.icon size={14} className="text-[#6c5ce7] shrink-0 mt-0.5" />
                            <p className="text-[#292832] font-semibold">{ins.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                );

              case "favorites-panel":
                return (
                  <section key={widget.id} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-[#efedf4] rounded-2xl p-5 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-[#5143bd] uppercase tracking-wider">Recently Visited</h4>
                        <p className="text-[10px] text-[#777281]">Pick up where you left off</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {dbData?.notes?.slice(0, 2).map((n: any) => (
                          <button key={n.id} onClick={() => { window.location.href = "/notes"; }} className="flex items-center gap-2.5 p-2.5 bg-[#fbfaff]/50 border border-[#efedf4] hover:bg-[#fbfaff] rounded-xl text-xs font-bold transition">
                            <StickyNote size={14} className="text-orange-500 shrink-0" />
                            <span className="truncate flex-1 text-left">{n.title}</span>
                          </button>
                        ))}
                        {dbData?.whiteboards?.slice(0, 2).map((w: any) => (
                          <button key={w.id} onClick={() => { window.location.href = "/whiteboard"; }} className="flex items-center gap-2.5 p-2.5 bg-[#fbfaff]/50 border border-[#efedf4] hover:bg-[#fbfaff] rounded-xl text-xs font-bold transition">
                            <PenTool size={14} className="text-pink-500 shrink-0" />
                            <span className="truncate flex-1 text-left">{w.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border border-[#efedf4] rounded-2xl p-5 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-[#5143bd] uppercase tracking-wider">Favorites &amp; Pins</h4>
                        <p className="text-[10px] text-[#777281]">Favorited notes/apps</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {dbData?.notes?.filter((n: any) => n.isFavorite).slice(0, 2).map((fav: any) => (
                          <button key={fav.id} onClick={() => { window.location.href = "/notes"; }} className="flex items-center gap-2.5 p-2.5 bg-yellow-50/20 border border-yellow-100 rounded-xl text-xs font-bold text-yellow-800 transition">
                            <Star size={13.5} fill="#e49a3a" className="text-[#e49a3a] shrink-0" />
                            <span className="truncate flex-1 text-left">{fav.title}</span>
                          </button>
                        ))}
                        {dbData?.generatedApps?.filter((a: any) => a.isPinned).slice(0, 2).map((app: any) => (
                          <button key={app.id} onClick={() => { window.location.href = "/ai-template-builder"; }} className="flex items-center gap-2.5 p-2.5 bg-[#eeeaff]/40 border border-[#cfc8f5] rounded-xl text-xs font-bold text-[#5143bd] transition">
                            <WandSparkles size={13.5} className="text-[#6c5ce7] shrink-0" />
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
                    <div className="lg:col-span-2 bg-white border border-[#efedf4] rounded-2xl p-5 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-[#5143bd] uppercase tracking-wider">Activity Log Timeline</h4>
                        <p className="text-[10px] text-[#777281]">Real-time operations timeline</p>
                      </div>
                      {activities.length === 0 ? (
                        <p className="text-xs text-[#777281] italic">No recent timeline activities.</p>
                      ) : (
                        <div className="relative border-l border-[#efedf4] pl-4 ml-2.5 space-y-4">
                          {activities.map((act, i) => (
                            <div key={i} className="relative">
                              <span className="absolute -left-7 top-0.5 size-5 rounded-full border border-white bg-white shadow-sm flex items-center justify-center">
                                <act.icon size={11} className="text-[#777281]" />
                              </span>
                              <div className="text-xs">
                                <p className="font-bold text-[#282633]">{act.title}</p>
                                <p className="text-[10px] text-[#777281] mt-0.5">{act.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* AI Chat History */}
                    <div className="bg-white border border-[#efedf4] rounded-2xl p-5 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-[#5143bd] uppercase tracking-wider">AI Chats</h4>
                        <p className="text-[10px] text-[#777281]">Conversational archives</p>
                      </div>
                      {!dbData?.chats || dbData.chats.length === 0 ? (
                        <div className="text-xs text-[#aaa6b5] text-center py-6">No recent chats.</div>
                      ) : (
                        <div className="space-y-2">
                          {dbData.chats.slice(0, 3).map((chat: any) => (
                            <div key={chat.id} className="p-3 bg-[#fbfaff] border border-[#efedf4] rounded-xl flex items-center justify-between">
                              <p className="text-xs font-bold truncate flex-1 pr-2">{chat.title}</p>
                              <button onClick={() => { window.location.href = "/ai-assistant"; }} className="px-2.5 py-1 bg-[#eeeaff] text-[#5143bd] rounded-lg text-[10px] font-bold">
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
        </div>
      </div>

      {/* Widget Layout Customizer Drawer */}
      {showCustomizer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-[320px] bg-white h-full shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between border-b border-[#efedf4] pb-4 mb-4">
                <div>
                  <h3 className="font-bold text-sm text-[#282633] flex items-center gap-1.5">
                    <Sliders size={16} className="text-[#6c5ce7]" />
                    Dashboard Widgets
                  </h3>
                  <p className="text-[10px] text-[#777281] mt-0.5">Toggle visibilities &amp; layout order</p>
                </div>
                <button onClick={() => setShowCustomizer(false)} className="p-1 rounded-lg text-[#aaa6b5] hover:bg-slate-100">
                  <X size={15} />
                </button>
              </div>

              <div className="space-y-2.5 overflow-y-auto max-h-[70vh] pr-1">
                {widgetsList.map((w, index) => (
                  <div key={w.id} className="p-3 bg-[#f8f8fb] border border-[#efedf4] rounded-xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={w.visible}
                        onChange={() => handleToggleWidget(w.id)}
                        className="rounded text-[#6c5ce7] focus:ring-[#6c5ce7]"
                      />
                      <span className="text-xs font-semibold text-[#292832]">{w.name}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button onClick={() => handleMoveWidget(index, "up")} disabled={index === 0} className="p-1 text-[#aaa399] hover:text-[#6c5ce7] disabled:opacity-30">
                        &uarr;
                      </button>
                      <button onClick={() => handleMoveWidget(index, "down")} disabled={index === widgetsList.length - 1} className="p-1 text-[#aaa399] hover:text-[#6c5ce7] disabled:opacity-30">
                        &darr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setShowCustomizer(false)} className="h-10 w-full bg-[#6c5ce7] hover:bg-[#5143bd] text-white font-bold rounded-xl text-xs">
              Save Dashboard Layout
            </button>
          </div>
        </div>
      )}

      {/* Creation forms dialog popups */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleTaskSubmit} className="bg-white rounded-2xl border-2 border-[#6c5ce7] w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-black text-sm text-[#282633] flex items-center gap-1.5">
                <SquareKanban size={16} className="text-[#6c5ce7]" />
                Create Kanban Task
              </h4>
              <button type="button" onClick={() => setShowCreateTaskModal(false)}><X size={15} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#b0a9bd] mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="Review pricing structure..."
                  className="w-full h-9 px-3 rounded-lg border text-xs outline-none focus:border-[#6c5ce7]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#b0a9bd] mb-1">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Detail notes..."
                  className="w-full h-16 p-2 rounded-lg border text-xs outline-none resize-none focus:border-[#6c5ce7]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#b0a9bd] mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg border text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#b0a9bd] mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg border text-xs outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t pt-3">
              <button type="button" onClick={() => setShowCreateTaskModal(false)} className="h-8.5 px-4 bg-slate-50 border rounded-xl text-xs font-semibold text-[#777281]">Cancel</button>
              <button type="submit" className="h-8.5 px-4 bg-[#6c5ce7] text-white rounded-xl text-xs font-bold">Add Task</button>
            </div>
          </form>
        </div>
      )}

      {showCreateEventModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleEventSubmit} className="bg-white rounded-2xl border-2 border-[#6c5ce7] w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-black text-sm text-[#282633] flex items-center gap-1.5">
                <CalendarDays size={16} className="text-[#6c5ce7]" />
                Schedule Calendar Event
              </h4>
              <button type="button" onClick={() => setShowCreateEventModal(false)}><X size={15} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#b0a9bd] mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="Strategic roadmap sync..."
                  className="w-full h-9 px-3 rounded-lg border text-xs outline-none focus:border-[#6c5ce7]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#b0a9bd] mb-1">Description</label>
                <input
                  type="text"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Sync link details..."
                  className="w-full h-9 px-3 rounded-lg border text-xs outline-none focus:border-[#6c5ce7]"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-[#b0a9bd] mb-1">Date</label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg border text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#b0a9bd] mb-1">Time</label>
                  <input
                    type="text"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    placeholder="10:00"
                    className="w-full h-9 px-2 rounded-lg border text-xs outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#b0a9bd] mb-1">Category</label>
                <select
                  value={eventForm.category}
                  onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                  className="w-full h-9 px-2 rounded-lg border text-xs outline-none"
                >
                  <option value="Meeting">Meeting</option>
                  <option value="Reminder">Reminder</option>
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t pt-3">
              <button type="button" onClick={() => setShowCreateEventModal(false)} className="h-8.5 px-4 bg-slate-50 border rounded-xl text-xs font-semibold text-[#777281]">Cancel</button>
              <button type="submit" disabled={creatingItem} className="h-8.5 px-4 bg-[#6c5ce7] text-white rounded-xl text-xs font-bold">
                {creatingItem ? <Loader2 size={12} className="animate-spin" /> : "Add Event"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showCreateBoardModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleBoardSubmit} className="bg-white rounded-2xl border-2 border-[#6c5ce7] w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-black text-sm text-[#282633] flex items-center gap-1.5">
                <LayoutDashboard size={16} className="text-[#6c5ce7]" />
                Create Kanban Board
              </h4>
              <button type="button" onClick={() => setShowCreateBoardModal(false)}><X size={15} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#b0a9bd] mb-1">Board Name</label>
                <input
                  type="text"
                  required
                  value={boardForm.name}
                  onChange={(e) => setBoardForm({ ...boardForm, name: e.target.value })}
                  placeholder="Design Sprint #2..."
                  className="w-full h-9 px-3 rounded-lg border text-xs outline-none focus:border-[#6c5ce7]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#b0a9bd] mb-1">Accent Color</label>
                <div className="flex gap-2">
                  {["#6c5ce7", "#3e9b68", "#ef6688", "#e49a3a", "#3b82f6"].map((hex) => (
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
            <div className="flex justify-end gap-2 border-t pt-3">
              <button type="button" onClick={() => setShowCreateBoardModal(false)} className="h-8.5 px-4 bg-slate-50 border rounded-xl text-xs font-semibold text-[#777281]">Cancel</button>
              <button type="submit" className="h-8.5 px-4 bg-[#6c5ce7] text-white rounded-xl text-xs font-bold">Add Board</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

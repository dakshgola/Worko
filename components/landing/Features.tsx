"use client";
import React from "react";
import { Bot, CalendarDays, SquareKanban, StickyNote, PenTool, WandSparkles, Search } from "lucide-react";

const LANDING_FEATURES = [
  { title: "AI Conversational Assistant", desc: "Speak or chat with Gemini to query metrics, write documentation drafts, or outline database tasks.", icon: Bot, bg: "from-amber-500 to-orange-600", accent: "rgba(245, 176, 92, 0.15)" },
  { title: "Neon Postgres Calendar", desc: "Drag-and-drop meetings agendas directly synced to your real-time database.", icon: CalendarDays, bg: "from-sky-500 to-indigo-600", accent: "rgba(96, 165, 250, 0.15)" },
  { title: "Collaborative Kanban Tasks", desc: "Organize check-lists, track deadliness, and drag tasks between customizable boards columns.", icon: SquareKanban, bg: "from-emerald-500 to-teal-600", accent: "rgba(82, 194, 136, 0.15)" },
  { title: "TipTap Specs Wiki Documents", desc: "Structure rich-text specs documents and sub-pages to build team-shared knowledge bases.", icon: StickyNote, bg: "from-orange-500 to-red-600", accent: "rgba(255, 90, 54, 0.15)" },
  { title: "SVG Whiteboards", desc: "Draw mindmaps, flows, and shapes with collaborative pointers on an infinite canvas sheet.", icon: PenTool, bg: "from-pink-500 to-rose-600", accent: "rgba(244, 139, 164, 0.15)" },
  { title: "Voice Notes Dictation", desc: "Dictate transcriptions directly at cursor using AssemblyAI streaming sockets.", icon: StickyNote, bg: "from-violet-500 to-purple-600", accent: "rgba(135, 120, 255, 0.15)" },
  { title: "AI Custom App Builder", desc: "Describe custom trackers app layouts and compile schema JSONs config immediately.", icon: WandSparkles, bg: "from-rose-500 to-pink-600", accent: "rgba(244, 139, 164, 0.15)" },
  { title: "Global Search Engine", desc: "Instant matching overlay across notes, board cards, checklists, and calendar events.", icon: Search, bg: "from-indigo-500 to-blue-600", accent: "rgba(108, 92, 231, 0.15)" },
];

export function Features() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-16 space-y-12">
      <div className="text-center space-y-3">
        <h2 className="text-h2 text-foreground">Orchestrate everything.</h2>
        <p className="text-body-sm text-muted max-w-lg mx-auto font-semibold">
          Worko combines visual collaboration tools with database synchronization and Gemini processing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {LANDING_FEATURES.map((feat, i) => (
          <div
            key={i}
            className="group bg-surface border border-border/80 rounded-2xl p-6 transition duration-200 hover:shadow-md hover:border-border text-left relative overflow-hidden"
          >
            <div
              className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ backgroundColor: feat.accent }}
            />
            <div className="relative z-10 space-y-4">
              <span className={`grid size-10 place-items-center rounded-xl bg-gradient-to-br ${feat.bg} text-white shadow-sm`}>
                <feat.icon size={16} />
              </span>
              <h3 className="text-body-sm font-extrabold text-foreground">{feat.title}</h3>
              <p className="text-caption text-muted leading-relaxed font-semibold">{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

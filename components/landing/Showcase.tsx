"use client";
import React, { useState } from "react";
import { LayoutDashboard, Bot, StickyNote, Activity, PenTool, ArrowUpRight, Mic, Check, MousePointer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Showcase() {
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<"dashboard" | "ai" | "voice" | "collab" | "whiteboard">("dashboard");

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
    }, 255);
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
  );
}

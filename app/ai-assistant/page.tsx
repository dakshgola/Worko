"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Send,
  Mic,
  MicOff,
  CornerDownLeft,
  ChevronLeft,
  ChevronRight,
  Menu,
  Zap,
  PanelLeftClose,
} from "lucide-react";
import {
  listChats,
  createChat,
  getChatMessages,
  saveMessage,
  deleteChat,
} from "@/lib/ai-assistant/actions";
import { createEvent } from "@/lib/calendar/actions";
import { createNote } from "@/lib/notes/actions";

const sidebarNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "AI Assistant", icon: Bot, href: "/ai-assistant", active: true },
  { label: "Calendar", icon: CalendarDays, href: "/calendar" },
  { label: "Tasks", icon: SquareKanban, href: "/kanban" },
  { label: "Notes", icon: StickyNote, href: "/notes" },
  { label: "Whiteboard", icon: PenTool, href: "/whiteboard" },
  { label: "Spaces", icon: PanelTop, href: "/spaces" },
  { label: "AI Builder", icon: WandSparkles, href: "/ai-template-builder" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export default function AiAssistantPage() {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Chat threads
  const [chatsList, setChatsList] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  
  // States
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [inputMsg, setInputMsg] = useState("");
  const [streamingResponse, setStreamingResponse] = useState("");
  const [isAiResponding, setIsAiResponding] = useState(false);

  // Suggested prompts
  const suggestedPrompts = [
    "Schedule meeting sync at 14:00 today",
    "Create a new priority note draft",
    "How is my productivity score today?",
  ];

  // Action confirmations triggers
  const [actionConfirmation, setActionConfirmation] = useState<{
    type: "task" | "event" | "note";
    payload: any;
  } | null>(null);
  const [actionSuccess, setActionSuccess] = useState(false);

  // AssemblyAI Voice
  const [isRecording, setIsRecording] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  const fetchChats = async () => {
    try {
      setLoadingChats(true);
      const res = await listChats();
      setChatsList(res);
      if (res.length > 0) {
        setActiveChat(res[0]);
        await loadMessages(res[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingChats(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      setLoadingHistory(true);
      const res = await getChatMessages(chatId);
      setMessages(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const handleCreateChat = async (initialTitle?: string) => {
    try {
      const chat = await createChat(initialTitle || "New Conversation", "Gemini");
      setChatsList((prev) => [chat, ...prev]);
      setActiveChat(chat);
      setMessages([]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteChat(id);
      const rem = chatsList.filter((c) => c.id !== id);
      setChatsList(rem);
      if (activeChat?.id === id) {
        setActiveChat(rem.length > 0 ? rem[0] : null);
        if (rem.length > 0) await loadMessages(rem[0].id);
        else setMessages([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectChat = async (chat: any) => {
    setActiveChat(chat);
    await loadMessages(chat.id);
  };

  // Submit Prompt Chat
  const handleSubmitPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;

    let chat = activeChat;
    if (!chat) {
      // Create chat thread on the fly
      const chatTitle = promptText.length > 25 ? promptText.substring(0, 25) + "..." : promptText;
      chat = await createChat(chatTitle, "Gemini");
      setChatsList((prev) => [chat, ...prev]);
      setActiveChat(chat);
    }

    // Save user message
    const userMsg = await saveMessage(chat.id, "user", promptText);
    setMessages((prev) => [...prev, userMsg]);
    setInputMsg("");

    // Simulate/Detect workspace intent triggers
    const lower = promptText.toLowerCase();
    let detectedAction = false;
    
    if (lower.includes("schedule") || lower.includes("meeting") || lower.includes("event")) {
      // Intent: Create event
      setActionConfirmation({
        type: "event",
        payload: {
          title: "Strategy Session Sync",
          description: "Sync scheduled via AI Assistant",
          date: new Date().toISOString().split("T")[0],
          time: "14:00",
          category: "Meeting",
        },
      });
      detectedAction = true;
    } else if (lower.includes("note") || lower.includes("write")) {
      // Intent: Create Note
      setActionConfirmation({
        type: "note",
        payload: {
          title: "AI Assistant Meeting Reflection",
        },
      });
      detectedAction = true;
    }

    try {
      setIsAiResponding(true);
      setStreamingResponse("");

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error("LLM failure");
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          fullText += chunk;
          setStreamingResponse((prev) => prev + chunk);
        }
      }

      // Save assistant message
      const assistantMsg = await saveMessage(chat.id, "assistant", fullText);
      setMessages((prev) => [...prev, assistantMsg]);
      setStreamingResponse("");
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiResponding(false);
    }
  };

  // Confirm workspace execution triggers
  const handleConfirmAction = async () => {
    if (!actionConfirmation) return;
    try {
      if (actionConfirmation.type === "event") {
        await createEvent(actionConfirmation.payload);
      } else if (actionConfirmation.type === "note") {
        await createNote(actionConfirmation.payload);
      }

      setActionSuccess(true);
      setTimeout(() => {
        setActionConfirmation(null);
        setActionSuccess(false);
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // AssemblyAI Audio mic stream
  const startVoiceRecording = async () => {
    try {
      const response = await fetch("/api/assemblyai/token", { method: "POST" });
      const { token } = await response.json();

      const socket = new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`);
      socketRef.current = socket;

      socket.onopen = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx({ sampleRate: 16000 });
        audioCtxRef.current = ctx;

        const src = ctx.createMediaStreamSource(stream);
        const proc = ctx.createScriptProcessor(4096, 1, 1);
        processorRef.current = proc;

        proc.onaudioprocess = (e) => {
          const input = e.inputBuffer.getChannelData(0);
          const pcm = new Int16Array(input.length);
          for (let i = 0; i < input.length; i++) {
            pcm[i] = Math.max(-1, Math.min(1, input[i])) * 0x7fff;
          }
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ audio_data: Buffer.from(pcm.buffer).toString("base64") }));
          }
        };

        src.connect(proc);
        proc.connect(ctx.destination);
        setIsRecording(true);
      };

      socket.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.text && data.message_type === "PartialTranscript") {
          setInputMsg(data.text);
        } else if (data.text && data.message_type === "FinalTranscript") {
          setInputMsg(data.text);
        }
      };

      socket.onclose = () => stopVoiceRecording();
    } catch (err) {
      console.error(err);
      alert("Microphone permissions required.");
    }
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    if (processorRef.current) processorRef.current.disconnect();
    if (audioCtxRef.current) audioCtxRef.current.close();
    if (micStreamRef.current) micStreamRef.current.getTracks().forEach((t) => t.stop());
    if (socketRef.current) socketRef.current.close();
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

      <main className="flex-1 min-w-0 lg:ml-[210px] flex h-screen overflow-hidden">
        {/* Chat conversations history list */}
        <section className="w-60 border-r border-[#efedf4] bg-white flex flex-col shrink-0">
          <div className="p-4 border-b border-[#efedf4] flex items-center justify-between">
            <span className="text-xs font-bold text-[#b0a9bd] uppercase tracking-wider">Chat Threads</span>
            <button onClick={() => handleCreateChat()} className="p-1 bg-[#eeeaff] text-[#6c5ce7] rounded-lg">
              <Plus size={13} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loadingChats ? (
              <div className="text-center py-6 text-xs"><Loader2 size={11} className="animate-spin text-[#6c5ce7]" /></div>
            ) : chatsList.length === 0 ? (
              <p className="text-[10px] text-center text-slate-400 py-6">0 chats started.</p>
            ) : (
              chatsList.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-bold flex items-center justify-between group truncate ${
                    activeChat?.id === chat.id ? "bg-[#eeeaff] text-[#6c5ce7]" : "hover:bg-[#fbfaff]"
                  }`}
                >
                  <span className="truncate flex-grow pr-1">{chat.title}</span>
                  <button onClick={(e) => handleDeleteChat(chat.id, e)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition">
                    <Trash2 size={11} />
                  </button>
                </button>
              ))
            )}
          </div>
        </section>

        {/* ChatGPT Chat Console */}
        <section className="flex-grow bg-white flex flex-col min-w-0 h-full overflow-hidden relative">
          <div className="flex h-[64px] items-center border-b border-[#efedf4] px-6 shrink-0 bg-white/80 z-10">
            <span className="grid size-9 place-items-center rounded-xl bg-amber-100 text-amber-600 shadow-sm shrink-0 mr-2.5">
              <Bot size={17} />
            </span>
            <div>
              <h3 className="font-black text-sm text-[#282633]">{activeChat?.title || "AI Command Assistant"}</h3>
              <p className="text-[9.5px] text-[#b0a9bd] font-bold uppercase tracking-wider">Gemini LLM model online</p>
            </div>
          </div>

          {/* Messages scroll */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && !isAiResponding && (
              <div className="max-w-md mx-auto text-center py-10 space-y-4">
                <Bot size={40} className="mx-auto text-amber-500" />
                <h4 className="font-extrabold text-sm text-[#282633]">Ask Worko AI Assistant anything</h4>
                <p className="text-xs text-[#777281] leading-relaxed">
                  Compose task events, sync outlines, summarize database note blocks, or dictate text via speech recorder:
                </p>
                <div className="flex flex-col gap-2 pt-2">
                  {suggestedPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputMsg(p);
                        handleSubmitPrompt(p);
                      }}
                      className="text-left p-3 border border-[#efedf4] rounded-xl hover:border-[#cfc8f5] hover:bg-[#fbfaff] transition text-xs font-semibold text-[#5143bd]"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 max-w-xl ${m.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
              >
                <span className={`grid size-8 place-items-center rounded-lg text-xs font-extrabold shrink-0 ${
                  m.role === "user" ? "bg-[#eeeaff] text-[#6c5ce7]" : "bg-amber-100 text-amber-600"
                }`}>
                  {m.role === "user" ? "U" : "AI"}
                </span>

                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed font-semibold shadow-sm ${
                  m.role === "user" ? "bg-[#6c5ce7] text-white" : "bg-[#f8f8fb] border border-[#efedf4]"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}

            {/* SSE typing streaming */}
            {isAiResponding && streamingResponse && (
              <div className="flex gap-3 max-w-xl">
                <span className="grid size-8 place-items-center rounded-lg text-xs font-extrabold bg-amber-100 text-amber-600 shrink-0">AI</span>
                <div className="p-3.5 bg-[#f8f8fb] border border-[#efedf4] rounded-2xl text-xs leading-relaxed font-semibold shadow-sm">
                  {streamingResponse}
                  <span className="inline-block size-2 bg-amber-500 rounded-full animate-ping ml-1" />
                </div>
              </div>
            )}

            {/* Confirm action widget overlay */}
            {actionConfirmation && (
              <div className="max-w-md mx-auto bg-amber-50/50 border-2 border-dashed border-amber-300 p-4 rounded-2xl shadow space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">AI Intent Confirmed</span>
                  {actionSuccess && <span className="text-[10px] text-emerald-600 font-bold">Successfully created!</span>}
                </div>
                <h5 className="font-extrabold text-xs text-[#282633]">
                  Ready to compile &quot;{actionConfirmation.payload.title}&quot; {actionConfirmation.type === "event" ? "event" : "note"}?
                </h5>
                <p className="text-[10px] text-[#777281]">Assigned parameters parsed from assistant chat context.</p>

                <div className="flex justify-end gap-2 pt-1.5 border-t border-amber-200">
                  <button onClick={() => setActionConfirmation(null)} className="h-7.5 px-3 bg-white border border-amber-200 text-amber-900 rounded-lg text-[10px] font-bold">Cancel</button>
                  <button onClick={handleConfirmAction} className="h-7.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold">Confirm Execute</button>
                </div>
              </div>
            )}
          </div>

          {/* Prompt composer footers */}
          <div className="p-4 border-t border-[#efedf4] shrink-0 bg-white">
            <div className="max-w-2.5xl mx-auto relative flex items-center bg-[#f8f8fb] border border-[#e5e2ed] rounded-2xl p-1 px-3 shadow-inner">
              
              <button
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                className={`p-2 rounded-xl transition ${
                  isRecording ? "text-red-500 hover:bg-red-50" : "text-[#716c7d] hover:text-[#282633]"
                }`}
              >
                {isRecording ? <MicOff size={15} className="animate-pulse" /> : <Mic size={15} />}
              </button>

              <input
                type="text"
                placeholder={isRecording ? "Listening stream..." : "Ask Assistant to log tasks, schedule calendar events, or write note specifications..."}
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmitPrompt(inputMsg);
                  }
                }}
                className="flex-1 bg-transparent border-none outline-none py-2 px-3 text-xs text-[#292832] font-semibold"
              />

              <button
                onClick={() => handleSubmitPrompt(inputMsg)}
                className="p-2 bg-[#6c5ce7] hover:bg-[#5143bd] text-white rounded-xl shadow-sm transition"
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        </section>
      </main>
      {sidebarOpen && <button aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-[#302a3d]/20 backdrop-blur-sm lg:hidden" />}
    </div>
  );
}

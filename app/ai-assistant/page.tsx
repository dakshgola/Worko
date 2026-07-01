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
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar";
import { createEvent } from "@/lib/calendar/actions";
import { createNote } from "@/lib/notes/actions";

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
        await createNote({ title: actionConfirmation.payload.title });
      }
      setActionSuccess(true);
      setTimeout(() => {
        setActionConfirmation(null);
        setActionSuccess(false);
      }, 1800);
    } catch (e) {
      console.error(e);
    }
  };

  // AssemblyAI Voice Streaming Handshake
  const startVoiceRecording = async () => {
    try {
      const response = await fetch("/api/assemblyai/token", { method: "POST" });
      if (!response.ok) throw new Error("Handshake failed");
      const { token } = await response.json();

      const wsUrl = `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx({ sampleRate: 16000 });
        audioCtxRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7fff;
          }
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ audio_data: Buffer.from(pcmData.buffer).toString("base64") }));
          }
        };

        source.connect(processor);
        processor.connect(audioCtx.destination);
        setIsRecording(true);
      };

      socket.onmessage = (message) => {
        const res = JSON.parse(message.data);
        if (res.text && res.message_type === "PartialTranscript") {
          setInputMsg(res.text);
        } else if (res.text && res.message_type === "FinalTranscript") {
          setInputMsg(res.text);
          handleSubmitPrompt(res.text);
        }
      };

      socket.onerror = (e) => console.error(e);
      socket.onclose = () => stopVoiceRecording();
    } catch (err) {
      console.error(err);
      alert("Please allow microphone permissions to dictating prompts.");
    }
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    if (processorRef.current) processorRef.current.disconnect();
    if (audioCtxRef.current) audioCtxRef.current.close();
    if (micStreamRef.current) micStreamRef.current.getTracks().forEach((t) => t.stop());
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ terminate_session: true }));
      }
      socketRef.current.close();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Navigation */}
      <WorkspaceSidebar active="AI Assistant" />

      <main className="flex-grow min-w-0 flex h-screen overflow-hidden">
        {/* Left conversations list */}
        <section className="w-60 border-r border-border bg-surface flex flex-col shrink-0">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <span className="text-overline text-muted block">Conversations</span>
            <button onClick={() => handleCreateChat()} className="btn-secondary size-8 p-0 flex items-center justify-center">
              <Plus size={13} />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-2 space-y-1">
            {loadingChats ? (
              <div className="text-center py-4 text-caption font-semibold text-muted"><Loader2 size={12} className="animate-spin text-primary inline" /></div>
            ) : chatsList.length === 0 ? (
              <div className="text-caption text-muted text-center py-4 font-semibold">0 conversation logs.</div>
            ) : (
              chatsList.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat)}
                  className={`w-full text-left p-2.5 rounded-xl text-body-sm font-bold flex items-center justify-between group truncate ${
                    activeChat?.id === chat.id ? "bg-primary-soft text-primary" : "hover:bg-hover-overlay"
                  }`}
                >
                  <span className="truncate flex-1">{chat.title}</span>
                  <button onClick={(e) => handleDeleteChat(chat.id, e)} className="text-slate-300 hover:text-danger transition ml-2 opacity-0 group-hover:opacity-100">
                    <Trash2 size={11} />
                  </button>
                </button>
              ))
            )}
          </div>
        </section>

        {/* Right Chat Board */}
        <section className="flex-grow flex flex-col bg-background relative h-full">
          {/* Header */}
          <div className="h-[68px] bg-surface border-b border-border flex items-center px-6 gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center bg-primary-soft text-primary rounded-xl"><Bot size={15} /></span>
              <div>
                <h3 className="text-body-sm font-extrabold text-foreground">{activeChat?.title || "New Session"}</h3>
                <p className="text-overline text-muted block font-semibold">AI Orchestrator</p>
              </div>
            </div>
          </div>

          {/* Messages Flow */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-12 text-caption font-semibold text-muted">
                <Loader2 size={14} className="animate-spin mr-1 text-primary" /> Loading history...
              </div>
            ) : messages.length === 0 && !streamingResponse ? (
              <div className="max-w-md mx-auto text-center py-16 space-y-4">
                <Bot size={42} className="text-primary mx-auto animate-bounce" />
                <h4 className="text-h3 text-foreground">Ask anything about your workspace</h4>
                <p className="text-body-sm text-muted leading-relaxed font-semibold">
                  I can schedule events, write specifications notes drafts, or calculate productivity logs based on Neon Database records.
                </p>

                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {suggestedPrompts.map((sg, i) => (
                    <button
                      key={i}
                      onClick={() => { setInputMsg(sg); handleSubmitPrompt(sg); }}
                      className="px-3 py-1.5 bg-primary-soft border border-primary-soft hover:bg-primary hover:text-white text-primary text-btn rounded-full transition"
                    >
                      {sg}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((m) => (
                  <div key={m.id} className={`flex gap-3.5 items-start ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <span className={`grid size-8 shrink-0 place-items-center rounded-xl text-badge-val ${
                      m.role === "user" ? "bg-amber-100 text-amber-700" : "bg-primary-soft text-primary"
                    }`}>
                      {m.role === "user" ? "US" : "AI"}
                    </span>
                    <div className={`p-3.5 rounded-2xl text-body-sm leading-relaxed font-semibold ${
                      m.role === "user" ? "bg-primary text-white" : "bg-surface border border-border text-foreground"
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))}

                {streamingResponse && (
                  <div className="flex gap-3.5 items-start">
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary text-badge-val">AI</span>
                    <div className="p-3.5 rounded-2xl text-body-sm leading-relaxed bg-surface border border-border text-foreground font-semibold">
                      {streamingResponse}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Confirmation Panel Overlay */}
            {actionConfirmation && (
              <div className="max-w-md mx-auto bg-surface border border-border p-4 rounded-2xl shadow-lg space-y-3">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <Sparkles size={14} className="text-primary animate-pulse" />
                  <span className="text-overline text-foreground block font-bold">Detected Workspace Action Intent</span>
                </div>
                <div className="text-body-sm text-muted leading-relaxed">
                  <p className="text-overline text-primary tracking-wider block font-bold">{actionConfirmation.type} to build:</p>
                  <p className="text-body-sm font-extrabold text-foreground mt-0.5">{actionConfirmation.payload.title}</p>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setActionConfirmation(null)} className="btn-outline h-9.5 px-3 py-1">Discard</button>
                  <button onClick={handleConfirmAction} className="btn-primary h-9.5 px-3 py-1">
                    {actionSuccess ? <Check size={11} /> : "Execute Confirmation"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Form input bar */}
          <div className="p-4 bg-surface border-t border-border shrink-0">
            <div className="max-w-3xl mx-auto flex gap-2">
              <button
                type="button"
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                className={`grid size-10 place-items-center rounded-xl border transition ${
                  isRecording ? "bg-red-500 border-red-500 text-white animate-pulse" : "btn-secondary text-primary border-border bg-surface flex items-center justify-center"
                }`}
              >
                {isRecording ? <MicOff size={15} /> : <Mic size={15} />}
              </button>

              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  placeholder="Ask Gemini orchestrator..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitPrompt(inputMsg)}
                  className="w-full input-cozy h-10 pr-10"
                />
                <button
                  onClick={() => handleSubmitPrompt(inputMsg)}
                  disabled={isAiResponding || !inputMsg.trim()}
                  className="absolute right-2 grid size-7 place-items-center rounded-lg bg-primary text-white hover:bg-primary-hover transition"
                >
                  <Send size={11} fill="currentColor" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Bot,
  Loader2,
  ChevronLeft,
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
import { ChatHistorySidebar } from "@/components/ai-assistant/ChatHistorySidebar";
import { MessageThread } from "@/components/ai-assistant/MessageThread";
import { InputComposer } from "@/components/ai-assistant/InputComposer";
import { PageWrapper } from "@/components/PageWrapper";

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

  const handleSelectChat = async (chat: any) => {
    setActiveChat(chat);
    await loadMessages(chat.id);
  };

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this conversation logs forever?")) {
      try {
        await deleteChat(id);
        setChatsList((curr) => curr.filter((c) => c.id !== id));
        if (activeChat?.id === id) {
          setActiveChat(null);
          setMessages([]);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Voice recording streaming
  const startVoiceRecording = async () => {
    try {
      const response = await fetch("/api/assemblyai/token", { method: "POST" });
      const { token } = await response.json();

      socketRef.current = new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`);
      socketRef.current.onopen = () => {
        setIsRecording(true);
      };

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.text && data.message_type === "PartialTranscript") {
          setInputMsg(data.text);
        } else if (data.text && data.message_type === "FinalTranscript") {
          setInputMsg(data.text);
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass({ sampleRate: 16000 });
      const source = audioCtxRef.current.createMediaStreamSource(stream);

      processorRef.current = audioCtxRef.current.createScriptProcessor(4096, 1, 1);
      source.connect(processorRef.current);
      processorRef.current.connect(audioCtxRef.current.destination);

      processorRef.current.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          const raw = JSON.stringify({ audio_data: Buffer.from(pcmData.buffer).toString("base64") });
          socketRef.current.send(raw);
        }
      };
    } catch (err) {
      console.error("Audio dictation stream initiation failed:", err);
    }
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify({ terminate_session: true }));
      socketRef.current.close();
      socketRef.current = null;
    }
  };

  // Submit chat prompt
  const handleSubmitPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;
    let chat = activeChat;
    if (!chat) {
      chat = await createChat(promptText.substring(0, 30), "Gemini");
      setChatsList((prev) => [chat, ...prev]);
      setActiveChat(chat);
    }

    const userMsg = { id: "user_" + Date.now(), role: "user", content: promptText };
    setMessages((prev) => [...prev, userMsg]);
    setInputMsg("");
    setIsAiResponding(true);
    setStreamingResponse("");

    try {
      await saveMessage(chat.id, "user", promptText);

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: promptText }].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("API responds error");
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiText = "";

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          aiText += chunk;
          setStreamingResponse((prev) => prev + chunk);
        }
      }

      await saveMessage(chat.id, "assistant", aiText);

      // Perform actions detection (mock logic for tool integrations)
      if (aiText.toLowerCase().includes("schedule meeting") || aiText.toLowerCase().includes("schedule sync")) {
        setActionConfirmation({
          type: "event",
          payload: { title: "Team Coordination Sync", date: new Date().toISOString().split("T")[0], time: "14:00" },
        });
      } else if (aiText.toLowerCase().includes("create note") || aiText.toLowerCase().includes("create a note")) {
        setActionConfirmation({
          type: "note",
          payload: { title: "Draft Specification Notes", content: "Outlining AI assistant features schema logs." },
        });
      }

      setMessages((prev) => [...prev, { id: "ai_" + Date.now(), role: "assistant", content: aiText }]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [...prev, { id: "ai_" + Date.now(), role: "assistant", content: "Apologies, I encountered an internal socket issue." }]);
    } finally {
      setIsAiResponding(false);
      setStreamingResponse("");
    }
  };

  const handleConfirmAction = async () => {
    if (!actionConfirmation) return;
    try {
      setActionSuccess(true);
      if (actionConfirmation.type === "event") {
        await createEvent({
          title: actionConfirmation.payload.title,
          date: actionConfirmation.payload.date,
          time: actionConfirmation.payload.time,
          category: "Meeting",
          priority: "High",
        });
      } else if (actionConfirmation.type === "note") {
        await createNote({ title: actionConfirmation.payload.title });
      }
      setTimeout(() => {
        setActionConfirmation(null);
        setActionSuccess(false);
      }, 1500);
    } catch (e) {
      console.error(e);
      setActionSuccess(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Navigation */}
      <WorkspaceSidebar active="AI Assistant" />

      <PageWrapper className="flex-grow min-w-0 flex h-screen overflow-hidden pt-[64px] lg:pt-0">
        <ChatHistorySidebar
          chatsList={chatsList}
          activeChat={activeChat}
          loadingChats={loadingChats}
          handleCreateChat={handleCreateChat}
          handleSelectChat={handleSelectChat}
          handleDeleteChat={handleDeleteChat}
        />

        {/* Right Chat Board */}
        <section className={`flex-grow flex flex-col bg-background relative h-full ${!activeChat ? "hidden lg:flex" : "flex"}`}>
          {/* Header */}
          <div className="h-[68px] bg-surface border-b border-border flex items-center px-6 gap-3 shrink-0">
            {activeChat && (
              <button
                onClick={() => setActiveChat(null)}
                className="mr-1.5 grid size-8.5 place-items-center rounded-xl border border-border bg-surface text-muted shadow-xs hover:bg-hover-overlay lg:hidden shrink-0"
                aria-label="Back to conversations list"
              >
                <ChevronLeft size={14} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center bg-primary-soft text-primary rounded-xl"><Bot size={15} /></span>
              <div>
                <h3 className="text-body-sm font-extrabold text-foreground">{activeChat?.title || "New Session"}</h3>
                <p className="text-overline text-muted block font-semibold">AI Orchestrator</p>
              </div>
            </div>
          </div>

          <MessageThread
            messages={messages}
            loadingHistory={loadingHistory}
            streamingResponse={streamingResponse}
            isAiResponding={isAiResponding}
            actionConfirmation={actionConfirmation}
            setActionConfirmation={setActionConfirmation}
            actionSuccess={actionSuccess}
            handleConfirmAction={handleConfirmAction}
            suggestedPrompts={suggestedPrompts}
            setInputMsg={setInputMsg}
            handleSubmitPrompt={handleSubmitPrompt}
          />

          {/* Sound wave overlay */}
          {isRecording && (
            <div className="flex justify-center items-center py-2.5 bg-background border-t border-border shrink-0 gap-2">
              <div className="voice-wave-container">
                <span className="voice-wave-bar" />
                <span className="voice-wave-bar" />
                <span className="voice-wave-bar" />
                <span className="voice-wave-bar" />
                <span className="voice-wave-bar" />
              </div>
              <span className="text-caption text-primary font-bold animate-pulse">Streaming Voice Dictation...</span>
            </div>
          )}

          <InputComposer
            inputMsg={inputMsg}
            setInputMsg={setInputMsg}
            isAiResponding={isAiResponding}
            handleSubmitPrompt={handleSubmitPrompt}
            isRecording={isRecording}
            startVoiceRecording={startVoiceRecording}
            stopVoiceRecording={stopVoiceRecording}
          />
        </section>
      </PageWrapper>
    </div>
  );
}

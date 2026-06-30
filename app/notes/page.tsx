"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
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
  Mic,
  MicOff,
  Sparkles,
  Check,
  RotateCcw,
  Copy,
  ChevronLeft,
  ChevronRight,
  Menu,
  Zap,
  PanelLeftClose,
  Clock,
} from "lucide-react";
import {
  listNotes,
  createNote,
  updateNoteMetadata,
  updateNoteContent,
  deleteNoteForever,
  duplicateNote,
  refineSelectedText,
} from "@/lib/notes/actions";

const sidebarNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "AI Assistant", icon: Bot, href: "/ai-assistant" },
  { label: "Calendar", icon: CalendarDays, href: "/calendar" },
  { label: "Tasks", icon: SquareKanban, href: "/kanban" },
  { label: "Notes", icon: StickyNote, href: "/notes", active: true },
  { label: "Whiteboard", icon: PenTool, href: "/whiteboard" },
  { label: "Spaces", icon: PanelTop, href: "/spaces" },
  { label: "AI Builder", icon: WandSparkles, href: "/ai-template-builder" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export default function NotesPage() {
  const { user } = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Notes state
  const [notesList, setNotesList] = useState<any[]>([]);
  const [activeNote, setActiveNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);

  // Search Notes
  const [noteSearch, setNoteSearch] = useState("");

  // AI Refine State
  const [aiPrompt, setAiPrompt] = useState("");
  const [refining, setRefining] = useState(false);

  // AssemblyAI Voice transcription state
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    onUpdate: ({ editor }) => {
      if (!activeNote) return;
      const htmlContent = editor.getHTML();
      const plainText = editor.getText();
      const wordsCount = plainText.split(/\s+/).filter(Boolean).length;

      // Debounce/autosave simulation
      setSaving(true);
      const timer = setTimeout(async () => {
        try {
          await updateNoteContent(activeNote.id, htmlContent, plainText, wordsCount);
          setNotesList((curr) =>
            curr.map((n) =>
              n.id === activeNote.id
                ? { ...n, content: htmlContent, plainText, wordCount: wordsCount }
                : n
            )
          );
        } catch (e) {
          console.error("Autosave failed:", e);
        } finally {
          setSaving(false);
        }
      }, 1000);

      return () => clearTimeout(timer);
    },
  });

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await listNotes();
      setNotesList(res);
      if (res.length > 0) {
        setActiveNote(res[0]);
        if (editor) {
          editor.commands.setContent(res[0].content || "");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Update editor content when active note changes
  useEffect(() => {
    if (activeNote && editor) {
      const currentHTML = editor.getHTML();
      if (currentHTML !== activeNote.content) {
        editor.commands.setContent(activeNote.content || "");
      }
    }
  }, [activeNote, editor]);

  const handleCreateNote = async () => {
    try {
      setCreating(true);
      const newNote = await createNote({ title: "New Note", color: "#6c5ce7" });
      setNotesList((prev) => [newNote, ...prev]);
      setActiveNote(newNote);
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateTitle = async (newTitle: string) => {
    if (!activeNote) return;
    try {
      setActiveNote((prev: any) => ({ ...prev, title: newTitle }));
      setNotesList((curr) => curr.map((n) => (n.id === activeNote.id ? { ...n, title: newTitle } : n)));
      await updateNoteMetadata(activeNote.id, { title: newTitle });
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleFavorite = async () => {
    if (!activeNote) return;
    try {
      const nextFav = !activeNote.isFavorite;
      setActiveNote((prev: any) => ({ ...prev, isFavorite: nextFav }));
      setNotesList((curr) => curr.map((n) => (n.id === activeNote.id ? { ...n, isFavorite: nextFav } : n)));
      await updateNoteMetadata(activeNote.id, { isFavorite: nextFav });
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePin = async () => {
    if (!activeNote) return;
    try {
      const nextPin = !activeNote.isPinned;
      setActiveNote((prev: any) => ({ ...prev, isPinned: nextPin }));
      setNotesList((curr) => curr.map((n) => (n.id === activeNote.id ? { ...n, isPinned: nextPin } : n)));
      await updateNoteMetadata(activeNote.id, { isPinned: nextPin });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateColor = async (colorHex: string) => {
    if (!activeNote) return;
    try {
      setActiveNote((prev: any) => ({ ...prev, color: colorHex }));
      setNotesList((curr) => curr.map((n) => (n.id === activeNote.id ? { ...n, color: colorHex } : n)));
      await updateNoteMetadata(activeNote.id, { color: colorHex });
    } catch (e) {
      console.error(e);
    }
  };

  const handleTrashNote = async () => {
    if (!activeNote) return;
    if (confirm("Are you sure you want to move this note to trash?")) {
      try {
        await updateNoteMetadata(activeNote.id, { isTrashed: true });
        const remaining = notesList.filter((n) => n.id !== activeNote.id);
        setNotesList(remaining);
        setActiveNote(remaining.length > 0 ? remaining[0] : null);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDuplicateNote = async () => {
    if (!activeNote) return;
    try {
      setCreating(true);
      const dup = await duplicateNote(activeNote.id);
      setNotesList((prev) => [dup, ...prev]);
      setActiveNote(dup);
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  // Gemini AI Refine Handler
  const handleAIRefine = async () => {
    if (!editor || !aiPrompt.trim()) return;
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      " "
    );
    const targetText = selectedText || editor.getText();

    try {
      setRefining(true);
      const refined = await refineSelectedText(targetText, aiPrompt);
      if (selectedText) {
        editor.chain().focus().insertContent(refined).run();
      } else {
        editor.commands.setContent(refined);
      }
      setAiPrompt("");
    } catch (e) {
      console.error(e);
    } finally {
      setRefining(false);
    }
  };

  // AssemblyAI Voice Note Streaming
  const startVoiceRecording = async () => {
    try {
      const response = await fetch("/api/assemblyai/token", { method: "POST" });
      if (!response.ok) throw new Error("AssemblyAI handshake failed");
      const { token } = await response.json();

      const wsUrl = `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx({ sampleRate: 16000 });
        audioContextRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          // Downsample and convert to 16-bit PCM
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
          setTranscript(res.text);
        } else if (res.text && res.message_type === "FinalTranscript") {
          setTranscript("");
          if (editor) {
            editor.chain().focus().insertContent(res.text + " ").run();
          }
        }
      };

      socket.onerror = (e) => console.error("AssemblyAI streaming error:", e);
      socket.onclose = () => stopVoiceRecording();

    } catch (err) {
      console.error("Recording start failed:", err);
      alert("Please grant microphone permissions to use voice transcription.");
    }
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    setTranscript("");

    if (processorRef.current) processorRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    if (micStreamRef.current) micStreamRef.current.getTracks().forEach((track) => track.stop());
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ terminate_session: true }));
      }
      socketRef.current.close();
    }
  };

  const filteredNotes = notesList.filter((note) =>
    note.title.toLowerCase().includes(noteSearch.toLowerCase())
  );

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

      {/* Workspace notes list & editor */}
      <main className="flex-1 min-w-0 lg:ml-[210px] flex h-screen overflow-hidden">
        
        {/* Notes sidebar */}
        <section className="w-64 border-r border-[#efedf4] bg-white flex flex-col shrink-0">
          <div className="p-4 border-b border-[#efedf4] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#b0a9bd] uppercase tracking-wider">Your Notes</span>
              <button
                onClick={handleCreateNote}
                disabled={creating}
                className="p-1.5 bg-[#eeeaff] text-[#6c5ce7] rounded-xl hover:bg-[#6c5ce7] hover:text-white transition"
              >
                {creating ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              </button>
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#b0a9bd]" />
              <input
                type="text"
                placeholder="Search notes..."
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                className="w-full h-8 bg-[#f8f8fb] border border-[#e5e2ed] rounded-lg pl-8 pr-2.5 text-xs outline-none focus:border-[#bdb4f1]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-xs text-[#b0a9bd]">
                <Loader2 size={13} className="animate-spin text-[#6c5ce7] mr-1.5" /> Loading...
              </div>
            ) : filteredNotes.length === 0 ? (
              <p className="text-xs text-[#b0a9bd] text-center py-6">No notes found.</p>
            ) : (
              filteredNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => setActiveNote(note)}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition ${
                    activeNote?.id === note.id ? "bg-[#eeeaff]/60 text-[#5143bd]" : "hover:bg-[#fbfaff]"
                  }`}
                >
                  <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: note.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">{note.title}</p>
                    <p className="text-[9px] text-[#aaa6b5] truncate mt-0.5">
                      {note.plainText || "Empty note"}
                    </p>
                  </div>
                  {note.isPinned && <Sparkles size={11} className="text-amber-500 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </section>

        {/* Note editor panel */}
        <section className="flex-grow bg-white flex flex-col min-w-0 h-full overflow-hidden">
          {activeNote ? (
            <>
              {/* Note Header toolbar */}
              <div className="flex h-[64px] items-center gap-3 border-b border-[#efedf4] px-6 shrink-0 bg-white/80 backdrop-blur-xl">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => handleUpdateTitle(e.target.value)}
                  className="font-black text-base text-[#282633] outline-none border-b border-transparent focus:border-[#efedf4] flex-grow max-w-sm"
                />

                {saving && (
                  <span className="text-[10px] text-[#aaa6b5] font-semibold flex items-center animate-pulse gap-1">
                    <Clock size={11} /> Saving
                  </span>
                )}

                <div className="ml-auto flex items-center gap-2">
                  <button onClick={handleToggleFavorite} className={`p-1.5 rounded-lg border transition ${activeNote.isFavorite ? "border-yellow-100 bg-yellow-50/20 text-yellow-600" : "border-[#e5e2ed] text-[#aaa6b5] hover:text-[#282633]"}`}>
                    <Star size={14} fill={activeNote.isFavorite ? "currentColor" : "none"} />
                  </button>
                  <button onClick={handleTogglePin} className={`p-1.5 rounded-lg border transition ${activeNote.isPinned ? "border-amber-100 bg-amber-50/20 text-amber-600" : "border-[#e5e2ed] text-[#aaa6b5] hover:text-[#282633]"}`}>
                    <Sparkles size={14} />
                  </button>
                  <button onClick={handleDuplicateNote} className="p-1.5 rounded-lg border border-[#e5e2ed] text-[#716c7d] hover:text-[#6c5ce7]">
                    <Copy size={14} />
                  </button>
                  <button onClick={handleTrashNote} className="p-1.5 rounded-lg border border-[#e5e2ed] text-[#716c7d] hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Note Body */}
              <div className="flex-1 flex min-w-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto px-8 py-6 prose max-w-none prose-sm">
                  
                  {/* Colors selector bar */}
                  <div className="flex items-center gap-1.5 mb-4">
                    {["#6c5ce7", "#3e9b68", "#ef6688", "#e49a3a", "#3b82f6", "#b0a9bd"].map((cHex) => (
                      <button
                        key={cHex}
                        onClick={() => handleUpdateColor(cHex)}
                        className={`size-4 rounded-full border border-white transition relative flex items-center justify-center shrink-0 ${activeNote.color === cHex ? "ring-2 ring-[#6c5ce7]" : ""}`}
                        style={{ backgroundColor: cHex }}
                      />
                    ))}
                  </div>

                  <EditorContent editor={editor} className="outline-none min-h-[300px] text-sm text-[#282633] font-normal leading-relaxed" />
                </div>

                {/* Editor features sidebar */}
                <div className="w-80 border-l border-[#efedf4] p-5 space-y-6 flex flex-col bg-[#fafafc] shrink-0">
                  
                  {/* Voice Note stream AssemblyAI */}
                  <div className="bg-white border border-[#efedf4] p-4 rounded-2xl shadow-sm space-y-3">
                    <h5 className="text-[11px] font-bold text-[#5143bd] uppercase tracking-wider">Voice Notes</h5>
                    <p className="text-[10px] text-[#777281]">Dictate your text. Audio will transcribe directly at cursor:</p>
                    
                    <button
                      onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                      className={`h-9 w-full rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition ${
                        isRecording
                          ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                          : "bg-[#eeeaff] hover:bg-[#6c5ce7] text-[#5143bd] hover:text-white"
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <MicOff size={14} /> Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic size={14} /> Record Speech
                        </>
                      )}
                    </button>
                    {transcript && (
                      <div className="p-2.5 bg-slate-50 border border-dashed text-[10px] text-[#777281] rounded-xl italic">
                        &quot;{transcript}&quot;
                      </div>
                    )}
                  </div>

                  {/* Gemini refine panel */}
                  <div className="bg-white border border-[#efedf4] p-4 rounded-2xl shadow-sm space-y-3">
                    <h5 className="text-[11px] font-bold text-[#5143bd] uppercase tracking-wider">AI Edit &amp; Refine</h5>
                    <p className="text-[10px] text-[#777281]">Select some text or type your custom editing request below:</p>
                    
                    <textarea
                      placeholder="e.g. Translate to Spanish, fix grammar, rewrite professionally..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="w-full h-20 p-2 border border-[#e5e2ed] text-xs rounded-xl outline-none resize-none focus:border-[#bdb4f1]"
                    />

                    <button
                      onClick={handleAIRefine}
                      disabled={refining || !aiPrompt.trim()}
                      className="h-9 w-full bg-gradient-to-r from-[#6c5ce7] to-[#8b5cf6] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition"
                    >
                      {refining ? (
                        <>
                          <Loader2 size={13} className="animate-spin" /> Refining
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} /> Refine Text
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <StickyNote size={48} className="text-slate-300" />
              <h4 className="font-bold text-sm text-slate-500">No active notes selected</h4>
              <p className="text-xs max-w-xs text-slate-400">Select an existing note or click the plus icon to start writing.</p>
              <button onClick={handleCreateNote} className="h-9 px-4 bg-[#6c5ce7] hover:bg-[#5143bd] text-white rounded-xl text-xs font-bold">
                Create a Note
              </button>
            </div>
          )}
        </section>
      </main>
      {sidebarOpen && <button aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-[#302a3d]/20 backdrop-blur-sm lg:hidden" />}
    </div>
  );
}

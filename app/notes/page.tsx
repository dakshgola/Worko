"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { motion, AnimatePresence } from "framer-motion";
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
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar";

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
      const newNote = await createNote({ title: "New Note", color: "#FF5A36" });
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

  // AssemblyAI Audio Voice Note stream
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
        const audioContext = new AudioCtx({ sampleRate: 16000 });
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
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
        processor.connect(audioContext.destination);
        setIsRecording(true);
      };

      socket.onmessage = (message) => {
        const res = JSON.parse(message.data);
        if (res.text) {
          setTranscript(res.text);
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
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Navigation */}
      <WorkspaceSidebar active="Notes" />

      {/* Workspace notes list & editor */}
      <main className="flex-1 min-w-0 flex h-screen overflow-hidden">
        
        {/* Notes sidebar */}
        <section className="w-64 border-r border-border bg-surface flex flex-col shrink-0">
          <div className="p-4 border-b border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-overline text-muted block">Your Notes</span>
              <button
                onClick={handleCreateNote}
                disabled={creating}
                className="btn-secondary size-8 p-0 flex items-center justify-center"
              >
                {creating ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              </button>
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search notes..."
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                className="pl-8 input-cozy h-8 rounded-lg"
              />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-caption font-semibold text-muted">
                <Loader2 size={13} className="animate-spin text-primary mr-1.5" /> Loading...
              </div>
            ) : filteredNotes.length === 0 ? (
              <p className="text-caption font-semibold text-muted text-center py-6">No notes found.</p>
            ) : (
              filteredNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => setActiveNote(note)}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition ${
                    activeNote?.id === note.id ? "bg-primary-soft text-primary" : "hover:bg-hover-overlay"
                  }`}
                >
                  <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: note.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-body-sm font-bold truncate">{note.title}</p>
                    <p className="text-caption text-muted truncate mt-0.5 font-semibold">
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
        <section className="flex-grow bg-background flex flex-col min-w-0 h-full overflow-hidden">
          {activeNote ? (
            <>
              {/* Note Header toolbar */}
              <div className="flex h-[64px] items-center gap-3 border-b border-border px-6 shrink-0 bg-surface/80 backdrop-blur-xl">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => handleUpdateTitle(e.target.value)}
                  className="text-h3 text-foreground outline-none border-b border-transparent focus:border-border flex-grow max-w-sm bg-transparent font-bold"
                />

                {saving && (
                  <span className="text-caption text-muted font-semibold flex items-center animate-pulse gap-1">
                    <Clock size={11} /> Saving
                  </span>
                )}

                <div className="ml-auto flex items-center gap-2">
                  <button onClick={handleToggleFavorite} className={`p-1.5 rounded-lg border transition ${activeNote.isFavorite ? "border-yellow-100 bg-yellow-50/20 text-yellow-600" : "border-border bg-surface text-muted hover:text-foreground"}`}>
                    <Star size={14} fill={activeNote.isFavorite ? "currentColor" : "none"} />
                  </button>
                  <button onClick={handleTogglePin} className={`p-1.5 rounded-lg border transition ${activeNote.isPinned ? "border-amber-100 bg-amber-50/20 text-amber-600" : "border-border bg-surface text-muted hover:text-foreground"}`}>
                    <Sparkles size={14} />
                  </button>
                  <button onClick={handleDuplicateNote} className="btn-icon size-8 flex items-center justify-center text-muted hover:text-primary">
                    <Copy size={14} />
                  </button>
                  <button onClick={handleTrashNote} className="btn-icon size-8 flex items-center justify-center text-muted hover:text-danger">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Note Body */}
              <div className="flex-1 flex min-w-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto px-8 py-6 bg-surface prose max-w-none">
                  
                  {/* Colors selector bar */}
                  <div className="flex items-center gap-1.5 mb-4">
                    {["#FF5A36", "#3e9b68", "#ef6688", "#e49a3a", "#3b82f6", "#aaa6b5"].map((cHex) => (
                      <button
                        key={cHex}
                        onClick={() => handleUpdateColor(cHex)}
                        className={`size-4 rounded-full border border-white transition relative flex items-center justify-center shrink-0 ${activeNote.color === cHex ? "ring-2 ring-primary" : ""}`}
                        style={{ backgroundColor: cHex }}
                      />
                    ))}
                  </div>

                  <EditorContent editor={editor} className="outline-none min-h-[300px] text-body text-foreground" />
                </div>

                {/* Editor features sidebar */}
                <div className="w-80 border-l border-border p-5 space-y-6 flex flex-col bg-background shrink-0">
                  
                  {/* Voice Note stream AssemblyAI */}
                  <div className="bg-surface border border-border p-4 rounded-2xl shadow-sm space-y-3">
                    <h5 className="text-label-val text-primary uppercase tracking-wider block font-bold">Voice Notes</h5>
                    <p className="text-caption text-muted">Dictate your text. Audio will transcribe directly at cursor:</p>
                    
                    {isRecording && (
                      <div className="flex justify-center items-center py-2">
                        <div className="voice-wave-container">
                          <span className="voice-wave-bar" />
                          <span className="voice-wave-bar" />
                          <span className="voice-wave-bar" />
                          <span className="voice-wave-bar" />
                          <span className="voice-wave-bar" />
                        </div>
                      </div>
                    )}

                    <button
                      onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                      className={`h-9.5 w-full btn-secondary text-btn flex items-center justify-center gap-1.5 shadow-sm transition ${
                        isRecording
                          ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                          : "hover:bg-primary hover:text-white"
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
                      <div className="p-2.5 bg-background border border-dashed border-border text-caption text-muted rounded-xl italic font-semibold">
                        &quot;{transcript}&quot;
                      </div>
                    )}
                  </div>

                  {/* Gemini refine panel */}
                  <div className="bg-surface border border-border p-4 rounded-2xl shadow-sm space-y-3">
                    <h5 className="text-label-val text-primary uppercase tracking-wider block font-bold">AI Edit &amp; Refine</h5>
                    <p className="text-caption text-muted">Select some text or type your custom editing request below:</p>
                    
                    <textarea
                      placeholder="e.g. Translate to Spanish, fix grammar, rewrite professionally..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="w-full h-20 p-2 border border-border text-input-val rounded-xl outline-none resize-none focus:border-primary bg-background text-foreground"
                    />

                    <button
                      onClick={handleAIRefine}
                      disabled={refining || !aiPrompt.trim()}
                      className="w-full btn-primary h-9.5"
                    >
                      {refining ? (
                        <div className="flex items-center justify-center gap-1">
                          <span className="ai-dot-indicator" />
                          <span className="ai-dot-indicator" />
                          <span className="ai-dot-indicator" />
                        </div>
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
              <h4 className="text-body-sm font-bold text-slate-500">No active notes selected</h4>
              <p className="text-caption max-w-xs text-slate-400">Select an existing note or click the plus icon to start writing.</p>
              <button onClick={handleCreateNote} className="btn-primary h-9.5 px-4">
                Create a Note
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

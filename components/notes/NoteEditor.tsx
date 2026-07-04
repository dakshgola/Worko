"use client";
import React from "react";
import { EditorContent } from "@tiptap/react";
import {
  ChevronLeft,
  Clock,
  Star,
  Sparkles,
  Copy,
  Trash2,
  MicOff,
  Mic,
  StickyNote,
} from "lucide-react";

import { Note } from "@/db/schema";
import { Editor } from "@tiptap/react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface NoteEditorProps {
  activeNote: Note | null;
  setActiveNote: (note: Note | null) => void;
  editor: Editor | null;
  saving: boolean;
  handleUpdateTitle: (title: string) => void;
  handleToggleFavorite: () => void;
  handleTogglePin: () => void;
  handleDuplicateNote: () => void;
  handleTrashNote: () => void;
  handleUpdateColor: (colorHex: string) => void;
  isRecording: boolean;
  transcript: string;
  startVoiceRecording: () => void;
  stopVoiceRecording: () => void;
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  refining: boolean;
  handleAIRefine: () => void;
  handleCreateNote: () => void;
}

export function NoteEditor({
  activeNote,
  setActiveNote,
  editor,
  saving,
  handleUpdateTitle,
  handleToggleFavorite,
  handleTogglePin,
  handleDuplicateNote,
  handleTrashNote,
  handleUpdateColor,
  isRecording,
  transcript,
  startVoiceRecording,
  stopVoiceRecording,
  aiPrompt,
  setAiPrompt,
  refining,
  handleAIRefine,
  handleCreateNote,
}: NoteEditorProps) {
  return (
    <section className={`flex-grow bg-background flex flex-col min-w-0 h-full overflow-hidden ${!activeNote ? "hidden lg:flex" : "flex"}`}>
      {activeNote ? (
        <>
          {/* Note Header toolbar */}
          <div className="flex h-[64px] items-center gap-3 border-b border-border px-6 shrink-0 bg-surface/80 backdrop-blur-xl">
            <button
              onClick={() => setActiveNote(null)}
              className="mr-1.5 grid size-8.5 place-items-center rounded-xl border border-border bg-surface text-muted shadow-xs hover:bg-hover-overlay lg:hidden shrink-0"
              aria-label="Back to notes list"
            >
              <ChevronLeft size={14} />
            </button>
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      aria-label="Toggle favorite"
                      onClick={handleToggleFavorite}
                      className={`p-1.5 rounded-lg border transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                        activeNote.isFavorite
                          ? "border-yellow-100 bg-yellow-50/20 text-yellow-600"
                          : "border-border bg-surface text-muted hover:text-foreground"
                      }`}
                    >
                      <Star size={14} fill={activeNote.isFavorite ? "currentColor" : "none"} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Toggle favorite</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      aria-label="Toggle pin"
                      onClick={handleTogglePin}
                      className={`p-1.5 rounded-lg border transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                        activeNote.isPinned
                          ? "border-amber-100 bg-amber-50/20 text-amber-600"
                          : "border-border bg-surface text-muted hover:text-foreground"
                      }`}
                    >
                      <Sparkles size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Toggle pin</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      aria-label="Duplicate note"
                      onClick={handleDuplicateNote}
                      className="btn-icon size-8 flex items-center justify-center text-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                    >
                      <Copy size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Duplicate note</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      aria-label="Delete note"
                      onClick={handleTrashNote}
                      className="btn-icon size-8 flex items-center justify-center text-muted hover:text-danger focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                    >
                      <Trash2 size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Delete note</TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
            <div className="w-80 border-l border-border p-5 space-y-6 flex flex-col bg-background shrink-0 hidden lg:flex">
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
  );
}

"use client";
import React from "react";
import { Search, Loader2, Plus, Sparkles } from "lucide-react";

import { Note } from "@/db/schema";

interface NotesListProps {
  activeNote: Note | null;
  setActiveNote: (note: Note | null) => void;
  creating: boolean;
  handleCreateNote: () => void;
  noteSearch: string;
  setNoteSearch: (s: string) => void;
  loading: boolean;
  filteredNotes: Note[];
}

function extractTextFromTiptapDoc(node: any): string {
  if (!node) return "";
  if (node.type === "text" && node.text) {
    return node.text;
  }
  if (node.content && Array.isArray(node.content)) {
    return node.content.map(extractTextFromTiptapDoc).join(" ");
  }
  return "";
}

function getNotePreview(plainText: string | null): string {
  if (!plainText) return "Empty note";
  const trimmed = plainText.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.type === "doc") {
        return extractTextFromTiptapDoc(parsed).trim() || "Empty note";
      }
    } catch (e) {
      // Ignore parse failure, treat as literal text
    }
  }
  return plainText || "Empty note";
}

export function NotesList({
  activeNote,
  setActiveNote,
  creating,
  handleCreateNote,
  noteSearch,
  setNoteSearch,
  loading,
  filteredNotes,
}: NotesListProps) {
  return (
    <section className={`w-full lg:w-64 border-r border-border bg-surface flex flex-col shrink-0 ${activeNote ? "hidden lg:flex" : "flex"}`}>
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
                  {getNotePreview(note.plainText)}
                </p>
              </div>
              {note.isPinned && <Sparkles size={11} className="text-amber-500 shrink-0" />}
            </button>
          ))
        )}
      </div>
    </section>
  );
}

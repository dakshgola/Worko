"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
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
import { useVoiceDictation } from "@/hooks/useVoiceDictation";
import { NotesList } from "@/components/notes/NotesList";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import { Note } from "@/db/schema";

export default function NotesPage() {
  const { user } = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Notes state
  const [notesList, setNotesList] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);

  // Search Notes
  const [noteSearch, setNoteSearch] = useState("");
  const [noteToTrash, setNoteToTrash] = useState<string | null>(null);

  // AI Refine State
  const [aiPrompt, setAiPrompt] = useState("");
  const [refining, setRefining] = useState(false);

  // Keep track of activeNote via Ref to avoid stale closures in TipTap callbacks
  const activeNoteRef = useRef<Note | null>(null);
  useEffect(() => {
    activeNoteRef.current = activeNote;
  }, [activeNote]);

  // Keep track of the active debounce timer for autosaving
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep track of which note is currently loaded in the editor to prevent overwriting content while typing
  const [loadedNoteId, setLoadedNoteId] = useState<string | null>(null);

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    onUpdate: ({ editor: currentEditor }) => {
      const currentNote = activeNoteRef.current;
      if (!currentNote) return;
      const htmlContent = currentEditor.getHTML();
      const plainText = currentEditor.getText();
      const wordsCount = plainText.split(/\s+/).filter(Boolean).length;

      // Debounce/autosave
      setSaving(true);
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = setTimeout(async () => {
        try {
          await updateNoteContent(currentNote.id, htmlContent, plainText, wordsCount);
          setNotesList((curr) =>
            curr.map((n) =>
              n.id === currentNote.id
                ? { ...n, content: htmlContent, plainText, wordCount: wordsCount }
                : n
            )
          );
          setActiveNote((curr) => {
            if (curr && curr.id === currentNote.id) {
              return { ...curr, content: htmlContent, plainText, wordCount: wordsCount };
            }
            return curr;
          });
        } catch (e) {
          console.error("Autosave failed:", e);
        } finally {
          setSaving(false);
        }
      }, 1000);
    },
  });

  // Wire AssemblyAI Voice dictation custom hook
  const {
    isRecording,
    transcript,
    startVoiceRecording,
    stopVoiceRecording,
  } = useVoiceDictation(editor);

  const setEditorContentParsed = (contentStr: string | null) => {
    if (!editor) return;
    const content = contentStr || "";
    if (content.trim().startsWith('{"type":"doc"')) {
      try {
        editor.commands.setContent(JSON.parse(content));
      } catch (e) {
        editor.commands.setContent(content);
      }
    } else {
      editor.commands.setContent(content);
    }
  };

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await listNotes();
      setNotesList(res);
      if (res.length > 0) {
        setActiveNote(res[0]);
        if (editor) {
          setEditorContentParsed(res[0].content);
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
      if (activeNote.id !== loadedNoteId) {
        setEditorContentParsed(activeNote.content);
        setLoadedNoteId(activeNote.id);
      }
    } else if (!activeNote && editor) {
      editor.commands.setContent("");
      setLoadedNoteId(null);
    }
  }, [activeNote, editor, loadedNoteId]);

  const handleCreateNote = async () => {
    try {
      setCreating(true);
      const newNote = await createNote({ title: "New Note", color: "#FF5A36" });
      setNotesList((prev) => [newNote, ...prev]);
      setActiveNote(newNote);
      toast.success("Note created successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to create note");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateTitle = async (newTitle: string) => {
    if (!activeNote) return;
    try {
      setActiveNote((prev) => prev ? { ...prev, title: newTitle } : null);
      setNotesList((curr) => curr.map((n) => (n.id === activeNote.id ? { ...n, title: newTitle } : n)));
      await updateNoteMetadata(activeNote.id, { title: newTitle });
    } catch (e) {
      console.error(e);
      toast.error("Failed to update note title");
    }
  };

  const handleToggleFavorite = async () => {
    if (!activeNote) return;
    try {
      const nextFav = !activeNote.isFavorite;
      setActiveNote((prev) => prev ? { ...prev, isFavorite: nextFav } : null);
      setNotesList((curr) => curr.map((n) => (n.id === activeNote.id ? { ...n, isFavorite: nextFav } : n)));
      await updateNoteMetadata(activeNote.id, { isFavorite: nextFav });
      toast.success(nextFav ? "Added to favorites" : "Removed from favorites");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update favorite status");
    }
  };

  const handleTogglePin = async () => {
    if (!activeNote) return;
    try {
      const nextPin = !activeNote.isPinned;
      setActiveNote((prev) => prev ? { ...prev, isPinned: nextPin } : null);
      setNotesList((curr) => curr.map((n) => (n.id === activeNote.id ? { ...n, isPinned: nextPin } : n)));
      await updateNoteMetadata(activeNote.id, { isPinned: nextPin });
      toast.success(nextPin ? "Note pinned" : "Note unpinned");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update pin status");
    }
  };

  const handleUpdateColor = async (colorHex: string) => {
    if (!activeNote) return;
    try {
      setActiveNote((prev) => prev ? { ...prev, color: colorHex } : null);
      setNotesList((curr) => curr.map((n) => (n.id === activeNote.id ? { ...n, color: colorHex } : n)));
      await updateNoteMetadata(activeNote.id, { color: colorHex });
      toast.success("Note color updated");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update color");
    }
  };

  const handleTrashNote = async () => {
    if (!activeNote) return;
    setNoteToTrash(activeNote.id);
  };

  const handleDuplicateNote = async () => {
    if (!activeNote) return;
    try {
      setCreating(true);
      const dup = await duplicateNote(activeNote.id);
      setNotesList((prev) => [dup, ...prev]);
      setActiveNote(dup);
      toast.success("Note duplicated successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to duplicate note");
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

  const filteredNotes = notesList.filter((note) =>
    note.title.toLowerCase().includes(noteSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Navigation */}
      <WorkspaceSidebar active="Notes" />

      {/* Workspace notes list & editor */}
      <main className="flex-1 min-w-0 flex h-screen overflow-hidden pt-[64px] lg:pt-0">
        <NotesList
          activeNote={activeNote}
          setActiveNote={setActiveNote}
          creating={creating}
          handleCreateNote={handleCreateNote}
          noteSearch={noteSearch}
          setNoteSearch={setNoteSearch}
          loading={loading}
          filteredNotes={filteredNotes}
        />

        <NoteEditor
          activeNote={activeNote}
          setActiveNote={setActiveNote}
          editor={editor}
          saving={saving}
          handleUpdateTitle={handleUpdateTitle}
          handleToggleFavorite={handleToggleFavorite}
          handleTogglePin={handleTogglePin}
          handleDuplicateNote={handleDuplicateNote}
          handleTrashNote={handleTrashNote}
          handleUpdateColor={handleUpdateColor}
          isRecording={isRecording}
          transcript={transcript}
          startVoiceRecording={startVoiceRecording}
          stopVoiceRecording={stopVoiceRecording}
          aiPrompt={aiPrompt}
          setAiPrompt={setAiPrompt}
          refining={refining}
          handleAIRefine={handleAIRefine}
          handleCreateNote={handleCreateNote}
        />
      </main>

      <Dialog open={!!noteToTrash} onOpenChange={(open) => { if (!open) setNoteToTrash(null); }}>
        <DialogContent className="bg-surface border border-border w-full max-w-sm p-6 shadow-2xl dark:border-border dark:bg-surface sm:rounded-3xl gap-4">
          <DialogTitle className="text-body-sm font-extrabold text-foreground">Move note to Trash?</DialogTitle>
          <DialogDescription className="text-caption text-muted font-semibold mt-1">
            Are you sure you want to move this note to the trash? You can restore it later from settings.
          </DialogDescription>
          <div className="flex justify-end gap-2 border-t border-border pt-4 mt-2">
            <button
              onClick={() => setNoteToTrash(null)}
              className="btn-outline h-9 px-4 text-btn text-muted"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (noteToTrash) {
                  try {
                    await updateNoteMetadata(noteToTrash, { isTrashed: true });
                    const remaining = notesList.filter((n) => n.id !== noteToTrash);
                    setNotesList(remaining);
                    setActiveNote(remaining.length > 0 ? remaining[0] : null);
                    toast.success("Note moved to trash");
                  } catch (e) {
                    console.error(e);
                    toast.error("Failed to trash note");
                  } finally {
                    setNoteToTrash(null);
                  }
                }
              }}
              className="btn-primary bg-destructive hover:bg-destructive/90 h-9 px-4 text-btn text-white"
            >
              Trash Note
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

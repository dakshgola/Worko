"use server";

import { db } from "@/db";
import { notes } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function listNotes() {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    return await db
      .select()
      .from(notes)
      .where(and(eq(notes.userId, user.id), eq(notes.isTrashed, false)))
      .orderBy(desc(notes.isPinned), desc(notes.updatedAt));
  } catch (error: any) {
    console.error("Error in listNotes:", error);
    throw new Error(error.message || "Failed to list notes");
  }
}

export async function listTrashedNotes() {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    return await db
      .select()
      .from(notes)
      .where(and(eq(notes.userId, user.id), eq(notes.isTrashed, true)))
      .orderBy(desc(notes.trashedAt));
  } catch (error: any) {
    console.error("Error in listTrashedNotes:", error);
    throw new Error(error.message || "Failed to list trashed notes");
  }
}

export async function createNote(data?: { title?: string; color?: string }) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const newNoteId = "note_" + crypto.randomUUID();
    const newNote = {
      id: newNoteId,
      userId: user.id,
      title: data?.title || "Untitled Note",
      content: "",
      plainText: "",
      wordCount: 0,
      color: data?.color || "#6c5ce7",
      isPinned: false,
      isFavorite: false,
      isTrashed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      trashedAt: null as Date | null,
    };

    await db.insert(notes).values(newNote);
    return newNote;
  } catch (error: any) {
    console.error("Error in createNote:", error);
    throw new Error(error.message || "Failed to create note");
  }
}

export async function updateNoteMetadata(
  noteId: string,
  data: { title?: string; isPinned?: boolean; isFavorite?: boolean; color?: string; isTrashed?: boolean }
) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.isTrashed === true) {
      updateData.trashedAt = new Date();
    } else if (data.isTrashed === false) {
      updateData.trashedAt = null;
    }

    await db
      .update(notes)
      .set(updateData)
      .where(and(eq(notes.id, noteId), eq(notes.userId, user.id)));

    return { success: true };
  } catch (error: any) {
    console.error("Error in updateNoteMetadata:", error);
    throw new Error(error.message || "Failed to update note metadata");
  }
}

export async function updateNoteContent(noteId: string, content: string, plainText: string, wordCount: number) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    await db
      .update(notes)
      .set({
        content,
        plainText,
        wordCount,
        updatedAt: new Date(),
      })
      .where(and(eq(notes.id, noteId), eq(notes.userId, user.id)));

    return { success: true };
  } catch (error: any) {
    console.error("Error in updateNoteContent:", error);
    throw new Error(error.message || "Failed to update note content");
  }
}

export async function duplicateNote(noteId: string) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const existing = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, user.id)))
      .limit(1);

    if (existing.length === 0) throw new Error("Note not found");
    const n = existing[0];

    const duplicatedId = "note_" + crypto.randomUUID();
    const duplicatedNote = {
      id: duplicatedId,
      userId: user.id,
      title: n.title.startsWith("Copy of ") ? n.title : `Copy of ${n.title}`,
      content: n.content || "",
      plainText: n.plainText || "",
      wordCount: n.wordCount || 0,
      color: n.color,
      isPinned: false,
      isFavorite: false,
      isTrashed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      trashedAt: null as Date | null,
    };

    await db.insert(notes).values(duplicatedNote);
    return duplicatedNote;
  } catch (error: any) {
    console.error("Error in duplicateNote:", error);
    throw new Error(error.message || "Failed to duplicate note");
  }
}

export async function restoreNote(noteId: string) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    await db
      .update(notes)
      .set({ isTrashed: false, trashedAt: null, updatedAt: new Date() })
      .where(and(eq(notes.id, noteId), eq(notes.userId, user.id)));

    return { success: true };
  } catch (error: any) {
    console.error("Error in restoreNote:", error);
    throw new Error(error.message || "Failed to restore note");
  }
}

export async function deleteNoteForever(noteId: string) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    await db
      .delete(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, user.id)));

    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteNoteForever:", error);
    throw new Error(error.message || "Failed to delete note permanently");
  }
}

export async function refineSelectedText(text: string, instruction: string): Promise<string> {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return `[Simulated refinement of: "${instruction}"]\n${text}`;
    }

    const prompt = `You are an expert editor. Rewrite/refine the following text based on this instruction: "${instruction}". Output ONLY the refined text. Do not include any quotes, introductory remarks, markdown code fences, or explanations. Preserve the formatting like paragraph breaks. Here is the text:\n\n${text}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      return `[Failed to connect to Gemini API. Fallback refinement]\n${text}`;
    }

    const resData = await response.json();
    const refined = resData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return refined || text;
  } catch (error) {
    console.error("Error in refineSelectedText action:", error);
    return `[Refinement Error]\n${text}`;
  }
}

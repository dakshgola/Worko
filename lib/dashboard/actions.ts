"use server";

import { db } from "@/db";
import { notes, whiteboards, spaces, pages, generatedApps, chats, userPreferences, calendarEvents } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function getDashboardData() {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // 1. User preferences (or default check)
    const prefsList = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, user.id))
      .limit(1);

    let activePrefs = prefsList[0] || null;

    // 2. Active Notes (not trashed)
    const activeNotes = await db
      .select()
      .from(notes)
      .where(and(eq(notes.userId, user.id), eq(notes.isTrashed, false)))
      .orderBy(desc(notes.isPinned), desc(notes.updatedAt));

    // 3. Active Whiteboards (not trashed)
    const activeWhiteboards = await db
      .select()
      .from(whiteboards)
      .where(and(eq(whiteboards.userId, user.id), eq(whiteboards.isTrashed, false)))
      .orderBy(desc(whiteboards.updatedAt));

    // 4. Spaces
    const activeSpaces = await db
      .select()
      .from(spaces)
      .where(and(eq(spaces.ownerId, user.id), eq(spaces.isArchived, false)))
      .orderBy(desc(spaces.updatedAt));

    // 5. Pages
    const activePages = await db
      .select()
      .from(pages)
      .where(and(eq(pages.createdBy, user.id), eq(pages.isArchived, false)))
      .orderBy(desc(pages.updatedAt));

    // 6. Generated AI Apps (Templates)
    const templates = await db
      .select()
      .from(generatedApps)
      .where(eq(generatedApps.userId, user.id))
      .orderBy(desc(generatedApps.updatedAt));

    // 7. Recent chats
    const activeChats = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, user.id))
      .orderBy(desc(chats.updatedAt));

    // 8. Calendar Events
    const activeEvents = await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.userId, user.id))
      .orderBy(desc(calendarEvents.createdAt));

    return {
      success: true,
      preferences: activePrefs,
      notes: activeNotes,
      whiteboards: activeWhiteboards,
      spaces: activeSpaces,
      pages: activePages,
      generatedApps: templates,
      chats: activeChats,
      calendarEvents: activeEvents,
    };
  } catch (error: any) {
    console.error("Error in getDashboardData:", error);
    return {
      success: false,
      error: error.message || "Failed to load dashboard data",
      preferences: null,
      notes: [],
      whiteboards: [],
      spaces: [],
      pages: [],
      generatedApps: [],
      chats: [],
      calendarEvents: [],
    };
  }
}

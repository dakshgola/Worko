"use server";

import { db } from "@/db";
import { notes, calendarEvents, kanbanTasks } from "@/db/schema";
import { eq, or, and, ilike } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function globalSearch(query: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  if (!query || !query.trim()) return [];

  const searchPattern = `%${query.trim()}%`;

  // 1. Search notes
  const matchNotes = await db
    .select({
      id: notes.id,
      title: notes.title,
      color: notes.color,
    })
    .from(notes)
    .where(
      and(
        eq(notes.userId, user.id),
        eq(notes.isTrashed, false),
        or(
          ilike(notes.title, searchPattern),
          ilike(notes.plainText, searchPattern)
        )
      )
    )
    .limit(8);

  // 2. Search calendar events
  const matchEvents = await db
    .select({
      id: calendarEvents.id,
      title: calendarEvents.title,
      date: calendarEvents.date,
      time: calendarEvents.time,
    })
    .from(calendarEvents)
    .where(
      and(
        eq(calendarEvents.userId, user.id),
        or(
          ilike(calendarEvents.title, searchPattern),
          ilike(calendarEvents.description, searchPattern)
        )
      )
    )
    .limit(8);

  // 3. Search kanban tasks
  const matchTasks = await db
    .select({
      id: kanbanTasks.id,
      title: kanbanTasks.title,
      boardId: kanbanTasks.boardId,
      priority: kanbanTasks.priority,
    })
    .from(kanbanTasks)
    .where(
      and(
        eq(kanbanTasks.userId, user.id),
        eq(kanbanTasks.archived, false),
        or(
          ilike(kanbanTasks.title, searchPattern),
          ilike(kanbanTasks.description, searchPattern)
        )
      )
    )
    .limit(8);

  // Group and format matches
  const results: any[] = [];

  matchNotes.forEach((n) => {
    results.push({
      id: n.id,
      type: "Note",
      title: n.title,
      subtitle: "Wiki Specification",
      url: `/notes`,
      color: n.color,
    });
  });

  matchEvents.forEach((ev) => {
    results.push({
      id: ev.id,
      type: "Calendar Event",
      title: ev.title,
      subtitle: `${ev.date || "No date"} at ${ev.time || "12:00"}`,
      url: `/calendar`,
    });
  });

  matchTasks.forEach((t) => {
    results.push({
      id: t.id,
      type: "Kanban Task",
      title: t.title,
      subtitle: `Priority: ${t.priority}`,
      url: `/kanban`,
    });
  });

  return results;
}

"use server";

import { db } from "@/db";
import { calendarEvents, notifications } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { createEventSchema, updateEventSchema } from "@/lib/validation";

export async function listEvents() {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    return await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.userId, user.id))
      .orderBy(desc(calendarEvents.createdAt));
  } catch (error: any) {
    console.error("Error in listEvents:", error);
    throw new Error(error.message || "Failed to list events");
  }
}

export async function createEvent(data: {
  title: string;
  description?: string;
  date?: string;
  time?: string;
  category?: string;
  priority?: string;
  notes?: string;
  recurring?: boolean;
}) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const parsed = createEventSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message || "Invalid event data");
    }

    const ratelimit = await checkRateLimit(user.id, "db_write");
    if (!ratelimit.success) throw new Error("Too many requests, please wait a moment");

    const newEventId = "event_" + crypto.randomUUID();
    const newEvent = {
      id: newEventId,
      userId: user.id,
      title: data.title,
      description: data.description || null,
      date: data.date || null,
      time: data.time || null,
      category: data.category || "Meeting",
      priority: data.priority || "Medium",
      notes: data.notes || null,
      recurring: data.recurring || false,
      completed: false,
    };

    await db.insert(calendarEvents).values(newEvent);

    await db.insert(notifications).values({
      id: "notif_" + crypto.randomUUID(),
      userId: user.id,
      type: "calendar",
      message: `Scheduled new calendar event: "${data.title}" for ${data.date || "today"} at ${data.time || "12:00"}.`,
      read: false,
      relatedEntityId: newEventId,
    });

    return newEvent;
  } catch (error: any) {
    console.error("Error in createEvent:", error);
    throw new Error(error.message || "Failed to create event");
  }
}

export async function updateEvent(
  id: string,
  data: Partial<Omit<typeof calendarEvents.$inferInsert, "id" | "userId">>
) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const parsed = updateEventSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message || "Invalid event data");
    }

    await db
      .update(calendarEvents)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(calendarEvents.id, id), eq(calendarEvents.userId, user.id)));

    return { success: true };
  } catch (error: any) {
    console.error("Error in updateEvent:", error);
    throw new Error(error.message || "Failed to update event");
  }
}

export async function deleteEvent(id: string) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    await db
      .delete(calendarEvents)
      .where(and(eq(calendarEvents.id, id), eq(calendarEvents.userId, user.id)));

    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteEvent:", error);
    throw new Error(error.message || "Failed to delete event");
  }
}

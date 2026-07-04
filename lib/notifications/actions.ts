"use server";

import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function createNotification(
  type: string,
  message: string,
  relatedEntityId?: string
) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const newNotify = {
    id: crypto.randomUUID(),
    userId: user.id,
    type,
    message,
    read: false,
    createdAt: new Date(),
    relatedEntityId: relatedEntityId || null,
  };

  await db.insert(notifications).values(newNotify);
  return newNotify;
}

export async function markNotificationRead(id: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, user.id)));

  return { success: true };
}

export async function listNotifications() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(20);
}

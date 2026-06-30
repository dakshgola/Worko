"use server";

import { db } from "@/db";
import { userPreferences, categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function getUserPreferences() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const results = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, user.id))
    .limit(1);

  if (results.length > 0) {
    return results[0];
  }

  // Create default preferences
  const defaultPrefs = {
    userId: user.id,
    theme: "system",
    language: "en",
    timezone: "UTC",
    aiModel: "Gemini",
    aiTone: "Professional",
    aiRefine: true,
    aiSummaries: true,
    aiTaskGen: true,
    aiMeetingNotes: true,
    aiWhiteboard: true,
    aiPageGen: true,
    emailNotifications: true,
    pushNotifications: true,
    reminders: true,
    taskDueAlerts: true,
    calendarEventAlerts: true,
    mentions: true,
    comments: true,
    collaboratorActivity: true,
  };

  await db.insert(userPreferences).values(defaultPrefs);
  return defaultPrefs;
}

export async function saveUserPreferences(data: Partial<Omit<typeof userPreferences.$inferInsert, "userId">>) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  await db
    .update(userPreferences)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(userPreferences.userId, user.id));

  return { success: true };
}

export async function listCategories() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const results = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, user.id));

  if (results.length > 0) {
    return results;
  }

  // Prepopulate default categories if 0 categories
  const defaultCats = [
    { id: "cat_1", userId: user.id, name: "Work", color: "#6c5ce7", icon: "Briefcase" },
    { id: "cat_2", userId: user.id, name: "Personal", color: "#3e9b68", icon: "User" },
    { id: "cat_3", userId: user.id, name: "Meeting", color: "#ef6688", icon: "Users" },
    { id: "cat_4", userId: user.id, name: "Reminder", color: "#e49a3a", icon: "Bell" },
  ];

  for (const cat of defaultCats) {
    await db.insert(categories).values(cat);
  }

  return defaultCats;
}

export async function createCategory(data: { name: string; color: string; icon: string }) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const newCat = {
    id: "cat_" + crypto.randomUUID(),
    userId: user.id,
    name: data.name,
    color: data.color || "#6c5ce7",
    icon: data.icon || "Folder",
  };

  await db.insert(categories).values(newCat);
  return newCat;
}

export async function updateCategory(id: string, data: { name?: string; color?: string; icon?: string }) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  await db
    .update(categories)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(categories.id, id), eq(categories.userId, user.id)));

  return { success: true };
}

export async function deleteCategory(id: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, user.id)));

  return { success: true };
}

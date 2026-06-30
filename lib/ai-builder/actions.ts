"use server";

import { db } from "@/db";
import { generatedApps } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function listGeneratedApps() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  return db
    .select()
    .from(generatedApps)
    .where(eq(generatedApps.userId, user.id))
    .orderBy(desc(generatedApps.updatedAt));
}

export async function createGeneratedApp(data: {
  appName: string;
  description?: string;
  icon?: string;
  color?: string;
  jsonConfig: string;
}) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const newAppId = "app_" + crypto.randomUUID();
  const newApp = {
    id: newAppId,
    userId: user.id,
    appName: data.appName,
    description: data.description || null,
    icon: data.icon || "Flame",
    color: data.color || "#F97316",
    jsonConfig: data.jsonConfig,
    isPinned: false,
  };

  await db.insert(generatedApps).values(newApp);
  return newApp;
}

export async function togglePinApp(appId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const existing = await db
    .select()
    .from(generatedApps)
    .where(and(eq(generatedApps.id, appId), eq(generatedApps.userId, user.id)))
    .limit(1);

  if (existing.length === 0) throw new Error("App not found");
  const app = existing[0];

  await db
    .update(generatedApps)
    .set({ isPinned: !app.isPinned, updatedAt: new Date() })
    .where(and(eq(generatedApps.id, appId), eq(generatedApps.userId, user.id)));

  return { success: true, isPinned: !app.isPinned };
}

export async function deleteGeneratedApp(appId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  await db
    .delete(generatedApps)
    .where(and(eq(generatedApps.id, appId), eq(generatedApps.userId, user.id)));

  return { success: true };
}

export async function getGeneratedApp(appId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const results = await db
    .select()
    .from(generatedApps)
    .where(and(eq(generatedApps.id, appId), eq(generatedApps.userId, user.id)))
    .limit(1);

  return results[0] || null;
}

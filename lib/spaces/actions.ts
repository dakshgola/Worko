"use server";

import { db } from "@/db";
import { spaces, pages } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function listSpaces() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  return db
    .select()
    .from(spaces)
    .where(and(eq(spaces.ownerId, user.id), eq(spaces.isArchived, false)))
    .orderBy(desc(spaces.updatedAt));
}

export async function createSpace(data: { name: string; description?: string; color?: string }) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const ratelimit = await checkRateLimit(user.id, "db_write");
  if (!ratelimit.success) throw new Error("Too many requests, please wait a moment");

  const newSpaceId = "space_" + crypto.randomUUID();
  const newSpace = {
    id: newSpaceId,
    name: data.name,
    description: data.description || null,
    color: data.color || "Purple",
    ownerId: user.id,
    isFavorite: false,
    isArchived: false,
  };

  await db.insert(spaces).values(newSpace);
  return newSpace;
}

export async function updateSpace(spaceId: string, data: Partial<Omit<typeof spaces.$inferInsert, "id" | "ownerId">>) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  await db
    .update(spaces)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(spaces.id, spaceId), eq(spaces.ownerId, user.id)));

  return { success: true };
}

export async function deleteSpace(spaceId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  await db
    .delete(spaces)
    .where(and(eq(spaces.id, spaceId), eq(spaces.ownerId, user.id)));

  return { success: true };
}

export async function listPages(spaceId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Verify ownership of the space
  const space = await db
    .select()
    .from(spaces)
    .where(and(eq(spaces.id, spaceId), eq(spaces.ownerId, user.id)))
    .limit(1);

  if (space.length === 0) {
    return [];
  }

  return db
    .select()
    .from(pages)
    .where(and(eq(pages.spaceId, spaceId), eq(pages.isArchived, false)))
    .orderBy(desc(pages.updatedAt));
}

export async function createPage(spaceId: string, title?: string, template?: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const ratelimit = await checkRateLimit(user.id, "db_write");
  if (!ratelimit.success) throw new Error("Too many requests, please wait a moment");

  // Verify ownership of the space
  const space = await db
    .select()
    .from(spaces)
    .where(and(eq(spaces.id, spaceId), eq(spaces.ownerId, user.id)))
    .limit(1);

  if (space.length === 0) {
    throw new Error("Space not found or unauthorized");
  }

  const newPageId = "page_" + crypto.randomUUID();
  const newPage = {
    id: newPageId,
    spaceId: spaceId,
    title: title || "Untitled Page",
    content: "",
    template: template || "Blank Page",
    isFavorite: false,
    isArchived: false,
    createdBy: user.id,
    updatedBy: user.id,
  };

  await db.insert(pages).values(newPage);
  return newPage;
}

export async function updatePage(pageId: string, data: Partial<Omit<typeof pages.$inferInsert, "id" | "createdBy">>) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const result = await db
    .update(pages)
    .set({ ...data, updatedBy: user.id, updatedAt: new Date() })
    .where(and(eq(pages.id, pageId), eq(pages.createdBy, user.id)))
    .returning();

  if (!result || result.length === 0) {
    throw new Error("Page not found or unauthorized");
  }

  return { success: true };
}

export async function deletePage(pageId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const result = await db
    .delete(pages)
    .where(and(eq(pages.id, pageId), eq(pages.createdBy, user.id)))
    .returning();

  if (!result || result.length === 0) {
    throw new Error("Page not found or unauthorized");
  }

  return { success: true };
}

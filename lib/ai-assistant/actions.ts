"use server";

import { db } from "@/db";
import { chats, messages } from "@/db/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function listChats() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  return db
    .select()
    .from(chats)
    .where(eq(chats.userId, user.id))
    .orderBy(desc(chats.updatedAt));
}

export async function createChat(title?: string, model?: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const newChatId = "chat_" + crypto.randomUUID();
  const newChat = {
    id: newChatId,
    userId: user.id,
    title: title || "New Conversation",
    model: model || "Gemini",
  };

  await db.insert(chats).values(newChat);
  return newChat;
}

export async function getChatMessages(chatId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Verify ownership of the chat
  const chat = await db
    .select()
    .from(chats)
    .where(and(eq(chats.id, chatId), eq(chats.userId, user.id)))
    .limit(1);

  if (chat.length === 0) {
    return [];
  }

  return db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(asc(messages.createdAt));
}

export async function saveMessage(chatId: string, role: string, content: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Verify ownership of the chat
  const chat = await db
    .select()
    .from(chats)
    .where(and(eq(chats.id, chatId), eq(chats.userId, user.id)))
    .limit(1);

  if (chat.length === 0) {
    throw new Error("Chat not found or unauthorized");
  }

  const newMessageId = "msg_" + crypto.randomUUID();
  const newMessage = {
    id: newMessageId,
    chatId: chatId,
    role: role,
    content: content,
  };

  await db.insert(messages).values(newMessage);

  // Update chat updatedAt
  await db
    .update(chats)
    .set({ updatedAt: new Date() })
    .where(and(eq(chats.id, chatId), eq(chats.userId, user.id)));

  return newMessage;
}

export async function deleteChat(chatId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Verify ownership of the chat
  const chat = await db
    .select()
    .from(chats)
    .where(and(eq(chats.id, chatId), eq(chats.userId, user.id)))
    .limit(1);

  if (chat.length === 0) {
    throw new Error("Chat not found or unauthorized");
  }

  await db.delete(messages).where(eq(messages.chatId, chatId));
  await db.delete(chats).where(and(eq(chats.id, chatId), eq(chats.userId, user.id)));

  return { success: true };
}

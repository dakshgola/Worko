"use server";

import { db } from "@/db";
import { whiteboards } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function listWhiteboards() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  return db
    .select()
    .from(whiteboards)
    .where(and(eq(whiteboards.userId, user.id), eq(whiteboards.isTrashed, false)))
    .orderBy(desc(whiteboards.updatedAt));
}

export async function createWhiteboard(name?: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const newId = "wb_" + crypto.randomUUID();
  const newBoard = {
    id: newId,
    userId: user.id,
    name: name || "Untitled Whiteboard",
    color: "#6c5ce7",
    isFavorite: false,
    isTrashed: false,
    elements: "[]",
  };

  await db.insert(whiteboards).values(newBoard);
  return newBoard;
}

export async function updateWhiteboardElements(boardId: string, elementsJson: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  await db
    .update(whiteboards)
    .set({
      elements: elementsJson,
      updatedAt: new Date(),
    })
    .where(and(eq(whiteboards.id, boardId), eq(whiteboards.userId, user.id)));

  return { success: true };
}

export async function updateWhiteboardMetadata(
  boardId: string,
  data: { name?: string; color?: string; isFavorite?: boolean; isTrashed?: boolean }
) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const updateData: any = { ...data, updatedAt: new Date() };
  if (data.isTrashed === true) {
    updateData.trashedAt = new Date();
  } else if (data.isTrashed === false) {
    updateData.trashedAt = null;
  }

  await db
    .update(whiteboards)
    .set(updateData)
    .where(and(eq(whiteboards.id, boardId), eq(whiteboards.userId, user.id)));

  return { success: true };
}

export async function deleteWhiteboardForever(boardId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  await db
    .delete(whiteboards)
    .where(and(eq(whiteboards.id, boardId), eq(whiteboards.userId, user.id)));

  return { success: true };
}

export async function generateAIDiagram(prompt: string): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return JSON.stringify({
        nodes: [
          { id: "node1", type: "rectangle", label: "Idea Root", x: 150, y: 150, color: "#6c5ce7" },
          { id: "node2", type: "circle", label: "Step 2", x: 380, y: 150, color: "#3e9b68" }
        ],
        edges: [
          { from: "node1", to: "node2", label: "Process Flow" }
        ]
      });
    }

    const geminiPrompt = `You are a system architecture generator. Given the user's prompt, generate a visual diagram structure representing: "${prompt}".
Return ONLY a valid JSON object matching this structure:
{
  "nodes": [
    { "id": "node_unique_id", "type": "rectangle" | "circle" | "diamond", "label": "Text inside shape", "x": number, "y": number, "color": "#hex_accent" }
  ],
  "edges": [
    { "from": "node_from_id", "to": "node_to_id", "label": "Optional label along connector line" }
  ]
}
Position the nodes logically with spacing (e.g. horizontal layout with 200-250px difference, vertical layout, etc.) to form a readable graph layout. 
Output ONLY the raw JSON string. Do not wrap in markdown code blocks, do not write introductory text, do not write explanations. Just valid JSON.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: geminiPrompt }] }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Gemini call failed");
    }

    const resData = await response.json();
    let resultText = resData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    let cleanJson = resultText;
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.slice(7);
    }
    if (cleanJson.endsWith("```")) {
      cleanJson = cleanJson.slice(0, -3);
    }
    return cleanJson.trim();
  } catch (error) {
    console.error("Error in generateAIDiagram:", error);
    return JSON.stringify({
      nodes: [
        { id: "node1", type: "rectangle", label: "Diagram Error: " + prompt, x: 200, y: 150, color: "#f43f5e" }
      ],
      edges: []
    });
  }
}

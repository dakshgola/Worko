"use server";

import { db } from "@/db";
import { kanbanBoards, kanbanTasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function syncKanbanData(boards: any[]) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // Delete previous boards and tasks for this user
    await db.delete(kanbanBoards).where(eq(kanbanBoards.userId, user.id));
    await db.delete(kanbanTasks).where(eq(kanbanTasks.userId, user.id));

    // If there are boards, insert them
    if (boards.length > 0) {
      const boardsToInsert = boards.map((b) => ({
        id: b.id,
        userId: user.id,
        name: b.name,
        description: b.description || null,
        color: b.color || "#6c5ce7",
        icon: b.icon || "Rocket",
        favorite: !!b.favorite,
      }));

      await db.insert(kanbanBoards).values(boardsToInsert);

      // Extract all tasks across all boards
      const tasksToInsert: any[] = [];
      boards.forEach((board) => {
        if (board.tasks && board.tasks.length > 0) {
          board.tasks.forEach((t: any) => {
            tasksToInsert.push({
              id: t.id,
              boardId: board.id,
              columnId: t.columnId,
              userId: user.id,
              title: t.title,
              description: t.description || null,
              dueDate: t.dueDate,
              priority: t.priority || "Medium",
              labels: JSON.stringify(t.labels || []),
              assignee: t.assignee || null,
              archived: !!t.archived,
            });
          });
        }
      });

      if (tasksToInsert.length > 0) {
        await db.insert(kanbanTasks).values(tasksToInsert);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in syncKanbanData:", error);
    throw new Error(error.message || "Failed to sync Kanban data");
  }
}

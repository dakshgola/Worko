"use client";

import { arrayMove } from "@dnd-kit/sortable";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { KanbanBoard, KanbanTask, TaskFormData } from "./types";

const today = () => new Date().toISOString().slice(0, 10);
const id = () => crypto.randomUUID();

const initialBoards: KanbanBoard[] = [
  {
    id: "launch",
    name: "Product Launch",
    description: "Everything needed for a calm, confident launch.",
    color: "#6c5ce7",
    icon: "Rocket",
    favorite: true,
    columns: [
      { id: "launch-todo", title: "Todo", color: "#a78bfa" },
      { id: "launch-progress", title: "In Progress", color: "#60a5fa" },
      { id: "launch-done", title: "Done", color: "#34d399" },
    ],
    tasks: [
      {
        id: "task-1", columnId: "launch-todo", title: "Finalize launch checklist", description: "Review owners and timelines.", dueDate: today(), priority: "High",
        labels: [{ id: "l1", name: "Launch", color: "#8b5cf6" }, { id: "l2", name: "Ops", color: "#f59e0b" }], assignee: "Daksh", reminderTime: "09:00",
        checklist: [{ id: "c1", text: "Confirm owners", completed: true }, { id: "c2", text: "Check dependencies", completed: false }],
        notes: "", syncCalendar: true, linkNotes: false, recurring: false, archived: false, createdAt: new Date().toISOString(),
      },
      {
        id: "task-2", columnId: "launch-todo", title: "Prepare social assets", description: "Create launch-day visuals.", dueDate: today(), priority: "Medium",
        labels: [{ id: "l3", name: "Design", color: "#ec4899" }], assignee: "Maya", reminderTime: "13:30", checklist: [],
        notes: "Use the approved visual system.", syncCalendar: false, linkNotes: true, recurring: false, archived: false, createdAt: new Date().toISOString(),
      },
      {
        id: "task-3", columnId: "launch-progress", title: "Polish onboarding flow", description: "Tighten the first-run experience.", dueDate: today(), priority: "High",
        labels: [{ id: "l4", name: "Product", color: "#3b82f6" }], assignee: "Daksh", reminderTime: "15:00",
        checklist: [{ id: "c3", text: "Review copy", completed: true }, { id: "c4", text: "Test empty states", completed: true }, { id: "c5", text: "Mobile QA", completed: false }],
        notes: "", syncCalendar: true, linkNotes: true, recurring: false, archived: false, createdAt: new Date().toISOString(),
      },
      {
        id: "task-4", columnId: "launch-done", title: "Approve launch brief", description: "", dueDate: today(), priority: "Low",
        labels: [{ id: "l5", name: "Strategy", color: "#10b981" }], assignee: "Noah", reminderTime: "10:00", checklist: [],
        notes: "", syncCalendar: false, linkNotes: false, recurring: false, archived: false, createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "personal",
    name: "Personal Rhythm",
    description: "Small things that make the week feel lighter.",
    color: "#f59e0b",
    icon: "Sun",
    favorite: false,
    columns: [
      { id: "personal-todo", title: "Todo", color: "#fbbf24" },
      { id: "personal-progress", title: "In Progress", color: "#fb923c" },
      { id: "personal-done", title: "Done", color: "#34d399" },
    ],
    tasks: [],
  },
];

type Store = {
  boards: KanbanBoard[];
  activeBoardId: string;
  setActiveBoard: (boardId: string) => void;
  addBoard: (data: Pick<KanbanBoard, "name" | "description" | "color" | "icon">) => void;
  updateBoard: (boardId: string, data: Partial<KanbanBoard>) => void;
  deleteBoard: (boardId: string) => void;
  toggleFavorite: (boardId: string) => void;
  addColumn: (boardId: string) => void;
  renameColumn: (boardId: string, columnId: string, title: string) => void;
  deleteColumn: (boardId: string, columnId: string) => void;
  reorderColumns: (boardId: string, activeId: string, overId: string) => void;
  saveTask: (boardId: string, task: TaskFormData, taskId?: string) => void;
  deleteTask: (boardId: string, taskId: string) => void;
  duplicateTask: (boardId: string, taskId: string) => void;
  archiveTask: (boardId: string, taskId: string) => void;
  moveTask: (boardId: string, taskId: string, columnId: string) => void;
};

export const useKanbanStore = create<Store>()(persist((set) => ({
  boards: initialBoards,
  activeBoardId: initialBoards[0].id,
  setActiveBoard: (activeBoardId) => set({ activeBoardId }),
  addBoard: (data) => set((state) => {
    const boardId = id();
    const board: KanbanBoard = {
      ...data, id: boardId, favorite: false, tasks: [],
      columns: [
        { id: id(), title: "Todo", color: "#a78bfa" },
        { id: id(), title: "In Progress", color: "#60a5fa" },
        { id: id(), title: "Done", color: "#34d399" },
      ],
    };
    return { boards: [...state.boards, board], activeBoardId: boardId };
  }),
  updateBoard: (boardId, data) => set((state) => ({ boards: state.boards.map((board) => board.id === boardId ? { ...board, ...data } : board) })),
  deleteBoard: (boardId) => set((state) => {
    const boards = state.boards.filter((board) => board.id !== boardId);
    return { boards, activeBoardId: state.activeBoardId === boardId ? boards[0]?.id ?? "" : state.activeBoardId };
  }),
  toggleFavorite: (boardId) => set((state) => ({ boards: state.boards.map((board) => board.id === boardId ? { ...board, favorite: !board.favorite } : board) })),
  addColumn: (boardId) => set((state) => ({ boards: state.boards.map((board) => board.id === boardId && board.columns.length < 5 ? { ...board, columns: [...board.columns, { id: id(), title: "New column", color: "#f472b6" }] } : board) })),
  renameColumn: (boardId, columnId, title) => set((state) => ({ boards: state.boards.map((board) => board.id === boardId ? { ...board, columns: board.columns.map((column) => column.id === columnId ? { ...column, title } : column) } : board) })),
  deleteColumn: (boardId, columnId) => set((state) => ({ boards: state.boards.map((board) => board.id === boardId && board.columns.length > 1 ? { ...board, columns: board.columns.filter((column) => column.id !== columnId), tasks: board.tasks.filter((task) => task.columnId !== columnId) } : board) })),
  reorderColumns: (boardId, activeId, overId) => set((state) => ({ boards: state.boards.map((board) => {
    if (board.id !== boardId) return board;
    const oldIndex = board.columns.findIndex((column) => column.id === activeId);
    const newIndex = board.columns.findIndex((column) => column.id === overId);
    return oldIndex < 0 || newIndex < 0 ? board : { ...board, columns: arrayMove(board.columns, oldIndex, newIndex) };
  }) })),
  saveTask: (boardId, data, taskId) => set((state) => ({ boards: state.boards.map((board) => {
    if (board.id !== boardId) return board;
    if (taskId) return { ...board, tasks: board.tasks.map((task) => task.id === taskId ? { ...task, ...data } : task) };
    return { ...board, tasks: [...board.tasks, { ...data, id: id(), archived: false, createdAt: new Date().toISOString() }] };
  }) })),
  deleteTask: (boardId, taskId) => set((state) => ({ boards: state.boards.map((board) => board.id === boardId ? { ...board, tasks: board.tasks.filter((task) => task.id !== taskId) } : board) })),
  duplicateTask: (boardId, taskId) => set((state) => ({ boards: state.boards.map((board) => {
    if (board.id !== boardId) return board;
    const task = board.tasks.find((item) => item.id === taskId);
    return task ? { ...board, tasks: [...board.tasks, { ...task, id: id(), title: `${task.title} copy`, createdAt: new Date().toISOString() }] } : board;
  }) })),
  archiveTask: (boardId, taskId) => set((state) => ({ boards: state.boards.map((board) => board.id === boardId ? { ...board, tasks: board.tasks.map((task) => task.id === taskId ? { ...task, archived: true } : task) } : board) })),
  moveTask: (boardId, taskId, columnId) => set((state) => ({ boards: state.boards.map((board) => board.id === boardId ? { ...board, tasks: board.tasks.map((task) => task.id === taskId ? { ...task, columnId } : task) } : board) })),
}), { name: "worko-kanban" }));

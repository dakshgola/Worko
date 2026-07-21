import { z } from "zod";

// --- Notes Validation ---
export const createNoteSchema = z.object({
  title: z.string().max(100, "Title is too long (max 100 characters)").optional().or(z.literal("")),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format").optional().or(z.literal("")),
});

export const updateNoteMetadataSchema = z.object({
  title: z.string().max(100, "Title is too long (max 100 characters)").optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format").optional(),
  isPinned: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  isTrashed: z.boolean().optional(),
});

export const updateNoteContentSchema = z.object({
  content: z.string().max(10000000, "Content exceeds size limit (max 10MB)"),
  plainText: z.string().max(10000000, "Text content exceeds size limit (max 10MB)"),
  wordCount: z.number().int().min(0, "Word count cannot be negative"),
});

export const refineTextSchema = z.object({
  text: z.string().max(200000, "Text is too long (max 200,000 characters)"),
  instruction: z.string().max(1000, "Instruction is too long (max 1,000 characters)"),
});

// --- Calendar Events Validation ---
export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(150, "Title is too long (max 150 characters)"),
  description: z.string().max(2000, "Description is too long (max 2,000 characters)").optional().nullable(),
  date: z.string().max(30, "Invalid date format").optional().nullable(),
  time: z.string().max(30, "Invalid time format").optional().nullable(),
  category: z.enum(["Meeting", "Work", "Personal", "Reminder", "Task"]).optional(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
  notes: z.string().max(2000, "Notes are too long (max 2,000 characters)").optional().nullable(),
  recurring: z.boolean().optional(),
});

export const updateEventSchema = createEventSchema.partial();

// --- Spaces & Pages Validation ---
export const createSpaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long (max 100 characters)"),
  description: z.string().max(1000, "Description is too long (max 1,000 characters)").optional().nullable(),
  color: z.string().max(30, "Color name is too long").optional().nullable(),
});

export const updateSpaceSchema = createSpaceSchema.partial();

export const createPageSchema = z.object({
  title: z.string().max(100, "Title is too long (max 100 characters)").optional(),
  template: z.string().max(50, "Template name is too long (max 50 characters)").optional(),
});

export const updatePageSchema = z.object({
  title: z.string().max(100, "Title is too long (max 100 characters)").optional(),
  template: z.string().max(50, "Template name is too long").optional(),
  content: z.string().max(10000000, "Content exceeds size limit (max 10MB)").optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

// --- AI Chat Validation ---
export const aiChatSchema = z.object({
  prompt: z.string().max(20000, "Prompt is too long (max 20,000 characters)").optional(),
  history: z.array(
    z.object({
      role: z.string(),
      content: z.string().max(20000).optional(),
      text: z.string().max(20000).optional(),
    })
  ).optional(),
  messages: z.array(
    z.object({
      role: z.string(),
      content: z.string().max(20000).optional(),
      text: z.string().max(20000).optional(),
    })
  ).optional(),
}).refine(data => {
  return (data.prompt && data.prompt.trim().length > 0) || (data.messages && data.messages.length > 0);
}, {
  message: "Either prompt or messages must be provided",
  path: ["prompt"]
});

// --- Whiteboard Validation ---
export const createWhiteboardSchema = z.object({
  name: z.string().max(150, "Name is too long (max 150 characters)").optional(),
});

export const updateWhiteboardElementsSchema = z.string().max(50000000, "Whiteboard canvas elements exceed size limit (max 50MB)");

export const updateWhiteboardMetadataSchema = z.object({
  name: z.string().max(150, "Name is too long (max 150 characters)").optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format").optional(),
  isFavorite: z.boolean().optional(),
  isTrashed: z.boolean().optional(),
});

export const generateAIDiagramSchema = z.string().max(1000, "Prompt is too long (max 1,000 characters)");

// --- Kanban Validation ---
export const kanbanTaskSchema = z.object({
  id: z.string(),
  columnId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  dueDate: z.string().optional().nullable(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
  labels: z.array(z.string()).optional(),
  assignee: z.string().optional().nullable(),
  archived: z.boolean().optional(),
});

export const kanbanBoardSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  color: z.string().max(30).optional().nullable(),
  icon: z.string().max(30).optional().nullable(),
  favorite: z.boolean().optional(),
  tasks: z.array(kanbanTaskSchema).optional(),
});

export const syncKanbanSchema = z.array(kanbanBoardSchema);

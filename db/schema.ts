import { pgTable, serial, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").unique(),
  name: text("name"),
  email: text("email").notNull().unique(),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const notes = pgTable("notes", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").default("Untitled").notNull(),
  content: text("content"),
  plainText: text("plain_text"),
  wordCount: integer("word_count").default(0).notNull(),
  color: text("color").default("#6c5ce7").notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  isTrashed: boolean("is_trashed").default(false).notNull(),
  trashedAt: timestamp("trashed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

export const whiteboards = pgTable("whiteboards", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").default("Untitled Whiteboard").notNull(),
  color: text("color").default("#6c5ce7").notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  isTrashed: boolean("is_trashed").default(false).notNull(),
  elements: text("elements"), // JSON string of drawings/shapes/elements
  trashedAt: timestamp("trashed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Whiteboard = typeof whiteboards.$inferSelect;
export type NewWhiteboard = typeof whiteboards.$inferInsert;

export const spaces = pgTable("spaces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("Purple").notNull(),
  ownerId: text("owner_id").notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Space = typeof spaces.$inferSelect;
export type NewSpace = typeof spaces.$inferInsert;

export const pages = pgTable("pages", {
  id: text("id").primaryKey(),
  spaceId: text("space_id").notNull(),
  title: text("title").default("Untitled Page").notNull(),
  content: text("content"), // TipTap content
  template: text("template").default("Blank Page").notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  createdBy: text("created_by").notNull(),
  updatedBy: text("updated_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  linkedTasks: text("linked_tasks"),
  linkedNotes: text("linked_notes"),
  linkedWhiteboards: text("linked_whiteboards"),
  linkedEvents: text("linked_events"),
});

export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;

export const generatedApps = pgTable("generated_apps", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  appName: text("app_name").notNull(),
  description: text("description"),
  icon: text("icon").default("Flame").notNull(),
  color: text("color").default("#F97316").notNull(),
  jsonConfig: text("json_config").notNull(), // config representation JSON
  isPinned: boolean("is_pinned").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type GeneratedApp = typeof generatedApps.$inferSelect;
export type NewGeneratedApp = typeof generatedApps.$inferInsert;

export const userPreferences = pgTable("user_preferences", {
  userId: text("user_id").primaryKey(),
  theme: text("theme").default("system").notNull(),
  language: text("language").default("en").notNull(),
  timezone: text("timezone").default("UTC").notNull(),
  aiModel: text("ai_model").default("Gemini").notNull(),
  aiTone: text("ai_tone").default("Professional").notNull(),
  aiRefine: boolean("ai_refine").default(true).notNull(),
  aiSummaries: boolean("ai_summaries").default(true).notNull(),
  aiTaskGen: boolean("ai_task_gen").default(true).notNull(),
  aiMeetingNotes: boolean("ai_meeting_notes").default(true).notNull(),
  aiWhiteboard: boolean("ai_whiteboard_assistant").default(true).notNull(),
  aiPageGen: boolean("ai_page_gen").default(true).notNull(),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  pushNotifications: boolean("push_notifications").default(true).notNull(),
  reminders: boolean("reminders").default(true).notNull(),
  taskDueAlerts: boolean("task_due_alerts").default(true).notNull(),
  calendarEventAlerts: boolean("calendar_event_alerts").default(true).notNull(),
  mentions: boolean("mentions").default(true).notNull(),
  comments: boolean("comments").default(true).notNull(),
  collaboratorActivity: boolean("collaborator_activity").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  color: text("color").default("#6c5ce7").notNull(),
  icon: text("icon").default("Folder").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export const chats = pgTable("chats", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  model: text("model").default("Gemini").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Chat = typeof chats.$inferSelect;
export type NewChat = typeof chats.$inferInsert;

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  chatId: text("chat_id").notNull(),
  role: text("role").notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export const calendarEvents = pgTable("calendar_events", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date"), // YYYY-MM-DD
  time: text("time"), // HH:MM
  category: text("category").default("Meeting").notNull(),
  priority: text("priority").default("Medium").notNull(), // "Low" | "Medium" | "High"
  notes: text("notes"),
  recurring: boolean("recurring").default(false).notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type NewCalendarEvent = typeof calendarEvents.$inferInsert;

export const kanbanBoards = pgTable("kanban_boards", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#6c5ce7").notNull(),
  icon: text("icon").default("Rocket").notNull(),
  favorite: boolean("favorite").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const kanbanTasks = pgTable("kanban_tasks", {
  id: text("id").primaryKey(),
  boardId: text("board_id").notNull(),
  columnId: text("column_id").notNull(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: text("due_date").notNull(),
  priority: text("priority").notNull(),
  labels: text("labels"),
  assignee: text("assignee"),
  archived: boolean("archived").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  relatedEntityId: text("related_entity_id"),
});

export type KanbanBoardDb = typeof kanbanBoards.$inferSelect;
export type NewKanbanBoardDb = typeof kanbanBoards.$inferInsert;
export type KanbanTaskDb = typeof kanbanTasks.$inferSelect;
export type NewKanbanTaskDb = typeof kanbanTasks.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

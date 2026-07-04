import {
  KanbanTaskDb,
  UserPreferences,
  Note,
  Whiteboard,
  Space,
  Page,
  GeneratedApp,
  Chat,
  CalendarEvent,
  KanbanBoardDb,
} from "@/db/schema";

export interface ProductivityMetrics {
  score: number;
  totalTasks: number;
  completedTasks: number;
  notesCount: number;
  whiteboardsCount: number;
  spacesCount: number;
  meetingsCount: number;
}

export interface TimelineActivity {
  title: string;
  desc: string;
  icon: any; // Lucide icon components are React.ComponentType
  color: string;
  time: Date;
}

export interface DashboardTask extends KanbanTaskDb {
  boardName?: string;
}

export interface DashboardData {
  success?: boolean;
  preferences: UserPreferences | null;
  notes: Note[];
  whiteboards: Whiteboard[];
  spaces: Space[];
  pages: Page[];
  generatedApps: GeneratedApp[];
  chats: Chat[];
  calendarEvents: CalendarEvent[];
  kanbanBoards: KanbanBoardDb[];
  kanbanTasks: KanbanTaskDb[];
}

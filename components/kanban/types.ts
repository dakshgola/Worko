export type Priority = "Low" | "Medium" | "High";

export type KanbanLabel = {
  id: string;
  name: string;
  color: string;
};

export type ChecklistItem = {
  id: string;
  text: string;
  completed: boolean;
};

export type KanbanTask = {
  id: string;
  columnId: string;
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
  labels: KanbanLabel[];
  assignee?: string;
  reminderTime: string;
  checklist: ChecklistItem[];
  notes: string;
  syncCalendar: boolean;
  linkNotes: boolean;
  recurring: boolean;
  archived: boolean;
  createdAt: string;
};

export type KanbanColumn = {
  id: string;
  title: string;
  color: string;
};

export type KanbanBoard = {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  favorite: boolean;
  columns: KanbanColumn[];
  tasks: KanbanTask[];
};

export type TaskFormData = Omit<KanbanTask, "id" | "archived" | "createdAt">;

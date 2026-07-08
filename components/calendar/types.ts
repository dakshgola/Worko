export type CalendarView = "month" | "week";

export type TaskCategory = "Work" | "Personal" | "Meeting" | "Reminder";

export type TaskPriority = "Low" | "Medium" | "High";

export interface CalendarTask {
  id: string;
  title: string;
  description?: string;
  date: string | null;
  time?: string;
  category: TaskCategory;
  priority: TaskPriority;
  notes?: string;
  recurring?: boolean;
}

export interface TaskFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  category: TaskCategory;
  priority: TaskPriority;
  notes: string;
  recurring: boolean;
}

export const categoryStyles: Record<TaskCategory, { dot: string; chip: string; soft: string }> = {
  Work: { dot: "bg-secondary", chip: "border-secondary/30 bg-secondary-soft text-secondary", soft: "bg-secondary" },
  Personal: { dot: "bg-success", chip: "border-success/30 bg-success-soft text-success", soft: "bg-success" },
  Meeting: { dot: "bg-accent", chip: "border-accent/30 bg-accent-soft text-accent", soft: "bg-accent" },
  Reminder: { dot: "bg-warning", chip: "border-warning/30 bg-warning-soft text-warning", soft: "bg-warning" },
};


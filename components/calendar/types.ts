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
  Work: { dot: "bg-[#6c5ce7]", chip: "border-[#cfc8f7] bg-[#f0edff] text-[#5748c8]", soft: "bg-[#6c5ce7]" },
  Personal: { dot: "bg-[#43a978]", chip: "border-[#bfe4d0] bg-[#eaf8f0] text-[#33845d]", soft: "bg-[#43a978]" },
  Meeting: { dot: "bg-[#ef6688]", chip: "border-[#f3c1ce] bg-[#fff0f4] text-[#c54c6a]", soft: "bg-[#ef6688]" },
  Reminder: { dot: "bg-[#e49a3a]", chip: "border-[#f1d5aa] bg-[#fff6e8] text-[#b97825]", soft: "bg-[#e49a3a]" },
};


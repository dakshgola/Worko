"use client";

import { useEffect, useState } from "react";
import { BellRing, CalendarDays, Check, Clock3, Repeat2, Trash2, X } from "lucide-react";
import { categoryStyles, type TaskCategory, type TaskFormData, type TaskPriority, type CalendarTask } from "./types";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const blankForm: TaskFormData = {
  title: "",
  description: "",
  date: "",
  time: "09:00",
  category: "Work",
  priority: "Medium",
  notes: "",
  recurring: false,
};

export function TaskDialog({
  open,
  initialDate,
  task = null,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  initialDate: string;
  task?: CalendarTask | null;
  onClose: () => void;
  onSave: (data: TaskFormData, asDraft: boolean) => void;
  onDelete?: (taskId: string) => void;
}) {
  const [form, setForm] = useState<TaskFormData>(blankForm);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open) {
      setConfirmDelete(false);
      if (task) {
        setForm({
          title: task.title,
          description: task.description || "",
          date: task.date || "",
          time: task.time || "09:00",
          category: task.category,
          priority: task.priority,
          notes: task.notes || "",
          recurring: task.recurring || false,
        });
      } else {
        setForm({ ...blankForm, date: initialDate });
      }
    }
  }, [open, initialDate, task]);

  const update = <K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) => setForm((current) => ({ ...current, [key]: value }));
  const canSave = form.title.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-h-[92vh] w-full max-w-[660px] overflow-y-auto p-0 sm:rounded-[24px]">
        <div className="sticky top-0 z-10 flex items-center border-b border-border bg-surface/95 px-5 py-4 backdrop-blur-md">
          <div className="grid size-10 place-items-center rounded-[13px] bg-secondary-soft text-secondary"><CalendarDays size={18} /></div>
          <div className="ml-3">
            <DialogTitle className="text-base font-bold tracking-[-0.03em]">{task ? "Edit task" : "Create a new task"}</DialogTitle>
            <DialogDescription className="mt-0.5 text-[10px] text-muted">
              {task ? "Update your calendar details and plans." : "Give your next move a calm place to land."}
            </DialogDescription>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <Field label="Task title">
            <input autoFocus value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="What needs to happen?" className="calendar-input" />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Add a little context..." rows={2} className="calendar-input resize-none py-2.5" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Due date" icon={<CalendarDays size={12} />}>
              <input type="date" value={form.date} onChange={(event) => update("date", event.target.value)} className="calendar-input" />
            </Field>
            <Field label="Reminder time" icon={<Clock3 size={12} />}>
              <input type="time" value={form.time} onChange={(event) => update("time", event.target.value)} className="calendar-input" />
            </Field>
          </div>
          <Field label="Task category">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(Object.keys(categoryStyles) as TaskCategory[]).map((category) => (
                <button
                  key={category}
                  onClick={() => update("category", category)}
                  className={`flex h-10 items-center gap-2 rounded-xl border px-3 text-[10px] font-bold transition ${
                    form.category === category ? categoryStyles[category].chip : "border-border bg-surface text-muted hover:bg-hover-overlay"
                  }`}
                >
                  <span className={`size-2.5 rounded-full ${categoryStyles[category].dot}`} /> {category}
                  {form.category === category && <Check size={11} className="ml-auto" />}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Priority">
            <div className="flex rounded-xl bg-background p-1">
              {(["Low", "Medium", "High"] as TaskPriority[]).map((priority) => (
                <button
                  key={priority}
                  onClick={() => update("priority", priority)}
                  className={`h-8 flex-1 rounded-lg text-[10px] font-bold transition ${
                    form.priority === priority ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground"
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Notes">
            <textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Links, details, or a note to future you..." rows={2} className="calendar-input resize-none py-2.5" />
          </Field>
          <button
            onClick={() => update("recurring", !form.recurring)}
            className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
              form.recurring ? "border-secondary/40 bg-secondary-soft text-secondary" : "border-border hover:bg-hover-overlay"
            }`}
          >
            <span className={`grid size-8 place-items-center rounded-lg ${form.recurring ? "bg-secondary-soft text-secondary" : "bg-background text-muted"}`}><Repeat2 size={14} /></span>
            <span className="flex-1">
              <span className="block text-[11px] font-bold">Repeat weekly</span>
              <span className="mt-0.5 block text-[9px] text-muted">Create a recurring rhythm for this task</span>
            </span>
            <span className={`relative h-5 w-9 rounded-full transition ${form.recurring ? "bg-primary" : "bg-border"}`}>
              <span className={`absolute top-0.5 size-4 rounded-full bg-surface shadow-sm transition-all ${form.recurring ? "left-[18px]" : "left-0.5"}`} />
            </span>
          </button>
        </div>

        <div className="sticky bottom-0 flex flex-wrap items-center gap-2 border-t border-border bg-surface/95 px-5 py-4 backdrop-blur">
          {task && onDelete ? (
            <div className="mr-auto flex items-center gap-2">
              {confirmDelete ? (
                <>
                  <span className="text-[10px] font-bold text-danger">Are you sure?</span>
                  <button
                    onClick={() => {
                      onDelete(task.id);
                      setConfirmDelete(false);
                    }}
                    className="h-9 rounded-xl bg-danger px-3 text-[10px] font-black text-white hover:bg-danger-hover transition"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="h-9 rounded-xl border border-border bg-surface px-3 text-[10px] font-bold text-muted hover:bg-hover-overlay transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="h-9 rounded-xl border border-danger/30 bg-danger-soft text-danger px-4 text-[10px] font-bold hover:bg-danger/10 hover:border-danger/55 transition flex items-center gap-1.5"
                >
                  <Trash2 size={12} /> Delete event
                </button>
              )}
            </div>
          ) : (
            <span className="mr-auto flex items-center gap-1.5 text-[9px] font-semibold text-muted">
              <BellRing size={11} /> We&apos;ll remind you at the chosen time
            </span>
          )}
          <button disabled={!canSave} onClick={() => onSave(form, true)} className="h-9 rounded-xl border border-border bg-surface px-4 text-[10px] font-bold text-muted hover:bg-hover-overlay hover:text-foreground transition disabled:opacity-40">
            Save as draft
          </button>
          <button disabled={!canSave || !form.date} onClick={() => onSave(form, false)} className="h-9 rounded-xl bg-gradient-to-r from-primary to-primary-hover px-4 text-[10px] font-bold text-white shadow-[0_6px_16px_rgba(255,90,54,0.15)] transition hover:-translate-y-0.5 disabled:opacity-40">
            {task ? "Save changes" : "Schedule task"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.11em] text-muted">{icon}{label}</span>
      {children}
    </label>
  );
}


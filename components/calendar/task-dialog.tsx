"use client";

import { useEffect, useState } from "react";
import { BellRing, CalendarDays, Check, Clock3, Repeat2, X } from "lucide-react";
import { categoryStyles, type TaskCategory, type TaskFormData, type TaskPriority } from "./types";
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
  onClose,
  onSave,
}: {
  open: boolean;
  initialDate: string;
  onClose: () => void;
  onSave: (data: TaskFormData, asDraft: boolean) => void;
}) {
  const [form, setForm] = useState<TaskFormData>(blankForm);

  useEffect(() => {
    if (open) setForm({ ...blankForm, date: initialDate });
  }, [open, initialDate]);

  const update = <K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) => setForm((current) => ({ ...current, [key]: value }));
  const canSave = form.title.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-h-[92vh] w-full max-w-[660px] overflow-y-auto border border-white/80 bg-white p-0 shadow-[0_28px_80px_rgba(48,40,78,0.22)] sm:rounded-[24px]">
        <div className="sticky top-0 z-10 flex items-center border-b border-[#ece9f1] bg-white/95 px-5 py-4 backdrop-blur">
          <div className="grid size-10 place-items-center rounded-[13px] bg-[#eeeaff] text-[#6454d4]"><CalendarDays size={18} /></div>
          <div className="ml-3">
            <DialogTitle className="text-base font-bold tracking-[-0.03em]">Create a new task</DialogTitle>
            <DialogDescription className="mt-0.5 text-[10px] text-[#9992a2]">Give your next move a calm place to land.</DialogDescription>
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
                    form.category === category ? categoryStyles[category].chip : "border-[#e8e4ed] bg-white text-[#7d7687] hover:bg-[#faf9fc]"
                  }`}
                >
                  <span className={`size-2.5 rounded-full ${categoryStyles[category].dot}`} /> {category}
                  {form.category === category && <Check size={11} className="ml-auto" />}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Priority">
            <div className="flex rounded-xl bg-[#f5f3f7] p-1">
              {(["Low", "Medium", "High"] as TaskPriority[]).map((priority) => (
                <button
                  key={priority}
                  onClick={() => update("priority", priority)}
                  className={`h-8 flex-1 rounded-lg text-[10px] font-bold transition ${
                    form.priority === priority ? "bg-white text-[#4f4659] shadow-sm" : "text-[#9b94a4] hover:text-[#665e70]"
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
              form.recurring ? "border-[#cdc5f4] bg-[#f5f2ff]" : "border-[#e8e4ed] hover:bg-[#faf9fc]"
            }`}
          >
            <span className={`grid size-8 place-items-center rounded-lg ${form.recurring ? "bg-[#e7e1ff] text-[#6556d6]" : "bg-[#f2f0f4] text-[#918a99]"}`}><Repeat2 size={14} /></span>
            <span className="flex-1">
              <span className="block text-[11px] font-bold">Repeat weekly</span>
              <span className="mt-0.5 block text-[9px] text-[#9c95a5]">Create a recurring rhythm for this task</span>
            </span>
            <span className={`relative h-5 w-9 rounded-full transition ${form.recurring ? "bg-[#6c5ce7]" : "bg-[#d8d3dd]"}`}>
              <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-all ${form.recurring ? "left-[18px]" : "left-0.5"}`} />
            </span>
          </button>
        </div>

        <div className="sticky bottom-0 flex flex-wrap items-center gap-2 border-t border-[#ece9f1] bg-white/95 px-5 py-4 backdrop-blur">
          <span className="mr-auto flex items-center gap-1.5 text-[9px] font-semibold text-[#aaa3b1]"><BellRing size={11} /> We&apos;ll remind you at the chosen time</span>
          <button disabled={!canSave} onClick={() => onSave(form, true)} className="h-9 rounded-xl border border-[#ddd8e5] px-4 text-[10px] font-bold text-[#716979] transition hover:bg-[#f6f4f8] disabled:opacity-40">Save as draft</button>
          <button disabled={!canSave || !form.date} onClick={() => onSave(form, false)} className="h-9 rounded-xl bg-gradient-to-r from-[#6556db] to-[#7b5fe7] px-4 text-[10px] font-bold text-white shadow-[0_6px_16px_rgba(103,87,220,0.25)] transition hover:-translate-y-0.5 disabled:opacity-40">Schedule task</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.11em] text-[#8f8798]">{icon}{label}</span>
      {children}
    </label>
  );
}


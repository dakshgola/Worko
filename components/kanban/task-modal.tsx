"use client";

import { useEffect, useState } from "react";
import { BellRing, CalendarDays, Check, FileText, Plus, Repeat2, Tag, UserRound, X } from "lucide-react";
import type { KanbanBoard, KanbanTask, Priority, TaskFormData } from "./types";

const dateKey = () => new Date().toISOString().slice(0, 10);
const labelColors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"];

const blank = (columnId: string): TaskFormData => ({ columnId, title: "", description: "", dueDate: dateKey(), priority: "Medium", labels: [], assignee: "", reminderTime: "09:00", checklist: [], notes: "", syncCalendar: false, linkNotes: false, recurring: false });

export function TaskModal({ open, board, columnId, task, onClose, onSave }: { open: boolean; board: KanbanBoard; columnId: string; task?: KanbanTask; onClose: () => void; onSave: (data: TaskFormData) => void }) {
  const [form, setForm] = useState<TaskFormData>(blank(columnId));
  const [labelText, setLabelText] = useState("");
  const [checkText, setCheckText] = useState("");
  const update = <K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    if (open) setForm(task ? { ...task } : blank(columnId));
  }, [open, task, columnId]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-[#292438]/30 p-3 backdrop-blur-sm" onMouseDown={onClose}>
      <div onMouseDown={(event) => event.stopPropagation()} className="max-h-[94vh] w-full max-w-[720px] overflow-y-auto rounded-[24px] border border-white/80 bg-white shadow-[0_28px_80px_rgba(48,40,78,0.24)] dark:border-[#393349] dark:bg-[#211e29]">
        <div className="sticky top-0 z-10 flex items-center border-b border-[#ece9f1] bg-white/95 px-5 py-4 backdrop-blur dark:border-[#383242] dark:bg-[#211e29]/95">
          <span className="grid size-10 place-items-center rounded-[13px] bg-[#eeeaff] text-[#6454d4] dark:bg-[#352f4e]"><Check size={18} /></span>
          <div className="ml-3"><h2 className="text-sm font-bold">{task ? "Edit task" : "Create a new task"}</h2><p className="mt-0.5 text-[10px] text-[#9992a2]">{board.name} · Make the next move clear.</p></div>
          <button onClick={onClose} className="ml-auto grid size-8 place-items-center rounded-lg text-[#9d96a6] hover:bg-[#f4f1f6] dark:hover:bg-[#332e3c]"><X size={16} /></button>
        </div>
        <div className="space-y-4 p-5">
          <Field label="Task title"><input autoFocus value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="What needs to happen?" className="kanban-input" /></Field>
          <Field label="Description"><textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={2} placeholder="Add a little context..." className="kanban-input resize-none py-2.5" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Status"><select value={form.columnId} onChange={(e) => update("columnId", e.target.value)} className="kanban-input">{board.columns.map((column) => <option key={column.id} value={column.id}>{column.title}</option>)}</select></Field>
            <Field label="Assignee"><div className="relative"><UserRound size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa3b1]" /><input value={form.assignee} onChange={(e) => update("assignee", e.target.value)} placeholder="Optional" className="kanban-input pl-9" /></div></Field>
            <Field label="Due date"><input type="date" value={form.dueDate} onChange={(e) => update("dueDate", e.target.value)} className="kanban-input" /></Field>
            <Field label="Reminder time"><input type="time" value={form.reminderTime} onChange={(e) => update("reminderTime", e.target.value)} className="kanban-input" /></Field>
          </div>
          <Field label="Priority"><div className="flex rounded-xl bg-[#f5f3f7] p-1 dark:bg-[#2d2935]">{(["Low", "Medium", "High"] as Priority[]).map((priority) => <button key={priority} onClick={() => update("priority", priority)} className={`h-8 flex-1 rounded-lg text-[10px] font-bold transition ${form.priority === priority ? "bg-white text-[#4f4659] shadow-sm dark:bg-[#423b4c] dark:text-white" : "text-[#9b94a4]"}`}>{priority}</button>)}</div></Field>
          <Field label="Labels / tags">
            <div className="mb-2 flex flex-wrap gap-1.5">{form.labels.map((label) => <button key={label.id} onClick={() => update("labels", form.labels.filter((item) => item.id !== label.id))} className="rounded-full px-2.5 py-1 text-[9px] font-bold text-white" style={{ background: label.color }}>{label.name} ×</button>)}</div>
            <div className="flex gap-2"><input value={labelText} onChange={(e) => setLabelText(e.target.value)} placeholder="Add a label" className="kanban-input" /><button onClick={() => { if (!labelText.trim()) return; update("labels", [...form.labels, { id: crypto.randomUUID(), name: labelText.trim(), color: labelColors[form.labels.length % labelColors.length] }]); setLabelText(""); }} className="grid size-[42px] shrink-0 place-items-center rounded-xl bg-[#eeeaff] text-[#6556d6] dark:bg-[#352f4e]"><Tag size={14} /></button></div>
          </Field>
          <Field label="Checklist / subtasks">
            <div className="space-y-1.5">{form.checklist.map((item) => <button key={item.id} onClick={() => update("checklist", form.checklist.map((check) => check.id === item.id ? { ...check, completed: !check.completed } : check))} className="flex w-full items-center gap-2 rounded-lg bg-[#faf9fc] px-3 py-2 text-left text-[10px] dark:bg-[#2c2833]"><span className={`grid size-4 place-items-center rounded-full border ${item.completed ? "border-[#6c5ce7] bg-[#6c5ce7] text-white" : "border-[#d9d2df]"}`}>{item.completed && <Check size={9} />}</span><span className={item.completed ? "line-through opacity-50" : ""}>{item.text}</span></button>)}</div>
            <div className="mt-2 flex gap-2"><input value={checkText} onChange={(e) => setCheckText(e.target.value)} placeholder="Add a checklist item" className="kanban-input" /><button onClick={() => { if (!checkText.trim()) return; update("checklist", [...form.checklist, { id: crypto.randomUUID(), text: checkText.trim(), completed: false }]); setCheckText(""); }} className="grid size-[42px] shrink-0 place-items-center rounded-xl border border-[#e2dce8] dark:border-[#453e50]"><Plus size={14} /></button></div>
          </Field>
          <Field label="Notes"><textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={2} placeholder="Links, details, or a note to future you..." className="kanban-input resize-none py-2.5" /></Field>
          <div className="grid gap-2 sm:grid-cols-3">
            <Toggle icon={CalendarDays} label="Sync Calendar" active={form.syncCalendar} onClick={() => update("syncCalendar", !form.syncCalendar)} />
            <Toggle icon={FileText} label="Link Notes" active={form.linkNotes} onClick={() => update("linkNotes", !form.linkNotes)} />
            <Toggle icon={Repeat2} label="Recurring" active={form.recurring} onClick={() => update("recurring", !form.recurring)} />
          </div>
        </div>
        <div className="sticky bottom-0 flex items-center gap-2 border-t border-[#ece9f1] bg-white/95 px-5 py-4 backdrop-blur dark:border-[#383242] dark:bg-[#211e29]/95">
          <span className="mr-auto hidden items-center gap-1.5 text-[9px] text-[#aaa3b1] sm:flex"><BellRing size={11} /> Reminder at {form.reminderTime}</span>
          <button onClick={onClose} className="h-9 rounded-xl border border-[#ddd8e5] px-4 text-[10px] font-bold dark:border-[#453e50]">Cancel</button>
          <button disabled={!form.title.trim()} onClick={() => { onSave({ ...form, title: form.title.trim() }); onClose(); }} className="h-9 rounded-xl bg-gradient-to-r from-[#6556db] to-[#7b5fe7] px-4 text-[10px] font-bold text-white disabled:opacity-40">{task ? "Save changes" : "Create task"}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.11em] text-[#8f8798]">{label}</span>{children}</label>; }
function Toggle({ icon: Icon, label, active, onClick }: { icon: typeof CalendarDays; label: string; active: boolean; onClick: () => void }) { return <button onClick={onClick} className={`flex items-center gap-2 rounded-xl border p-3 text-[9px] font-bold transition ${active ? "border-[#c8bff3] bg-[#f3f0ff] text-[#6556d6] dark:bg-[#352f4e]" : "border-[#e8e4ed] text-[#8f8798] dark:border-[#403948]"}`}><Icon size={13} /><span className="flex-1 text-left">{label}</span><span className={`h-4 w-7 rounded-full p-0.5 transition ${active ? "bg-[#6c5ce7]" : "bg-[#d8d3dd]"}`}><span className={`block size-3 rounded-full bg-white transition ${active ? "translate-x-3" : ""}`} /></span></button>; }

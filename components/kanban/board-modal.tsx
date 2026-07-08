"use client";

import { useEffect, useState } from "react";
import { BriefcaseBusiness, Check, Palette, Rocket, Sparkles, Sun, X } from "lucide-react";
import type { KanbanBoard } from "./types";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const colors = ["#6c5ce7", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#ef4444"];
const icons = [{ name: "Rocket", Icon: Rocket }, { name: "Sparkles", Icon: Sparkles }, { name: "Briefcase", Icon: BriefcaseBusiness }, { name: "Sun", Icon: Sun }];

export function BoardModal({ open, board, onClose, onSave }: { open: boolean; board?: KanbanBoard; onClose: () => void; onSave: (data: Pick<KanbanBoard, "name" | "description" | "color" | "icon">) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(colors[0]);
  const [icon, setIcon] = useState(icons[0].name);

  useEffect(() => {
    if (!open) return;
    setName(board?.name ?? "");
    setDescription(board?.description ?? "");
    setColor(board?.color ?? colors[0]);
    setIcon(board?.icon ?? icons[0].name);
  }, [open, board]);

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-h-[92vh] w-full max-w-[500px] overflow-y-auto p-0 sm:rounded-[24px]">
        <div className="flex items-center border-b border-border px-5 py-4">
          <span className="grid size-10 place-items-center rounded-[13px] bg-secondary-soft text-secondary"><Palette size={18} /></span>
          <div className="ml-3">
            <DialogTitle className="text-sm font-bold">{board ? "Edit board" : "Create new board"}</DialogTitle>
            <DialogDescription className="mt-0.5 text-[10px] text-muted">Give this project a distinct little home.</DialogDescription>
          </div>
        </div>
        <div className="space-y-4 p-5">
          <Field label="Board name"><input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Website refresh" className="kanban-input" /></Field>
          <Field label="Description"><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this board for?" rows={2} className="kanban-input resize-none py-2.5" /></Field>
          <Field label="Board color"><div className="flex flex-wrap gap-2">{colors.map((item) => <button key={item} onClick={() => setColor(item)} className="grid size-9 place-items-center rounded-xl transition hover:scale-105" style={{ background: item }}>{color === item && <Check size={15} className="text-white" />}</button>)}</div></Field>
          <Field label="Board icon"><div className="grid grid-cols-4 gap-2">{icons.map(({ name: item, Icon }) => <button key={item} onClick={() => setIcon(item)} className={`grid h-11 place-items-center rounded-xl border transition ${icon === item ? "border-secondary/40 bg-secondary-soft text-secondary" : "border-border text-muted hover:bg-hover-overlay"}`}><Icon size={16} /></button>)}</div></Field>
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <button onClick={onClose} className="h-9 rounded-xl border border-border bg-surface px-4 text-[10px] font-bold text-muted hover:bg-hover-overlay hover:text-foreground">Cancel</button>
          <button disabled={!name.trim()} onClick={() => { onSave({ name: name.trim(), description, color, icon }); onClose(); }} className="h-9 rounded-xl bg-gradient-to-r from-primary to-primary-hover px-4 text-[10px] font-bold text-white shadow-[0_6px_16px_rgba(255,90,54,0.15)] disabled:opacity-40">{board ? "Save changes" : "Create board"}</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.11em] text-muted">{label}</span>{children}</label>;
}

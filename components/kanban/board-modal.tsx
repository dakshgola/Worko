"use client";

import { useEffect, useState } from "react";
import { BriefcaseBusiness, Check, Palette, Rocket, Sparkles, Sun, X } from "lucide-react";
import type { KanbanBoard } from "./types";

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

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-[#292438]/30 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-[500px] overflow-hidden rounded-[24px] border border-white/80 bg-white shadow-[0_28px_80px_rgba(48,40,78,0.24)] dark:border-[#393349] dark:bg-[#211e29]">
        <div className="flex items-center border-b border-[#ece9f1] px-5 py-4 dark:border-[#383242]">
          <span className="grid size-10 place-items-center rounded-[13px] bg-[#eeeaff] text-[#6454d4] dark:bg-[#352f4e]"><Palette size={18} /></span>
          <div className="ml-3"><h2 className="text-sm font-bold">{board ? "Edit board" : "Create a new board"}</h2><p className="mt-0.5 text-[10px] text-[#9992a2]">Give this project a distinct little home.</p></div>
          <button onClick={onClose} className="ml-auto grid size-8 place-items-center rounded-lg text-[#9d96a6] hover:bg-[#f4f1f6] dark:hover:bg-[#332e3c]"><X size={16} /></button>
        </div>
        <div className="space-y-4 p-5">
          <Field label="Board name"><input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Website refresh" className="kanban-input" /></Field>
          <Field label="Description"><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this board for?" rows={2} className="kanban-input resize-none py-2.5" /></Field>
          <Field label="Board color"><div className="flex flex-wrap gap-2">{colors.map((item) => <button key={item} onClick={() => setColor(item)} className="grid size-9 place-items-center rounded-xl transition hover:scale-105" style={{ background: item }}>{color === item && <Check size={15} className="text-white" />}</button>)}</div></Field>
          <Field label="Board icon"><div className="grid grid-cols-4 gap-2">{icons.map(({ name: item, Icon }) => <button key={item} onClick={() => setIcon(item)} className={`grid h-11 place-items-center rounded-xl border transition ${icon === item ? "border-[#bdb4f1] bg-[#f1edff] text-[#6556d6] dark:bg-[#352f4e]" : "border-[#e8e4ed] text-[#918a99] hover:bg-[#faf9fc] dark:border-[#3c3646] dark:hover:bg-[#302b38]"}`}><Icon size={16} /></button>)}</div></Field>
        </div>
        <div className="flex justify-end gap-2 border-t border-[#ece9f1] px-5 py-4 dark:border-[#383242]">
          <button onClick={onClose} className="h-9 rounded-xl border border-[#ddd8e5] px-4 text-[10px] font-bold dark:border-[#453e50]">Cancel</button>
          <button disabled={!name.trim()} onClick={() => { onSave({ name: name.trim(), description, color, icon }); onClose(); }} className="h-9 rounded-xl bg-gradient-to-r from-[#6556db] to-[#7b5fe7] px-4 text-[10px] font-bold text-white shadow-[0_6px_16px_rgba(103,87,220,0.25)] disabled:opacity-40">{board ? "Save changes" : "Create board"}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.11em] text-[#8f8798]">{label}</span>{children}</label>;
}

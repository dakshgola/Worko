"use client";

import { useMemo, useState } from "react";
import { DndContext, DragEndEvent, PointerSensor, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Archive, BarChart3, Bell, BriefcaseBusiness, CalendarDays, Check, ChevronDown, CircleHelp, Copy, FileText,
  Filter, GripVertical, LayoutDashboard, Menu, MoreHorizontal, Moon, Pencil, Plus, Rocket, Search, Settings,
  Sparkles, SquareKanban, Star, StickyNote, Sun, Trash2, UserRound, X, Zap,
  Bot, PenTool, PanelTop, WandSparkles,
} from "lucide-react";
import { BoardModal } from "./board-modal";
import { useKanbanStore } from "./store";
import { TaskModal } from "./task-modal";
import type { KanbanBoard, KanbanTask, Priority, TaskFormData } from "./types";

const iconMap = { Rocket, Sparkles, Briefcase: BriefcaseBusiness, Sun };
const priorityStyles: Record<Priority, string> = { Low: "bg-[#e9f7ef] text-[#37845a]", Medium: "bg-[#fff3df] text-[#b87322]", High: "bg-[#ffe8ec] text-[#c84c62]" };

export function KanbanPage() {
  const store = useKanbanStore();
  const board = store.boards.find((item) => item.id === store.activeBoardId) ?? store.boards[0];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [boardSearch, setBoardSearch] = useState("");
  const [taskSearch, setTaskSearch] = useState("");
  const [priority, setPriority] = useState<Priority | "All">("All");
  const [sort, setSort] = useState<"Created" | "Due date" | "Priority">("Created");
  const [boardModal, setBoardModal] = useState<"new" | "edit" | null>(null);
  const [taskModal, setTaskModal] = useState<{ columnId: string; task?: KanbanTask } | null>(null);
  const [dark, setDark] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const filteredTasks = useMemo(() => {
    if (!board) return [];
    const rank = { High: 0, Medium: 1, Low: 2 };
    return board.tasks.filter((task) => !task.archived && (priority === "All" || task.priority === priority) && `${task.title} ${task.description} ${task.labels.map((label) => label.name).join(" ")}`.toLowerCase().includes(taskSearch.toLowerCase())).sort((a, b) => sort === "Due date" ? a.dueDate.localeCompare(b.dueDate) : sort === "Priority" ? rank[a.priority] - rank[b.priority] : b.createdAt.localeCompare(a.createdAt));
  }, [board, priority, sort, taskSearch]);

  const stats = useMemo(() => {
    if (!board) return { total: 0, complete: 0, overdue: 0, progress: 0 };
    const tasks = board.tasks.filter((task) => !task.archived);
    const doneId = board.columns.find((column) => column.title.toLowerCase() === "done")?.id;
    const complete = tasks.filter((task) => task.columnId === doneId).length;
    const overdue = tasks.filter((task) => task.dueDate < new Date().toISOString().slice(0, 10) && task.columnId !== doneId).length;
    return { total: tasks.length, complete, overdue, progress: tasks.length ? Math.round(complete / tasks.length * 100) : 0 };
  }, [board]);

  const dragEnd = ({ active, over }: DragEndEvent) => {
    if (!board || !over) return;
    const kind = active.data.current?.kind;
    if (kind === "column") store.reorderColumns(board.id, String(active.id), String(over.id));
    if (kind === "task") {
      const overColumn = over.data.current?.kind === "task" ? over.data.current.columnId : String(over.id);
      store.moveTask(board.id, String(active.id), overColumn);
    }
  };

  if (!board) return <div className="grid min-h-screen place-items-center"><button onClick={() => setBoardModal("new")} className="rounded-xl bg-[#6c5ce7] px-4 py-2 text-sm font-bold text-white">Create your first board</button><BoardModal open={boardModal === "new"} onClose={() => setBoardModal(null)} onSave={store.addBoard} /></div>;

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-[#f8f8fb] text-[#292832] transition-colors dark:bg-[#18161e] dark:text-[#f1edf6]">
        <WorkspaceSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} active="Tasks" />
        <main className="min-h-screen min-w-0 lg:ml-[210px]">
          <header className="sticky top-0 z-30 flex h-[64px] items-center gap-3 border-b border-[#e9e7ef] bg-[#f8f8fb]/90 px-4 backdrop-blur-xl dark:border-[#302b38] dark:bg-[#18161e]/90 lg:px-6">
            <button onClick={() => setSidebarOpen(true)} className="grid size-9 place-items-center rounded-xl border border-[#e5e2ed] bg-white text-[#777080] dark:border-[#3b3543] dark:bg-[#24212b] lg:hidden"><Menu size={16} /></button>
            <div className="relative hidden max-w-[330px] flex-1 sm:block"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa3b1]" /><input value={taskSearch} onChange={(e) => setTaskSearch(e.target.value)} placeholder="Search tasks and labels..." className="kanban-input h-9 pl-9" /></div>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => setDark(!dark)} aria-label="Toggle dark mode" className="grid size-9 place-items-center rounded-xl border border-[#e5e2ed] bg-white text-[#7b7484] dark:border-[#3b3543] dark:bg-[#24212b] dark:text-[#c8c1d0]">{dark ? <Sun size={15} /> : <Moon size={15} />}</button>
              <button className="relative grid size-9 place-items-center rounded-xl border border-[#e5e2ed] bg-white text-[#7b7484] dark:border-[#3b3543] dark:bg-[#24212b]"><Bell size={15} /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#ef6688] ring-2 ring-white" /></button>
              <button onClick={() => setTaskModal({ columnId: board.columns[0].id })} className="flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-[#6556db] to-[#7b5fe7] px-3.5 text-[10px] font-bold text-white shadow-[0_6px_18px_rgba(103,87,220,0.25)]"><Plus size={14} /><span className="hidden sm:inline">New task</span></button>
            </div>
          </header>

          <div className="flex min-h-[calc(100vh-64px)] min-w-0">
            <BoardSidebar boards={store.boards} activeId={board.id} search={boardSearch} setSearch={setBoardSearch} setActive={store.setActiveBoard} onAdd={() => setBoardModal("new")} onEdit={(id) => { store.setActiveBoard(id); setBoardModal("edit"); }} onDelete={store.deleteBoard} onFavorite={store.toggleFavorite} />
            <div className="min-w-0 flex-1 p-4 lg:p-6">
              <section className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div><p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#9f98a7]">Kanban workspace</p><div className="flex items-center gap-2"><span className="size-3 rounded-full" style={{ background: board.color }} /><h1 className="text-2xl font-bold tracking-[-0.045em] sm:text-3xl">{board.name}</h1><button onClick={() => store.toggleFavorite(board.id)} className={board.favorite ? "text-[#f5a524]" : "text-[#b6afbd]"}><Star size={16} fill={board.favorite ? "currentColor" : "none"} /></button></div><p className="mt-1.5 text-[11px] text-[#918a98]">{board.description || "A clear view of everything moving."}</p></div>
                <div className="flex flex-wrap gap-2">
                  <label className="relative flex h-9 items-center gap-1.5 rounded-xl border border-[#e5e1eb] bg-white px-3 text-[9px] font-bold text-[#756e7e] shadow-sm dark:border-[#3b3543] dark:bg-[#24212b] xl:hidden">
                    <SquareKanban size={12} />
                    <select value={board.id} onChange={(event) => store.setActiveBoard(event.target.value)} className="max-w-28 appearance-none bg-transparent pr-3 outline-none">
                      {store.boards.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </label>
                  <button onClick={() => setBoardModal("new")} className="grid size-9 place-items-center rounded-xl border border-[#e5e1eb] bg-white text-[#6556d6] shadow-sm dark:border-[#3b3543] dark:bg-[#24212b] xl:hidden"><Plus size={13} /></button>
                  <SelectButton icon={Filter} value={priority} options={["All", "Low", "Medium", "High"]} onChange={(value) => setPriority(value as Priority | "All")} />
                  <SelectButton icon={ChevronDown} value={sort} options={["Created", "Due date", "Priority"]} onChange={(value) => setSort(value as typeof sort)} />
                  <button onClick={() => store.addColumn(board.id)} disabled={board.columns.length >= 5} className="flex h-9 items-center gap-2 rounded-xl border border-[#e5e1eb] bg-white px-3 text-[9px] font-bold text-[#756e7e] shadow-sm disabled:opacity-40 dark:border-[#3b3543] dark:bg-[#24212b]"><Plus size={13} /> Add column <span className="text-[#aaa3b1]">{board.columns.length}/5</span></button>
                </div>
              </section>

              <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Stat icon={SquareKanban} value={stats.total} label="Total tasks" color="bg-[#eeeaff] text-[#6556d6]" />
                <Stat icon={Check} value={stats.complete} label="Completed" color="bg-[#e9f7ef] text-[#3e9b68]" />
                <Stat icon={CalendarDays} value={stats.overdue} label="Overdue" color="bg-[#ffe8ec] text-[#c84c62]" />
                <Stat icon={BarChart3} value={`${stats.progress}%`} label="Productivity" color="bg-[#fff3df] text-[#d58c32]" progress={stats.progress} />
              </section>

              <DndContext sensors={sensors} onDragEnd={dragEnd}>
                <SortableContext items={board.columns.map((column) => column.id)} strategy={horizontalListSortingStrategy}>
                  <section className="grid min-w-0 gap-4 overflow-x-auto pb-4 [grid-template-columns:repeat(var(--columns),minmax(270px,1fr))]" style={{ "--columns": board.columns.length } as React.CSSProperties}>
                    {board.columns.map((column) => <Column key={column.id} board={board} column={column} tasks={filteredTasks.filter((task) => task.columnId === column.id)} onAdd={() => setTaskModal({ columnId: column.id })} onEdit={(task) => setTaskModal({ columnId: column.id, task })} />)}
                  </section>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </main>
        {sidebarOpen && <button onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-[#302a3d]/20 backdrop-blur-sm lg:hidden" />}
        <BoardModal open={boardModal !== null} board={boardModal === "edit" ? board : undefined} onClose={() => setBoardModal(null)} onSave={(data) => boardModal === "edit" ? store.updateBoard(board.id, data) : store.addBoard(data)} />
        <TaskModal open={!!taskModal} board={board} columnId={taskModal?.columnId ?? board.columns[0].id} task={taskModal?.task} onClose={() => setTaskModal(null)} onSave={(data: TaskFormData) => store.saveTask(board.id, data, taskModal?.task?.id)} />
      </div>
    </div>
  );
}

function BoardSidebar({ boards, activeId, search, setSearch, setActive, onAdd, onEdit, onDelete, onFavorite }: { boards: KanbanBoard[]; activeId: string; search: string; setSearch: (value: string) => void; setActive: (id: string) => void; onAdd: () => void; onEdit: (id: string) => void; onDelete: (id: string) => void; onFavorite: (id: string) => void }) {
  const visible = boards.filter((board) => board.name.toLowerCase().includes(search.toLowerCase())).sort((a, b) => Number(b.favorite) - Number(a.favorite));
  return <aside className="hidden w-[230px] shrink-0 border-r border-[#e8e7ef] bg-white/70 p-3 dark:border-[#302b38] dark:bg-[#1d1a23] xl:block">
    <div className="mb-3 flex items-center justify-between px-1"><div><p className="text-[11px] font-bold">Your boards</p><p className="mt-0.5 text-[8px] text-[#aaa3b1]">{boards.length} active workspaces</p></div><button onClick={onAdd} className="grid size-8 place-items-center rounded-xl bg-[#eeeaff] text-[#6556d6] dark:bg-[#352f4e]"><Plus size={14} /></button></div>
    <div className="relative mb-3"><Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa3b1]" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search boards..." className="kanban-input h-9 pl-8 text-[9px]" /></div>
    <div className="space-y-1.5">{visible.map((board) => { const Icon = iconMap[board.icon as keyof typeof iconMap] ?? SquareKanban; return <div key={board.id} className={`group relative rounded-xl border p-2 transition ${board.id === activeId ? "border-[#d9d2fb] bg-[#f3f0ff] shadow-sm dark:bg-[#302b42]" : "border-transparent hover:bg-[#f8f6fa] dark:hover:bg-[#28242f]"}`}><button onClick={() => setActive(board.id)} className="flex w-full items-center gap-2 text-left"><span className="grid size-8 shrink-0 place-items-center rounded-[10px] text-white shadow-sm" style={{ background: board.color }}><Icon size={13} /></span><span className="min-w-0 flex-1"><span className="block truncate text-[10px] font-bold">{board.name}</span><span className="mt-0.5 block text-[8px] text-[#9d96a6]">{board.tasks.filter((task) => !task.archived).length} tasks</span></span></button><div className="absolute right-2 top-2 hidden gap-0.5 rounded-lg bg-white p-0.5 shadow-sm group-hover:flex dark:bg-[#383242]"><MiniButton onClick={() => onFavorite(board.id)} icon={Star} /><MiniButton onClick={() => onEdit(board.id)} icon={Pencil} /><MiniButton onClick={() => onDelete(board.id)} icon={Trash2} /></div></div>; })}</div>
  </aside>;
}

function Column({ board, column, tasks, onAdd, onEdit }: { board: KanbanBoard; column: KanbanBoard["columns"][number]; tasks: KanbanTask[]; onAdd: () => void; onEdit: (task: KanbanTask) => void }) {
  const store = useKanbanStore();
  const sortable = useSortable({ id: column.id, data: { kind: "column" } });
  const droppable = useDroppable({ id: column.id, data: { kind: "column" } });
  const style = { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition };
  return <div ref={(node) => { sortable.setNodeRef(node); droppable.setNodeRef(node); }} style={style} className={`min-h-[450px] rounded-[20px] border bg-[#f3f2f7]/75 p-3 transition dark:border-[#393341] dark:bg-[#211e28] ${droppable.isOver ? "border-[#bdb4f1] ring-2 ring-[#ded9ff]" : "border-[#e8e5ed]"}`}>
    <div className="mb-3 flex items-center gap-2 px-1"><button {...sortable.attributes} {...sortable.listeners} className="cursor-grab text-[#aaa3b1]"><GripVertical size={14} /></button><span className="size-2 rounded-full" style={{ background: column.color }} /><input value={column.title} onChange={(e) => store.renameColumn(board.id, column.id, e.target.value)} className="min-w-0 flex-1 bg-transparent text-[11px] font-bold outline-none" /><span className="rounded-full bg-white px-2 py-0.5 text-[8px] font-bold text-[#8f8798] shadow-sm dark:bg-[#302b38]">{tasks.length}</span><button onClick={() => store.deleteColumn(board.id, column.id)} className="text-[#aaa3b1] hover:text-[#d05268]"><Trash2 size={12} /></button></div>
    <SortableContext items={tasks.map((task) => task.id)}><div className="space-y-2">{tasks.map((task) => <TaskCard key={task.id} task={task} board={board} onEdit={() => onEdit(task)} />)}</div></SortableContext>
    <button onClick={onAdd} className="mt-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#d9d3e0] text-[9px] font-bold text-[#918a99] transition hover:border-[#bdb4f1] hover:bg-white hover:text-[#6556d6] dark:border-[#453e50] dark:hover:bg-[#2b2732]"><Plus size={12} /> Add task</button>
  </div>;
}

function TaskCard({ task, board, onEdit }: { task: KanbanTask; board: KanbanBoard; onEdit: () => void }) {
  const store = useKanbanStore();
  const sortable = useSortable({ id: task.id, data: { kind: "task", columnId: task.columnId } });
  const complete = task.checklist.filter((item) => item.completed).length;
  const progress = task.checklist.length ? Math.round(complete / task.checklist.length * 100) : 0;
  return <article ref={sortable.setNodeRef} style={{ transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition }} className={`group rounded-[16px] border border-[#e6e2eb] bg-white p-3 shadow-[0_5px_16px_rgba(54,48,89,0.045)] transition hover:-translate-y-0.5 hover:border-[#d7d0f1] hover:shadow-[0_10px_24px_rgba(54,48,89,0.09)] dark:border-[#3c3645] dark:bg-[#2a2631] ${sortable.isDragging ? "opacity-50" : ""}`}>
    <div className="mb-2 flex items-start gap-2"><button {...sortable.attributes} {...sortable.listeners} className="mt-0.5 cursor-grab text-[#c0b9c6] opacity-0 group-hover:opacity-100"><GripVertical size={12} /></button><button onClick={onEdit} className="min-w-0 flex-1 text-left text-[11px] font-bold leading-4">{task.title}</button><div className="relative"><button className="peer grid size-5 place-items-center rounded-md text-[#aaa3b1] hover:bg-[#f4f1f6]"><MoreHorizontal size={13} /></button><div className="invisible absolute right-0 top-5 z-20 w-28 rounded-xl border border-[#e5e1eb] bg-white p-1 opacity-0 shadow-xl transition peer-focus:visible peer-focus:opacity-100 hover:visible hover:opacity-100 dark:border-[#453e50] dark:bg-[#312c39]"><Action label="Edit" icon={Pencil} onClick={onEdit} /><Action label="Duplicate" icon={Copy} onClick={() => store.duplicateTask(board.id, task.id)} /><Action label="Archive" icon={Archive} onClick={() => store.archiveTask(board.id, task.id)} /><Action label="Delete" icon={Trash2} onClick={() => store.deleteTask(board.id, task.id)} /></div></div></div>
    {task.description && <p className="mb-2 line-clamp-2 text-[9px] leading-4 text-[#958e9c]">{task.description}</p>}
    <div className="mb-2 flex flex-wrap gap-1">{task.labels.slice(0, 3).map((label) => <span key={label.id} className="rounded-full px-2 py-0.5 text-[7px] font-bold text-white" style={{ background: label.color }}>{label.name}</span>)}</div>
    {task.checklist.length > 0 && <div className="mb-2"><div className="mb-1 flex justify-between text-[7px] font-bold text-[#aaa3b1]"><span>Progress</span><span>{complete}/{task.checklist.length}</span></div><div className="h-1 overflow-hidden rounded-full bg-[#eeeaf1] dark:bg-[#403947]"><div className="h-full rounded-full bg-[#6c5ce7]" style={{ width: `${progress}%` }} /></div></div>}
    <div className="flex items-center gap-1.5 border-t border-[#f0edf3] pt-2 text-[8px] text-[#9a93a2] dark:border-[#3a3442]"><span className={`rounded-full px-1.5 py-0.5 font-bold ${priorityStyles[task.priority]}`}>{task.priority}</span><CalendarDays size={9} /><span>{task.dueDate.slice(5)}</span>{task.syncCalendar && <CalendarDays size={10} className="ml-auto text-[#6556d6]" />}{task.linkNotes && <FileText size={10} className="text-[#df8b3b]" />}{task.assignee && <span className="ml-auto grid size-5 place-items-center rounded-full bg-gradient-to-br from-[#ffad72] to-[#ef6688] text-[6px] font-bold text-white">{task.assignee.slice(0, 2).toUpperCase()}</span>}</div>
  </article>;
}

function WorkspaceSidebar({ open, onClose, active }: { open: boolean; onClose: () => void; active: string }) {
  const items = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/" },
    { label: "AI Assistant", icon: Bot, href: "/ai-assistant" },
    { label: "Calendar", icon: CalendarDays, href: "/calendar" },
    { label: "Tasks", icon: SquareKanban, href: "/kanban" },
    { label: "Notes", icon: StickyNote, href: "/notes" },
    { label: "Whiteboard", icon: PenTool, href: "/whiteboard" },
    { label: "Spaces", icon: PanelTop, href: "/spaces" },
    { label: "AI Builder", icon: WandSparkles, href: "/ai-template-builder" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-[210px] border-r border-[#e8e7ef] bg-white transition-transform dark:border-[#302b38] dark:bg-[#1d1a23] lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-[64px] items-center gap-3 border-b border-[#efedf4] px-4 dark:border-[#302b38]">
        <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#6c5ce7] to-[#8b5cf6] text-white shadow-lg">
          <Zap size={17} fill="currentColor" />
        </span>
        <div>
          <p className="text-[15px] font-bold tracking-[-0.04em]">Worko</p>
          <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#aaa4b2]">Creative workspace</p>
        </div>
        <button onClick={onClose} className="ml-auto lg:hidden">
          <X size={15} />
        </button>
      </div>
      <nav className="space-y-1 p-3 overflow-y-auto max-h-[calc(100vh-140px)]">
        <p className="mb-2 px-2 text-[8px] font-bold uppercase tracking-[0.17em] text-[#aaa6b5]">Workspace</p>
        {items.map(({ label, icon: Icon, href }) => (
          <a
            key={label}
            href={href}
            className={`relative flex h-10 items-center gap-3 rounded-xl px-2.5 text-[11px] font-bold transition ${
              label === active ? "bg-[#eeeaff] text-[#5849c6] dark:bg-[#352f4e]" : "text-[#777181] hover:bg-[#f7f5f9] dark:hover:bg-[#28242f]"
            }`}
          >
            <span className={`grid size-7 place-items-center rounded-lg ${
              label === active ? "bg-white text-[#6556d6] shadow-sm dark:bg-[#463e58]" : "bg-[#f3f1f5] text-[#918a99] dark:bg-[#302b38]"
            }`}>
              <Icon size={13} />
            </span>
            {label}
          </a>
        ))}
      </nav>
      <div className="absolute bottom-0 w-full border-t border-[#efedf4] p-3 dark:border-[#302b38]">
        <button
          onClick={() => { window.location.href = "/settings"; }}
          className="flex w-full items-center gap-2 rounded-xl border border-[#ece8f1] bg-[#fcfbfd] p-2 text-left dark:border-[#3c3645] dark:bg-[#29252f]"
        >
          <span className="grid size-8 place-items-center rounded-[10px] bg-gradient-to-br from-[#ffad72] to-[#ef6688] text-[9px] font-bold text-white">DG</span>
          <span className="min-w-0">
            <span className="block text-[10px] font-bold">Daksh Gola</span>
            <span className="block text-[8px] text-[#a29ba9]">Personal workspace</span>
          </span>
          <Settings size={12} className="ml-auto" />
        </button>
      </div>
    </aside>
  );
}

function SelectButton({ icon: Icon, value, options, onChange }: { icon: typeof Filter; value: string; options: string[]; onChange: (value: string) => void }) { return <label className="relative flex h-9 items-center gap-1.5 rounded-xl border border-[#e5e1eb] bg-white px-3 text-[9px] font-bold text-[#756e7e] shadow-sm dark:border-[#3b3543] dark:bg-[#24212b]"><Icon size={12} /><select value={value} onChange={(e) => onChange(e.target.value)} className="appearance-none bg-transparent pr-3 outline-none">{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }
function Stat({ icon: Icon, value, label, color, progress }: { icon: typeof SquareKanban; value: string | number; label: string; color: string; progress?: number }) { return <div className="flex items-center gap-3 rounded-[16px] border border-[#e7e4ee] bg-white p-3 shadow-[0_6px_20px_rgba(54,48,89,0.04)] dark:border-[#393341] dark:bg-[#24212b]"><span className={`grid size-9 place-items-center rounded-xl ${color}`}><Icon size={15} /></span><span><span className="block text-sm font-bold">{value}</span><span className="text-[8px] font-bold uppercase tracking-[0.1em] text-[#9d96a6]">{label}</span></span>{progress !== undefined && <span className="ml-auto h-8 w-1.5 overflow-hidden rounded-full bg-[#eeeaf1] dark:bg-[#403947]"><span className="block w-full rounded-full bg-[#f0a342]" style={{ height: `${progress}%`, marginTop: `${100 - progress}%` }} /></span>}</div>; }
function MiniButton({ onClick, icon: Icon }: { onClick: () => void; icon: typeof Star }) { return <button onClick={onClick} className="grid size-5 place-items-center rounded-md text-[#9992a2] hover:bg-[#f2eff5] hover:text-[#6556d6] dark:hover:bg-[#494153]"><Icon size={10} /></button>; }
function Action({ label, icon: Icon, onClick }: { label: string; icon: typeof Pencil; onClick: () => void }) { return <button onClick={onClick} className="flex h-7 w-full items-center gap-2 rounded-lg px-2 text-[8px] font-bold text-[#756e7e] hover:bg-[#f5f2f7] dark:text-[#c0b8c8] dark:hover:bg-[#403947]"><Icon size={10} />{label}</button>; }

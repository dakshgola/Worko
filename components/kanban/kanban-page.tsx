"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
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
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar";
import { syncKanbanData } from "@/lib/kanban/actions";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const iconMap = { Rocket, Sparkles, Briefcase: BriefcaseBusiness, Sun };
const priorityStyles: Record<Priority, string> = { Low: "bg-success-soft text-success", Medium: "bg-primary-soft text-primary", High: "bg-danger-soft text-danger" };

export function KanbanPage() {
  const store = useKanbanStore();

  useEffect(() => {
    if (store.boards && store.boards.length > 0) {
      syncKanbanData(store.boards).catch((err) => {
        console.error("Kanban sync failed:", err);
        toast.error("Failed to sync Kanban data");
      });
    }
  }, [store.boards]);

  const board = store.boards.find((item) => item.id === store.activeBoardId) ?? store.boards[0];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [boardSearch, setBoardSearch] = useState("");
  const [taskSearch, setTaskSearch] = useState("");
  const [priority, setPriority] = useState<Priority | "All">("All");
  const [sort, setSort] = useState<"Created" | "Due date" | "Priority">("Created");
  const [boardModal, setBoardModal] = useState<"new" | "edit" | null>(null);
  const [taskModal, setTaskModal] = useState<{ columnId: string; task?: KanbanTask } | null>(null);
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

  if (!board) return <div className="grid min-h-screen place-items-center bg-background"><button onClick={() => setBoardModal("new")} className="btn-primary">Create your first board</button><BoardModal open={boardModal === "new"} onClose={() => setBoardModal(null)} onSave={store.addBoard} /></div>;

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <WorkspaceSidebar active="Tasks" />
      <main className="flex-grow min-w-0 min-h-screen pt-[64px] lg:pt-0">
        <header className="sticky top-[64px] lg:top-0 z-30 flex h-[68px] items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-6">
          <div className="relative hidden max-w-[330px] flex-1 sm:block"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={taskSearch} onChange={(e) => setTaskSearch(e.target.value)} placeholder="Search tasks and labels..." className="pl-9 input-cozy" /></div>
          <div className="ml-auto flex items-center gap-2">
            <button className="btn-icon text-muted relative"><Bell size={15} /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary ring-2 ring-white" /></button>
            <button onClick={() => setTaskModal({ columnId: board.columns[0].id })} className="btn-primary h-10 gap-2"><Plus size={14} /><span className="hidden sm:inline">New task</span></button>
          </div>
        </header>

        <div className="flex min-h-[calc(100vh-68px)] min-w-0">
          <BoardSidebar boards={store.boards} activeId={board.id} search={boardSearch} setSearch={setBoardSearch} setActive={store.setActiveBoard} onAdd={() => setBoardModal("new")} onEdit={(id) => { store.setActiveBoard(id); setBoardModal("edit"); }} onDelete={store.deleteBoard} onFavorite={store.toggleFavorite} />
          
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="min-w-0 flex-1 p-4 lg:p-6"
          >
            <section className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div><p className="mb-1.5 text-overline text-muted block">Kanban workspace</p><div className="flex items-center gap-2"><span className="size-3 rounded-full" style={{ background: board.color }} /><h1 className="text-h2 text-foreground">{board.name}</h1><button onClick={() => store.toggleFavorite(board.id)} className={board.favorite ? "text-amber-500" : "text-muted"}><Star size={16} fill={board.favorite ? "currentColor" : "none"} /></button></div><p className="mt-1.5 text-body-sm text-muted font-semibold">{board.description || "A clear view of everything moving."}</p></div>
              <div className="flex flex-wrap gap-2">
                <label className="relative flex h-10 items-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-btn text-muted shadow-sm xl:hidden">
                  <SquareKanban size={12} />
                  <select value={board.id} onChange={(event) => store.setActiveBoard(event.target.value)} className="max-w-28 appearance-none bg-transparent pr-3 outline-none font-semibold">
                    {store.boards.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </label>
                <button onClick={() => setBoardModal("new")} className="btn-icon text-primary xl:hidden"><Plus size={13} /></button>
                <SelectButton icon={Filter} value={priority} options={["All", "Low", "Medium", "High"]} onChange={(value) => setPriority(value as Priority | "All")} />
                <SelectButton icon={ChevronDown} value={sort} options={["Created", "Due date", "Priority"]} onChange={(value) => setSort(value as typeof sort)} />
                <button onClick={() => store.addColumn(board.id)} disabled={board.columns.length >= 5} className="flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-btn text-muted shadow-sm disabled:opacity-40"><Plus size={13} /> Add column <span className="text-muted">{board.columns.length}/5</span></button>
              </div>
            </section>

            <section className="mb-5 grid gap-3 grid-cols-2 md:grid-cols-2 xl:grid-cols-4">
              <Stat icon={SquareKanban} value={stats.total} label="Total tasks" color="bg-primary-soft text-primary" />
              <Stat icon={Check} value={stats.complete} label="Completed" color="bg-success-soft text-success" />
              <Stat icon={CalendarDays} value={stats.overdue} label="Overdue" color="bg-danger-soft text-danger" />
              <Stat icon={BarChart3} value={`${stats.progress}%`} label="Productivity" color="bg-primary-soft text-primary" progress={stats.progress} />
            </section>

            <DndContext sensors={sensors} onDragEnd={dragEnd}>
              <SortableContext items={board.columns.map((column) => column.id)} strategy={horizontalListSortingStrategy}>
                <section className="grid min-w-0 gap-4 overflow-x-auto pb-4 [grid-template-columns:repeat(var(--columns),minmax(270px,1fr))]" style={{ "--columns": board.columns.length } as React.CSSProperties}>
                  {board.columns.map((column) => <Column key={column.id} board={board} column={column} tasks={filteredTasks.filter((task) => task.columnId === column.id)} onAdd={() => setTaskModal({ columnId: column.id })} onEdit={(task) => setTaskModal({ columnId: column.id, task })} />)}
                </section>
              </SortableContext>
            </DndContext>
          </motion.div>
        </div>
      </main>
      <BoardModal open={boardModal !== null} board={boardModal === "edit" ? board : undefined} onClose={() => setBoardModal(null)} onSave={(data) => boardModal === "edit" ? store.updateBoard(board.id, data) : store.addBoard(data)} />
      <TaskModal open={!!taskModal} board={board} columnId={taskModal?.columnId ?? board.columns[0].id} task={taskModal?.task} onClose={() => setTaskModal(null)} onSave={(data: TaskFormData) => store.saveTask(board.id, data, taskModal?.task?.id)} />
    </div>
  );
}

function BoardSidebar({ boards, activeId, search, setSearch, setActive, onAdd, onEdit, onDelete, onFavorite }: { boards: KanbanBoard[]; activeId: string; search: string; setSearch: (value: string) => void; setActive: (id: string) => void; onAdd: () => void; onEdit: (id: string) => void; onDelete: (id: string) => void; onFavorite: (id: string) => void }) {
  const visible = boards.filter((board) => board.name.toLowerCase().includes(search.toLowerCase())).sort((a, b) => Number(b.favorite) - Number(a.favorite));
  return <aside className="hidden w-[230px] shrink-0 border-r border-border bg-background p-3 xl:block">
    <div className="mb-3 flex items-center justify-between px-1"><div><p className="text-label-val font-bold text-foreground">Your boards</p><p className="mt-0.5 text-caption text-muted font-semibold">{boards.length} active workspaces</p></div><button onClick={onAdd} className="btn-secondary size-8 p-0 flex items-center justify-center"><Plus size={14} /></button></div>
    <div className="relative mb-3"><Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter boards..." className="pl-8 input-cozy h-8 rounded-lg" /></div>
    <div className="space-y-1.5">{visible.map((board) => { const Icon = iconMap[board.icon as keyof typeof iconMap] ?? SquareKanban; return <div key={board.id} className={`group relative rounded-xl border p-2 transition ${board.id === activeId ? "border-primary bg-primary-soft shadow-sm" : "border-transparent hover:bg-hover-overlay"}`}><button onClick={() => setActive(board.id)} className="flex w-full items-center gap-2 text-left"><span className="grid size-8 shrink-0 place-items-center rounded-[10px] text-white shadow-sm" style={{ background: board.color }}><Icon size={13} /></span><span className="min-w-0 flex-1"><span className="block truncate text-body-sm font-bold text-foreground">{board.name}</span><span className="mt-0.5 block text-caption text-muted font-semibold">{board.tasks.filter((task) => !task.archived).length} tasks</span></span></button><div className="absolute right-2 top-2 hidden gap-0.5 rounded-lg bg-surface p-0.5 shadow-sm group-hover:flex"><MiniButton onClick={() => onFavorite(board.id)} icon={Star} /><MiniButton onClick={() => onEdit(board.id)} icon={Pencil} /><MiniButton onClick={() => onDelete(board.id)} icon={Trash2} /></div></div>; })}</div>
  </aside>;
}

function Column({ board, column, tasks, onAdd, onEdit }: { board: KanbanBoard; column: KanbanBoard["columns"][number]; tasks: KanbanTask[]; onAdd: () => void; onEdit: (task: KanbanTask) => void }) {
  const store = useKanbanStore();
  const sortable = useSortable({ id: column.id, data: { kind: "column" } });
  const droppable = useDroppable({ id: column.id, data: { kind: "column" } });
  const style = { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition };
  return <div ref={(node) => { sortable.setNodeRef(node); droppable.setNodeRef(node); }} style={style} className={`min-h-[450px] rounded-[20px] border bg-background/80 p-3 transition ${droppable.isOver ? "border-primary ring-2 ring-primary-soft" : "border-border"}`}>
    <div className="mb-3 flex items-center gap-2 px-1"><button {...sortable.attributes} {...sortable.listeners} className="cursor-grab text-muted"><GripVertical size={14} /></button><span className="size-2 rounded-full" style={{ background: column.color }} /><input value={column.title} onChange={(e) => store.renameColumn(board.id, column.id, e.target.value)} className="min-w-0 flex-1 bg-transparent text-label-val font-bold text-foreground outline-none" /><span className="rounded-full bg-surface px-2 py-0.5 text-badge-val text-muted shadow-sm">{tasks.length}</span><button onClick={() => store.deleteColumn(board.id, column.id)} className="text-muted hover:text-primary"><Trash2 size={12} /></button></div>
    <SortableContext items={tasks.map((task) => task.id)}><div className="space-y-2">{tasks.map((task) => <TaskCard key={task.id} task={task} board={board} onEdit={() => onEdit(task)} />)}</div></SortableContext>
    <button onClick={onAdd} className="mt-2 btn-outline w-full hover:border-primary border-dashed"><Plus size={12} /> Add task</button>
  </div>;
}

function TaskCard({ task, board, onEdit }: { task: KanbanTask; board: KanbanBoard; onEdit: () => void }) {
  const store = useKanbanStore();
  const sortable = useSortable({ id: task.id, data: { kind: "task", columnId: task.columnId } });
  const complete = task.checklist.filter((item) => item.completed).length;
  const progress = task.checklist.length ? Math.round(complete / task.checklist.length * 100) : 0;
  return <article ref={sortable.setNodeRef} style={{ transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition }} className={`group rounded-[16px] border border-border bg-surface p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md ${sortable.isDragging ? "opacity-50" : ""}`}>
    <div className="mb-2 flex items-start gap-2">
      <button {...sortable.attributes} {...sortable.listeners} className="mt-0.5 cursor-grab text-muted opacity-100 lg:opacity-0 lg:group-hover:opacity-100" aria-label="Drag task card"><GripVertical size={12} /></button>
      <button onClick={onEdit} className="min-w-0 flex-1 text-left text-body-sm font-bold text-foreground leading-4">{task.title}</button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="grid size-5 place-items-center rounded-md text-muted hover:bg-hover-overlay" aria-label="Task options">
            <MoreHorizontal size={13} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-28 bg-surface border border-border p-1 shadow-lg rounded-xl">
          <DropdownMenuItem onClick={onEdit} className="flex h-7 w-full items-center gap-2 rounded-lg px-2 text-caption font-bold text-muted hover:bg-primary-soft hover:text-primary cursor-pointer">
            <Pencil size={10} /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => store.duplicateTask(board.id, task.id)} className="flex h-7 w-full items-center gap-2 rounded-lg px-2 text-caption font-bold text-muted hover:bg-primary-soft hover:text-primary cursor-pointer">
            <Copy size={10} /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => store.archiveTask(board.id, task.id)} className="flex h-7 w-full items-center gap-2 rounded-lg px-2 text-caption font-bold text-muted hover:bg-primary-soft hover:text-primary cursor-pointer">
            <Archive size={10} /> Archive
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => store.deleteTask(board.id, task.id)} className="flex h-7 w-full items-center gap-2 rounded-lg px-2 text-caption font-bold text-muted hover:bg-[#ffe5e5] hover:text-danger cursor-pointer">
            <Trash2 size={10} /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    {task.description && <p className="mb-2 line-clamp-2 text-caption leading-relaxed text-muted font-semibold">{task.description}</p>}
    <div className="mb-2 flex flex-wrap gap-1">{task.labels.slice(0, 3).map((label) => <span key={label.id} className="rounded-full px-2 py-0.5 text-[7px] font-bold text-white" style={{ background: label.color }}>{label.name}</span>)}</div>
    {task.checklist.length > 0 && <div className="mb-2"><div className="mb-1 flex justify-between text-badge-val text-muted"><span>Progress</span><span>{complete}/{task.checklist.length}</span></div><div className="h-1 overflow-hidden rounded-full bg-background border border-border"><div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} /></div></div>}
    <div className="flex items-center gap-1.5 border-t border-border pt-2 text-caption text-muted font-semibold"><span className={`rounded-full px-1.5 py-0.5 font-bold ${priorityStyles[task.priority]}`}>{task.priority}</span><CalendarDays size={9} /><span>{task.dueDate.slice(5)}</span>{task.syncCalendar && <CalendarDays size={10} className="ml-auto text-primary" />}{task.linkNotes && <FileText size={10} className="text-primary" />}{task.assignee && <span className="ml-auto grid size-5 place-items-center rounded-full bg-gradient-to-br from-[#ffad72] to-[#ef6688] text-[6px] font-bold text-white">{task.assignee.slice(0, 2).toUpperCase()}</span>}</div>
  </article>;
}

function SelectButton({ icon: Icon, value, options, onChange }: { icon: typeof Filter; value: string; options: string[]; onChange: (value: string) => void }) { return <label className="relative flex h-10 items-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-btn text-muted shadow-sm"><Icon size={12} /><select value={value} onChange={(e) => onChange(e.target.value)} className="appearance-none bg-transparent pr-3 outline-none font-semibold">{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }
function Stat({ icon: Icon, value, label, color, progress }: { icon: typeof SquareKanban; value: string | number; label: string; color: string; progress?: number }) { return <div className="flex items-center gap-3 rounded-[16px] border border-border bg-surface p-3 shadow-sm"><span className={`grid size-9 place-items-center rounded-xl ${color}`}><Icon size={15} /></span><span><span className="block text-h3 font-black text-foreground">{value}</span><span className="text-overline text-muted block">{label}</span></span>{progress !== undefined && <span className="ml-auto h-8 w-1.5 overflow-hidden rounded-full bg-background"><span className="block w-full rounded-full bg-primary" style={{ height: `${progress}%`, marginTop: `${100 - progress}%` }} /></span>}</div>; }
function MiniButton({ onClick, icon: Icon }: { onClick: () => void; icon: typeof Star }) { return <button onClick={onClick} className="grid size-5 place-items-center rounded-md text-muted hover:bg-primary-soft hover:text-primary"><Icon size={10} /></button>; }
function Action({ label, icon: Icon, onClick }: { label: string; icon: typeof Pencil; onClick: () => void }) { return <button onClick={onClick} className="flex h-7 w-full items-center gap-2 rounded-lg px-2 text-caption font-bold text-muted hover:bg-primary-soft hover:text-primary"><Icon size={10} />{label}</button>; }

"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileText,
  LayoutDashboard,
  MoreHorizontal,
  PanelTop,
  PenTool,
  Plus,
  Search,
  Settings,
  Sparkles,
  SquareKanban,
  StickyNote,
  WandSparkles,
  Zap,
} from "lucide-react";

const navigation = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, color: "text-indigo-600", iconBg: "bg-indigo-100", active: true },
      { label: "AI Assistant", icon: Sparkles, color: "text-amber-600", iconBg: "bg-amber-100" },
      { label: "Calendar", icon: CalendarDays, color: "text-sky-600", iconBg: "bg-sky-100" },
    ],
  },
  {
    label: "Create",
    items: [
      { label: "Task / Kanban", icon: SquareKanban, color: "text-emerald-600", iconBg: "bg-emerald-100" },
      { label: "Notes", icon: StickyNote, color: "text-orange-600", iconBg: "bg-orange-100" },
      { label: "Whiteboard", icon: PenTool, color: "text-pink-600", iconBg: "bg-pink-100" },
      { label: "Pages / Spaces", icon: PanelTop, color: "text-violet-600", iconBg: "bg-violet-100" },
    ],
  },
  {
    label: "Tools",
    items: [
      { label: "AI Template Builder", icon: WandSparkles, color: "text-rose-600", iconBg: "bg-rose-100" },
      { label: "Settings", icon: Settings, color: "text-slate-600", iconBg: "bg-slate-100" },
    ],
  },
];

const tasks = [
  { title: "Finalize project brief", project: "Website refresh", color: "bg-violet-500", done: true },
  { title: "Map onboarding flow", project: "Product design", color: "bg-sky-500", done: false },
  { title: "Review Q2 content plan", project: "Marketing", color: "bg-orange-500", done: false },
];

const spaces = [
  { title: "Product Strategy", type: "Whiteboard", color: "from-violet-100 to-fuchsia-50", icon: PenTool },
  { title: "Weekly Notes", type: "Notes", color: "from-amber-100 to-orange-50", icon: StickyNote },
  { title: "Launch Planning", type: "Kanban board", color: "from-sky-100 to-cyan-50", icon: SquareKanban },
];

export default function Home() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f8fb] text-[#292832]">
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-[#e8e7ef] bg-[linear-gradient(180deg,#ffffff_0%,#fbfaff_52%,#fffaf8_100%)] shadow-[6px_0_30px_rgba(50,46,92,0.035)] transition-all duration-300 ${
          collapsed ? "w-[68px]" : "w-[224px]"
        }`}
      >
        <div className="flex h-[68px] items-center border-b border-[#efedf4] px-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-[12px] bg-gradient-to-br from-[#6c5ce7] via-[#6757dc] to-[#8b5cf6] text-white shadow-[0_7px_18px_rgba(102,87,220,0.28)] ring-1 ring-white/30 transition duration-300 hover:scale-105 hover:rotate-[-3deg]">
              <Zap size={17} fill="currentColor" strokeWidth={1.8} />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-[16px] font-bold tracking-[-0.045em] text-[#282633]">Worko</p>
                <p className="truncate text-[9px] font-bold uppercase tracking-[0.15em] text-[#9b97a8]">
                  Creative workspace
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 py-3">
          {navigation.map((section, sectionIndex) => (
            <div key={section.label} className={sectionIndex === 0 ? "" : "mt-4"}>
              {!collapsed && (
                <p className="mb-1.5 px-2.5 text-[9px] font-bold uppercase tracking-[0.17em] text-[#aaa6b5]">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map(({ label, icon: Icon, color, iconBg, active }) => (
                  <button
                    key={label}
                    title={collapsed ? label : undefined}
                    onClick={() => {
                      if (label === "Calendar") window.location.href = "/calendar";
                    }}
                    className={`group relative flex h-9.5 w-full items-center gap-2.5 rounded-[10px] px-2 text-[12px] font-semibold transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-[#eeeaff] to-[#f6f3ff] text-[#5143bd] shadow-[inset_0_0_0_1px_rgba(103,87,220,0.08)]"
                        : "text-[#6f6b7b] hover:translate-x-0.5 hover:bg-white hover:text-[#302d3a] hover:shadow-[0_4px_14px_rgba(54,48,89,0.06)]"
                    } ${collapsed ? "justify-center px-0" : ""}`}
                  >
                    {active && <span className="absolute left-0 h-4 w-0.5 rounded-full bg-[#6c5ce7]" />}
                    <span className={`grid size-6 shrink-0 place-items-center rounded-[7px] ${iconBg} transition-transform duration-200 group-hover:scale-105`}>
                      <Icon size={13.5} strokeWidth={2.25} className={color} />
                    </span>
                    {!collapsed && <span className="truncate">{label}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[#efedf4] p-2.5">
          <button
            className={`mb-1.5 flex h-9 w-full items-center gap-2.5 rounded-[10px] px-2 text-[12px] font-semibold text-[#777281] transition hover:bg-white hover:text-[#5143bd] hover:shadow-sm ${
              collapsed ? "justify-center" : ""
            }`}
            title={collapsed ? "Help & support" : undefined}
          >
            <span className="grid size-6 place-items-center rounded-[7px] bg-cyan-100"><CircleHelp size={13.5} className="shrink-0 text-cyan-600" /></span>
            {!collapsed && <span>Help & support</span>}
          </button>
          <div className={`flex items-center gap-2.5 rounded-xl border border-[#ece9f2] bg-white/80 p-1.5 shadow-[0_4px_14px_rgba(54,48,89,0.045)] transition hover:border-[#ddd7f4] hover:shadow-[0_6px_18px_rgba(54,48,89,0.08)] ${collapsed ? "justify-center" : ""}`}>
            <div className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-gradient-to-br from-[#ffad72] to-[#ef6688] text-[10px] font-bold text-white shadow-sm">
              DG
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">Daksh Gola</p>
                  <p className="truncate text-[10px] text-[#999187]">Personal workspace</p>
                </div>
                <ChevronDown size={14} className="text-[#aaa399]" />
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-[78px] grid size-6 place-items-center rounded-full border border-[#e3e0eb] bg-white text-[#858091] shadow-[0_3px_10px_rgba(54,48,89,0.1)] transition duration-200 hover:scale-110 hover:border-[#cfc8f5] hover:text-[#5b4dcc]"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      <main className={`min-h-screen transition-[margin] duration-300 ${collapsed ? "ml-[68px]" : "ml-[224px]"}`}>
        <header className="sticky top-0 z-20 flex h-[68px] items-center gap-4 border-b border-[#e9e7ef] bg-[#f8f8fb]/85 px-6 backdrop-blur-xl lg:px-10">
          <div className="relative max-w-[420px] flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a39d93]" />
            <input
              className="h-9.5 w-full rounded-xl border border-[#e5e2ed] bg-white/85 pl-10 pr-16 text-sm shadow-[0_2px_8px_rgba(54,48,89,0.025)] outline-none transition-all placeholder:text-[#aaa6b4] focus:border-[#bdb4f1] focus:bg-white focus:ring-4 focus:ring-[#ded9ff]/60"
              placeholder="Search your workspace..."
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-[#e8e2d8] bg-[#f7f5f0] px-1.5 py-0.5 text-[10px] text-[#9c958a]">
              ⌘ K
            </kbd>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="relative grid size-9.5 place-items-center rounded-xl border border-[#e5e2ed] bg-white text-[#716c7d] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#cfc8f5] hover:text-[#5143bd] hover:shadow-md">
              <Bell size={17} />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#e87d8f] ring-2 ring-white" />
            </button>
            <button className="flex h-9.5 items-center gap-2 rounded-xl bg-gradient-to-r from-[#6556db] to-[#7b5fe7] px-4 text-xs font-semibold text-white shadow-[0_6px_18px_rgba(103,87,220,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_9px_24px_rgba(103,87,220,0.32)]">
              <Plus size={16} />
              <span className="hidden sm:inline">Create new</span>
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] p-6 lg:p-10">
          <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold text-[#8e877e]">Sunday, June 7</p>
              <h1 className="text-3xl font-bold tracking-[-0.045em] text-[#302d29]">Good afternoon, Daksh</h1>
              <p className="mt-2 text-sm text-[#888178]">Here&apos;s a calm look at everything moving today.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["DG", "AM", "SR"].map((name, index) => (
                  <div
                    key={name}
                    className={`grid size-8 place-items-center rounded-full border-2 border-[#f7f5f0] text-[9px] font-bold text-white ${
                      ["bg-[#e99472]", "bg-[#69a8a0]", "bg-[#8074d6]"][index]
                    }`}
                  >
                    {name}
                  </div>
                ))}
              </div>
              <span className="text-xs font-medium text-[#8e877e]">3 online</span>
            </div>
          </section>

          <section className="mb-6 grid gap-4 md:grid-cols-3">
            <StatCard icon={Check} color="bg-[#e9f7ef] text-[#3e9b68]" value="12" label="Tasks completed" note="+3 this week" />
            <StatCard icon={Clock3} color="bg-[#fff3df] text-[#d58c32]" value="6.5h" label="Focus time" note="Your daily best" />
            <StatCard icon={FileText} color="bg-[#eeebff] text-[#6657d9]" value="24" label="Active pages" note="Across 4 spaces" />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.35fr_0.8fr]">
            <div className="space-y-6">
              <div className="rounded-[22px] border border-[#e7e4ee] bg-white p-5 shadow-[0_8px_32px_rgba(54,48,89,0.055)] transition-shadow hover:shadow-[0_12px_38px_rgba(54,48,89,0.08)]">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold tracking-[-0.025em]">Today&apos;s focus</h2>
                    <p className="mt-1 text-xs text-[#999187]">Three priorities to keep things moving</p>
                  </div>
                  <button className="grid size-8 place-items-center rounded-lg text-[#aaa399] hover:bg-[#f6f2eb]">
                    <MoreHorizontal size={17} />
                  </button>
                </div>
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <button
                      key={task.title}
                      className="flex w-full items-center gap-3 rounded-xl border border-transparent p-3 text-left transition hover:border-[#eee8de] hover:bg-[#faf8f3]"
                    >
                      <span
                        className={`grid size-5 place-items-center rounded-full border ${
                          task.done ? "border-[#70b990] bg-[#70b990] text-white" : "border-[#d9d2c7] text-transparent"
                        }`}
                      >
                        <Check size={12} />
                      </span>
                      <span className={`flex-1 text-sm font-medium ${task.done ? "text-[#9a938a] line-through" : ""}`}>
                        {task.title}
                      </span>
                      <span className="hidden items-center gap-2 text-[11px] text-[#999187] sm:flex">
                        <span className={`size-2 rounded-full ${task.color}`} />
                        {task.project}
                      </span>
                    </button>
                  ))}
                </div>
                <button className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-[#6657d9] hover:bg-[#f2efff]">
                  <Plus size={14} /> Add a task
                </button>
              </div>

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold tracking-[-0.025em]">Pick up where you left off</h2>
                    <p className="mt-1 text-xs text-[#999187]">Your recently visited spaces</p>
                  </div>
                  <button className="flex items-center gap-1 text-xs font-semibold text-[#6657d9]">
                    View all <ArrowUpRight size={13} />
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {spaces.map(({ title, type, color, icon: Icon }) => (
                    <button
                      key={title}
                      className="group overflow-hidden rounded-[20px] border border-[#e7e4ee] bg-white text-left shadow-[0_8px_24px_rgba(54,48,89,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-[#d8d1f4] hover:shadow-[0_14px_34px_rgba(54,48,89,0.11)]"
                    >
                      <div className={`relative h-24 bg-gradient-to-br ${color} p-4`}>
                        <div className="grid size-9 place-items-center rounded-xl bg-white/75 text-[#6254c9] shadow-sm backdrop-blur">
                          <Icon size={17} />
                        </div>
                        <div className="absolute -bottom-4 right-5 h-12 w-20 rotate-[-7deg] rounded-lg border border-white/70 bg-white/45" />
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-semibold">{title}</p>
                        <p className="mt-1 text-[11px] text-[#999187]">{type} · Edited recently</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#5647c8] via-[#6757dc] to-[#8a5ee4] p-6 text-white shadow-[0_16px_40px_rgba(91,75,205,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_46px_rgba(91,75,205,0.34)]">
                <div className="absolute -right-8 -top-12 size-36 rounded-full bg-[#8f81ef]/30" />
                <div className="absolute -bottom-14 -left-8 size-32 rounded-full bg-[#e9a5c0]/20" />
                <div className="relative">
                  <div className="mb-7 flex items-center justify-between">
                    <div className="grid size-10 place-items-center rounded-xl bg-white/15">
                      <Sparkles size={19} className="text-[#ffe6a7]" />
                    </div>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/75">
                      AI assistant
                    </span>
                  </div>
                  <h2 className="text-xl font-bold tracking-[-0.04em]">Turn ideas into action.</h2>
                  <p className="mt-2 max-w-[280px] text-xs leading-5 text-white/70">
                    Ask Worko AI to organize notes, build a board, or plan your week.
                  </p>
                  <button className="mt-5 flex h-9 items-center gap-2 rounded-xl bg-white px-3.5 text-xs font-bold text-[#5143bd] transition hover:bg-[#f6f3ff]">
                    Start a conversation <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>

              <div className="rounded-[22px] border border-[#e7e4ee] bg-white p-5 shadow-[0_8px_32px_rgba(54,48,89,0.055)] transition-shadow hover:shadow-[0_12px_38px_rgba(54,48,89,0.08)]">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold tracking-[-0.025em]">Up next</h2>
                    <p className="mt-1 text-xs text-[#999187]">Today&apos;s schedule</p>
                  </div>
                  <button className="text-xs font-semibold text-[#6657d9]">Open calendar</button>
                </div>
                <div className="space-y-4">
                  <Event time="2:30 PM" title="Design sync" detail="Product team · 30 min" color="border-[#796cdb]" />
                  <Event time="4:00 PM" title="Deep work" detail="Website refresh · 90 min" color="border-[#e59a68]" />
                  <Event time="6:15 PM" title="Weekly reflection" detail="Personal · 20 min" color="border-[#68aa91]" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  color,
  value,
  label,
  note,
}: {
  icon: typeof Check;
  color: string;
  value: string;
  label: string;
  note: string;
}) {
  return (
    <div className="group flex items-center gap-4 rounded-[20px] border border-[#e7e4ee] bg-white p-5 shadow-[0_8px_24px_rgba(54,48,89,0.045)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#dcd6f3] hover:shadow-[0_12px_30px_rgba(54,48,89,0.09)]">
      <div className={`grid size-11 place-items-center rounded-[14px] transition-transform duration-300 group-hover:scale-105 ${color}`}>
        <Icon size={19} />
      </div>
      <div>
        <p className="text-xl font-bold tracking-[-0.04em]">{value}</p>
        <p className="text-xs font-semibold text-[#6f6961]">{label}</p>
      </div>
      <span className="ml-auto hidden text-[10px] text-[#a39d93] sm:block">{note}</span>
    </div>
  );
}

function Event({ time, title, detail, color }: { time: string; title: string; detail: string; color: string }) {
  return (
    <div className={`border-l-2 ${color} pl-4`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#aaa399]">{time}</p>
      <p className="mt-1 text-sm font-semibold">{title}</p>
      <p className="mt-0.5 text-[11px] text-[#999187]">{detail}</p>
    </div>
  );
}

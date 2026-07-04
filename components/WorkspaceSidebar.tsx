"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Zap,
  LayoutDashboard,
  Bot,
  CalendarDays,
  SquareKanban,
  StickyNote,
  PenTool,
  PanelTop,
  WandSparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface WorkspaceSidebarProps {
  active: string;
}

export function WorkspaceSidebar({ active }: WorkspaceSidebarProps) {
  const { user } = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("worko-sidebar-collapsed");
    if (saved) setCollapsed(saved === "true");
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [active]);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("worko-sidebar-collapsed", String(next));
    window.dispatchEvent(new Event("sidebar-toggle"));
  };

  const sections = [
    {
      label: "Overview",
      items: [
        { label: "Dashboard", icon: LayoutDashboard, href: "/", color: "text-indigo-600", iconBg: "bg-indigo-50" },
        { label: "AI Assistant", icon: Bot, href: "/ai-assistant", color: "text-amber-600", iconBg: "bg-amber-50" },
        { label: "Calendar", icon: CalendarDays, href: "/calendar", color: "text-sky-600", iconBg: "bg-sky-50" },
      ],
    },
    {
      label: "Workspace",
      items: [
        { label: "Tasks", icon: SquareKanban, href: "/kanban", color: "text-emerald-600", iconBg: "bg-emerald-50" },
        { label: "Notes", icon: StickyNote, href: "/notes", color: "text-orange-600", iconBg: "bg-orange-50" },
        { label: "Whiteboard", icon: PenTool, href: "/whiteboard", color: "text-pink-600", iconBg: "bg-pink-50" },
        { label: "Spaces", icon: PanelTop, href: "/spaces", color: "text-violet-600", iconBg: "bg-violet-50" },
      ],
    },
    {
      label: "Build",
      items: [
        { label: "AI Builder", icon: WandSparkles, href: "/ai-template-builder", color: "text-rose-600", iconBg: "bg-rose-50" },
        { label: "Settings", icon: Settings, href: "/settings", color: "text-slate-600", iconBg: "bg-slate-50" },
      ],
    },
  ];

  if (!isLoaded) {
    return (
      <aside className="w-[224px] border-r border-border bg-background shrink-0 hidden lg:block" />
    );
  }

  const sidebarContent = (isMobile: boolean = false) => (
    <>
      <div className="flex h-[64px] items-center border-b border-border px-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#FF5A36] to-[#ff7d5e] text-white shadow-sm ring-1 ring-white/30">
            <Zap size={16} fill="currentColor" />
          </div>
          {(!collapsed || isMobile) && (
            <div className="min-w-0">
              <p className="truncate text-h4 text-foreground">Worko</p>
              <p className="truncate text-overline text-muted">
                Workspace
              </p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {sections.map((section) => (
          <div key={section.label}>
            {(!collapsed || isMobile) && (
              <p className="mb-1.5 px-2.5 text-overline text-muted block">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(({ label, icon: Icon, href, color, iconBg }) => {
                const isActive = active.toLowerCase() === label.toLowerCase();
                return (
                  <a
                    key={label}
                    href={href}
                    className={`group relative flex h-9.5 w-full items-center gap-2.5 rounded-xl px-2 text-sidebar transition-all duration-200 ${
                      isActive
                        ? "bg-surface text-primary shadow-sm border border-border"
                        : "text-muted hover:translate-x-0.5 hover:bg-surface hover:text-foreground"
                    } ${(collapsed && !isMobile) ? "justify-center px-0" : ""}`}
                  >
                    {isActive && <span className="absolute left-0 h-4 w-0.5 rounded-full bg-primary" />}
                    <span className={`grid size-6 shrink-0 place-items-center rounded-lg ${isActive ? "bg-primary-soft text-primary" : `${iconBg} ${color}`}`}>
                      <Icon size={13} />
                    </span>
                    {(!collapsed || isMobile) && <span>{label}</span>}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-2.5">
        <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface p-1.5 shadow-sm">
          <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#ffad72] to-[#ef6688] text-[10px] font-bold text-white uppercase">
            {user?.firstName ? user.firstName.substring(0, 2) : "DG"}
          </div>
          {(!collapsed || isMobile) && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-label-val text-foreground">{user?.fullName || "Daksh Gola"}</p>
              <p className="truncate text-caption text-muted uppercase tracking-wider font-semibold">Workspace</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 flex h-[64px] items-center justify-between border-b border-border bg-background px-4 lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-[#FF5A36] to-[#ff7d5e] text-white">
            <Zap size={15} fill="currentColor" />
          </div>
          <span className="text-[13px] font-extrabold text-foreground tracking-tight">Worko</span>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="grid size-9 place-items-center rounded-xl border border-border bg-surface text-muted shadow-xs hover:bg-surface/80 transition"
              aria-label="Open navigation menu"
            >
              <Menu size={16} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[240px] border-r border-border bg-background">
            <div className="flex h-full flex-col">
              {sidebarContent(true)}
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar (aside) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden lg:flex flex-col border-r border-border bg-background transition-all duration-300 ${
          collapsed ? "w-[68px]" : "w-[224px]"
        }`}
      >
        {sidebarContent(false)}

        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-[78px] grid size-6 place-items-center rounded-full border border-border bg-surface text-muted shadow-sm hover:scale-105"
          aria-label="Toggle navigation collapse"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Desktop Layout spacer */}
      <div className="shrink-0 hidden lg:block" style={{ width: collapsed ? "68px" : "224px" }} />
    </>
  );
}

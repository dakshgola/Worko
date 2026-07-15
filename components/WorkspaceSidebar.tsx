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
import { motion } from "framer-motion";
import { IconChip } from "@/components/ui/icon-chip";

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
        { label: "Dashboard", icon: LayoutDashboard, href: "/", chipColor: "pink" as const },
        { label: "AI Assistant", icon: Bot, href: "/ai-assistant", chipColor: "yellow" as const },
        { label: "Calendar", icon: CalendarDays, href: "/calendar", chipColor: "mint" as const },
      ],
    },
    {
      label: "Workspace",
      items: [
        { label: "Tasks", icon: SquareKanban, href: "/kanban", chipColor: "pink" as const },
        { label: "Notes", icon: StickyNote, href: "/notes", chipColor: "orange" as const },
        { label: "Whiteboard", icon: PenTool, href: "/whiteboard", chipColor: "mint" as const },
        { label: "Spaces", icon: PanelTop, href: "/spaces", chipColor: "yellow" as const },
      ],
    },
    {
      label: "Build",
      items: [
        { label: "AI Builder", icon: WandSparkles, href: "/ai-template-builder", chipColor: "yellow" as const },
        { label: "Settings", icon: Settings, href: "/settings", chipColor: "black" as const },
      ],
    },
  ];

  if (!isLoaded) {
    return (
      <aside className="w-[224px] border-r-[var(--border-thick)] border-black dark:border-white bg-brutal-bg shrink-0 hidden lg:block" />
    );
  }

  const sidebarContent = (isMobile: boolean = false) => (
    <>
      <div className="flex h-[64px] items-center border-b-[var(--border-thick)] border-black dark:border-white px-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <IconChip color="orange" variant="square" className="size-9 border-black dark:border-white">
            <Zap size={16} fill="currentColor" />
          </IconChip>
          {(!collapsed || isMobile) && (
            <div className="min-w-0">
              <p className="truncate text-h4 font-display font-bold text-foreground">Worko</p>
              <p className="truncate text-overline text-muted font-semibold">
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
              <p className="mb-1.5 px-2.5 text-overline text-muted font-bold block">
                {section.label}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map(({ label, icon: Icon, href, chipColor }) => {
                const isActive = active.toLowerCase() === label.toLowerCase();
                return (
                  <a
                    key={label}
                    href={href}
                    className={`group relative flex h-9.5 w-full items-center gap-2.5 rounded-xl px-2 text-sidebar font-display font-semibold transition-all duration-200 z-0 ${
                      isActive
                        ? "text-foreground font-bold"
                        : "text-muted hover:translate-x-0.5 hover:text-foreground"
                    } ${(collapsed && !isMobile) ? "justify-center px-0" : ""}`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeSidebarHighlight"
                        className="absolute inset-0 rounded-xl bg-brutal-white border-[var(--border-thick)] border-black dark:border-white shadow-brutal-sm -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    {isActive && (
                      <motion.span
                        layoutId="activeSidebarIndicator"
                        className="absolute left-1.5 h-4 w-1 rounded-full bg-brutal-pink border border-black dark:border-white"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <IconChip
                      color={chipColor}
                      variant="square"
                      className={`size-7 p-1 border-[1.5px] border-black dark:border-white shadow-none group-hover:scale-105 transition-transform duration-100 ${
                        isActive ? "ring-2 ring-brutal-pink ring-offset-2" : ""
                      }`}
                    >
                      <Icon size={14} />
                    </IconChip>
                    {(!collapsed || isMobile) && <span className="transition-transform duration-200 group-hover:translate-x-0.5">{label}</span>}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-2.5">
        <div className="flex items-center gap-2.5 rounded-xl border-[var(--border-thick)] border-black dark:border-white bg-brutal-white p-1.5 shadow-brutal-sm">
          <IconChip color="yellow" variant="square" className="size-8 text-[10px] font-bold border-[1.5px] border-black dark:border-white shadow-none">
            {user?.firstName ? user.firstName.substring(0, 2) : "DG"}
          </IconChip>
          {(!collapsed || isMobile) && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-label-val font-bold text-foreground">{user?.fullName || "Daksh Gola"}</p>
              <p className="truncate text-caption text-muted uppercase tracking-wider font-bold">Workspace</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 flex h-[64px] items-center justify-between border-b-[var(--border-thick)] border-black dark:border-white bg-brutal-bg px-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2.5">
          <IconChip color="orange" variant="square" className="size-8 border-[1.5px] border-black dark:border-white shadow-none">
            <Zap size={15} fill="currentColor" />
          </IconChip>
          <span className="text-[13px] font-display font-extrabold text-foreground tracking-tight">Worko</span>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="grid size-9 place-items-center rounded-xl border-[var(--border-thick)] border-black dark:border-white bg-brutal-pink text-black shadow-brutal-sm hover:shadow-brutal-md active:scale-95 transition-all"
              aria-label="Open navigation menu"
            >
              <Menu size={16} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[240px] border-r-[var(--border-thick)] border-black dark:border-white bg-brutal-bg">
            <div className="flex h-full flex-col">
              {sidebarContent(true)}
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar (aside) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden lg:flex flex-col border-r-[var(--border-thick)] border-black dark:border-white bg-brutal-bg transition-all duration-300 ${
          collapsed ? "w-[68px]" : "w-[224px]"
        }`}
      >
        {sidebarContent(false)}

        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-[78px] grid size-6 place-items-center rounded-full border-[var(--border-thick)] border-black dark:border-white bg-brutal-yellow text-black shadow-brutal-sm hover:scale-105 active:scale-95 transition-all"
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

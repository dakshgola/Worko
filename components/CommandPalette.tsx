"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, StickyNote, Calendar, SquareKanban, Command, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { globalSearch } from "@/lib/search/actions";
import { searchPaletteVariants } from "@/lib/motion";

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  url: string;
  color?: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle palette with Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const matches = await globalSearch(query);
        setResults(matches);
      } catch (err) {
        console.error("Global search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleResultClick = (url: string) => {
    setIsOpen(false);
    window.location.href = url;
  };

  // Group results
  const groupedResults = results.reduce((acc, current) => {
    if (!acc[current.type]) {
      acc[current.type] = [];
    }
    acc[current.type].push(current);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const getIcon = (type: string) => {
    switch (type) {
      case "Note":
        return <StickyNote size={14} className="text-amber-500" />;
      case "Calendar Event":
        return <Calendar size={14} className="text-indigo-500" />;
      case "Kanban Task":
        return <SquareKanban size={14} className="text-emerald-500" />;
      default:
        return <Search size={14} className="text-primary" />;
    }
  };

  return (
    <>
      {/* Floating search button in the top navigation header */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-surface text-muted shadow-sm hover:text-foreground transition text-caption font-bold"
        title="Search workspaces (Cmd+K)"
      >
        <Search size={14} />
        <span className="hidden md:inline">Search...</span>
        <kbd className="hidden sm:inline-flex h-4.5 select-none items-center gap-0.5 rounded-md border border-border bg-background px-1 text-[8px] font-bold text-muted uppercase">
          <Command size={7} />K
        </kbd>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              variants={searchPaletteVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="glass w-full max-w-lg rounded-2xl shadow-[var(--shadow-float)] overflow-hidden z-10 flex flex-col max-h-[450px]"
            >
              {/* Search Input Bar */}
              <div className="relative flex items-center border-b border-border p-3 shrink-0">
                <Search size={16} className="absolute left-4.5 text-muted" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search notes, boards, tasks, calendar events..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-10 h-10 outline-none bg-transparent text-body-sm font-semibold text-foreground"
                />
                {loading ? (
                  <Loader2 size={16} className="absolute right-4.5 text-primary animate-spin" />
                ) : query ? (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-4.5 text-muted hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <span className="absolute right-4 px-1.5 py-0.5 border border-border bg-background rounded text-[9px] font-bold text-muted uppercase">
                    ESC
                  </span>
                )}
              </div>

              {/* Matches List */}
              <div className="flex-grow overflow-y-auto p-3 space-y-4">
                {query.trim() === "" ? (
                  <div className="text-center py-10 space-y-2">
                    <Command size={28} className="text-muted/60 mx-auto" />
                    <p className="text-caption font-bold text-muted">Type something to search across your workspace</p>
                    <p className="text-[10px] text-muted/80 font-semibold">Results match notes, boards, and scheduled calendar items</p>
                  </div>
                ) : Object.keys(groupedResults).length === 0 && !loading ? (
                  <div className="text-center py-10 space-y-2">
                    <Search size={28} className="text-muted/60 mx-auto" />
                    <p className="text-caption font-bold text-muted">No matches found for "{query}"</p>
                    <p className="text-[10px] text-muted/80 font-semibold">Try searching for other keywords, notes or events</p>
                  </div>
                ) : (
                  Object.entries(groupedResults).map(([groupName, items]) => (
                    <div key={groupName} className="space-y-1.5">
                      <h5 className="text-[9px] font-bold uppercase tracking-wider text-muted px-2.5">
                        {groupName}s
                      </h5>
                      <div className="space-y-0.5">
                        {items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleResultClick(item.url)}
                            className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-primary-soft/40 rounded-xl text-left transition group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="grid size-7 place-items-center rounded-lg bg-background border border-border shrink-0 shadow-sm">
                                {item.color ? (
                                  <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                ) : (
                                  getIcon(item.type)
                                )}
                              </span>
                              <div className="min-w-0">
                                <p className="text-body-sm font-bold text-foreground group-hover:text-primary transition truncate">
                                  {item.title}
                                </p>
                                <p className="text-[10px] text-muted font-semibold truncate mt-0.5">
                                  {item.subtitle}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

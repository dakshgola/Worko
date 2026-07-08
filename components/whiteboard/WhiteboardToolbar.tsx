"use client";
import React from "react";
import { ChevronLeft, Trash2, MousePointer, Square, Circle, Type } from "lucide-react";

import { Whiteboard } from "@/db/schema";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface WhiteboardToolbarProps {
  activeBoard: Whiteboard;
  setActiveBoard: (b: Whiteboard | null) => void;
  handleUpdateName: (name: string) => void;
  others: readonly any[];
  tool: "select" | "rectangle" | "circle" | "text";
  setTool: (t: "select" | "rectangle" | "circle" | "text") => void;
  selectedId: string | null;
  handleDeleteSelected: () => void;
}

export function WhiteboardToolbar({
  activeBoard,
  setActiveBoard,
  handleUpdateName,
  others,
  tool,
  setTool,
  selectedId,
  handleDeleteSelected,
}: WhiteboardToolbarProps) {
  return (
    <div className="h-[68px] bg-surface border-b border-border flex items-center px-6 gap-4 shrink-0 shadow-sm z-10">
      <button
        onClick={() => setActiveBoard(null)}
        className="mr-1.5 grid size-8.5 place-items-center rounded-xl border border-border bg-surface text-muted shadow-xs hover:bg-hover-overlay lg:hidden shrink-0"
        aria-label="Back to whiteboards list"
      >
        <ChevronLeft size={14} />
      </button>
      <input
        type="text"
        value={activeBoard.name}
        onChange={(e) => handleUpdateName(e.target.value)}
        className="text-h3 font-black text-foreground outline-none max-w-xs border-b border-transparent focus:border-primary bg-transparent"
      />

      {/* Live Collaborators stack inside toolbar */}
      <div className="flex items-center gap-1.5 ml-4">
        {others.map(({ connectionId, presence, info }) => {
          const name = info?.name || presence?.name || "Guest";
          const avatar = info?.avatar || presence?.avatar || "";
          return (
            <span
              key={connectionId}
              className="grid place-items-center relative"
              title={name}
            >
              {avatar ? (
                <img src={avatar} alt={name} className="size-7.5 rounded-full object-cover border border-primary ring-2 ring-primary-soft shadow-sm" />
              ) : (
                <span className="size-7.5 rounded-full bg-primary-soft text-primary font-black text-[9px] border border-primary grid place-items-center uppercase">
                  {name.substring(0, 2)}
                </span>
              )}
            </span>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 bg-background border border-border p-1 rounded-xl ml-auto">
        <TooltipProvider>
          {[
            { tool: "select", icon: MousePointer, label: "Select element" },
            { tool: "rectangle", icon: Square, label: "Draw rectangle" },
            { tool: "circle", icon: Circle, label: "Draw circle" },
            { tool: "text", icon: Type, label: "Insert text label" },
          ].map((t) => (
            <Tooltip key={t.tool}>
              <TooltipTrigger asChild>
                <button
                  aria-label={t.label}
                  onClick={() => setTool(t.tool as "select" | "rectangle" | "circle" | "text")}
                  className={`size-10 md:size-8 flex items-center justify-center rounded-xl transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                    tool === t.tool ? "bg-surface text-primary shadow-sm" : "text-muted hover:text-foreground"
                  }`}
                >
                  <t.icon size={15} />
                </button>
              </TooltipTrigger>
              <TooltipContent>{t.label}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      {selectedId && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="Delete selected shape"
                onClick={handleDeleteSelected}
                className="size-10 md:size-8 flex items-center justify-center rounded-xl border border-danger-soft text-danger hover:bg-danger-soft focus-visible:ring-2 focus-visible:ring-danger focus-visible:outline-none"
              >
                <Trash2 size={15} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Delete selected shape</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

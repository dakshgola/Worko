"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Bot,
  CalendarDays,
  SquareKanban,
  StickyNote,
  PenTool,
  PanelTop,
  WandSparkles,
  Settings,
  Plus,
  Loader2,
  Search,
  Bell,
  Trash2,
  Star,
  Activity,
  X,
  Sparkles,
  Check,
  MousePointer,
  Square,
  Circle,
  Hash,
  Type,
  ChevronLeft,
  ChevronRight,
  Menu,
  Zap,
  PanelLeftClose,
} from "lucide-react";
import {
  listWhiteboards,
  createWhiteboard,
  updateWhiteboardMetadata,
  updateWhiteboardElements,
  deleteWhiteboardForever,
  generateAIDiagram,
} from "@/lib/whiteboard/actions";
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar";

interface Element {
  id: string;
  type: "rectangle" | "circle" | "line" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  color: string;
}

export default function WhiteboardPage() {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // DB Whiteboards
  const [boards, setBoards] = useState<any[]>([]);
  const [activeBoard, setActiveBoard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // SVG drawing states
  const [elements, setElements] = useState<Element[]>([]);
  const [tool, setTool] = useState<"select" | "rectangle" | "circle" | "text">("select");
  const [drawingColor, setDrawingColor] = useState("#FF5A36");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [tempElement, setTempElement] = useState<Element | null>(null);

  // Selected shape drag state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // AI Diagram prompts
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const res = await listWhiteboards();
      setBoards(res);
      if (res.length > 0) {
        setActiveBoard(res[0]);
        setElements(JSON.parse(res[0].elements || "[]"));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleCreateBoard = async () => {
    try {
      setCreating(true);
      const newB = await createWhiteboard("Creative Canvas");
      setBoards((prev) => [newB, ...prev]);
      setActiveBoard(newB);
      setElements([]);
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateName = async (newName: string) => {
    if (!activeBoard) return;
    try {
      setActiveBoard((prev: any) => ({ ...prev, name: newName }));
      setBoards((curr) => curr.map((b) => (b.id === activeBoard.id ? { ...b, name: newName } : b)));
      await updateWhiteboardMetadata(activeBoard.id, { name: newName });
    } catch (e) {
      console.error(e);
    }
  };

  const saveCanvasElements = async (newElements: Element[]) => {
    if (!activeBoard) return;
    try {
      await updateWhiteboardElements(activeBoard.id, JSON.stringify(newElements));
    } catch (e) {
      console.error(e);
    }
  };

  // Switch active board
  const handleSelectBoard = (board: any) => {
    setActiveBoard(board);
    setElements(JSON.parse(board.elements || "[]"));
    setSelectedId(null);
  };

  // Canvas Interactions
  const getCoordinates = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const coords = getCoordinates(e);

    if (tool === "select") {
      // Check if clicking on an element
      const hit = [...elements].reverse().find(
        (el) =>
          coords.x >= el.x &&
          coords.x <= el.x + el.width &&
          coords.y >= el.y &&
          coords.y <= el.y + el.height
      );

      if (hit) {
        setSelectedId(hit.id);
        setIsDragging(true);
        setDragOffset({
          x: coords.x - hit.x,
          y: coords.y - hit.y,
        });
      } else {
        setSelectedId(null);
      }
      return;
    }

    setIsDrawing(true);
    setStartPos(coords);

    if (tool === "text") {
      const textVal = prompt("Enter shape label:");
      if (textVal) {
        const newEl: Element = {
          id: "el_" + crypto.randomUUID(),
          type: "text",
          x: coords.x,
          y: coords.y,
          width: 140,
          height: 35,
          text: textVal,
          color: drawingColor,
        };
        const updated = [...elements, newEl];
        setElements(updated);
        saveCanvasElements(updated);
      }
      setIsDrawing(false);
      setTool("select");
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const coords = getCoordinates(e);

    if (isDragging && selectedId && tool === "select") {
      const updated = elements.map((el) => {
        if (el.id === selectedId) {
          return {
            ...el,
            x: coords.x - dragOffset.x,
            y: coords.y - dragOffset.y,
          };
        }
        return el;
      });
      setElements(updated);
      return;
    }

    if (!isDrawing) return;

    const width = coords.x - startPos.x;
    const height = coords.y - startPos.y;

    if (tool === "rectangle") {
      setTempElement({
        id: "temp",
        type: "rectangle",
        x: width < 0 ? coords.x : startPos.x,
        y: height < 0 ? coords.y : startPos.y,
        width: Math.abs(width),
        height: Math.abs(height),
        color: drawingColor,
      });
    } else if (tool === "circle") {
      setTempElement({
        id: "temp",
        type: "circle",
        x: startPos.x,
        y: startPos.y,
        width: Math.abs(width),
        height: Math.abs(height),
        color: drawingColor,
      });
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !tempElement) {
      setIsDrawing(false);
      setTempElement(null);
      return;
    }

    // Save final element
    const newEl: Element = {
      ...tempElement,
      id: "el_" + crypto.randomUUID(),
    };

    const updated = [...elements, newEl];
    setElements(updated);
    saveCanvasElements(updated);

    setIsDrawing(false);
    setTempElement(null);
    setTool("select");
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    const updated = elements.filter((el) => el.id !== selectedId);
    setElements(updated);
    saveCanvasElements(updated);
    setSelectedId(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        // Prevent deleting elements if user typing in inputs/textareas
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag === "input" || activeTag === "textarea") return;

        handleDeleteSelected();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, elements]);

  // AI custom flowchart shapes generation trigger
  const handleAIGenerateDiagram = async () => {
    if (!aiPrompt.trim()) return;
    try {
      setGenerating(true);
      const generatedCode = await generateAIDiagram(aiPrompt);
      const parsed = JSON.parse(generatedCode);
      if (parsed && Array.isArray(parsed)) {
        const withIds = parsed.map((el: any) => ({
          ...el,
          id: "el_" + crypto.randomUUID(),
        }));
        const combined = [...elements, ...withIds];
        setElements(combined);
        saveCanvasElements(combined);
        setAiPrompt("");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to deduce flowchart configurations. Try refining your request prompt.");
    } finally {
      setGenerating(false);
    }
  };

  const loadPredefinedTemplate = (type: "flowchart" | "mindmap") => {
    let prepopulated: Element[] = [];
    if (type === "flowchart") {
      prepopulated = [
        { id: "el_flow1", type: "rectangle", x: 150, y: 120, width: 120, height: 40, text: "User Action Start", color: "#FF5A36" },
        { id: "el_flow2", type: "circle", x: 170, y: 220, width: 80, height: 80, text: "Validate Auth", color: "#6c5ce7" },
        { id: "el_flow3", type: "rectangle", x: 150, y: 360, width: 120, height: 40, text: "Dashboard Render", color: "#3e9b68" },
      ];
    } else {
      prepopulated = [
        { id: "el_mind1", type: "circle", x: 200, y: 200, width: 100, height: 100, text: "Product Specs", color: "#FF5A36" },
        { id: "el_mind2", type: "rectangle", x: 80, y: 100, width: 100, height: 35, text: "Notes Wiki", color: "#3b82f6" },
        { id: "el_mind3", type: "rectangle", x: 320, y: 100, width: 100, height: 35, text: "Agendas Tasks", color: "#e49a3a" },
        { id: "el_mind4", type: "rectangle", x: 200, y: 350, width: 100, height: 35, text: "Collaboration", color: "#ef6688" },
      ];
    }

    setElements(prepopulated);
    saveCanvasElements(prepopulated);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#2C2A29] flex">
      {/* Sidebar Navigation */}
      <WorkspaceSidebar active="Whiteboard" />

      <main className="flex-grow min-w-0 flex h-screen overflow-hidden">
        
        {/* Left canvas selector panel */}
        <section className="w-56 border-r border-[#EBE8E2] bg-white flex flex-col shrink-0">
          <div className="p-4 border-b border-[#EBE8E2] flex items-center justify-between">
            <span className="text-overline text-[#aaa6b5] block">Canvas list</span>
            <button
              onClick={handleCreateBoard}
              disabled={creating}
              className="p-1 bg-[#FFE8E2] text-[#FF5A36] rounded-lg"
            >
              {creating ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="flex justify-center items-center py-6 text-caption font-semibold"><Loader2 size={12} className="animate-spin mr-1.5" /> Loading</div>
            ) : (
              boards.map((b) => (
                <button
                  key={b.id}
                  onClick={() => handleSelectBoard(b)}
                  className={`w-full text-left p-2 rounded-xl text-body-sm font-bold truncate ${
                    activeBoard?.id === b.id ? "bg-[#FFE8E2]/60 text-[#FF5A36]" : "hover:bg-slate-50"
                  }`}
                >
                  {b.name}
                </button>
              ))
            )}
          </div>
        </section>

        {/* Center drawing area */}
        <section className="flex-1 bg-[#FAF8F4] flex flex-col min-w-0 h-full relative">
          {activeBoard ? (
            <>
              {/* Toolbar header */}
              <div className="h-[68px] bg-white border-b border-[#EBE8E2] flex items-center px-6 gap-4 shrink-0 shadow-sm z-10">
                <input
                  type="text"
                  value={activeBoard.name}
                  onChange={(e) => handleUpdateName(e.target.value)}
                  className="text-h3 font-black text-[#2C2A29] outline-none max-w-xs border-b border-transparent focus:border-slate-200 bg-transparent"
                />

                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl ml-auto">
                  {[
                    { tool: "select", icon: MousePointer },
                    { tool: "rectangle", icon: Square },
                    { tool: "circle", icon: Circle },
                    { tool: "text", icon: Type },
                  ].map((t) => (
                    <button
                      key={t.tool}
                      onClick={() => setTool(t.tool as any)}
                      className={`p-1.5 rounded-lg transition ${
                        tool === t.tool ? "bg-white text-[#FF5A36] shadow-sm" : "text-[#5E5B5A] hover:text-[#2C2A29]"
                      }`}
                    >
                      <t.icon size={14} />
                    </button>
                  ))}
                </div>

                {selectedId && (
                  <button
                    onClick={handleDeleteSelected}
                    className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Collaborative SVG Board drawing */}
              <div className="flex-1 relative overflow-hidden bg-white">
                <svg
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  className="w-full h-full bg-white select-none cursor-crosshair"
                >
                  {elements.map((el) => {
                    const isSelected = el.id === selectedId;
                    if (el.type === "rectangle") {
                      return (
                        <g key={el.id}>
                          <rect
                            x={el.x}
                            y={el.y}
                            width={el.width}
                            height={el.height}
                            fill="none"
                            stroke={el.color}
                            strokeWidth={isSelected ? 3 : 2}
                            rx={4}
                          />
                          {el.text && (
                            <text
                              x={el.x + 10}
                              y={el.y + el.height / 2 + 4}
                              fontSize={11}
                              fontFamily="var(--font-sans)"
                              fontWeight="bold"
                              fill="#2C2A29"
                            >
                              {el.text}
                            </text>
                          )}
                        </g>
                      );
                    } else if (el.type === "circle") {
                      const rx = el.width / 2;
                      const ry = el.height / 2;
                      const cx = el.x + rx;
                      const cy = el.y + ry;
                      return (
                        <g key={el.id}>
                          <ellipse
                            cx={cx}
                            cy={cy}
                            rx={rx}
                            ry={ry}
                            fill="none"
                            stroke={el.color}
                            strokeWidth={isSelected ? 3 : 2}
                          />
                          {el.text && (
                            <text
                              x={cx - el.text.length * 3}
                              y={cy + 4}
                              fontSize={11}
                              fontFamily="var(--font-sans)"
                              fontWeight="bold"
                              fill="#2C2A29"
                            >
                              {el.text}
                            </text>
                          )}
                        </g>
                      );
                    } else if (el.type === "line") {
                      return (
                        <g key={el.id}>
                          <line
                            x1={el.x}
                            y1={el.y}
                            x2={el.x + el.width}
                            y2={el.y + el.height}
                            stroke={el.color}
                            strokeWidth={2}
                          />
                          {el.text && (
                            <text
                              x={el.x + el.width / 2 - 10}
                              y={el.y + el.height / 2 - 6}
                              fontSize={9}
                              fontFamily="var(--font-sans)"
                              fontWeight="bold"
                              fill="#aaa6b5"
                            >
                              {el.text}
                            </text>
                          )}
                        </g>
                      );
                    } else if (el.type === "text") {
                      return (
                        <text
                          key={el.id}
                          x={el.x}
                          y={el.y}
                          fill={el.color}
                          fontSize={12}
                          fontFamily="var(--font-sans)"
                          fontWeight="bold"
                        >
                          {el.text}
                        </text>
                      );
                    }
                    return null;
                  })}

                  {/* Rendering temp element while drawing */}
                  {tempElement && tempElement.type === "rectangle" && (
                    <rect
                      x={tempElement.x}
                      y={tempElement.y}
                      width={tempElement.width}
                      height={tempElement.height}
                      fill="none"
                      stroke={tempElement.color}
                      strokeWidth={2}
                      strokeDasharray="4 4"
                    />
                  )}
                  {tempElement && tempElement.type === "circle" && (
                    <ellipse
                      cx={tempElement.x + tempElement.width / 2}
                      cy={tempElement.y + tempElement.height / 2}
                      rx={tempElement.width / 2}
                      ry={tempElement.height / 2}
                      fill="none"
                      stroke={tempElement.color}
                      strokeWidth={2}
                      strokeDasharray="4 4"
                    />
                  )}
                </svg>

                {/* Left floating color tag select */}
                <div className="absolute left-4 top-4 bg-white border border-[#EBE8E2] rounded-xl p-2 shadow-sm space-y-1.5 flex flex-col z-20">
                  {["#FF5A36", "#3e9b68", "#ef6688", "#e49a3a", "#3b82f6"].map((hex) => (
                    <button
                      key={hex}
                      onClick={() => setDrawingColor(hex)}
                      className={`size-4 rounded-full border border-white shrink-0 ${
                        drawingColor === hex ? "ring-2 ring-[#FF5A36]" : ""
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>

                {/* Bottom template quick presets loaders */}
                <div className="absolute bottom-4 left-4 right-4 bg-white border border-[#EBE8E2] rounded-xl p-3 shadow-md z-20 flex items-center justify-between">
                  <span className="text-overline text-[#aaa6b5] block">Canvas templates</span>
                  <div className="flex gap-2">
                    <button onClick={() => loadPredefinedTemplate("flowchart")} className="px-2.5 py-1 bg-[#FFE8E2] text-[#FF5A36] text-caption font-bold rounded-lg transition hover:bg-[#FF5A36] hover:text-white">
                      Flowchart Presets
                    </button>
                    <button onClick={() => loadPredefinedTemplate("mindmap")} className="px-2.5 py-1 bg-[#FFE8E2] text-[#FF5A36] text-caption font-bold rounded-lg transition hover:bg-[#FF5A36] hover:text-white">
                      Mindmap Canvas
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <PenTool size={48} className="text-slate-300" />
              <h4 className="text-body-sm font-bold text-slate-500">No active whiteboard chosen</h4>
              <p className="text-caption max-w-xs text-slate-400">Initialize a creative canvas sheet to outline diagrams.</p>
              <button onClick={handleCreateBoard} className="h-9.5 px-4 bg-[#FF5A36] hover:bg-[#ff7d5e] text-white rounded-xl text-btn">
                Initialize Whiteboard
              </button>
            </div>
          )}
        </section>

        {/* Right side AI generator */}
        <section className="w-80 border-l border-[#EBE8E2] bg-[#FAF8F4] p-5 shrink-0 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h4 className="text-label-val text-[#FF5A36] uppercase tracking-wider block">AI Diagram Generator</h4>
              <p className="text-caption text-[#5E5B5A] mt-0.5">Describe your flow process. Gemini will append vector node shapes immediately:</p>
            </div>

            <textarea
              placeholder="e.g. User authentication flow, OAuth handshake process, task lifecycle..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full h-24 p-3 bg-white border border-[#EBE8E2] text-input-val rounded-xl outline-none resize-none focus:border-[#FF5A36]"
            />

            <button
              onClick={handleAIGenerateDiagram}
              disabled={generating || !aiPrompt.trim()}
              className="h-9.5 w-full bg-[#FF5A36] hover:bg-[#ff7d5e] text-white font-bold rounded-xl text-btn flex items-center justify-center gap-1 transition"
            >
              {generating ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Generating
                </>
              ) : (
                <>
                  <Sparkles size={13} /> Generate shapes
                </>
              )}
            </button>
          </div>

          <div className="p-3 bg-amber-50/40 border border-amber-100 rounded-xl text-caption text-amber-800 leading-relaxed font-semibold">
            Select shape and drag to move on canvas. Double-click or select and press Delete to remove elements.
          </div>
        </section>
      </main>
    </div>
  );
}

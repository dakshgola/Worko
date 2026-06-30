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

const sidebarNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "AI Assistant", icon: Bot, href: "/ai-assistant" },
  { label: "Calendar", icon: CalendarDays, href: "/calendar" },
  { label: "Tasks", icon: SquareKanban, href: "/kanban" },
  { label: "Notes", icon: StickyNote, href: "/notes" },
  { label: "Whiteboard", icon: PenTool, href: "/whiteboard", active: true },
  { label: "Spaces", icon: PanelTop, href: "/spaces" },
  { label: "AI Builder", icon: WandSparkles, href: "/ai-template-builder" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

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
  const [drawingColor, setDrawingColor] = useState("#6c5ce7");
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
    if (isDragging) {
      setIsDragging(false);
      saveCanvasElements(elements);
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    if (tempElement) {
      const newEl = {
        ...tempElement,
        id: "el_" + crypto.randomUUID(),
      };
      const updated = [...elements, newEl];
      setElements(updated);
      setTempElement(null);
      saveCanvasElements(updated);
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    const updated = elements.filter((el) => el.id !== selectedId);
    setElements(updated);
    setSelectedId(null);
    saveCanvasElements(updated);
  };

  // AI Diagram parser
  const handleAIGenerateDiagram = async () => {
    if (!aiPrompt.trim()) return;
    try {
      setGenerating(true);
      const jsonRes = await generateAIDiagram(aiPrompt);
      const data = JSON.parse(jsonRes);

      const parsedElements: Element[] = [];

      // Map parsed nodes to SVG elements
      (data.nodes || []).forEach((node: any, idx: number) => {
        parsedElements.push({
          id: node.id,
          type: node.type === "circle" ? "circle" : "rectangle",
          x: node.x || 100 + idx * 180,
          y: node.y || 150,
          width: 140,
          height: 60,
          text: node.label,
          color: node.color || "#6c5ce7",
        });
      });

      // Simple visual links representation as lines
      (data.edges || []).forEach((edge: any) => {
        const fromNode = parsedElements.find((el) => el.id === edge.from);
        const toNode = parsedElements.find((el) => el.id === edge.to);

        if (fromNode && toNode) {
          parsedElements.push({
            id: "line_" + crypto.randomUUID(),
            type: "line",
            x: fromNode.x + 70,
            y: fromNode.y + 30,
            width: toNode.x - fromNode.x,
            height: toNode.y - fromNode.y,
            text: edge.label || "",
            color: "#b0a9bd",
          });
        }
      });

      const updated = [...elements, ...parsedElements];
      setElements(updated);
      saveCanvasElements(updated);
      setAiPrompt("");
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  // Load Bottom templates
  const loadPredefinedTemplate = (type: string) => {
    let prepopulated: Element[] = [];

    if (type === "flowchart") {
      prepopulated = [
        { id: "1", type: "rectangle", x: 100, y: 150, width: 140, height: 60, text: "User Accesses Site", color: "#6c5ce7" },
        { id: "2", type: "circle", x: 300, y: 150, width: 140, height: 60, text: "Auth Valid?", color: "#e49a3a" },
        { id: "3", type: "rectangle", x: 500, y: 100, width: 140, height: 60, text: "Render Dashboard", color: "#3e9b68" },
      ];
    } else if (type === "mindmap") {
      prepopulated = [
        { id: "1", type: "circle", x: 250, y: 150, width: 140, height: 60, text: "Marketing Strategy", color: "#ef6688" },
        { id: "2", type: "rectangle", x: 100, y: 50, width: 140, height: 60, text: "Content Writing", color: "#3b82f6" },
        { id: "3", type: "rectangle", x: 400, y: 50, width: 140, height: 60, text: "Google Ads Campaign", color: "#3e9b68" },
      ];
    }

    setElements(prepopulated);
    saveCanvasElements(prepopulated);
  };

  return (
    <div className="min-h-screen bg-[#f8f8fb] text-[#292832] flex">
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[210px] border-r border-[#e8e7ef] bg-white transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[64px] items-center gap-3 border-b border-[#efedf4] px-4">
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#6c5ce7] to-[#8b5cf6] text-white shadow-[0_7px_18px_rgba(102,87,220,0.28)]"><Zap size={17} fill="currentColor" /></div>
          <div>
            <p className="text-[15px] font-bold tracking-[-0.04em]">Worko</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#aaa4b2]">Creative workspace</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto grid size-8 place-items-center rounded-lg text-[#9d96a6] hover:bg-[#f5f3f7] lg:hidden"><PanelLeftClose size={15} /></button>
        </div>
        <nav className="space-y-1 p-3 overflow-y-auto max-h-[calc(100vh-140px)]">
          <p className="mb-2 px-2 text-[8px] font-bold uppercase tracking-[0.17em] text-[#aaa6b5]">Workspace</p>
          {sidebarNav.map(({ label, icon: Icon, href, active }) => (
            <a key={label} href={href} className={`relative flex h-10 items-center gap-3 rounded-xl px-2.5 text-[11px] font-bold transition ${active ? "bg-[#eeeaff] text-[#5849c6]" : "text-[#777181] hover:bg-[#f7f5f9] hover:text-[#3f3948]"}`}>
              {active && <span className="absolute -left-1 h-5 w-0.5 rounded-full bg-[#6c5ce7]" />}
              <span className={`grid size-7 place-items-center rounded-lg ${active ? "bg-white text-[#6556d6] shadow-sm" : "bg-[#f3f1f5] text-[#918a99]"}`}><Icon size={13} /></span>
              {label}
            </a>
          ))}
        </nav>
      </aside>

      <main className="flex-1 min-w-0 lg:ml-[210px] flex h-screen overflow-hidden">
        
        {/* Left canvas selector panel */}
        <section className="w-56 border-r border-[#efedf4] bg-white flex flex-col shrink-0">
          <div className="p-4 border-b border-[#efedf4] flex items-center justify-between">
            <span className="text-xs font-bold text-[#b0a9bd] uppercase tracking-wider">Canvas list</span>
            <button
              onClick={handleCreateBoard}
              disabled={creating}
              className="p-1 bg-[#eeeaff] text-[#6c5ce7] rounded-lg"
            >
              {creating ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="flex justify-center items-center py-6 text-xs"><Loader2 size={12} className="animate-spin mr-1.5" /> Loading</div>
            ) : (
              boards.map((b) => (
                <button
                  key={b.id}
                  onClick={() => handleSelectBoard(b)}
                  className={`w-full text-left p-2 rounded-xl text-xs font-bold truncate ${
                    activeBoard?.id === b.id ? "bg-[#eeeaff] text-[#6c5ce7]" : ""
                  }`}
                >
                  {b.name}
                </button>
              ))
            )}
          </div>
        </section>

        {/* Center drawing area */}
        <section className="flex-1 bg-[#f9f9fb] flex flex-col min-w-0 h-full relative">
          {activeBoard ? (
            <>
              {/* Toolbar header */}
              <div className="h-[64px] bg-white border-b border-[#efedf4] flex items-center px-6 gap-4 shrink-0 shadow-sm z-10">
                <input
                  type="text"
                  value={activeBoard.name}
                  onChange={(e) => handleUpdateName(e.target.value)}
                  className="font-black text-base text-[#282633] outline-none max-w-xs border-b border-transparent focus:border-slate-200"
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
                        tool === t.tool ? "bg-white text-[#6c5ce7] shadow-sm" : "text-[#777281] hover:text-[#282633]"
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
              <div className="flex-1 relative overflow-hidden">
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
                              fontFamily="monospace"
                              fill="#282633"
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
                              fontFamily="monospace"
                              fill="#282633"
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
                <div className="absolute left-4 top-4 bg-white border border-[#efedf4] rounded-xl p-2 shadow-sm space-y-1.5 flex flex-col z-20">
                  {["#6c5ce7", "#3e9b68", "#ef6688", "#e49a3a", "#3b82f6"].map((hex) => (
                    <button
                      key={hex}
                      onClick={() => setDrawingColor(hex)}
                      className={`size-4 rounded-full border border-white shrink-0 ${
                        drawingColor === hex ? "ring-2 ring-indigo-500" : ""
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>

                {/* Bottom template quick presets loaders */}
                <div className="absolute bottom-4 left-4 right-4 bg-white border border-[#efedf4] rounded-xl p-3 shadow-md z-20 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#b0a9bd] uppercase tracking-wider">Canvas templates</span>
                  <div className="flex gap-2">
                    <button onClick={() => loadPredefinedTemplate("flowchart")} className="px-2.5 py-1 bg-violet-50 text-[#6c5ce7] text-[10px] font-bold rounded-lg">
                      Flowchart Presets
                    </button>
                    <button onClick={() => loadPredefinedTemplate("mindmap")} className="px-2.5 py-1 bg-pink-50 text-[#ef6688] text-[10px] font-bold rounded-lg">
                      Mindmap Canvas
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <PenTool size={48} className="text-slate-300" />
              <h4 className="font-bold text-sm text-slate-500">No active whiteboard chosen</h4>
              <p className="text-xs max-w-xs text-slate-400">Initialize a creative canvas sheet to outline diagrams.</p>
              <button onClick={handleCreateBoard} className="h-9 px-4 bg-[#6c5ce7] text-white rounded-xl text-xs font-bold">
                Initialize Whiteboard
              </button>
            </div>
          )}
        </section>

        {/* Right side AI generator */}
        <section className="w-80 border-l border-[#efedf4] bg-[#fafafc] p-5 shrink-0 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h4 className="text-[11px] font-bold text-[#5143bd] uppercase tracking-wider">AI Diagram Generator</h4>
              <p className="text-[10px] text-[#777281] mt-0.5">Describe your flow process. Gemini will append vector node shapes immediately:</p>
            </div>

            <textarea
              placeholder="e.g. User authentication flow, OAuth handshake process, task lifecycle..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full h-24 p-3 bg-white border border-[#e5e2ed] text-xs rounded-xl outline-none resize-none focus:border-[#bdb4f1]"
            />

            <button
              onClick={handleAIGenerateDiagram}
              disabled={generating || !aiPrompt.trim()}
              className="h-9 w-full bg-gradient-to-r from-[#6c5ce7] to-[#8b5cf6] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition"
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

          <div className="p-3 bg-amber-50/40 border border-amber-100 rounded-xl text-[9.5px] text-amber-800 leading-relaxed font-semibold">
            Select shape and drag to move on canvas. Double-click or select and press Delete to remove elements.
          </div>
        </section>
      </main>
      {sidebarOpen && <button aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-[#302a3d]/20 backdrop-blur-sm lg:hidden" />}
    </div>
  );
}

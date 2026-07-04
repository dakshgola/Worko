"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Plus,
  Loader2,
  Trash2,
  MousePointer,
  Square,
  Circle,
  Type,
  ChevronLeft,
  PenTool,
  Sparkles,
} from "lucide-react";
import {
  listWhiteboards,
  createWhiteboard,
  updateWhiteboardMetadata,
  updateWhiteboardElements,
  generateAIDiagram,
} from "@/lib/whiteboard/actions";
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar";
import { LiveMap } from "@liveblocks/client";
import {
  LiveblocksProvider,
  RoomProvider,
  useMyPresence,
  useOthers,
  useUpdateMyPresence,
  useStorage,
  useMutation,
} from "@/lib/liveblocks";

export type Element = {
  id: string;
  type: "rectangle" | "circle" | "line" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  color: string;
  [key: string]: any;
};

export default function WhiteboardPage() {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // DB Whiteboards
  const [boards, setBoards] = useState<any[]>([]);
  const [activeBoard, setActiveBoard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const res = await listWhiteboards();
      setBoards(res);
      if (res.length > 0) {
        setActiveBoard(res[0]);
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
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleSelectBoard = (board: any) => {
    setActiveBoard(board);
  };

  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <div className="min-h-screen bg-background text-foreground flex">
        {/* Sidebar Navigation */}
        <WorkspaceSidebar active="Whiteboard" />

        <main className="flex-grow min-w-0 flex h-screen overflow-hidden pt-[64px] lg:pt-0">
          {/* Left canvas selector panel */}
          <section className={`w-full lg:w-56 border-r border-border bg-surface flex flex-col shrink-0 ${activeBoard ? "hidden lg:flex" : "flex"}`}>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="text-overline text-muted block">Canvas list</span>
              <button
                onClick={handleCreateBoard}
                disabled={creating}
                className="btn-secondary size-8 p-0 flex items-center justify-center"
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
                      activeBoard?.id === b.id ? "bg-primary-soft text-primary" : "hover:bg-hover-overlay"
                    }`}
                  >
                    {b.name}
                  </button>
                ))
              )}
            </div>
          </section>

          {/* Collaborative Room Canvas Wrapper */}
          <section className={`flex-1 bg-background flex flex-col min-w-0 h-full relative ${!activeBoard ? "hidden lg:flex" : "flex"}`}>
            {activeBoard ? (
              <RoomProvider
                id={`whiteboard-${activeBoard.id}`}
                initialPresence={{ cursor: null, name: user?.fullName || "Guest User", avatar: user?.imageUrl || "" }}
                initialStorage={{
                  canvasElements: new LiveMap<string, Element>(),
                }}
              >
                <WhiteboardMultiplayerCanvas
                  activeBoard={activeBoard}
                  setActiveBoard={setActiveBoard}
                  boards={boards}
                  setBoards={setBoards}
                  user={user}
                />
              </RoomProvider>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
                <PenTool size={48} className="text-slate-300" />
                <h4 className="text-body-sm font-bold text-slate-500">No active whiteboard chosen</h4>
                <p className="text-caption max-w-xs text-slate-400">Initialize a creative canvas sheet to outline diagrams.</p>
                <button onClick={handleCreateBoard} className="btn-primary h-9.5 px-4">
                  Initialize Whiteboard
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
    </LiveblocksProvider>
  );
}

interface CanvasProps {
  activeBoard: any;
  setActiveBoard: (b: any) => void;
  boards: any[];
  setBoards: React.Dispatch<React.SetStateAction<any[]>>;
  user: any;
}

function WhiteboardMultiplayerCanvas({ activeBoard, setActiveBoard, boards, setBoards, user }: CanvasProps) {
  // Sync state from Liveblocks storage LiveMap
  const canvasElements = useStorage((root) => root.canvasElements);
  const elements = useMemo(() => {
    return canvasElements ? (Array.from(canvasElements.values()) as Element[]) : [];
  }, [canvasElements]);

  // SVG drawing states
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

  // Liveblocks presence & collaborator tracking hooks
  const updateMyPresence = useUpdateMyPresence();
  const others = useOthers();

  // Populate map storage from Postgres if empty on room creation
  const populateMutation = useMutation(({ storage }) => {
    const map = storage.get("canvasElements");
    if (map.size === 0 && activeBoard.elements) {
      try {
        const initial = JSON.parse(activeBoard.elements);
        if (Array.isArray(initial)) {
          initial.forEach((el: any) => {
            map.set(el.id, el);
          });
        }
      } catch (e) {
        console.error("Failed to parse initial elements:", e);
      }
    }
  }, [activeBoard]);

  useEffect(() => {
    populateMutation();
  }, [populateMutation]);

  // Mutations to edit map storage
  const saveCanvasElementsMutation = useMutation(({ storage }, updated: Element[]) => {
    const map = storage.get("canvasElements");
    for (const key of Array.from(map.keys())) {
      map.delete(key);
    }
    updated.forEach((el) => {
      map.set(el.id, el);
    });
  }, []);

  const updateElementMutation = useMutation(({ storage }, id: string, x: number, y: number) => {
    const map = storage.get("canvasElements");
    const existing = map.get(id);
    if (existing) {
      map.set(id, { ...existing, x, y });
    }
  }, []);

  const deleteElementMutation = useMutation(({ storage }, id: string) => {
    storage.get("canvasElements").delete(id);
  }, []);

  // Update board metadata title
  const handleUpdateName = async (newName: string) => {
    setActiveBoard({ ...activeBoard, name: newName });
    setBoards(boards.map((b) => (b.id === activeBoard.id ? { ...b, name: newName } : b)));
    await updateWhiteboardMetadata(activeBoard.id, { name: newName });
  };

  // Debounced Neon Postgres DB persistence
  const saveCanvasElementsToDb = async (newElements: Element[]) => {
    try {
      await updateWhiteboardElements(activeBoard.id, JSON.stringify(newElements));
    } catch (e) {
      console.error("Failed to save elements to database:", e);
    }
  };

  useEffect(() => {
    if (elements.length > 0) {
      const timer = setTimeout(() => {
        saveCanvasElementsToDb(elements);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [elements]);

  // Canvas Mouse events
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
        saveCanvasElementsMutation([...elements, newEl]);
      }
      setIsDrawing(false);
      setTool("select");
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const coords = getCoordinates(e);

    // Sync current cursor position to other users
    updateMyPresence({ cursor: coords });

    if (isDragging && selectedId && tool === "select") {
      const nx = coords.x - dragOffset.x;
      const ny = coords.y - dragOffset.y;
      updateElementMutation(selectedId, nx, ny);
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

    const newEl: Element = {
      ...tempElement,
      id: "el_" + crypto.randomUUID(),
    };

    saveCanvasElementsMutation([...elements, newEl]);
    setIsDrawing(false);
    setTempElement(null);
    setTool("select");
  };

  const handleMouseLeave = () => {
    updateMyPresence({ cursor: null });
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    deleteElementMutation(selectedId);
    setSelectedId(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag === "input" || activeTag === "textarea") return;
        handleDeleteSelected();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, elements]);

  // Load custom templates shapes directly to room storage
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
    saveCanvasElementsMutation(prepopulated);
  };

  // AI diagrams shapes loader
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
        saveCanvasElementsMutation([...elements, ...withIds]);
        setAiPrompt("");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to deduce flowchart configurations. Try refining your request prompt.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full relative">
      {/* Visual Workspace toolbar header */}
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
          className="text-h3 font-black text-foreground outline-none max-w-xs border-b border-transparent focus:border-slate-200 bg-transparent"
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
                tool === t.tool ? "bg-surface text-primary shadow-sm" : "text-muted hover:text-foreground"
              }`}
            >
              <t.icon size={14} />
            </button>
          ))}
        </div>

        {selectedId && (
          <button
            onClick={handleDeleteSelected}
            className="p-1.5 rounded-lg border border-danger-soft text-danger hover:bg-danger-soft"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* SVG Canvas and Right AI helper layout panel */}
      <div className="flex-grow flex min-h-0 relative">
        <div className="flex-grow relative overflow-hidden bg-white">
          <svg
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
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

            {/* Live pointers of other online collaborators */}
            {others.map(({ connectionId, presence, info }) => {
              if (!presence?.cursor) return null;
              const name = info?.name || presence.name || "Guest";
              const avatar = info?.avatar || presence.avatar || "";
              return (
                <g key={connectionId} style={{ pointerEvents: "none" }} className="z-50 select-none">
                  {/* Cursor pointer */}
                  <path
                    d="M0,0 L0,16 L4,12 L8,20 L11,19 L7,11 L13,11 Z"
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth={1}
                    transform={`translate(${presence.cursor.x}, ${presence.cursor.y})`}
                  />
                  {/* Cursor tooltip (Avatar + Name) */}
                  <foreignObject
                    x={presence.cursor.x + 12}
                    y={presence.cursor.y + 12}
                    width={150}
                    height={32}
                  >
                    <div className="flex items-center gap-1 bg-surface/90 border border-border px-1.5 py-0.5 rounded-lg shadow-sm text-[9px] font-bold text-foreground">
                      {avatar && <img src={avatar} alt={name} className="size-4.5 rounded-full object-cover border border-white" />}
                      <span className="truncate max-w-[100px]">{name}</span>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>

          {/* Left floating color tag select */}
          <div className="absolute left-4 top-4 bg-surface border border-border rounded-xl p-2 shadow-sm space-y-1.5 flex flex-col z-20">
            {["#FF5A36", "#3e9b68", "#ef6688", "#e49a3a", "#3b82f6"].map((hex) => (
              <button
                key={hex}
                onClick={() => setDrawingColor(hex)}
                className={`size-4 rounded-full border border-white shrink-0 ${
                  drawingColor === hex ? "ring-2 ring-primary" : ""
                }`}
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>

          {/* Bottom template quick presets loaders */}
          <div className="absolute bottom-4 left-4 right-4 bg-surface border border-border rounded-xl p-3 shadow-md z-20 flex items-center justify-between">
            <span className="text-overline text-muted block">Canvas templates</span>
            <div className="flex gap-2">
              <button onClick={() => loadPredefinedTemplate("flowchart")} className="btn-secondary text-caption hover:bg-primary hover:text-white px-2.5 py-1">
                Flowchart Presets
              </button>
              <button onClick={() => loadPredefinedTemplate("mindmap")} className="btn-secondary text-caption hover:bg-primary hover:text-white px-2.5 py-1">
                Mindmap Canvas
              </button>
            </div>
          </div>
        </div>

        {/* Right side AI generator */}
        <section className="w-80 border-l border-border bg-background p-5 shrink-0 flex flex-col justify-between hidden lg:flex">
          <div className="space-y-4">
            <div>
              <h4 className="text-label-val text-primary uppercase tracking-wider block font-bold">AI Diagram Generator</h4>
              <p className="text-caption text-muted mt-0.5 font-semibold">Describe your flow process. Gemini will append vector node shapes immediately:</p>
            </div>

            <textarea
              placeholder="e.g. User authentication flow, OAuth handshake process, task lifecycle..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full h-24 p-3 bg-surface border border-border text-input-val rounded-xl outline-none resize-none focus:border-primary text-foreground"
            />

            <button
              onClick={handleAIGenerateDiagram}
              disabled={generating || !aiPrompt.trim()}
              className="w-full btn-primary h-9.5"
            >
              {generating ? (
                <div className="flex items-center justify-center gap-1">
                  <span className="ai-dot-indicator" />
                  <span className="ai-dot-indicator" />
                  <span className="ai-dot-indicator" />
                </div>
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
      </div>
    </div>
  );
}

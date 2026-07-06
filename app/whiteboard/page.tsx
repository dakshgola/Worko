"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  Plus,
  Loader2,
  PenTool,
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
import { ClientSideSuspense } from "@liveblocks/react";
import {
  LiveblocksProvider,
  RoomProvider,
  useMyPresence,
  useOthers,
  useUpdateMyPresence,
  useStorage,
  useMutation,
} from "@/lib/liveblocks";
import { WhiteboardCanvas } from "@/components/whiteboard/WhiteboardCanvas";
import { WhiteboardToolbar } from "@/components/whiteboard/WhiteboardToolbar";
import { WhiteboardAIGenerator } from "@/components/whiteboard/WhiteboardAIGenerator";

import { Whiteboard } from "@/db/schema";

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
  const [boards, setBoards] = useState<Whiteboard[]>([]);
  const [activeBoard, setActiveBoard] = useState<Whiteboard | null>(null);
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
      toast.success("Whiteboard created successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to create whiteboard");
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
                <ClientSideSuspense fallback={
                  <div className="flex-grow flex flex-col items-center justify-center text-caption font-semibold text-muted gap-2">
                    <Loader2 size={18} className="animate-spin text-primary" />
                    <span>Loading collaborative workspace...</span>
                  </div>
                }>
                  <WhiteboardMultiplayerCanvas
                    activeBoard={activeBoard}
                    setActiveBoard={setActiveBoard}
                    boards={boards}
                    setBoards={setBoards}
                    user={user}
                  />
                </ClientSideSuspense>
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
  activeBoard: Whiteboard;
  setActiveBoard: (b: Whiteboard | null) => void;
  boards: Whiteboard[];
  setBoards: React.Dispatch<React.SetStateAction<Whiteboard[]>>;
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

  const initialSyncRef = useRef<string | null>(null);
  const storageRoot = useStorage((root) => root);
  const isStorageLoaded = !!storageRoot;

  const drawingColorList = ["#FF5A36", "#3e9b68", "#ef6688", "#e49a3a", "#3b82f6"];

  // Populate map storage from Postgres if empty on room creation
  const populateMutation = useMutation(({ storage }) => {
    const map = storage.get("canvasElements");
    if (map.size === 0 && activeBoard.elements) {
      try {
        const initial = JSON.parse(activeBoard.elements);
        if (Array.isArray(initial)) {
          initial.forEach((el: Element) => {
            map.set(el.id, el);
          });
        }
      } catch (e) {
        console.error("Failed to parse initial elements:", e);
      }
    }
  }, [activeBoard]);

  useEffect(() => {
    if (isStorageLoaded && initialSyncRef.current !== activeBoard.id) {
      initialSyncRef.current = activeBoard.id;
      populateMutation();
    }
  }, [populateMutation, activeBoard.id, isStorageLoaded]);

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
    if (!activeBoard) return;
    try {
      setActiveBoard({ ...activeBoard, name: newName });
      setBoards(boards.map((b) => (b.id === activeBoard.id ? { ...b, name: newName } : b)));
      await updateWhiteboardMetadata(activeBoard.id, { name: newName });
    } catch (e) {
      console.error(e);
      toast.error("Failed to rename whiteboard");
    }
  };

  // Debounced Neon Postgres DB persistence
  const saveCanvasElementsToDb = async (newElements: Element[]) => {
    if (!activeBoard) return;
    try {
      await updateWhiteboardElements(activeBoard.id, JSON.stringify(newElements));
    } catch (e) {
      console.error("Failed to save elements to database:", e);
      toast.error("Failed to save drawing changes");
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
        const withIds = parsed.map((el: Element) => ({
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
      <WhiteboardToolbar
        activeBoard={activeBoard}
        setActiveBoard={setActiveBoard}
        handleUpdateName={handleUpdateName}
        others={others}
        tool={tool}
        setTool={setTool}
        selectedId={selectedId}
        handleDeleteSelected={handleDeleteSelected}
      />

      <div className="flex-grow flex min-h-0 relative">
        <WhiteboardCanvas
          elements={elements}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          tool={tool}
          setTool={setTool}
          drawingColor={drawingColor}
          setIsDrawing={setIsDrawing}
          isDrawing={isDrawing}
          startPos={startPos}
          setStartPos={setStartPos}
          tempElement={tempElement}
          setTempElement={setTempElement}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          dragOffset={dragOffset}
          setDragOffset={setDragOffset}
          saveCanvasElementsMutation={saveCanvasElementsMutation}
          updateElementMutation={updateElementMutation}
          deleteElementMutation={deleteElementMutation}
          others={others}
          updateMyPresence={updateMyPresence}
          drawingColorList={drawingColorList}
          setDrawingColor={setDrawingColor}
          loadPredefinedTemplate={loadPredefinedTemplate}
        />

        <WhiteboardAIGenerator
          aiPrompt={aiPrompt}
          setAiPrompt={setAiPrompt}
          generating={generating}
          handleAIGenerateDiagram={handleAIGenerateDiagram}
        />
      </div>
    </div>
  );
}

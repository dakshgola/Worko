"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
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
  FolderPlus,
  FilePlus,
  Link,
  ChevronLeft,
  ChevronRight,
  Menu,
  Zap,
  PanelLeftClose,
} from "lucide-react";
import {
  listSpaces,
  createSpace,
  updateSpace,
  deleteSpace,
  listPages,
  createPage,
  updatePage,
  deletePage,
} from "@/lib/spaces/actions";
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar";

const sidebarNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "AI Assistant", icon: Bot, href: "/ai-assistant" },
  { label: "Calendar", icon: CalendarDays, href: "/calendar" },
  { label: "Tasks", icon: SquareKanban, href: "/kanban" },
  { label: "Notes", icon: StickyNote, href: "/notes" },
  { label: "Whiteboard", icon: PenTool, href: "/whiteboard" },
  { label: "Spaces", icon: PanelTop, href: "/spaces", active: true },
  { label: "AI Builder", icon: WandSparkles, href: "/ai-template-builder" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export default function SpacesPage() {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Spaces & Pages states
  const [spacesList, setSpacesList] = useState<any[]>([]);
  const [activeSpace, setActiveSpace] = useState<any>(null);
  const [pagesList, setPagesList] = useState<any[]>([]);
  const [activePage, setActivePage] = useState<any>(null);

  // Loading toggles
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [loadingPages, setLoadingPages] = useState(false);
  const [saving, setSaving] = useState(false);

  // Creation popups
  const [showSpaceModal, setShowSpaceModal] = useState(false);
  const [newSpaceForm, setNewSpaceForm] = useState({ name: "", description: "", color: "Purple" });

  // Tiptap Rich-Text Editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    onUpdate: ({ editor }) => {
      if (!activePage) return;
      const htmlContent = editor.getHTML();

      setSaving(true);
      const timer = setTimeout(async () => {
        try {
          await updatePage(activePage.id, { content: htmlContent });
          setPagesList((curr) =>
            curr.map((p) => (p.id === activePage.id ? { ...p, content: htmlContent } : p))
          );
        } catch (e) {
          console.error(e);
        } finally {
          setSaving(false);
        }
      }, 1000);

      return () => clearTimeout(timer);
    },
  });

  const fetchSpaces = async () => {
    try {
      setLoadingSpaces(true);
      const res = await listSpaces();
      setSpacesList(res);
      if (res.length > 0) {
        setActiveSpace(res[0]);
        await fetchPages(res[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSpaces(false);
    }
  };

  const fetchPages = async (spaceId: string) => {
    try {
      setLoadingPages(true);
      const res = await listPages(spaceId);
      setPagesList(res);
      if (res.length > 0) {
        setActivePage(res[0]);
        if (editor) {
          editor.commands.setContent(res[0].content || "");
        }
      } else {
        setActivePage(null);
        if (editor) {
          editor.commands.setContent("");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPages(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  useEffect(() => {
    if (activePage && editor) {
      const curr = editor.getHTML();
      if (curr !== activePage.content) {
        editor.commands.setContent(activePage.content || "");
      }
    }
  }, [activePage, editor]);

  const handleCreateSpaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceForm.name.trim()) return;

    try {
      const space = await createSpace({
        name: newSpaceForm.name,
        description: newSpaceForm.description,
        color: newSpaceForm.color,
      });

      setSpacesList((prev) => [...prev, space]);
      setActiveSpace(space);
      setShowSpaceModal(false);
      setNewSpaceForm({ name: "", description: "", color: "Purple" });
      await fetchPages(space.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePageInsideActiveSpace = async () => {
    if (!activeSpace) return;
    try {
      setLoadingPages(true);
      const page = await createPage(activeSpace.id, "Draft Specification Document", "Blank Page");
      setPagesList((prev) => [page, ...prev]);
      setActivePage(page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPages(false);
    }
  };

  const handleUpdatePageTitle = async (newTitle: string) => {
    if (!activePage) return;
    try {
      setActivePage((prev: any) => ({ ...prev, title: newTitle }));
      setPagesList((curr) => curr.map((p) => (p.id === activePage.id ? { ...p, title: newTitle } : p)));
      await updatePage(activePage.id, { title: newTitle });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteActivePage = async () => {
    if (!activePage) return;
    if (confirm("Are you sure you want to delete this page document?")) {
      try {
        await deletePage(activePage.id);
        const remaining = pagesList.filter((p) => p.id !== activePage.id);
        setPagesList(remaining);
        setActivePage(remaining.length > 0 ? remaining[0] : null);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8fb] text-[#292832] flex">
      {/* Sidebar Navigation */}
      <WorkspaceSidebar active="Spaces" />

      <main className="flex-1 min-w-0 flex h-screen overflow-hidden">
        {/* Spaces Folders sidebar */}
        <section className="w-60 border-r border-[#efedf4] bg-white flex flex-col shrink-0">
          <div className="p-4 border-b border-[#efedf4] flex items-center justify-between">
            <span className="text-xs font-bold text-[#b0a9bd] uppercase tracking-wider">Workspace Spaces</span>
            <button onClick={() => setShowSpaceModal(true)} className="p-1 bg-violet-50 text-[#6c5ce7] rounded-lg">
              <FolderPlus size={13} />
            </button>
          </div>

          <div className="p-2 space-y-1 overflow-y-auto max-h-[40vh] border-b border-[#efedf4]">
            {loadingSpaces ? (
              <div className="text-center py-4 text-xs"><Loader2 size={12} className="animate-spin text-[#6c5ce7] mr-1" /> Loading</div>
            ) : spacesList.length === 0 ? (
              <p className="text-[10px] text-center py-3 text-slate-400">No spaces created.</p>
            ) : (
              spacesList.map((space) => (
                <button
                  key={space.id}
                  onClick={() => {
                    setActiveSpace(space);
                    fetchPages(space.id);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 truncate ${
                    activeSpace?.id === space.id ? "bg-[#eeeaff] text-[#6c5ce7]" : ""
                  }`}
                >
                  <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: space.color === "Purple" ? "#6c5ce7" : space.color === "Green" ? "#3e9b68" : "#3b82f6" }} />
                  <span className="truncate">{space.name}</span>
                </button>
              ))
            )}
          </div>

          {/* Subpages Sidebar under space */}
          {activeSpace && (
            <div className="flex-1 flex flex-col min-h-0 bg-[#fcfcfd]">
              <div className="p-4 border-b border-[#efedf4]/70 flex items-center justify-between shrink-0 bg-white">
                <span className="text-[10px] font-extrabold text-[#aaa6b5] uppercase tracking-wider">Nested Pages</span>
                <button onClick={handleCreatePageInsideActiveSpace} className="p-1 bg-[#eeeaff] text-[#6c5ce7] rounded-lg">
                  <FilePlus size={12} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {loadingPages ? (
                  <div className="text-center py-6 text-xs"><Loader2 size={11} className="animate-spin text-[#6c5ce7]" /></div>
                ) : pagesList.length === 0 ? (
                  <p className="text-[10px] text-center text-slate-400 py-6">0 page sheets.</p>
                ) : (
                  pagesList.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => setActivePage(page)}
                      className={`w-full text-left p-2 rounded-lg text-[11px] font-semibold truncate ${
                        activePage?.id === page.id ? "bg-white border border-[#ece9f2] text-[#6c5ce7] shadow-sm" : "text-[#777281] hover:bg-[#fafafb]"
                      }`}
                    >
                      📄 {page.title}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </section>

        {/* Page spec editor */}
        <section className="flex-grow bg-white flex flex-col min-w-0 h-full overflow-hidden">
          {activePage ? (
            <>
              {/* Toolbar */}
              <div className="h-[64px] bg-white border-b border-[#efedf4] px-6 flex items-center gap-3 shrink-0">
                <input
                  type="text"
                  value={activePage.title}
                  onChange={(e) => handleUpdatePageTitle(e.target.value)}
                  className="font-black text-base text-[#282633] outline-none max-w-sm border-b border-transparent focus:border-slate-100"
                />

                {saving && (
                  <span className="text-[10px] text-[#aaa6b5] font-bold flex items-center animate-pulse gap-1">
                    <Loader2 size={10} className="animate-spin text-[#6c5ce7]" /> Autosaving
                  </span>
                )}

                <div className="ml-auto flex items-center gap-2">
                  <button onClick={handleDeleteActivePage} className="p-1.5 rounded-lg border border-[#e5e2ed] text-red-500 hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Rich-Text Editor content */}
              <div className="flex-1 flex min-w-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto px-8 py-6 prose max-w-none prose-sm">
                  <div className="mb-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Doc Template: <span className="text-[#6c5ce7]">{activePage.template}</span>
                  </div>
                  <EditorContent editor={editor} className="outline-none min-h-[350px] text-sm text-[#292832] font-normal leading-relaxed" />
                </div>

                {/* Linked References Sidebar */}
                <div className="w-72 border-l border-[#efedf4] bg-[#fafafc] p-5 space-y-4 shrink-0 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h5 className="text-[11px] font-bold text-[#5143bd] uppercase tracking-wider flex items-center gap-1">
                      <Link size={12} /> Linked References
                    </h5>
                    <p className="text-[10px] text-[#777281]">Outline connections with calendar sync, tasks, or boards logs:</p>

                    <div className="space-y-2">
                      <div className="p-2.5 bg-white border border-[#efedf4] rounded-xl text-xs space-y-1 shadow-sm">
                        <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Linked Boards</p>
                        <p className="font-semibold truncate text-[#282633]">None connected</p>
                      </div>
                      <div className="p-2.5 bg-white border border-[#efedf4] rounded-xl text-xs space-y-1 shadow-sm">
                        <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Calendar Events</p>
                        <p className="font-semibold truncate text-[#282633]">None scheduled</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl text-[9px] text-[#5143bd] leading-relaxed font-semibold">
                    Pages are synced securely inside spaces folders. Changes sync automatically in real-time.
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <PanelTop size={48} className="text-slate-300" />
              <h4 className="font-bold text-sm text-slate-500">No active page selected</h4>
              <p className="text-xs max-w-xs text-slate-400">Select an existing document under your spaces navigation or create a new spec document sheet.</p>
              {activeSpace && (
                <button onClick={handleCreatePageInsideActiveSpace} className="h-9 px-4 bg-[#6c5ce7] text-white rounded-xl text-xs font-bold">
                  Create Page
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Create Space Modal */}
      {showSpaceModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateSpaceSubmit} className="bg-white rounded-2xl border-2 border-[#6c5ce7] w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-black text-sm text-[#282633] flex items-center gap-1.5">
                <FolderPlus size={16} className="text-[#6c5ce7]" />
                Create Workspace Space
              </h4>
              <button type="button" onClick={() => setShowSpaceModal(false)}><X size={15} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#b0a9bd] mb-1">Space Name</label>
                <input
                  type="text"
                  required
                  value={newSpaceForm.name}
                  onChange={(e) => setNewSpaceForm({ ...newSpaceForm, name: e.target.value })}
                  placeholder="e.g. Confluence Wiki, Engineering Team..."
                  className="w-full h-9 px-3 rounded-lg border text-xs outline-none focus:border-[#6c5ce7]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#b0a9bd] mb-1">Description</label>
                <input
                  type="text"
                  value={newSpaceForm.description}
                  onChange={(e) => setNewSpaceForm({ ...newSpaceForm, description: e.target.value })}
                  placeholder="e.g. Document specifications and roadmaps..."
                  className="w-full h-9 px-3 rounded-lg border text-xs outline-none focus:border-[#6c5ce7]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#b0a9bd] mb-1">Space Theme Color</label>
                <select
                  value={newSpaceForm.color}
                  onChange={(e) => setNewSpaceForm({ ...newSpaceForm, color: e.target.value })}
                  className="w-full h-9 px-2 rounded-lg border text-xs outline-none"
                >
                  <option value="Purple">Purple Accent</option>
                  <option value="Green">Green Forest</option>
                  <option value="Blue">Blue Ocean</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t pt-3">
              <button type="button" onClick={() => setShowSpaceModal(false)} className="h-8.5 px-4 bg-slate-50 border rounded-xl text-xs font-semibold text-[#777281]">Cancel</button>
              <button type="submit" className="h-8.5 px-4 bg-[#6c5ce7] text-white rounded-xl text-xs font-bold">Add Space</button>
            </div>
          </form>
        </div>
      )}

      {sidebarOpen && <button aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-[#302a3d]/20 backdrop-blur-sm lg:hidden" />}
    </div>
  );
}

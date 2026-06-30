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
    <div className="min-h-screen bg-[#FAF8F4] text-[#2C2A29] flex">
      {/* Sidebar Navigation */}
      <WorkspaceSidebar active="Spaces" />

      <main className="flex-1 min-w-0 flex h-screen overflow-hidden">
        {/* Spaces Folders sidebar */}
        <section className="w-60 border-r border-[#EBE8E2] bg-white flex flex-col shrink-0">
          <div className="p-4 border-b border-[#EBE8E2] flex items-center justify-between">
            <span className="text-overline text-[#aaa6b5] block">Workspace Spaces</span>
            <button onClick={() => setShowSpaceModal(true)} className="p-1 bg-[#FFE8E2] text-[#FF5A36] rounded-lg">
              <FolderPlus size={13} />
            </button>
          </div>

          <div className="p-2 space-y-1 overflow-y-auto max-h-[40vh] border-b border-[#EBE8E2]">
            {loadingSpaces ? (
              <div className="text-center py-4 text-caption font-semibold text-[#aaa6b5]"><Loader2 size={12} className="animate-spin text-[#FF5A36] mr-1 inline" /> Loading</div>
            ) : spacesList.length === 0 ? (
              <p className="text-caption text-center py-3 text-slate-400 font-semibold">No spaces created.</p>
            ) : (
              spacesList.map((space) => (
                <button
                  key={space.id}
                  onClick={() => {
                    setActiveSpace(space);
                    fetchPages(space.id);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-body-sm font-bold flex items-center gap-2 truncate ${
                    activeSpace?.id === space.id ? "bg-[#FFE8E2]/60 text-[#FF5A36]" : "hover:bg-slate-50"
                  }`}
                >
                  <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: space.color === "Purple" ? "#FF5A36" : space.color === "Green" ? "#3e9b68" : "#3b82f6" }} />
                  <span className="truncate">{space.name}</span>
                </button>
              ))
            )}
          </div>

          {/* Subpages Sidebar under space */}
          {activeSpace && (
            <div className="flex-1 flex flex-col min-h-0 bg-[#FAF8F4]/30">
              <div className="p-4 border-b border-[#EBE8E2]/70 flex items-center justify-between shrink-0 bg-white">
                <span className="text-overline text-[#aaa6b5] block">Nested Pages</span>
                <button onClick={handleCreatePageInsideActiveSpace} className="p-1 bg-[#FFE8E2] text-[#FF5A36] rounded-lg">
                  <FilePlus size={12} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {loadingPages ? (
                  <div className="text-center py-6 text-xs text-[#aaa6b5]"><Loader2 size={11} className="animate-spin text-[#FF5A36]" /></div>
                ) : pagesList.length === 0 ? (
                  <p className="text-caption text-center text-slate-400 py-6 font-semibold">0 page sheets.</p>
                ) : (
                  pagesList.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => setActivePage(page)}
                      className={`w-full text-left p-2 rounded-lg text-sidebar font-semibold truncate ${
                        activePage?.id === page.id ? "bg-white border border-[#EBE8E2] text-[#FF5A36] shadow-sm" : "text-[#5E5B5A] hover:bg-slate-50"
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
              <div className="h-[68px] bg-white border-b border-[#EBE8E2] px-6 flex items-center gap-3 shrink-0">
                <input
                  type="text"
                  value={activePage.title}
                  onChange={(e) => handleUpdatePageTitle(e.target.value)}
                  className="text-h3 font-black text-[#2C2A29] outline-none max-w-sm border-b border-transparent focus:border-slate-100 bg-transparent"
                />

                {saving && (
                  <span className="text-caption text-[#aaa6b5] font-bold flex items-center animate-pulse gap-1">
                    <Loader2 size={10} className="animate-spin text-[#FF5A36]" /> Autosaving
                  </span>
                )}

                <div className="ml-auto flex items-center gap-2">
                  <button onClick={handleDeleteActivePage} className="p-1.5 rounded-lg border border-[#EBE8E2] text-red-500 hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Rich-Text Editor content */}
              <div className="flex-1 flex min-w-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto px-8 py-6 bg-white prose max-w-none">
                  <div className="mb-4 text-overline text-[#FF5A36] block">
                    Doc Template: <span>{activePage.template}</span>
                  </div>
                  <EditorContent editor={editor} className="outline-none min-h-[350px] text-body text-[#2C2A29]" />
                </div>

                {/* Linked References Sidebar */}
                <div className="w-72 border-l border-[#EBE8E2] bg-[#FAF8F4] p-5 space-y-4 shrink-0 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h5 className="text-label-val text-[#FF5A36] uppercase tracking-wider block flex items-center gap-1">
                      <Link size={12} /> Linked References
                    </h5>
                    <p className="text-caption text-[#5E5B5A] font-semibold">Outline connections with calendar sync, tasks, or boards logs:</p>

                    <div className="space-y-2">
                      <div className="p-2.5 bg-white border border-[#EBE8E2] rounded-xl space-y-1 shadow-sm">
                        <p className="text-overline text-[#aaa6b5] block">Linked Boards</p>
                        <p className="text-body-sm font-bold truncate text-[#2C2A29]">None connected</p>
                      </div>
                      <div className="p-2.5 bg-white border border-[#EBE8E2] rounded-xl space-y-1 shadow-sm">
                        <p className="text-overline text-[#aaa6b5] block">Calendar Events</p>
                        <p className="text-body-sm font-bold truncate text-[#2C2A29]">None scheduled</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#FFE8E2]/60 border border-[#ffcfc4] rounded-xl text-caption text-[#FF5A36] leading-relaxed font-semibold">
                    Pages are synced securely inside spaces folders. Changes sync automatically in real-time.
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <PanelTop size={48} className="text-slate-300" />
              <h4 className="text-body-sm font-bold text-slate-500">No active page selected</h4>
              <p className="text-caption max-w-xs text-slate-400">Select an existing document under your spaces navigation or create a new spec document sheet.</p>
              {activeSpace && (
                <button onClick={handleCreatePageInsideActiveSpace} className="h-9.5 px-4 bg-[#FF5A36] text-white rounded-xl text-btn">
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
          <form onSubmit={handleCreateSpaceSubmit} className="bg-white rounded-2xl border-2 border-[#FF5A36] w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-black text-sm text-[#2C2A29] flex items-center gap-1.5">
                <FolderPlus size={16} className="text-[#FF5A36]" />
                Create Workspace Space
              </h4>
              <button type="button" onClick={() => setShowSpaceModal(false)}><X size={15} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-label-val uppercase text-[#aaa6b5] mb-1">Space Name</label>
                <input
                  type="text"
                  required
                  value={newSpaceForm.name}
                  onChange={(e) => setNewSpaceForm({ ...newSpaceForm, name: e.target.value })}
                  placeholder="e.g. Confluence Wiki, Engineering Team..."
                  className="w-full h-10 px-3 rounded-lg border text-input-val outline-none focus:border-[#FF5A36]"
                />
              </div>
              <div>
                <label className="block text-label-val uppercase text-[#aaa6b5] mb-1">Description</label>
                <input
                  type="text"
                  value={newSpaceForm.description}
                  onChange={(e) => setNewSpaceForm({ ...newSpaceForm, description: e.target.value })}
                  placeholder="e.g. Document specifications and roadmaps..."
                  className="w-full h-10 px-3 rounded-lg border text-input-val outline-none focus:border-[#FF5A36]"
                />
              </div>
              <div>
                <label className="block text-label-val uppercase text-[#aaa6b5] mb-1">Space Theme Color</label>
                <select
                  value={newSpaceForm.color}
                  onChange={(e) => setNewSpaceForm({ ...newSpaceForm, color: e.target.value })}
                  className="w-full h-10 px-2 rounded-lg border text-input-val outline-none text-[#5E5B5A] font-semibold"
                >
                  <option value="Purple">Coral Orange Theme</option>
                  <option value="Green">Green Forest</option>
                  <option value="Blue">Blue Ocean</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t pt-3">
              <button type="button" onClick={() => setShowSpaceModal(false)} className="h-9 px-4 bg-slate-50 border rounded-xl text-btn text-[#5E5B5A]">Cancel</button>
              <button type="submit" className="h-9 px-4 bg-[#FF5A36] text-white rounded-xl text-btn">Add Space</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

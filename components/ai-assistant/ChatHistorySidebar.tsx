"use client";
import React from "react";
import { Plus, Loader2, Trash2 } from "lucide-react";

interface ChatHistorySidebarProps {
  chatsList: any[];
  activeChat: any;
  loadingChats: boolean;
  handleCreateChat: () => void;
  handleSelectChat: (chat: any) => void;
  handleDeleteChat: (id: string, e: React.MouseEvent) => void;
}

export function ChatHistorySidebar({
  chatsList,
  activeChat,
  loadingChats,
  handleCreateChat,
  handleSelectChat,
  handleDeleteChat,
}: ChatHistorySidebarProps) {
  return (
    <section className={`w-full lg:w-60 border-r border-border bg-surface flex flex-col shrink-0 ${activeChat ? "hidden lg:flex" : "flex"}`}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        <span className="text-overline text-muted block">Conversations</span>
        <button onClick={() => handleCreateChat()} className="btn-secondary size-8 p-0 flex items-center justify-center">
          <Plus size={13} />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-2 space-y-1">
        {loadingChats ? (
          <div className="text-center py-4 text-caption font-semibold text-muted"><Loader2 size={12} className="animate-spin text-primary inline" /></div>
        ) : chatsList.length === 0 ? (
          <div className="text-caption text-muted text-center py-4 font-semibold">0 conversation logs.</div>
        ) : (
          chatsList.map((chat) => (
            <button
              key={chat.id}
              onClick={() => handleSelectChat(chat)}
              className={`w-full text-left p-2.5 rounded-xl text-body-sm font-bold flex items-center justify-between group truncate ${
                activeChat?.id === chat.id ? "bg-primary-soft text-primary" : "hover:bg-hover-overlay"
              }`}
            >
              <span className="truncate flex-1">{chat.title}</span>
              <button onClick={(e) => handleDeleteChat(chat.id, e)} className="text-slate-300 hover:text-danger transition ml-2 opacity-0 group-hover:opacity-100">
                <Trash2 size={11} />
              </button>
            </button>
          ))
        )}
      </div>
    </section>
  );
}

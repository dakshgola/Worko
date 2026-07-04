"use client";
import React from "react";
import { Bot, Loader2, Sparkles, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MessageThreadProps {
  messages: any[];
  loadingHistory: boolean;
  streamingResponse: string;
  isAiResponding: boolean;
  actionConfirmation: any;
  setActionConfirmation: (val: any) => void;
  actionSuccess: boolean;
  handleConfirmAction: () => void;
  suggestedPrompts: string[];
  setInputMsg: (msg: string) => void;
  handleSubmitPrompt: (msg: string) => void;
}

export function MessageThread({
  messages,
  loadingHistory,
  streamingResponse,
  isAiResponding,
  actionConfirmation,
  setActionConfirmation,
  actionSuccess,
  handleConfirmAction,
  suggestedPrompts,
  setInputMsg,
  handleSubmitPrompt,
}: MessageThreadProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {loadingHistory ? (
        <div className="flex items-center justify-center py-12 text-caption font-semibold text-muted">
          <Loader2 size={14} className="animate-spin mr-1 text-primary" /> Loading history...
        </div>
      ) : messages.length === 0 && !streamingResponse ? (
        <div className="max-w-md mx-auto text-center py-16 space-y-4">
          <Bot size={42} className="text-primary mx-auto animate-bounce" />
          <h4 className="text-h3 text-foreground">Ask anything about your workspace</h4>
          <p className="text-body-sm text-muted leading-relaxed font-semibold">
            I can schedule events, write specifications notes drafts, or calculate productivity logs based on Neon Database records.
          </p>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {suggestedPrompts.map((sg, i) => (
              <button
                key={i}
                onClick={() => { setInputMsg(sg); handleSubmitPrompt(sg); }}
                className="px-3 py-1.5 bg-primary-soft border border-primary-soft hover:bg-primary hover:text-white text-primary text-btn rounded-full transition"
              >
                {sg}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3.5 items-start ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <span className={`grid size-8 shrink-0 place-items-center rounded-xl text-badge-val ${
                m.role === "user" ? "bg-amber-100 text-amber-700" : "bg-primary-soft text-primary"
              }`}>
                {m.role === "user" ? "US" : "AI"}
              </span>
              <div className={`p-3.5 rounded-2xl text-body-sm leading-relaxed font-semibold ${
                m.role === "user" ? "bg-primary text-white" : "bg-surface border border-border text-foreground"
              }`}>
                {m.content}
              </div>
            </div>
          ))}

          {streamingResponse && (
            <div className="flex gap-3.5 items-start">
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary text-badge-val">AI</span>
              <div className="p-3.5 rounded-2xl text-body-sm leading-relaxed bg-surface border border-border text-foreground font-semibold">
                {streamingResponse}
              </div>
            </div>
          )}

          {isAiResponding && !streamingResponse && (
            <div className="flex gap-3.5 items-start">
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary text-badge-val">AI</span>
              <div className="p-3.5 rounded-2xl text-body-sm leading-relaxed bg-surface border border-border text-foreground font-semibold">
                <div className="flex items-center gap-1 py-1.5 px-3">
                  <span className="ai-dot-indicator" />
                  <span className="ai-dot-indicator" />
                  <span className="ai-dot-indicator" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Confirmation Panel Overlay */}
      <AnimatePresence>
        {actionConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="max-w-md mx-auto bg-surface border border-border p-4 rounded-2xl shadow-lg space-y-3"
          >
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <Sparkles size={14} className="text-primary animate-pulse" />
              <span className="text-overline text-foreground block font-bold">Detected Workspace Action Intent</span>
            </div>
            <div className="text-body-sm text-muted leading-relaxed">
              <p className="text-overline text-primary tracking-wider block font-bold">{actionConfirmation.type} to build:</p>
              <p className="text-body-sm font-extrabold text-foreground mt-0.5">{actionConfirmation.payload.title}</p>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setActionConfirmation(null)} className="btn-outline h-9.5 px-3 py-1">Discard</button>
              <button onClick={handleConfirmAction} className="btn-primary h-9.5 px-3 py-1">
                {actionSuccess ? <Check size={11} /> : "Execute Confirmation"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

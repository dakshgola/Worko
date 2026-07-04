"use client";
import React from "react";
import { Sparkles } from "lucide-react";

interface WhiteboardAIGeneratorProps {
  aiPrompt: string;
  setAiPrompt: (p: string) => void;
  generating: boolean;
  handleAIGenerateDiagram: () => void;
}

export function WhiteboardAIGenerator({
  aiPrompt,
  setAiPrompt,
  generating,
  handleAIGenerateDiagram,
}: WhiteboardAIGeneratorProps) {
  return (
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
          className="w-full h-24 p-3 bg-surface border-border border text-input-val rounded-xl outline-none resize-none focus:border-primary text-foreground"
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
  );
}

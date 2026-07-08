"use client";
import React from "react";
import { Mic, MicOff, Send } from "lucide-react";

interface InputComposerProps {
  inputMsg: string;
  setInputMsg: (msg: string) => void;
  isAiResponding: boolean;
  handleSubmitPrompt: (msg: string) => void;
  isRecording: boolean;
  startVoiceRecording: () => void;
  stopVoiceRecording: () => void;
}

export function InputComposer({
  inputMsg,
  setInputMsg,
  isAiResponding,
  handleSubmitPrompt,
  isRecording,
  startVoiceRecording,
  stopVoiceRecording,
}: InputComposerProps) {
  return (
    <div className="p-4 bg-surface border-t border-border shrink-0">
      <div className="max-w-3xl mx-auto flex gap-2">
        <button
          type="button"
          onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
          className={`grid size-10 place-items-center rounded-xl border transition ${
            isRecording ? "bg-red-500 border-red-500 text-white animate-pulse" : "btn-secondary text-primary border-border bg-surface flex items-center justify-center"
          }`}
        >
          {isRecording ? <MicOff size={15} /> : <Mic size={15} />}
        </button>

        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            placeholder="Ask Gemini orchestrator..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmitPrompt(inputMsg)}
            className="w-full input-cozy h-10 pr-10"
          />
          <button
            onClick={() => handleSubmitPrompt(inputMsg)}
            disabled={isAiResponding || !inputMsg.trim()}
            className="absolute right-1.5 grid size-8.5 place-items-center rounded-[10px] bg-primary text-white hover:bg-primary-hover transition"
          >
            <Send size={12} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}

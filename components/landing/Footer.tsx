"use client";
import React from "react";
import { Zap, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/80 bg-surface/50 py-16 px-6 mt-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-left">
        
        {/* Logo stack */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-primary to-[#ff7d5e] text-white">
              <Zap size={14} fill="currentColor" />
            </div>
            <span className="text-h4 text-foreground font-black">Worko</span>
          </div>
          <p className="text-caption text-muted font-semibold leading-relaxed">
            The premium knowledge hub and AI workspace manager designed for high-performance builders.
          </p>
        </div>

        {/* Nav columns */}
        <div>
          <h5 className="text-overline text-foreground mb-3.5 font-bold">Workspace modules</h5>
          <ul className="space-y-2 text-caption font-semibold text-muted">
            <li><a href="/notes" className="hover:text-primary transition-colors">Specifications Wiki</a></li>
            <li><a href="/kanban" className="hover:text-primary transition-colors">Kanban Tasks</a></li>
            <li><a href="/calendar" className="hover:text-primary transition-colors">Neon Calendars</a></li>
            <li><a href="/whiteboard" className="hover:text-primary transition-colors">Infinite Whiteboard</a></li>
          </ul>
        </div>

        <div>
          <h5 className="text-overline text-foreground mb-3.5 font-bold">Generators</h5>
          <ul className="space-y-2 text-caption font-semibold text-muted">
            <li><a href="/ai-assistant" className="hover:text-primary transition-colors">Gemini Orchestrator</a></li>
            <li><a href="/ai-template-builder" className="hover:text-primary transition-colors">AI Apps Builders</a></li>
            <li><a href="https://github.com/dakshgola/Worko" target="_blank" className="hover:text-primary transition-colors">GitHub Sources</a></li>
          </ul>
        </div>

        <div>
          <h5 className="text-overline text-foreground mb-3.5 font-bold">Account</h5>
          <ul className="space-y-2 text-caption font-semibold text-muted">
            <li><a href="/settings" className="hover:text-primary transition-colors">Preferences</a></li>
            <li><a href="/settings" className="hover:text-primary transition-colors">Plans Billing</a></li>
            <li><a href="/sign-in" className="hover:text-primary transition-colors">Sign In</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto border-t border-border mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-caption font-semibold text-[#c0bac8]">
        <p>&copy; {new Date().getFullYear()} Worko Corp. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="https://github.com/dakshgola/Worko" target="_blank" className="hover:text-primary transition-colors flex items-center gap-1"><Github size={12} /> GitHub Repository</a>
        </div>
      </div>
    </footer>
  );
}

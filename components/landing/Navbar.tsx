"use client";
import React from "react";
import { Zap, Github } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-surface/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="grid size-9.5 place-items-center rounded-xl bg-gradient-to-br from-primary to-[#ff7d5e] text-white shadow-sm ring-1 ring-white/20">
          <Zap size={16} fill="currentColor" />
        </div>
        <div>
          <span className="text-h4 text-foreground font-black tracking-tight">Worko</span>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-8 text-nav text-muted font-semibold">
        <a href="#features" className="hover:text-primary transition-colors">Features</a>
        <a href="#showcase" className="hover:text-primary transition-colors">Workspace Showcase</a>
        <a href="#pricing" className="hover:text-primary transition-colors">Pricing Plans</a>
        <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
        <a href="https://github.com/dakshgola/Worko" target="_blank" className="hover:text-primary transition flex items-center gap-1">
          <Github size={13} /> GitHub
        </a>
      </nav>

      <div className="flex items-center gap-3 text-btn">
        <a href="/sign-in" className="text-muted hover:text-foreground transition-colors px-3 py-2">
          Sign In
        </a>
        <a
          href="/sign-up"
          className="flex items-center gap-1.5 h-10 rounded-xl bg-primary hover:bg-primary-hover px-4.5 text-white shadow-md transition hover:-translate-y-0.5"
        >
          Get Started
        </a>
      </div>
    </header>
  );
}

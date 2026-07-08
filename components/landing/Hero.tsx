"use client";
import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Play } from "lucide-react";

export function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-16 lg:pt-24 text-center space-y-8 relative">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary-soft/50 text-primary text-badge-val font-bold">
          <Sparkles size={10} className="animate-spin duration-[3s]" />
          Introducing Worko Workspace 2.0
        </div>

        <h1 className="display-lg text-foreground tracking-tight max-w-4xl mx-auto leading-[1.05]">
          Where ideas connect, plans align, and{" "}
          <span className="bg-gradient-to-r from-primary via-[#ff7d5e] to-secondary bg-clip-text text-transparent">
            AI drives collaboration.
          </span>
        </h1>

        <p className="text-body-lg text-muted max-w-2xl mx-auto font-medium">
          Bring your team's wiki specifications, task lists, calendar planning agendas, infinite drawings whiteboard canvas, and AssemblyAI dictation together in a premium cohesive workflow hub.
        </p>

        <div className="flex justify-center gap-3.5 pt-2">
          <a
            href="/sign-up"
            className="h-11 px-7 rounded-xl bg-primary hover:bg-primary-hover text-btn text-white shadow-lg flex items-center justify-center hover:-translate-y-0.5 transition duration-200"
          >
            Get Started Free <ArrowRight size={14} className="ml-1" />
          </a>
          <a
            href="#showcase"
            className="h-11 px-7 rounded-xl bg-surface border border-border text-btn text-muted flex items-center justify-center gap-1.5 hover:bg-hover-overlay transition duration-200"
          >
            <Play size={11} fill="currentColor" /> Live Showcase
          </a>
        </div>
      </motion.div>
    </section>
  );
}

"use client";
import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LANDING_FAQS = [
  { q: "What is Worko and how does the AI assist?", a: "Worko combines your notes, tasks, calendar agendas, and creative whiteboards into a single collaborative workspace. The built-in AI orchestrator automates your routine tasks: scheduling calendar meetings, structuring task lists, creating pages templates, and analyzing notes automatically." },
  { q: "Is the real-time collaboration feature secure?", a: "Yes, absolutely. Worko uses secure WebSockets and PostgreSQL schemas to sync documents, whiteboards, and canvas elements instantly with clerk-protected authentication." },
  { q: "Can I self-host Worko or run it locally?", a: "Worko is fully open-source and easy to run. You can clone the GitHub repository, plug in your Neon DB credentials and Gemini API Key, and spin it up in seconds." },
  { q: "How does the voice-to-text notes dictation work?", a: "Worko integrates AssemblyAI streaming sockets to transcribe audio directly at your cursor in real-time. Simply click the microphone icon and start speaking." }
];

export function FAQ() {
  const [faqOpenIdx, setFaqOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="max-w-3xl mx-auto px-6 py-16 space-y-12">
      <div className="text-center space-y-3">
        <h2 className="text-h2 text-foreground">Frequently Asked Questions</h2>
        <p className="text-body-sm text-muted font-semibold">Everything you need to know about Worko features and operations.</p>
      </div>

      <div className="space-y-3">
        {LANDING_FAQS.map((fq, i) => {
          const isOpen = faqOpenIdx === i;
          return (
            <div key={i} className="border border-border/80 bg-surface rounded-2xl overflow-hidden shadow-xs transition hover:border-border">
              <button
                onClick={() => setFaqOpenIdx(isOpen ? null : i)}
                className="w-full px-6 py-4.5 flex items-center justify-between text-left font-bold text-foreground text-body-sm hover:text-primary transition"
              >
                <span>{fq.q}</span>
                <ChevronRight size={14} className={`text-muted transition duration-200 transform ${isOpen ? "rotate-90 text-primary" : ""}`} />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="p-4.5 text-caption text-muted leading-relaxed font-semibold">
                      {fq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

"use client";
import React from "react";

export function CTA() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-gradient-to-br from-primary via-[#ff7d5e] to-secondary rounded-[32px] p-8 md:p-12 text-center text-white relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.15),transparent)]" />
        <div className="relative z-10 space-y-6">
          <h3 className="text-h2 font-black leading-tight">Ready to orchestrate your workspace?</h3>
          <p className="text-body-sm opacity-90 max-w-lg mx-auto font-medium">
            Join thousands of developers and managers deploying specs notes, agile tasks, interactive whiteboards, and calendar syncs in seconds.
          </p>
          <div className="flex justify-center pt-2">
            <a
              href="/sign-up"
              className="h-11 px-8 bg-white hover:bg-slate-50 text-[#C23B1E] font-bold text-btn rounded-xl shadow-md flex items-center justify-center hover:-translate-y-0.5 transition duration-200"
            >
              Get Started Instantly
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

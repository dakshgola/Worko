"use client";
import React from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Showcase } from "@/components/landing/Showcase";
import { Features } from "@/components/landing/Features";
import { CTA } from "@/components/landing/CTA";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-[#FFE8E2] selection:text-[#C23B1E] overflow-hidden relative pb-10">
      {/* Dynamic Animated Mesh Gradients Backdrop */}
      <div className="absolute top-[-10%] left-[-15%] w-[80%] h-[70%] rounded-full bg-gradient-to-br from-primary/8 via-secondary/4 to-transparent blur-[160px] pointer-events-none animate-pulse duration-[8s]" />
      <div className="absolute top-[30%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-accent-soft via-primary/5 to-transparent blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-20%] w-[70%] h-[60%] rounded-full bg-gradient-to-tr from-secondary/5 via-[#ff9b84]/5 to-transparent blur-[160px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 z-[-2] pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(var(--foreground) 1px, transparent 1px)`,
          backgroundSize: "24px 24px"
        }}
      />

      <Navbar />
      <Hero />
      <Showcase />
      <Features />
      <CTA />
      <FAQ />
      <Footer />
    </div>
  );
}

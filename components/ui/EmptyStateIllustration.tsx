"use client";
import React from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateIllustrationProps {
  icon: LucideIcon;
}

export function EmptyStateIllustration({ icon: Icon }: EmptyStateIllustrationProps) {
  return (
    <div className="relative size-24 mx-auto mb-5 flex items-center justify-center select-none pointer-events-none">
      {/* Overlapping plate 1: Primary Accent */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute inset-1 rounded-[38%] bg-gradient-to-tr from-primary/15 via-primary/5 to-transparent blur-[1px] opacity-90"
      />

      {/* Overlapping plate 2: Secondary Accent */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-2 rounded-[32%] bg-gradient-to-bl from-secondary/15 via-secondary/5 to-transparent blur-[1px] opacity-80"
      />

      {/* Ambient background glow */}
      <div className="absolute size-14 rounded-full bg-primary/8 blur-md" />

      {/* Center card containing the main icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="relative size-12.5 rounded-2xl bg-surface border border-border/80 shadow-[var(--shadow-md)] flex items-center justify-center text-primary z-10 backdrop-blur-xs"
      >
        <Icon size={20} className="shrink-0" />
      </motion.div>
    </div>
  );
}

"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { pageVariants, useMotionVariants } from "@/lib/motion";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  const shouldReduceMotion = useReducedMotion();
  const variants = useMotionVariants(pageVariants, !!shouldReduceMotion);

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}

"use client";

import { Variants } from "framer-motion";

/**
 * Standard motion transition presets
 */
export const transitions = {
  default: { duration: 0.2, ease: "easeOut" },
  spring: { type: "spring", stiffness: 380, damping: 30 },
  stagger: { staggerChildren: 0.04, delayChildren: 0.02 },
} as const;

/**
 * Page route entry animation variants
 */
export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.default
  },
  exit: { 
    opacity: 0, 
    y: -8,
    transition: { duration: 0.15, ease: "easeIn" }
  }
};

/**
 * Modal / Dialog animate overlay variants
 */
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: transitions.spring
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.15, ease: "easeIn" }
  }
};

/**
 * Floating Search / Command palette scale-in animation variants
 */
export const searchPaletteVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: -4 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.18, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    scale: 0.97, 
    y: -4,
    transition: { duration: 0.12, ease: "easeIn" }
  }
};

/**
 * Stagger Container animation variants
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.stagger,
  },
};

/**
 * Stagger Item animation variants (used with staggerContainer)
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.default
  },
};

/**
 * Animate card lift hover transition variants
 */
export const cardHoverVariants: Variants = {
  rest: { y: 0, boxShadow: "var(--shadow-sm)" },
  hover: { 
    y: -2, 
    boxShadow: "var(--shadow-md)",
    transition: { duration: 0.15, ease: "easeOut" }
  }
};

/**
 * Returns variants with transitions disabled if prefers-reduced-motion is requested.
 */
export function useMotionVariants(variants: Variants, reduced: boolean): Variants {
  if (!reduced) return variants;

  // Clone variants and strip animations / transform changes for reduced motion
  const cleanVariants: Variants = {};
  for (const key in variants) {
    if (Object.prototype.hasOwnProperty.call(variants, key)) {
      const state = variants[key];
      if (typeof state === "object" && state !== null) {
        cleanVariants[key] = {
          ...state,
          y: 0,
          x: 0,
          scale: 1,
          transition: { duration: 0.01 } // instant
        };
      } else {
        cleanVariants[key] = state;
      }
    }
  }
  return cleanVariants;
}

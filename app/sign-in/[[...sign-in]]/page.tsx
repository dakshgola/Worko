"use client";

import { SignIn } from "@clerk/nextjs";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Mesh Gradients Backdrop */}
      <div className="absolute top-[-10%] left-[-15%] w-[80%] h-[60%] rounded-full bg-gradient-to-br from-primary/8 via-secondary/4 to-transparent blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-accent-soft via-primary/5 to-transparent blur-[160px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.02] dark:opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(var(--foreground) 1px, transparent 1px)`,
          backgroundSize: "24px 24px"
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center w-full max-w-md"
      >
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-[#ff7d5e] text-white shadow-sm ring-1 ring-white/20">
            <Zap size={15} fill="currentColor" />
          </div>
          <span className="text-h3 text-foreground font-black tracking-tight">Worko</span>
        </div>

        {/* Clerk Sign In component */}
        <SignIn
          forceRedirectUrl="/auth/callback"
          appearance={{
            variables: {
              colorPrimary: "#FF5A36",
              colorBackground: "var(--surface)",
              colorText: "var(--foreground)",
              colorTextSecondary: "var(--muted)",
              colorInputBackground: "var(--background)",
              colorInputText: "var(--foreground)",
              colorBorder: "var(--border)",
              borderRadius: "16px",
              fontFamily: "var(--font-sans)",
            },
            elements: {
              card: "border border-border shadow-xl rounded-2xl bg-surface",
              headerTitle: "text-h3 font-black text-foreground",
              headerSubtitle: "text-caption text-muted font-semibold",
              socialButtonsIconButton: "border border-border hover:bg-hover-overlay rounded-xl",
              formButtonPrimary: "btn-primary font-bold shadow-md hover:bg-primary-hover transition-colors rounded-xl h-10 text-btn",
              formFieldInput: "input-cozy h-10 border border-border bg-background text-input-val rounded-xl",
              footerActionText: "text-caption text-muted font-semibold",
              footerActionLink: "text-primary hover:text-primary-hover hover:underline transition-colors font-bold",
            }
          }}
        />
      </motion.div>
    </main>
  );
}

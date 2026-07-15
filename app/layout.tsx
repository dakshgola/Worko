import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeSync } from "@/components/ThemeSync";

export const metadata: Metadata = {
  title: "Worko — Creative Workspace",
  description: "A cozy workspace for notes, tasks, ideas, and whiteboards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#EC4899',
        },
        elements: {
          card: 'border-[var(--border-thick)] border-black dark:border-white shadow-brutal-md rounded-card bg-brutal-white font-display',
          headerTitle: 'text-foreground font-display font-extrabold text-xl',
          headerSubtitle: 'text-muted font-sans font-medium',
          socialButtonsBlockButton: 'bg-brutal-white hover:bg-hover-overlay border-[var(--border-thick)] border-black dark:border-white text-foreground shadow-brutal-sm font-display font-bold transition-all',
          formButtonPrimary: 'btn-primary bg-brutal-pink text-black font-display font-bold shadow-brutal-sm hover:shadow-brutal-md rounded-pill transition-all',
          formFieldLabel: 'text-foreground font-display font-bold',
          formFieldInput: 'border-[var(--border-thick)] border-black dark:border-white bg-brutal-white text-foreground focus:border-brutal-pink focus:ring-0 focus-visible:outline-none transition-all',
          footerActionText: 'text-muted font-semibold',
          footerActionLink: 'text-brutal-pink hover:underline font-display font-bold',
        }
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ThemeSync />
            {children}
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

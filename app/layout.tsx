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
    <ClerkProvider>
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

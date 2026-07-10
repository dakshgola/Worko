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
          colorPrimary: '#FF5A36',
        },
        elements: {
          card: 'bg-surface border border-border shadow-md',
          headerTitle: 'text-foreground font-bold',
          headerSubtitle: 'text-muted',
          socialButtonsBlockButton: 'bg-background hover:bg-hover-overlay border border-border text-foreground',
          formButtonPrimary: 'btn-primary bg-[#FF5A36] hover:bg-[#E04825] text-white',
          formFieldLabel: 'text-foreground font-semibold',
          formFieldInput: 'input-cozy bg-background text-foreground border-border',
          footerActionText: 'text-muted',
          footerActionLink: 'text-primary hover:text-primary-hover font-bold',
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

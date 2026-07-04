"use client";

import React, { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function CalendarError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="size-16 rounded-full bg-danger-soft text-danger flex items-center justify-center mb-6">
        <AlertCircle size={32} />
      </div>
      <h2 className="text-h2 font-extrabold text-foreground mb-2">Something went wrong</h2>
      <p className="text-body text-muted max-w-md mb-8">
        We encountered an error loading your calendar schedules.
      </p>
      <button
        onClick={() => reset()}
        className="btn-primary h-11 px-6 gap-2"
      >
        <RotateCcw size={16} />
        Retry Loading
      </button>
    </div>
  );
}

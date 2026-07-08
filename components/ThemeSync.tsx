"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { getUserPreferences } from "@/lib/settings/actions";

export function ThemeSync() {
  const { setTheme } = useTheme();

  useEffect(() => {
    async function sync() {
      try {
        const prefs = await getUserPreferences();
        if (prefs && prefs.theme) {
          setTheme(prefs.theme);
        }
      } catch (err) {
        // Logged-out users or fetch failure - ignore
      }
    }
    sync();
  }, [setTheme]);

  return null;
}

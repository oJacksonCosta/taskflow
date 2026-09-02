"use client";

import { ReactNode } from "react";

// Libraries
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
};

export const useTheme = () => {
  const { theme, setTheme, systemTheme } = useNextTheme();

  return {
    theme,
    setTheme,
    systemTheme,
    toggleTheme: () => setTheme(theme === "light" ? "dark" : "light"),
  };
};

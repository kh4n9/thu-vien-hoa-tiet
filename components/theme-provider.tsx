"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Store đơn giản: giá trị theme hiện tại + danh sách subscriber.
let current: Theme = "light";
let hydrated = false;
const listeners = new Set<() => void>();

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function apply(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// Được gọi trên client sau hydrate — đọc giá trị thật từ localStorage/hệ thống.
function getSnapshot(): Theme {
  if (!hydrated && typeof window !== "undefined") {
    hydrated = true;
    const stored = localStorage.getItem("theme");
    current = stored === "dark" || stored === "light" ? stored : systemTheme();
  }
  return current;
}

// Giá trị dùng lúc SSR + hydrate — luôn "light" để server/client khớp nhau.
function getServerSnapshot(): Theme {
  return "light";
}

function toggle() {
  current = current === "dark" ? "light" : "dark";
  localStorage.setItem("theme", current);
  apply(current);
  listeners.forEach((listener) => listener());
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Cập nhật class trên <html> khi theme thay đổi (DOM side-effect, không setState).
  useEffect(() => {
    apply(theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(() => ({ theme, toggle }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme phải dùng bên trong ThemeProvider");
  return ctx;
}

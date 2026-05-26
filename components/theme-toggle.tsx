"use client";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

/**
 * SSR-safe "is this rendering on the client?" hook. Returns false during the
 * server render and the initial hydration pass, then true once we're firmly
 * on the client. Uses useSyncExternalStore to avoid React 19's no-setState-in-
 * effect lint rule.
 */
const subscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

/**
 * Inline sun/moon icons. Kept local to avoid pulling a full icon library for
 * a single button. Stroke uses currentColor so the icon inherits the button
 * foreground colour automatically.
 */
function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/**
 * Header-mounted button that flips the editor chrome between light and dark.
 * Uses next-themes (resolvedTheme) so the system-preference default resolves
 * correctly on first render without flashing. Hidden until mounted to avoid
 * an SSR/CSR mismatch on the icon.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const next = isDark ? "light" : "dark";
  const label = mounted ? `Switch to ${next} theme` : "Toggle theme";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
    >
      {mounted ? (isDark ? <SunIcon /> : <MoonIcon />) : <span className="w-4 h-4" />}
    </Button>
  );
}

"use client";

/** Placeholder for the future layers panel with tree navigation. */
export function LayersTab() {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.5">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-medium">Layer navigation</span>
        <span className="text-[11px] text-muted-foreground/60">Coming soon</span>
      </div>
    </div>
  );
}

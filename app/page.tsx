"use client";
import { ExportModal } from "@/components/export-modal";
import { PasteInput } from "@/components/paste-input";
import { PreviewCanvas } from "@/components/preview-canvas";
import { PropertiesPanel } from "@/components/properties-panel";
import { StarterBrowser } from "@/components/starter-browser";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import { useState } from "react";

/**
 * Top-level editor page. Composes the three-pane layout: code editor (left),
 * live preview (center), and tabbed properties panel (right). Global controls
 * for animation/speed/color now live inside the properties panel's Animation
 * tab instead of a separate bar.
 */
export default function Home() {
  useKeyboardShortcuts();
  const [exportOpen, setExportOpen] = useState(false);
  const [startersOpen, setStartersOpen] = useState(false);
  const tree = useSkeletonStore((s) => s.tree);
  const componentName = useSkeletonStore((s) => s.componentName);
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-4 py-2.5 border-b">
        <div className="flex items-center gap-2.5">
          <div className="size-6 rounded-full bg-primary flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="1" width="4" height="4" rx="0.5" fill="white" />
              <rect x="7" y="1" width="4" height="4" rx="0.5" fill="white" opacity="0.5" />
              <rect x="1" y="7" width="4" height="4" rx="0.5" fill="white" opacity="0.5" />
              <rect x="7" y="7" width="4" height="4" rx="0.5" fill="white" opacity="0.3" />
            </svg>
          </div>
          <span className="text-sm font-semibold">Skeleton Studio</span>
          <span className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 font-mono">
            1.4
          </span>
        </div>
        {componentName && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>{componentName}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            onClick={() => setExportOpen(true)}
            disabled={!tree}
            size="sm"
            className="bg-primary text-primary-foreground"
          >
            Export
          </Button>
        </div>
      </header>
      <main className="flex flex-1 min-h-0 relative">
        <section className="w-105 border-r flex flex-col min-h-0 shrink-0 relative">
          <PasteInput onBrowseStarters={() => setStartersOpen(true)} />
          {startersOpen && (
            <StarterBrowser onClose={() => setStartersOpen(false)} />
          )}
        </section>
        <section className="flex-1 min-h-0 flex flex-col">
          <PreviewCanvas />
        </section>
        <PropertiesPanel />
      </main>
      {exportOpen && <ExportModal onClose={() => setExportOpen(false)} />}
    </div>
  );
}

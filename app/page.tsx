"use client";
import { ExampleSnippets } from "@/components/example-snippets";
import { ExportModal } from "@/components/export-modal";
import { GlobalControls } from "@/components/global-controls";
import { PasteInput } from "@/components/paste-input";
import { PreviewCanvas } from "@/components/preview-canvas";
import { PropertiesPanel } from "@/components/properties-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import { useState } from "react";

/**
 * Top-level editor page. Composes the paste input, preview canvas, properties
 * panel, global controls, example loader, and export modal into the three-pane
 * layout described in the PRD. State lives in the Zustand store; this page is
 * pure composition.
 */
export default function Home() {
  const [exportOpen, setExportOpen] = useState(false);
  const tree = useSkeletonStore((s) => s.tree);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold">Skeleton Generator</span>
          <ExampleSnippets />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            onClick={() => setExportOpen(true)}
            disabled={!tree}
            size="sm"
          >
            Export
          </Button>
        </div>
      </header>
      <GlobalControls />
      <main className="flex flex-1 min-h-0">
        <section className="w-[420px] p-4 border-r flex flex-col min-h-0 shrink-0">
          <PasteInput />
        </section>
        <section className="flex-1 p-4 min-h-0 flex">
          <PreviewCanvas />
        </section>
        <PropertiesPanel />
      </main>
      {exportOpen && <ExportModal onClose={() => setExportOpen(false)} />}
    </div>
  );
}

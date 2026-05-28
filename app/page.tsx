"use client";
import { ExportModal } from "@/components/export-modal";
import { PasteInput } from "@/components/paste-input";
import { PreviewCanvas } from "@/components/preview-canvas";
import { PropertiesPanel } from "@/components/properties-panel";
import { ShortcutsModal } from "@/components/shortcuts-modal";
import { StarterBrowser } from "@/components/starter-browser";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { ProjectVersion } from "@/lib/globalConstant";
import { cn } from "@/lib/utils";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import { useState } from "react";

type MobilePane = "input" | "preview" | "properties";

const PANE_TABS: { id: MobilePane; label: string }[] = [
  { id: "input", label: "Input" },
  { id: "preview", label: "Preview" },
  { id: "properties", label: "Design" },
];

/**
 * Top-level editor page. Composes the three-pane layout: code editor (left),
 * live preview (center), and tabbed properties panel (right). Below `lg`
 * (1024px), panes stack vertically with a segment switcher so the tool
 * remains usable on tablets and smaller laptops.
 */
export default function Home() {
  useKeyboardShortcuts();
  const [exportOpen, setExportOpen] = useState(false);
  const [startersOpen, setStartersOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [mobilePane, setMobilePane] = useState<MobilePane>("preview");
  const tree = useSkeletonStore((s) => s.tree);
  const componentName = useSkeletonStore((s) => s.componentName);
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b gap-2">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="size-6 rounded-full bg-primary flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="1" width="4" height="4" rx="0.5" fill="white" />
              <rect
                x="7"
                y="1"
                width="4"
                height="4"
                rx="0.5"
                fill="white"
                opacity="0.5"
              />
              <rect
                x="1"
                y="7"
                width="4"
                height="4"
                rx="0.5"
                fill="white"
                opacity="0.5"
              />
              <rect
                x="7"
                y="7"
                width="4"
                height="4"
                rx="0.5"
                fill="white"
                opacity="0.3"
              />
            </svg>
          </div>
          <span className="text-sm font-semibold hidden sm:inline">
            Skeleton Studio
          </span>
          <span className="text-[11px] text-muted-foreground border border-border rounded px-1.5 py-0.5 font-mono">
            {ProjectVersion}
          </span>
        </div>
        {componentName && (
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
            <span className="truncate">{componentName}</span>
          </div>
        )}
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShortcutsOpen(true)}
            title="Keyboard shortcuts"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M8 16h.01M6 12v.01M6 16v.01M10 16h.01M14 16h.01" />
            </svg>
          </Button>
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

      <main className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Mobile pane switcher — visible only below lg */}
        <div className="flex lg:hidden items-center border-b shrink-0 bg-muted/30">
          {PANE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMobilePane(tab.id)}
              className={cn(
                "flex-1 py-2 text-xs font-medium transition-colors relative",
                "focus-visible:outline-2 focus-visible:outline-ring",
                mobilePane === tab.id
                  ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Input pane */}
        <section
          className={cn(
            "border-r border-border flex flex-col min-h-0 relative",
            "lg:w-105 lg:flex lg:shrink-0",
            mobilePane === "input" ? "flex flex-1" : "hidden lg:flex",
          )}
        >
          <PasteInput onBrowseStarters={() => setStartersOpen(true)} />
          {startersOpen && (
            <StarterBrowser onClose={() => setStartersOpen(false)} />
          )}
        </section>

        {/* Preview pane */}
        <section
          className={cn(
            "min-h-0 flex flex-col",
            "lg:flex-1 lg:flex",
            mobilePane === "preview" ? "flex flex-1" : "hidden lg:flex",
          )}
        >
          <PreviewCanvas />
        </section>

        {/* Properties pane */}
        <section
          className={cn(
            "border-l border-border flex flex-col min-h-0",
            "lg:w-72 lg:flex",
            mobilePane === "properties" ? "flex flex-1" : "hidden lg:flex",
          )}
        >
          <PropertiesPanel />
        </section>
      </main>
      {exportOpen && <ExportModal onClose={() => setExportOpen(false)} />}
      {shortcutsOpen && (
        <ShortcutsModal onClose={() => setShortcutsOpen(false)} />
      )}
    </div>
  );
}

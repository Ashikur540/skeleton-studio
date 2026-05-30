"use client";
import { PasteInput } from "@/components/paste-input";
import { PreviewCanvas } from "@/components/preview-canvas";
import { PropertiesPanel } from "@/components/properties-panel";
import { StarterBrowser } from "@/components/starter-browser";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { cn } from "@/lib/utils";
import { useState } from "react";

type MobilePane = "input" | "preview" | "properties";

const PANE_TABS: { id: MobilePane; label: string }[] = [
  { id: "input", label: "Input" },
  { id: "preview", label: "Preview" },
  { id: "properties", label: "Design" },
];

export default function AppPage() {
  useKeyboardShortcuts({ onBrowseStarters: () => setStartersOpen(true) });
  const [startersOpen, setStartersOpen] = useState(false);
  const [mobilePane, setMobilePane] = useState<MobilePane>("preview");

  return (
    <main className="flex flex-col lg:flex-row flex-1 min-h-0">
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

      <section
        className={cn(
          "min-h-0 flex flex-col",
          "lg:flex-1 lg:flex",
          mobilePane === "preview" ? "flex flex-1" : "hidden lg:flex",
        )}
      >
        <PreviewCanvas />
      </section>

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
  );
}

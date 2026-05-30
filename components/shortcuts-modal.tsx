"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { useMemo } from "react";

type ShortcutItem = { desc: string } & ({ mac: string; win: string } | { keys: string });

const SHORTCUT_GROUPS: { title: string; items: ShortcutItem[] }[] = [
  {
    title: "General",
    items: [
      { mac: "⌘ K", win: "Ctrl+K", desc: "Browse starters" },
      { mac: "⌘ ↵", win: "Ctrl+Enter", desc: "Generate skeleton" },
      { mac: "⌘ Z", win: "Ctrl+Z", desc: "Undo" },
      { mac: "⌘ ⇧ Z", win: "Ctrl+Shift+Z", desc: "Redo" },
    ],
  },
  {
    title: "Selection",
    items: [
      { keys: "Click", desc: "Select node" },
      { keys: "Esc", desc: "Deselect" },
      { keys: "Delete", desc: "Hide selected node" },
    ],
  },
  {
    title: "Resize",
    items: [
      { keys: "← →", desc: "Width ±1px" },
      { keys: "↑ ↓", desc: "Height ±1px" },
      { mac: "⇧ Arrow", win: "Shift+Arrow", desc: "Nudge ±10px" },
    ],
  },
  {
    title: "Scrub",
    items: [
      { keys: "Drag prefix", desc: "Adjust value ±1" },
      { mac: "⇧ Drag", win: "Shift+Drag", desc: "Adjust value ±10" },
    ],
  },
];

function isMac(): boolean {
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

function getKey(item: ShortcutItem, mac: boolean): string {
  if ("keys" in item) return item.keys;
  return mac ? item.mac : item.win;
}

/**
 * Modal overlay listing all keyboard shortcuts organized by category. Detects
 * the user's platform and shows the correct modifier keys (⌘ on macOS,
 * Ctrl on Windows/Linux).
 */
export function ShortcutsModal({ onClose }: { onClose: () => void }) {
  const mac = useMemo(() => isMac(), []);

  return (
    <Dialog open={true} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg!">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-2">
              <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
                {group.title}
              </span>
              {group.items.map((item) => (
                <div key={item.desc} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.desc}</span>
                  <Kbd>{getKey(item, mac)}</Kbd>
                </div>
              ))}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

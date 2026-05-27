"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";

const SHORTCUT_GROUPS = [
  {
    title: "General",
    items: [
      { keys: "⌘ K", desc: "Browse starters" },
      { keys: "⌘ ↵", desc: "Generate skeleton" },
      { keys: "⌘ Z", desc: "Undo" },
      { keys: "⌘ ⇧ Z", desc: "Redo" },
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
      { keys: "⇧ Arrow", desc: "Nudge ±10px" },
    ],
  },
  {
    title: "Scrub",
    items: [
      { keys: "Drag prefix", desc: "Adjust value ±1" },
      { keys: "⇧ Drag", desc: "Adjust value ±10" },
    ],
  },
];

/**
 * Modal overlay listing all keyboard shortcuts organized by category. Opened
 * by the keyboard icon button at the bottom-right of the properties panel.
 */
export function ShortcutsModal({ onClose }: { onClose: () => void }) {
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
                <div key={item.keys} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.desc}</span>
                  <Kbd>{item.keys}</Kbd>
                </div>
              ))}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

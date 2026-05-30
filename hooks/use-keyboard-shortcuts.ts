"use client";
import { findNode } from "@/lib/ir/helpers";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import { useEffect } from "react";

/**
 * Global keyboard shortcut listener. Mounted once from the root page
 * component. Uses `getState()` for fire-and-forget calls so the effect
 * doesn't re-subscribe on every store change.
 *
 * Shortcuts:
 * - Cmd/Ctrl+Z → undo (skipped inside CodeMirror)
 * - Cmd/Ctrl+Shift+Z → redo (skipped inside CodeMirror)
 * - Cmd/Ctrl+K → browse starters/templates
 * - Cmd/Ctrl+Enter → generate skeleton
 * - Delete/Backspace → hide selected node (skipped in inputs)
 * - Arrow keys → nudge width/height ±1 (Shift ±10, skipped in inputs)
 */
export function useKeyboardShortcuts({
  onBrowseStarters,
}: {
  onBrowseStarters?: () => void;
} = {}): void {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === "z") {
        if (isInsideCodeMirror(e.target)) return;
        e.preventDefault();
        const store = useSkeletonStore.getState();
        if (e.shiftKey) store.redo();
        else store.undo();
        return;
      }

      if (mod && e.key === "k") {
        e.preventDefault();
        onBrowseStarters?.();
        return;
      }

      if (mod && e.key === "Enter") {
        e.preventDefault();
        useSkeletonStore.getState().parseNow();
        return;
      }

      if (isInsideInput(e.target)) return;

      const store = useSkeletonStore.getState();
      const { selectedId, tree } = store;

      if (e.key === "Escape") {
        e.preventDefault();
        store.selectNode(null);
        return;
      }

      if (!selectedId || !tree) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        store.patchNode(selectedId, { visible: false });
        return;
      }

      const node = findNode(tree, selectedId);
      if (!node) return;

      const step = e.shiftKey ? 10 : 1;

      switch (e.key) {
        case "ArrowRight":
          if (node.width === "full") return;
          e.preventDefault();
          store.patchNode(selectedId, {
            width: Math.max(8, (typeof node.width === "number" ? node.width : 0) + step),
          });
          break;
        case "ArrowLeft":
          if (node.width === "full") return;
          e.preventDefault();
          store.patchNode(selectedId, {
            width: Math.max(8, (typeof node.width === "number" ? node.width : 0) - step),
          });
          break;
        case "ArrowDown":
          e.preventDefault();
          store.patchNode(selectedId, {
            height: Math.max(4, (node.height ?? 0) + step),
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          store.patchNode(selectedId, {
            height: Math.max(4, (node.height ?? 0) - step),
          });
          break;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
}

function isInsideCodeMirror(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.closest(".cm-editor") !== null;
}

/**
 * True when focus is inside an input, textarea, select, CodeMirror, or an
 * open Radix popover/listbox. Node shortcuts (delete, arrows) must not
 * fire when user is interacting with form controls or dropdown menus.
 */
function isInsideInput(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.closest(".cm-editor")) return true;
  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  const role = target.getAttribute("role");
  if (role === "combobox" || role === "listbox" || role === "option") return true;
  if (target.closest("[role=listbox]") || target.closest("[role=dialog]")) return true;
  return false;
}

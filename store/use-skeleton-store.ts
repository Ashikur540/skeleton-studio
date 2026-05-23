"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mutateNode } from "@/lib/ir/helpers";
import type {
  GlobalSettings,
  ParseError,
  SkeletonNode,
} from "@/lib/ir/types";
import { parseComponent } from "@/lib/parser/parse-component";

/**
 * Runtime state of the skeleton editor session. Holds the raw JSX source, the
 * parsed IR tree, the most recent parse error (if any), which node the user
 * has clicked, and the global render settings that feed both preview and export.
 */
type State = {
  source: string;
  tree: SkeletonNode | null;
  error: ParseError | null;
  selectedId: string | null;
  settings: GlobalSettings;
};

/**
 * Mutating operations exposed alongside State. setSource records live edits;
 * parseNow re-runs the parser on the current source; selectNode tracks the
 * active UI selection; patchNode applies a partial update to a single IR node;
 * setSettings merges a global settings patch; reset returns to the blank slate.
 */
type Actions = {
  setSource: (s: string) => void;
  parseNow: () => void;
  selectNode: (id: string | null) => void;
  patchNode: (id: string, patch: Partial<SkeletonNode>) => void;
  setSettings: (patch: Partial<GlobalSettings>) => void;
  reset: () => void;
};

/**
 * Initial render settings applied on first load and restored after a full reset.
 * Represents the most neutral, universally legible configuration for first-time
 * users — light theme, zinc palette, pulse animation at normal speed.
 */
const DEFAULT_SETTINGS: GlobalSettings = {
  animation: "pulse",
  speed: "normal",
  baseColor: "bg-zinc-200",
  theme: "light",
};

/**
 * Single Zustand store powering the entire skeleton editor. Combines all state
 * slices and action creators into one hook so components never import more than
 * one store. Persists source, tree, and settings to localStorage under a versioned
 * key so the user's work survives a page refresh without manual save.
 */
export const useSkeletonStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      source: "",
      tree: null,
      error: null,
      selectedId: null,
      settings: DEFAULT_SETTINGS,

      setSource: (s) => set({ source: s }),

      parseNow: () => {
        const { source } = get();
        if (!source.trim()) {
          set({ tree: null, error: null, selectedId: null });
          return;
        }
        const result = parseComponent(source);
        if (result.ok) {
          set({ tree: result.tree, error: null, selectedId: null });
        } else {
          set({ tree: null, error: result.error, selectedId: null });
        }
      },

      selectNode: (id) => set({ selectedId: id }),

      patchNode: (id, patch) => {
        const { tree } = get();
        if (!tree) return;
        set({ tree: mutateNode(tree, id, patch) });
      },

      setSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      reset: () =>
        set({
          source: "",
          tree: null,
          error: null,
          selectedId: null,
          settings: DEFAULT_SETTINGS,
        }),
    }),
    {
      name: "skeleton-generator-v1",
      partialize: (s) => ({
        source: s.source,
        tree: s.tree,
        settings: s.settings,
      }),
    },
  ),
);

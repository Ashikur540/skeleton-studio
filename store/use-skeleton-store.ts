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
 * parseNow re-runs the parser on the supplied or current source; selectNode
 * tracks active selection; patchNode applies a partial update to a single IR
 * node; setSettings merges a global settings patch; reset returns to the blank
 * slate AND clears persisted state.
 */
type Actions = {
  setSource: (s: string) => void;
  parseNow: (sourceOverride?: string) => void;
  selectNode: (id: string | null) => void;
  patchNode: (id: string, patch: Partial<SkeletonNode>) => void;
  setSettings: (patch: Partial<GlobalSettings>) => void;
  reset: () => void;
};

/**
 * Initial render settings applied on first load and restored after a full reset.
 * Pulse animation, neutral zinc palette, light preview background — the most
 * universally legible defaults for a first paint.
 */
const DEFAULT_SETTINGS: GlobalSettings = {
  animation: "pulse",
  speed: "normal",
  baseColor: "bg-zinc-200",
};

/**
 * Single Zustand store powering the entire skeleton editor. Only `source` and
 * `settings` are persisted to localStorage — the tree is intentionally recomputed
 * from source on rehydrate so parser/schema changes never strand stale IR data.
 * The persist key is versioned so bumping it invalidates incompatible storage.
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

      parseNow: (sourceOverride) => {
        const source = sourceOverride ?? get().source;
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

      reset: () => {
        set({
          source: "",
          tree: null,
          error: null,
          selectedId: null,
          settings: DEFAULT_SETTINGS,
        });
      },
    }),
    {
      name: "skeleton-generator-v2",
      partialize: (s) => ({
        source: s.source,
        settings: s.settings,
      }),
      onRehydrateStorage: () => (state) => {
        // After persist restores source + settings, rebuild the tree by parsing
        // the source. Guarantees the tree always matches the current parser
        // version rather than a stale shape from a previous schema.
        if (state && state.source.trim()) {
          state.parseNow();
        }
      },
    },
  ),
);

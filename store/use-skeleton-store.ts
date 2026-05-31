"use client";
import { mutateNode } from "@/lib/ir/helpers";
import type { GlobalSettings, ParseError, SkeletonNode } from "@/lib/ir/types";
import { parseComponent } from "@/lib/parser/parse-component";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_HISTORY = 50;

/**
 * Runtime state of the skeleton editor session. Holds the raw JSX source, the
 * parsed IR tree, the most recent parse error (if any), which node the user
 * has clicked, global render settings, and an undo/redo history stack.
 */
type State = {
  source: string;
  tree: SkeletonNode | null;
  error: ParseError | null;
  selectedId: string | null;
  settings: GlobalSettings;
  history: SkeletonNode[];
  future: SkeletonNode[];
  componentName: string | null;
  lastEditedAt: number | null;
  parseVersion: number;
};

/**
 * Mutating operations exposed alongside State. `pushSnapshot` and
 * `patchNodeQuiet` support drag-based editing: push one snapshot at drag
 * start, then apply quiet patches (no history push) during the drag.
 */
type Actions = {
  setSource: (s: string) => void;
  parseNow: (sourceOverride?: string) => void;
  selectNode: (id: string | null) => void;
  patchNode: (id: string, patch: Partial<SkeletonNode>) => void;
  patchNodeQuiet: (id: string, patch: Partial<SkeletonNode>) => void;
  pushSnapshot: () => void;
  setSettings: (patch: Partial<GlobalSettings>) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
};

/**
 * Initial render settings applied on first load and restored after a full reset.
 */
const DEFAULT_SETTINGS: GlobalSettings = {
  animation: "pulse",
  speed: "normal",
  baseColor: "bg-zinc-200",
  cardBackground: "transparent",
};

/**
 * Single Zustand store powering the entire skeleton editor. Only `source` and
 * `settings` are persisted to localStorage — the tree is recomputed from
 * source on rehydrate so parser/schema changes never strand stale IR data.
 * History/future arrays are transient and excluded from persistence.
 */
export const useSkeletonStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      source: "",
      tree: null,
      error: null,
      selectedId: null,
      settings: DEFAULT_SETTINGS,
      history: [],
      future: [],
      componentName: null,
      lastEditedAt: null,
      parseVersion: 0,

      setSource: (s) => set({ source: s }),

      parseNow: (sourceOverride) => {
        const source = sourceOverride ?? get().source;
        if (!source.trim()) {
          set({ tree: null, error: null, selectedId: null, history: [], future: [], componentName: null });
          return;
        }
        const result = parseComponent(source);
        if (result.ok) {
          set({
            tree: result.tree,
            error: null,
            selectedId: null,
            history: [],
            future: [],
            componentName: result.componentName ?? null,
            parseVersion: get().parseVersion + 1,
          });
        } else {
          set({ tree: null, error: result.error, selectedId: null, history: [], future: [] });
        }
      },

      selectNode: (id) => set({ selectedId: id }),

      /* Direct edits from the properties panel — each change pushes to
         history so undo steps match individual field edits. */
      patchNode: (id, patch) => {
        const { tree, history } = get();
        if (!tree) return;
        const next = history.length >= MAX_HISTORY
          ? [...history.slice(1), tree]
          : [...history, tree];
        set({
          tree: mutateNode(tree, id, patch),
          history: next,
          future: [],
          lastEditedAt: Date.now(),
        });
      },

      /* Called every frame during drag — mutates the IR without touching
         history, so intermediate values don't clutter the undo stack. */
      patchNodeQuiet: (id, patch) => {
        const { tree } = get();
        if (!tree) return;
        set({ tree: mutateNode(tree, id, patch), lastEditedAt: Date.now() });
      },

      /* Called once at drag start. Pushes the current tree onto history so
         the entire drag gesture can be undone in one step. */
      pushSnapshot: () => {
        const { tree, history } = get();
        if (!tree) return;
        const next = history.length >= MAX_HISTORY
          ? [...history.slice(1), tree]
          : [...history, tree];
        set({ history: next, future: [] });
      },

      setSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      undo: () => {
        const { tree, history, future } = get();
        if (history.length === 0) return;
        const prev = history[history.length - 1];
        set({
          tree: prev,
          history: history.slice(0, -1),
          future: tree ? [tree, ...future] : future,
        });
      },

      redo: () => {
        const { tree, history, future } = get();
        if (future.length === 0) return;
        const next = future[0];
        set({
          tree: next,
          history: tree ? [...history, tree] : history,
          future: future.slice(1),
        });
      },

      reset: () => {
        set({
          source: "",
          tree: null,
          error: null,
          selectedId: null,
          settings: DEFAULT_SETTINGS,
          history: [],
          future: [],
          componentName: null,
          lastEditedAt: null,
          parseVersion: 0,
        });
      },
    }),
    {
      name: "skeleton-generator-v2",
      partialize: (s) => ({
        source: s.source,
        settings: s.settings,
      }),
      /* Merge persisted state with current defaults so older localStorage
         saves missing newer GlobalSettings fields (e.g. cardBackground)
         still hydrate cleanly with the default value. */
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>;
        return {
          ...current,
          ...p,
          settings: { ...DEFAULT_SETTINGS, ...(p.settings ?? {}) },
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state && state.source.trim()) {
          state.parseNow();
        }
      },
    },
  ),
);

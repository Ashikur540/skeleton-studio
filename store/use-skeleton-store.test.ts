import { describe, expect, it, beforeEach } from "vitest";
import { useSkeletonStore } from "./use-skeleton-store";
import type { SkeletonNode } from "@/lib/ir/types";

function makeTree(id: string, width: number): SkeletonNode {
  return {
    id,
    kind: "text",
    confidence: "high",
    visible: true,
    width,
    height: 16,
  };
}

function seedTree() {
  const tree = makeTree("root", 100);
  useSkeletonStore.setState({ tree, history: [], future: [] });
  return tree;
}

beforeEach(() => {
  useSkeletonStore.setState({
    source: "",
    tree: null,
    error: null,
    selectedId: null,
    settings: { animation: "pulse", speed: "normal", baseColor: "bg-zinc-200" },
    history: [],
    future: [],
  });
});

describe("patchNode (history)", () => {
  it("pushes current tree to history before mutating", () => {
    seedTree();
    useSkeletonStore.getState().patchNode("root", { width: 200 });

    const s = useSkeletonStore.getState();
    expect(s.tree?.width).toBe(200);
    expect(s.history).toHaveLength(1);
    expect(s.history[0].width).toBe(100);
  });

  it("clears future on new mutation", () => {
    seedTree();
    useSkeletonStore.getState().patchNode("root", { width: 200 });
    useSkeletonStore.getState().undo();
    expect(useSkeletonStore.getState().future).toHaveLength(1);

    useSkeletonStore.getState().patchNode("root", { width: 300 });
    expect(useSkeletonStore.getState().future).toHaveLength(0);
  });

  it("caps history at 50 entries", () => {
    seedTree();
    for (let i = 0; i < 55; i++) {
      useSkeletonStore.getState().patchNode("root", { width: i });
    }
    expect(useSkeletonStore.getState().history).toHaveLength(50);
  });
});

describe("patchNodeQuiet", () => {
  it("mutates tree without pushing to history", () => {
    seedTree();
    useSkeletonStore.getState().patchNodeQuiet("root", { width: 200 });

    const s = useSkeletonStore.getState();
    expect(s.tree?.width).toBe(200);
    expect(s.history).toHaveLength(0);
  });

  it("does not clear future", () => {
    seedTree();
    useSkeletonStore.getState().patchNode("root", { width: 200 });
    useSkeletonStore.getState().undo();
    expect(useSkeletonStore.getState().future).toHaveLength(1);

    useSkeletonStore.getState().patchNodeQuiet("root", { width: 300 });
    expect(useSkeletonStore.getState().future).toHaveLength(1);
  });
});

describe("pushSnapshot", () => {
  it("pushes current tree to history without mutating", () => {
    seedTree();
    useSkeletonStore.getState().pushSnapshot();

    const s = useSkeletonStore.getState();
    expect(s.tree?.width).toBe(100);
    expect(s.history).toHaveLength(1);
    expect(s.history[0].width).toBe(100);
  });

  it("clears future stack", () => {
    seedTree();
    useSkeletonStore.getState().patchNode("root", { width: 200 });
    useSkeletonStore.getState().undo();
    expect(useSkeletonStore.getState().future).toHaveLength(1);

    useSkeletonStore.getState().pushSnapshot();
    expect(useSkeletonStore.getState().future).toHaveLength(0);
  });

  it("no-ops when tree is null", () => {
    useSkeletonStore.getState().pushSnapshot();
    expect(useSkeletonStore.getState().history).toHaveLength(0);
  });
});

describe("undo", () => {
  it("restores previous tree and pushes current to future", () => {
    seedTree();
    useSkeletonStore.getState().patchNode("root", { width: 200 });
    useSkeletonStore.getState().undo();

    const s = useSkeletonStore.getState();
    expect(s.tree?.width).toBe(100);
    expect(s.history).toHaveLength(0);
    expect(s.future).toHaveLength(1);
    expect(s.future[0].width).toBe(200);
  });

  it("no-ops when history is empty", () => {
    seedTree();
    useSkeletonStore.getState().undo();

    const s = useSkeletonStore.getState();
    expect(s.tree?.width).toBe(100);
    expect(s.future).toHaveLength(0);
  });

  it("supports multiple sequential undos", () => {
    seedTree();
    useSkeletonStore.getState().patchNode("root", { width: 200 });
    useSkeletonStore.getState().patchNode("root", { width: 300 });
    useSkeletonStore.getState().patchNode("root", { width: 400 });

    useSkeletonStore.getState().undo();
    expect(useSkeletonStore.getState().tree?.width).toBe(300);
    useSkeletonStore.getState().undo();
    expect(useSkeletonStore.getState().tree?.width).toBe(200);
    useSkeletonStore.getState().undo();
    expect(useSkeletonStore.getState().tree?.width).toBe(100);
    useSkeletonStore.getState().undo();
    expect(useSkeletonStore.getState().tree?.width).toBe(100);
  });
});

describe("redo", () => {
  it("restores from future and pushes current to history", () => {
    seedTree();
    useSkeletonStore.getState().patchNode("root", { width: 200 });
    useSkeletonStore.getState().undo();
    useSkeletonStore.getState().redo();

    const s = useSkeletonStore.getState();
    expect(s.tree?.width).toBe(200);
    expect(s.history).toHaveLength(1);
    expect(s.future).toHaveLength(0);
  });

  it("no-ops when future is empty", () => {
    seedTree();
    useSkeletonStore.getState().redo();

    const s = useSkeletonStore.getState();
    expect(s.tree?.width).toBe(100);
    expect(s.history).toHaveLength(0);
  });

  it("supports undo-redo-undo round trip", () => {
    seedTree();
    useSkeletonStore.getState().patchNode("root", { width: 200 });
    useSkeletonStore.getState().undo();
    expect(useSkeletonStore.getState().tree?.width).toBe(100);
    useSkeletonStore.getState().redo();
    expect(useSkeletonStore.getState().tree?.width).toBe(200);
    useSkeletonStore.getState().undo();
    expect(useSkeletonStore.getState().tree?.width).toBe(100);
  });
});

describe("parseNow clears history", () => {
  it("clears history and future on successful parse", () => {
    seedTree();
    useSkeletonStore.getState().patchNode("root", { width: 200 });
    useSkeletonStore.getState().undo();
    expect(useSkeletonStore.getState().history).toHaveLength(0);
    expect(useSkeletonStore.getState().future).toHaveLength(1);

    useSkeletonStore.setState({
      source: "export default function X() { return <div />; }",
    });
    useSkeletonStore.getState().parseNow();

    const s = useSkeletonStore.getState();
    expect(s.history).toHaveLength(0);
    expect(s.future).toHaveLength(0);
  });

  it("clears on empty source", () => {
    seedTree();
    useSkeletonStore.getState().patchNode("root", { width: 200 });
    useSkeletonStore.setState({ source: "" });
    useSkeletonStore.getState().parseNow();

    expect(useSkeletonStore.getState().history).toHaveLength(0);
    expect(useSkeletonStore.getState().future).toHaveLength(0);
  });
});

describe("drag workflow (pushSnapshot + patchNodeQuiet)", () => {
  it("produces one undo entry for an entire drag sequence", () => {
    seedTree();

    useSkeletonStore.getState().pushSnapshot();
    useSkeletonStore.getState().patchNodeQuiet("root", { width: 110 });
    useSkeletonStore.getState().patchNodeQuiet("root", { width: 120 });
    useSkeletonStore.getState().patchNodeQuiet("root", { width: 130 });

    const s = useSkeletonStore.getState();
    expect(s.tree?.width).toBe(130);
    expect(s.history).toHaveLength(1);
    expect(s.history[0].width).toBe(100);

    useSkeletonStore.getState().undo();
    expect(useSkeletonStore.getState().tree?.width).toBe(100);
  });
});

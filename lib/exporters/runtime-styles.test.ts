import { describe, expect, it } from "vitest";
import { blockStyles } from "./runtime-styles";
import type { GlobalSettings, SkeletonNode } from "@/lib/ir/types";

const settings: GlobalSettings = {
  animation: "pulse",
  speed: "normal",
  baseColor: "bg-zinc-200",
};

function node(partial: Partial<SkeletonNode> & { kind: SkeletonNode["kind"] }): SkeletonNode {
  return {
    id: "test",
    confidence: "high",
    visible: true,
    ...partial,
  };
}

describe("blockStyles (container)", () => {
  it("returns empty styling for bare container with no children and no layout", () => {
    const r = blockStyles(node({ kind: "container" }), settings);
    expect(r.className).toBe("");
    expect(r.style).toEqual({});
  });

  it("uses explicit flex layout when provided", () => {
    const r = blockStyles(
      node({ kind: "container", layout: { direction: "row", gap: 16 } }),
      settings,
    );
    expect(r.className).toContain("flex");
    expect(r.className).toContain("flex-row");
    expect(r.style.gap).toBe(16);
  });

  it("defaults to flex-col with gap when container has children but no explicit layout", () => {
    const r = blockStyles(
      node({
        kind: "container",
        children: [node({ kind: "text", id: "a" })],
      }),
      settings,
    );
    expect(r.className).toContain("flex-col");
    expect(r.style.gap).toBe(8);
  });
});

describe("blockStyles (card wrapper)", () => {
  it("renders card with children as outlined padded flex-col, no fill animation", () => {
    const r = blockStyles(
      node({
        kind: "card",
        width: 320,
        radius: 12,
        children: [node({ kind: "text", id: "a" })],
      }),
      settings,
    );
    expect(r.className).toContain("flex-col");
    expect(r.className).toContain("ring-1");
    expect(r.className).not.toContain("animate-pulse");
    expect(r.className).not.toContain("bg-zinc-200");
    expect(r.style.paddingTop).toBe(16);
    expect(r.style.paddingRight).toBe(16);
    expect(r.style.paddingBottom).toBe(16);
    expect(r.style.paddingLeft).toBe(16);
    expect(r.style.gap).toBe(12);
    expect(r.style.width).toBe(320);
    expect(r.style.borderRadius).toBe(12);
  });

  it("renders leaf card as animated fill block", () => {
    const r = blockStyles(
      node({ kind: "card", width: 48, height: 48, radius: 9999 }),
      settings,
    );
    expect(r.className).toContain("bg-zinc-200");
    expect(r.className).toContain("animate-pulse");
    expect(r.style.width).toBe(48);
    expect(r.style.height).toBe(48);
    expect(r.style.borderRadius).toBe(9999);
  });
});

describe("blockStyles (flex layout)", () => {
  it("applies alignItems / justifyContent from layout", () => {
    const r = blockStyles(
      node({
        kind: "container",
        layout: {
          direction: "row",
          gap: 16,
          alignItems: "center",
          justifyContent: "between",
        },
        children: [node({ kind: "text", id: "a" })],
      }),
      settings,
    );
    expect(r.style.alignItems).toBe("center");
    expect(r.style.justifyContent).toBe("space-between");
  });

  it("applies flex-wrap from layout.wrap", () => {
    const r = blockStyles(
      node({
        kind: "container",
        layout: { direction: "row", wrap: true },
        children: [node({ kind: "text", id: "a" })],
      }),
      settings,
    );
    expect(r.style.flexWrap).toBe("wrap");
  });

  it("surface wrapper also honors alignment hints", () => {
    const r = blockStyles(
      node({
        kind: "container",
        appearance: "card",
        layout: { direction: "col", alignItems: "center" },
        children: [node({ kind: "text", id: "a" })],
      }),
      settings,
    );
    expect(r.style.alignItems).toBe("center");
  });
});

describe("blockStyles (visual-card container)", () => {
  it("container with appearance=card renders as surface wrapper", () => {
    const r = blockStyles(
      node({
        kind: "container",
        appearance: "card",
        radius: 16,
        children: [node({ kind: "text", id: "a" })],
      }),
      settings,
    );
    expect(r.className).toContain("ring-1");
    expect(r.className).toContain("flex-col");
    expect(r.style.borderRadius).toBe(16);
    expect(r.style.paddingTop).toBe(16);
  });

  it("plain container without appearance stays transparent", () => {
    const r = blockStyles(
      node({
        kind: "container",
        children: [node({ kind: "text", id: "a" })],
      }),
      settings,
    );
    expect(r.className).not.toContain("ring-1");
  });

  it("surface wrapper honors row layout direction from class hints", () => {
    const r = blockStyles(
      node({
        kind: "container",
        appearance: "card",
        layout: { direction: "row", gap: 24 },
        children: [node({ kind: "text", id: "a" })],
      }),
      settings,
    );
    expect(r.className).toContain("flex-row");
    expect(r.style.gap).toBe(24);
  });
});

describe("blockStyles (padding)", () => {
  it("applies per-side padding from node.padding on a container", () => {
    const r = blockStyles(
      node({
        kind: "container",
        padding: { top: 40, right: 24, bottom: 16, left: 24 },
        children: [node({ kind: "text", id: "a" })],
      }),
      settings,
    );
    expect(r.style.paddingTop).toBe(40);
    expect(r.style.paddingRight).toBe(24);
    expect(r.style.paddingBottom).toBe(16);
    expect(r.style.paddingLeft).toBe(24);
  });

  it("class-hint padding overrides card wrapper default per side", () => {
    const r = blockStyles(
      node({
        kind: "card",
        width: 320,
        children: [node({ kind: "text", id: "a" })],
        padding: { top: 0 },
      }),
      settings,
    );
    expect(r.style.paddingTop).toBe(0);
    expect(r.style.paddingBottom).toBe(16);
  });

  it("applies padding on a fill block (e.g. button with px-6)", () => {
    const r = blockStyles(
      node({
        kind: "button",
        width: 100,
        height: 40,
        padding: { left: 24, right: 24 },
      }),
      settings,
    );
    expect(r.style.paddingLeft).toBe(24);
    expect(r.style.paddingRight).toBe(24);
  });
});

describe("blockStyles (fill kinds)", () => {
  it("applies pulse animation by default", () => {
    const r = blockStyles(
      node({ kind: "text", width: 100, height: 16 }),
      settings,
    );
    expect(r.className).toContain("animate-pulse");
    expect(r.style.animationDuration).toBe("1.5s");
  });

  it("applies shimmer animation when settings.animation === shimmer", () => {
    const r = blockStyles(
      node({ kind: "text", width: 100, height: 16 }),
      { ...settings, animation: "shimmer" },
    );
    expect(r.className).toContain("bg-gradient-to-r");
    expect(r.style.animation).toMatch(/^shimmer 1\.5s/);
  });
});

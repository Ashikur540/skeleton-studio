import { describe, expect, it } from "vitest";
import { detectArchetypes } from "./archetype-detector";
import type { SkeletonNode } from "@/lib/ir/types";

/**
 * Build a minimal SkeletonNode for fixture purposes. Fields default to values
 * a fresh classifier output would carry; tests override only what they care
 * about so each case stays focused on one detection signal.
 */
function n(over: Partial<SkeletonNode>): SkeletonNode {
  return {
    id: over.id ?? Math.random().toString(36).slice(2),
    kind: over.kind ?? "container",
    confidence: over.confidence ?? "medium",
    visible: over.visible ?? true,
    ...over,
  };
}

describe("detectArchetypes (media-object)", () => {
  it("avatar + text stack matches media-object and centers row layout", () => {
    const root = n({
      kind: "container",
      layout: { direction: "row", gap: 12 },
      children: [
        n({ kind: "avatar", width: 48, height: 48, radius: 9999 }),
        n({
          kind: "container",
          layout: { direction: "col" },
          children: [
            n({ kind: "text", height: 16 }),
            n({ kind: "paragraph", height: 14 }),
          ],
        }),
      ],
    });
    detectArchetypes(root);
    expect(root.archetype).toBe("media-object");
    expect(root.layout?.alignItems).toBe("center");
  });

  it("small rounded card as first child still counts as media-object anchor", () => {
    const root = n({
      kind: "container",
      layout: { direction: "row", gap: 8 },
      children: [
        n({ kind: "card", width: 48, height: 48, radius: 9999 }),
        n({ kind: "text", height: 16 }),
      ],
    });
    detectArchetypes(root);
    expect(root.archetype).toBe("media-object");
  });

  it("no layout + avatar + text infers row direction", () => {
    const root = n({
      kind: "container",
      children: [
        n({ kind: "image", width: 100, height: 80 }),
        n({ kind: "text", height: 16 }),
      ],
    });
    detectArchetypes(root);
    expect(root.archetype).toBe("media-object");
    expect(root.layout?.direction).toBe("row");
  });

  it("avatar without trailing content does NOT match (single child)", () => {
    const root = n({
      kind: "container",
      children: [n({ kind: "avatar", width: 48, height: 48 })],
    });
    detectArchetypes(root);
    expect(root.archetype).toBeUndefined();
  });

  it("respects explicit gap from class hints — does not overwrite", () => {
    const root = n({
      kind: "container",
      layout: { direction: "row", gap: 4 },
      children: [
        n({ kind: "avatar", width: 48, height: 48, radius: 9999 }),
        n({ kind: "text", height: 16 }),
      ],
    });
    detectArchetypes(root);
    expect(root.layout?.gap).toBe(4);
  });
});

describe("detectArchetypes (form-field)", () => {
  it("text + input pair matches form-field with tight gap", () => {
    const root = n({
      kind: "container",
      children: [
        n({ kind: "text", height: 14, width: 80 }),
        n({ kind: "input", width: 240, height: 40 }),
      ],
    });
    detectArchetypes(root);
    expect(root.archetype).toBe("form-field");
    expect(root.layout?.gap).toBe(6);
  });

  it("three children (label + input + helper) is NOT form-field (FormItem hint covers it)", () => {
    const root = n({
      kind: "container",
      children: [
        n({ kind: "text", height: 14 }),
        n({ kind: "input", width: 200, height: 40 }),
        n({ kind: "text", height: 12 }),
      ],
    });
    detectArchetypes(root);
    expect(root.archetype).toBeUndefined();
  });
});

describe("detectArchetypes (hero)", () => {
  it("tall heading + paragraph at shallow depth matches hero", () => {
    const root = n({
      kind: "container",
      children: [
        n({ kind: "text", height: 32 }),
        n({ kind: "paragraph", height: 16 }),
        n({ kind: "button", width: 120, height: 40 }),
      ],
    });
    detectArchetypes(root);
    expect(root.archetype).toBe("hero");
    expect(root.layout?.gap).toBe(24);
  });

  it("hero requires heading >= 24px tall", () => {
    const root = n({
      kind: "container",
      children: [
        n({ kind: "text", height: 16 }),
        n({ kind: "paragraph", height: 14 }),
      ],
    });
    detectArchetypes(root);
    expect(root.archetype).toBeUndefined();
  });

  it("hero does NOT fire inside card surfaces", () => {
    const root = n({
      kind: "card",
      children: [
        n({ kind: "text", height: 28 }),
        n({ kind: "paragraph", height: 16 }),
      ],
    });
    detectArchetypes(root);
    expect(root.archetype).not.toBe("hero");
  });
});

describe("detectArchetypes (nav-bar)", () => {
  it("top-level row with button child matches nav-bar", () => {
    const root = n({
      kind: "container",
      layout: { direction: "row" },
      children: [
        n({ kind: "text", height: 20 }),
        n({ kind: "text", height: 16 }),
        n({ kind: "button", width: 100, height: 40 }),
      ],
    });
    detectArchetypes(root);
    expect(root.archetype).toBe("nav-bar");
    expect(root.layout?.justifyContent).toBe("between");
  });

  it("col-direction container is never a nav-bar", () => {
    const root = n({
      kind: "container",
      layout: { direction: "col" },
      children: [
        n({ kind: "text" }),
        n({ kind: "button", width: 100, height: 40 }),
      ],
    });
    detectArchetypes(root);
    expect(root.archetype).not.toBe("nav-bar");
  });
});

describe("detectArchetypes (card-grid)", () => {
  it("two card children with appearance=card matches card-grid", () => {
    const root = n({
      kind: "container",
      children: [
        n({ kind: "container", appearance: "card", children: [n({ kind: "text" })] }),
        n({ kind: "container", appearance: "card", children: [n({ kind: "text" })] }),
      ],
    });
    detectArchetypes(root);
    expect(root.archetype).toBe("card-grid");
    expect(root.layout?.wrap).toBe(true);
  });

  it("mixed children (card + text) do NOT match card-grid", () => {
    const root = n({
      kind: "container",
      children: [
        n({ kind: "card", width: 200, height: 100, children: [n({ kind: "text" })] }),
        n({ kind: "text" }),
      ],
    });
    detectArchetypes(root);
    expect(root.archetype).not.toBe("card-grid");
  });
});

describe("detectArchetypes (stat-tile)", () => {
  it("small label + tall metric inside a card matches stat-tile", () => {
    const root = n({
      kind: "card",
      children: [
        n({ kind: "text", height: 12, width: 80 }),
        n({ kind: "text", height: 32, width: 100 }),
      ],
    });
    detectArchetypes(root);
    expect(root.archetype).toBe("stat-tile");
  });

  it("two equal-height text children are NOT a stat-tile", () => {
    const root = n({
      kind: "card",
      children: [
        n({ kind: "text", height: 16 }),
        n({ kind: "text", height: 16 }),
      ],
    });
    detectArchetypes(root);
    expect(root.archetype).not.toBe("stat-tile");
  });
});

describe("detectArchetypes (pricing-card)", () => {
  it("title + list + cta in a card matches pricing-card", () => {
    const root = n({
      kind: "card",
      children: [
        n({ kind: "text", height: 24 }),
        n({ kind: "text", height: 40 }),
        n({
          kind: "container",
          layout: { direction: "col" },
          children: [n({ kind: "text" }), n({ kind: "text" }), n({ kind: "text" })],
        }),
        n({ kind: "button", width: 200, height: 40 }),
      ],
    });
    detectArchetypes(root);
    expect(root.archetype).toBe("pricing-card");
  });
});

describe("detectArchetypes (recursion + nesting)", () => {
  it("annotates nested matches independently", () => {
    const root = n({
      kind: "container",
      layout: { direction: "col" },
      children: [
        n({
          kind: "container",
          layout: { direction: "row" },
          children: [
            n({ kind: "avatar", width: 48, height: 48, radius: 9999 }),
            n({ kind: "text", height: 16 }),
          ],
        }),
        n({
          kind: "container",
          children: [
            n({ kind: "text", height: 14, width: 80 }),
            n({ kind: "input", width: 200, height: 40 }),
          ],
        }),
      ],
    });
    detectArchetypes(root);
    expect(root.children?.[0].archetype).toBe("media-object");
    expect(root.children?.[1].archetype).toBe("form-field");
  });

  it("fill-leaf nodes never get an archetype", () => {
    const leaf = n({ kind: "text", height: 16 });
    detectArchetypes(leaf);
    expect(leaf.archetype).toBeUndefined();
  });
});

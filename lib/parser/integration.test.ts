import { describe, expect, it } from "vitest";
import { parseComponent } from "./parse-component";
import { mutateNode } from "@/lib/ir/helpers";
import { EXAMPLE_SNIPPETS } from "@/lib/examples/snippets";

/**
 * End-to-end check that the parser + IR mutation flow produce the data the
 * UI relies on. If these pass but the page still looks blank in the browser,
 * the bug is in React rendering, not the data layer.
 */

describe("integration: snippets parse to renderable trees", () => {
  for (const snip of EXAMPLE_SNIPPETS) {
    it(`${snip.name} parses to a non-empty visible tree`, () => {
      const r = parseComponent(snip.source);
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      expect(r.tree.visible).toBe(true);
      const count = countRenderable(r.tree);
      expect(count).toBeGreaterThan(0);
    });
  }

  it("Profile Card avatar is a card (not invisible container)", () => {
    const profile = EXAMPLE_SNIPPETS.find((s) => s.id === "profile-card")!;
    const r = parseComponent(profile.source);
    if (!r.ok) throw new Error("profile parse failed");
    // tree.children[0] is the inner flex group; its first child is the avatar div.
    const innerGroup = r.tree.children![0];
    const avatar = innerGroup.children![0];
    expect(avatar.kind).toBe("card");
    expect(avatar.width).toBe(48);
    expect(avatar.height).toBe(48);
  });
});

describe("integration: mutateNode flows through the tree", () => {
  it("patching width on a deep node returns a new tree with the update applied", () => {
    const r = parseComponent(EXAMPLE_SNIPPETS[0].source);
    if (!r.ok) throw new Error("parse failed");
    const avatar = r.tree.children![0].children![0];
    const next = mutateNode(r.tree, avatar.id, { width: 200 });
    const newAvatar = next.children![0].children![0];
    expect(newAvatar.width).toBe(200);
    // Original tree must be untouched (immutability contract).
    expect(avatar.width).toBe(48);
  });
});

function countRenderable(node: { kind: string; visible: boolean; children?: unknown[] }): number {
  if (!node.visible) return 0;
  let n = node.kind === "container" ? 0 : 1;
  for (const c of (node.children ?? []) as { kind: string; visible: boolean; children?: unknown[] }[]) {
    n += countRenderable(c);
  }
  return n;
}

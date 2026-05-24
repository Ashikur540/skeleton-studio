import { describe, expect, it } from "vitest";
import { parseComponent } from "./parse-component";

function tree(source: string) {
  const r = parseComponent(source);
  if (!r.ok) throw new Error(`parse failed: ${r.error.kind}`);
  return r.tree;
}

describe("parseComponent (happy path)", () => {
  it("parses a minimal function component", () => {
    const t = tree(`
      export default function Hello() {
        return <div className="w-64"><h1>Hi</h1></div>;
      }
    `);
    expect(t.kind).toBe("container");
    expect(t.width).toBe(256);
    expect(t.children).toHaveLength(1);
    expect(t.children?.[0].kind).toBe("text");
    expect(t.children?.[0].sourceTag).toBe("h1");
  });

  it("parses an arrow function component with implicit return", () => {
    const t = tree(`
      export const Card = () => (
        <div className="flex flex-col gap-4">
          <img className="w-12 h-12 rounded-full" />
          <p className="w-48">text</p>
        </div>
      );
    `);
    expect(t.layout).toEqual({ direction: "col", gap: 16 });
    expect(t.children).toHaveLength(2);
    expect(t.children?.[0].kind).toBe("image");
    expect(t.children?.[0].width).toBe(48);
    expect(t.children?.[1].kind).toBe("paragraph");
    // "text" is 4 chars — well below the 24-char threshold for multi-line.
    expect(t.children?.[1].lineCount).toBe(1);
  });

  it("preserves sourceTag for capitalized component identifiers", () => {
    const t = tree(`
      function Profile() {
        return <Card><Avatar /></Card>;
      }
    `);
    expect(t.kind).toBe("card");
    expect(t.sourceTag).toBe("Card");
    expect(t.children?.[0].kind).toBe("avatar");
    expect(t.children?.[0].sourceTag).toBe("Avatar");
  });

  it("ignores JSX text and whitespace children", () => {
    const t = tree(`
      function X() {
        return <div>some text<span className="w-10 h-4" /></div>;
      }
    `);
    expect(t.children).toHaveLength(1);
    expect(t.children?.[0].kind).toBe("text");
  });

  it("strips hooks and TS annotations silently", () => {
    const t = tree(`
      import { useState } from "react";
      type Props = { name: string };
      export default function Hi({ name }: Props) {
        const [x, setX] = useState(0);
        return <h1 className="w-32 h-8">{name}</h1>;
      }
    `);
    expect(t.kind).toBe("text");
    expect(t.width).toBe(128);
    expect(t.height).toBe(32);
  });
});

describe("parseComponent (.map handling)", () => {
  it("renders one representative child from .map() and tags it medium", () => {
    const r = parseComponent(`
      function List({ items }) {
        return (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.id} className="w-64 h-8" />
            ))}
          </ul>
        );
      }
    `);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.tree.children).toHaveLength(1);
    const child = r.tree.children![0];
    // <li> with explicit dimensions and no children gets promoted from
    // container to card so the representative row renders as a fill.
    expect(child.kind).toBe("card");
    expect(child.sourceTag).toBe("li");
    expect(child.width).toBe(256);
    expect(child.height).toBe(32);
    expect(child.confidence).toBe("medium");
  });

  it("handles .map() with block-body callback", () => {
    const r = parseComponent(`
      function List() {
        return (
          <ul>
            {arr.map((x) => {
              return <li className="w-10 h-4" />;
            })}
          </ul>
        );
      }
    `);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.tree.children).toHaveLength(1);
    expect(r.tree.children![0].confidence).toBe("medium");
  });

  it("ignores non-map expressions (variables, ternaries)", () => {
    const r = parseComponent(`
      function X({ name, isAdmin }) {
        return (
          <div className="w-32">
            {name}
            {isAdmin ? <span /> : null}
          </div>
        );
      }
    `);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.tree.children ?? []).toHaveLength(0);
  });
});

describe("parseComponent (errors)", () => {
  it("returns syntax-error on broken input", () => {
    const r = parseComponent(`function X( { return <div /> }`);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe("syntax-error");
  });

  it("surfaces Babel line/column on syntax errors so the editor can decorate", () => {
    const r = parseComponent(
      "function X() {\n  return (\n<>\n<div class=\"$$bad\">\n  <!-- comment -->\n",
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe("syntax-error");
    expect(r.error.loc).toBeDefined();
    expect(typeof r.error.loc!.line).toBe("number");
    expect(typeof r.error.loc!.column).toBe("number");
    expect(r.error.loc!.line).toBeGreaterThan(0);
  });

  it("returns no-return when component has no return", () => {
    const r = parseComponent(`
      export default function X() {
        const y = 1;
      }
    `);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe("no-return");
  });

  it("returns no-return when source has no function component at all", () => {
    const r = parseComponent(`const x = 1;`);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe("no-return");
  });

  it("returns no-return when return is not JSX", () => {
    const r = parseComponent(`
      export default function X() {
        return null;
      }
    `);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe("no-return");
  });
});

describe("parseComponent (confidence)", () => {
  it("assigns 'high' when both width and height come from classes", () => {
    const r = parseComponent(`
      function X() { return <div className="w-32 h-10" />; }
    `);
    if (!r.ok) throw new Error("expected ok");
    expect(r.tree.confidence).toBe("high");
  });

  it("assigns 'medium' when only one dimension is in classes", () => {
    const r = parseComponent(`
      function X() { return <div className="w-32" />; }
    `);
    if (!r.ok) throw new Error("expected ok");
    expect(r.tree.confidence).toBe("medium");
  });

  it("assigns 'fallback' when no class hints exist", () => {
    const r = parseComponent(`
      function X() { return <button />; }
    `);
    if (!r.ok) throw new Error("expected ok");
    expect(r.tree.confidence).toBe("fallback");
  });

  it("preserves sourceTag on every node", () => {
    const r = parseComponent(`
      function X() {
        return (
          <section>
            <h2 />
            <button />
          </section>
        );
      }
    `);
    if (!r.ok) throw new Error("expected ok");
    expect(r.tree.sourceTag).toBe("section");
    expect(r.tree.children?.[0].sourceTag).toBe("h2");
    expect(r.tree.children?.[1].sourceTag).toBe("button");
  });
});

describe("parseComponent (leaf div promotion)", () => {
  it("promotes a sized empty div to 'card' so it renders as a fill", () => {
    const r = parseComponent(`
      function Avatar() {
        return <div className="w-12 h-12 rounded-full" />;
      }
    `);
    if (!r.ok) throw new Error("expected ok");
    expect(r.tree.kind).toBe("card");
    expect(r.tree.width).toBe(48);
    expect(r.tree.height).toBe(48);
    expect(r.tree.radius).toBe(9999);
  });

  it("keeps a div with children as 'container'", () => {
    const r = parseComponent(`
      function X() {
        return (
          <div className="w-12 h-12">
            <span />
          </div>
        );
      }
    `);
    if (!r.ok) throw new Error("expected ok");
    expect(r.tree.kind).toBe("container");
  });

  it("keeps a bare empty div with no hints as 'container'", () => {
    const r = parseComponent(`
      function X() { return <div />; }
    `);
    if (!r.ok) throw new Error("expected ok");
    expect(r.tree.kind).toBe("container");
  });
});

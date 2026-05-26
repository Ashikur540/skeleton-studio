import { describe, expect, it } from "vitest";
import { formatSource } from "./format-source";

describe("formatSource", () => {
  it("formats messy JSX into clean output", async () => {
    const messy = `export default function Card(){return(<div className="flex"><p>hello</p></div>)}`;
    const out = await formatSource(messy);
    expect(out).toContain("export default function Card()");
    expect(out).toContain("\n");
    expect(out.split("\n").length).toBeGreaterThan(2);
  });

  it("returns original source when syntax is invalid", async () => {
    const broken = `function {{{ nope`;
    const out = await formatSource(broken);
    expect(out).toBe(broken);
  });

  it("preserves JSX structure", async () => {
    const jsx = `<Card><CardHeader><CardTitle>Title</CardTitle></CardHeader></Card>`;
    const out = await formatSource(jsx);
    expect(out).toContain("Card");
    expect(out).toContain("CardTitle");
  });
});

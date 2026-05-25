import { describe, expect, it } from "vitest";
import { detectTableGrid } from "./table-grid";
import type { SkeletonNode } from "@/lib/ir/types";

function n(over: Partial<SkeletonNode>): SkeletonNode {
  return {
    id: over.id ?? Math.random().toString(36).slice(2),
    kind: over.kind ?? "container",
    confidence: over.confidence ?? "medium",
    visible: over.visible ?? true,
    ...over,
  };
}

function cell(width: number | "full" = "full"): SkeletonNode {
  return n({ kind: "text", width, height: 16, sourceTag: "TableCell" });
}

function row(cells: SkeletonNode[]): SkeletonNode {
  return n({
    sourceTag: "TableRow",
    layout: { direction: "row", gap: 12 },
    width: "full",
    children: cells,
  });
}

describe("detectTableGrid", () => {
  it("pushes gridCols to all rows from a Table with uniform cells", () => {
    const table = n({
      sourceTag: "Table",
      layout: { direction: "col", gap: 8 },
      width: "full",
      children: [
        n({
          sourceTag: "TableHeader",
          layout: { direction: "col" },
          children: [row([cell(), cell(), cell()])],
        }),
        n({
          sourceTag: "TableBody",
          layout: { direction: "col" },
          children: [row([cell(), cell(), cell()])],
        }),
      ],
    });

    detectTableGrid(table);

    const headerRow = table.children![0].children![0];
    const bodyRow = table.children![1].children![0];
    expect(headerRow.layout?.gridCols).toBe("1fr 1fr 1fr");
    expect(bodyRow.layout?.gridCols).toBe("1fr 1fr 1fr");
  });

  it("uses fixed px width when a cell has an explicit numeric width", () => {
    const table = n({
      sourceTag: "Table",
      layout: { direction: "col" },
      children: [
        n({
          sourceTag: "TableHeader",
          layout: { direction: "col" },
          children: [row([cell(100), cell(), cell(), cell(80)])],
        }),
        n({
          sourceTag: "TableBody",
          layout: { direction: "col" },
          children: [row([cell(), cell(), cell(), cell()])],
        }),
      ],
    });

    detectTableGrid(table);

    const headerRow = table.children![0].children![0];
    expect(headerRow.layout?.gridCols).toBe("100px 1fr 1fr 80px");

    const bodyRow = table.children![1].children![0];
    expect(bodyRow.layout?.gridCols).toBe("100px 1fr 1fr 80px");
  });

  it("works with HTML table/thead/tbody/tr tags", () => {
    const table = n({
      sourceTag: "table",
      layout: { direction: "col" },
      children: [
        n({
          sourceTag: "thead",
          layout: { direction: "col" },
          children: [
            n({
              sourceTag: "tr",
              layout: { direction: "row", gap: 12 },
              children: [cell(60), cell(), cell()],
            }),
          ],
        }),
      ],
    });

    detectTableGrid(table);
    const tr = table.children![0].children![0];
    expect(tr.layout?.gridCols).toBe("60px 1fr 1fr");
  });

  it("skips tables with fewer than 2 columns", () => {
    const table = n({
      sourceTag: "Table",
      layout: { direction: "col" },
      children: [
        n({
          sourceTag: "TableBody",
          layout: { direction: "col" },
          children: [row([cell()])],
        }),
      ],
    });

    detectTableGrid(table);
    const r = table.children![0].children![0];
    expect(r.layout?.gridCols).toBeUndefined();
  });

  it("does not touch non-table containers", () => {
    const div = n({
      sourceTag: "div",
      layout: { direction: "col" },
      children: [
        n({
          sourceTag: "div",
          layout: { direction: "row", gap: 8 },
          children: [n({ kind: "text" }), n({ kind: "text" })],
        }),
      ],
    });

    detectTableGrid(div);
    expect(div.children![0].layout?.gridCols).toBeUndefined();
  });

  it("handles Table with direct row children (no section wrapper)", () => {
    const table = n({
      sourceTag: "Table",
      layout: { direction: "col" },
      children: [row([cell(50), cell()])],
    });

    detectTableGrid(table);
    const r = table.children![0];
    expect(r.layout?.gridCols).toBe("50px 1fr");
  });
});

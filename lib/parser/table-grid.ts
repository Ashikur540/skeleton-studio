import type { SkeletonNode } from "@/lib/ir/types";

/** Tags that represent a single horizontal table row. */
const TABLE_ROW_TAGS = new Set(["tr", "TableRow"]);

/**
 * Walk the IR tree and convert table rows from flex-row to CSS grid with a
 * computed `grid-template-columns` value. Column widths are inferred from the
 * first (header) row's cell dimensions: cells with an explicit pixel width
 * become fixed columns; cells with `width: "full"` become `1fr` tracks.
 * Pushes the same template to every row so columns align table-wide.
 */
export function detectTableGrid(node: SkeletonNode): void {
  if (node.children) {
    for (const c of node.children) detectTableGrid(c);
  }

  if (!isTableRoot(node)) return;

  const refRow = findFirstRow(node);
  if (!refRow?.children || refRow.children.length < 2) return;

  const cols = refRow.children.map(cellColumnWidth);
  const gridCols = cols.join(" ");

  pushGridToRows(node, gridCols);
}

/**
 * True for the top-level table element (HTML `table` or shadcn `Table`).
 * The grid template is inferred at this level so every nested section shares
 * the same column definitions.
 */
function isTableRoot(node: SkeletonNode): boolean {
  const tag = node.sourceTag ?? "";
  return tag === "table" || tag === "Table";
}

/**
 * Locate the first row by scanning sections (thead/tbody) then their children.
 * Falls back to a direct-child row when the table has no section wrappers.
 */
function findFirstRow(table: SkeletonNode): SkeletonNode | undefined {
  for (const section of table.children ?? []) {
    if (TABLE_ROW_TAGS.has(section.sourceTag ?? "")) return section;
    for (const child of section.children ?? []) {
      if (TABLE_ROW_TAGS.has(child.sourceTag ?? "")) return child;
    }
  }
  return undefined;
}

/**
 * Derive a CSS grid track width from a cell node's resolved width. Cells
 * whose Tailwind classes pinned an explicit pixel width become fixed tracks;
 * everything else becomes a `1fr` flexible track.
 */
function cellColumnWidth(cell: SkeletonNode): string {
  if (typeof cell.width === "number") return `${cell.width}px`;
  return "1fr";
}

/**
 * Recursively walk a table subtree and stamp `layout.gridCols` on every row
 * node so the renderer and exporter know to emit `display: grid` with a
 * shared column template.
 */
function pushGridToRows(node: SkeletonNode, gridCols: string): void {
  if (TABLE_ROW_TAGS.has(node.sourceTag ?? "") && node.layout) {
    node.layout.gridCols = gridCols;
  }
  for (const c of node.children ?? []) {
    pushGridToRows(c, gridCols);
  }
}

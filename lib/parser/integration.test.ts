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

describe("integration: design-system JSX (Material Tailwind-style)", () => {
  const source = `
    export function CardDefault() {
      return (
        <Card className="mt-6 w-96">
          <CardHeader color="blue-gray" className="relative h-56">
            <img src="x.jpg" alt="card-image" />
          </CardHeader>
          <CardBody>
            <Typography variant="h5" color="blue-gray" className="mb-2">
              UI/UX Review Check
            </Typography>
            <Typography>
              Body copy goes here describing the place in detail.
            </Typography>
          </CardBody>
          <CardFooter className="pt-0">
            <Button>Read More</Button>
          </CardFooter>
        </Card>
      );
    }
  `;

  it("classifies every node to a non-container fill where appropriate", () => {
    const r = parseComponent(source);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const root = r.tree;
    expect(root.kind).toBe("card");
    expect(root.sourceTag).toBe("Card");
    expect(root.width).toBe(384);

    const [header, body, footer] = root.children ?? [];
    expect(header.kind).toBe("container");
    expect(header.sourceTag).toBe("CardHeader");
    expect(header.height).toBe(224);

    const img = header.children?.[0];
    expect(img?.kind).toBe("image");

    expect(body.kind).toBe("container");
    expect(body.sourceTag).toBe("CardBody");
    const [title, paragraph] = body.children ?? [];
    expect(title.kind).toBe("text");
    expect(title.height).toBe(18);
    expect(paragraph.kind).toBe("text");

    expect(footer.kind).toBe("container");
    expect(footer.sourceTag).toBe("CardFooter");
    const btn = footer.children?.[0];
    expect(btn?.kind).toBe("button");
    expect(btn?.width).toBe(100);
  });

  it("never produces an invisible empty-container leaf", () => {
    const r = parseComponent(source);
    if (!r.ok) throw new Error("parse failed");
    walkAssertNoInvisibleLeaf(r.tree);
  });
});

function walkAssertNoInvisibleLeaf(node: {
  kind: string;
  width?: number | "full";
  height?: number;
  children?: unknown[];
}): void {
  const hasChildren = (node.children?.length ?? 0) > 0;
  if (!hasChildren && node.kind === "container") {
    throw new Error("found leaf container — would render as empty box");
  }
  for (const c of (node.children ?? []) as Parameters<
    typeof walkAssertNoInvisibleLeaf
  >[0][]) {
    walkAssertNoInvisibleLeaf(c);
  }
}

describe("integration: HTML table renders visibly", () => {
  const source = `
    export const BlogRow = () => (
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Job</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>1</th>
              <td>Cy Ganderton</td>
              <td>Quality Control Specialist</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  `;

  it("parses table tags into a non-empty visible tree", () => {
    const r = parseComponent(source);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(countRenderable(r.tree)).toBeGreaterThan(0);
  });

  it("th and td cells become text blocks", () => {
    const r = parseComponent(source);
    if (!r.ok) throw new Error("parse failed");
    const tbody = r.tree.children![0].children![1];
    const firstRow = tbody.children![0];
    expect(firstRow.kind).toBe("container");
    expect(firstRow.layout?.direction).toBe("row");
    for (const cell of firstRow.children ?? []) {
      expect(cell.kind).toBe("text");
    }
  });
});

describe("integration: shadcn Table primitives", () => {
  const source = `
    export function TableDemo() {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.invoice}>
                <TableCell className="font-medium">{invoice.invoice}</TableCell>
                <TableCell>{invoice.paymentStatus}</TableCell>
                <TableCell>{invoice.paymentMethod}</TableCell>
                <TableCell className="text-right">{invoice.totalAmount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell className="text-right">$2,500.00</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );
    }
  `;

  it("parses shadcn Table into row-major structure", () => {
    const r = parseComponent(source);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.tree.sourceTag).toBe("Table");
    expect(r.tree.layout?.direction).toBe("col");

    const [header, body, footer] = r.tree.children ?? [];
    expect(header.sourceTag).toBe("TableHeader");
    expect(body.sourceTag).toBe("TableBody");
    expect(footer.sourceTag).toBe("TableFooter");

    // Header → single TableRow → 4 TableHead cells horizontally
    const headerRow = header.children?.[0];
    expect(headerRow?.sourceTag).toBe("TableRow");
    expect(headerRow?.layout?.direction).toBe("row");
    expect(headerRow?.children).toHaveLength(4);
    for (const cell of headerRow!.children!) {
      expect(cell.kind).toBe("text");
    }

    // Body comes from .map() → exactly one representative TableRow
    const bodyRow = body.children?.[0];
    expect(bodyRow?.sourceTag).toBe("TableRow");
    expect(bodyRow?.confidence).toBe("medium");
    expect(bodyRow?.layout?.direction).toBe("row");
  });

  it("Table itself wraps in a card; row layers stay plain", () => {
    const r = parseComponent(source);
    if (!r.ok) throw new Error("parse failed");
    expect(r.tree.appearance).toBe("card");
    walkAssertNoRowLayerCard(r.tree);
  });
});

function walkAssertNoRowLayerCard(node: {
  sourceTag?: string;
  appearance?: string;
  children?: unknown[];
}): void {
  if (
    node.sourceTag &&
    ["TableHeader", "TableBody", "TableFooter", "TableRow"].includes(
      node.sourceTag,
    )
  ) {
    if (node.appearance === "card") {
      throw new Error(
        `${node.sourceTag} unexpectedly classified as card surface`,
      );
    }
  }
  for (const c of (node.children ?? []) as Parameters<
    typeof walkAssertNoRowLayerCard
  >[0][]) {
    walkAssertNoRowLayerCard(c);
  }
}

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

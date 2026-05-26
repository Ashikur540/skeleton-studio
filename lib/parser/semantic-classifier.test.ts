import { describe, expect, it } from "vitest";
import { classify } from "./semantic-classifier";
import type { RawNode } from "./raw-node";

function el(
  tag: string,
  className = "",
  children: RawNode[] = [],
  fromMap = false,
  props: Record<string, string | true> = {},
  hasTextContent = false,
  textContent = "",
): RawNode {
  return {
    kind: "element",
    tag,
    className,
    props,
    children,
    fromMap,
    hasTextContent,
    textContent,
  };
}

describe("classify (HTML tags)", () => {
  it("maps <h1> to text with default height", () => {
    const node = classify(el("h1"));
    expect(node).not.toBeNull();
    expect(node!.kind).toBe("text");
    expect(node!.sourceTag).toBe("h1");
    expect(node!.height).toBe(32);
  });

  it("maps <p> to paragraph with default lineCount 3 when no text content", () => {
    const node = classify(el("p"));
    expect(node!.kind).toBe("paragraph");
    expect(node!.lineCount).toBe(3);
  });

  it("paragraph with short text collapses to a single line", () => {
    const node = classify(el("p", "", [], false, {}, true, "New"));
    expect(node!.lineCount).toBe(1);
  });

  it("paragraph with medium text gets 2 lines", () => {
    const node = classify(
      el("p", "", [], false, {}, true, "Short blurb of about thirty chars."),
    );
    expect(node!.lineCount).toBe(2);
  });

  it("paragraph with long text caps at 5 lines", () => {
    const longText = "x".repeat(400);
    const node = classify(el("p", "", [], false, {}, true, longText));
    expect(node!.lineCount).toBe(5);
  });

  it("maps <button> to button with default dimensions", () => {
    const node = classify(el("button"));
    expect(node!.kind).toBe("button");
    expect(node!.width).toBe(100);
    expect(node!.height).toBe(40);
  });

  it("falls back to container for unknown HTML tags", () => {
    const node = classify(el("article"));
    expect(node!.kind).toBe("container");
  });
});

describe("classify (component-name hints)", () => {
  it("maps <Avatar /> to avatar kind", () => {
    const node = classify(el("Avatar"));
    expect(node!.kind).toBe("avatar");
  });

  it("maps <Card /> to card kind", () => {
    const node = classify(el("Card"));
    expect(node!.kind).toBe("card");
  });

  it("unknown capitalised component with children stays container", () => {
    const node = classify(el("FancyWidget", "", [el("p")]));
    expect(node!.kind).toBe("container");
  });
});

describe("classify (class hints + confidence)", () => {
  it("merges Tailwind w-32 h-10 into dimensions and yields high confidence", () => {
    const node = classify(el("div", "w-32 h-10"));
    expect(node!.width).toBe(128);
    expect(node!.height).toBe(40);
    expect(node!.confidence).toBe("high");
  });

  it("yields medium when only one dimension is pinned", () => {
    const node = classify(el("div", "w-32"));
    expect(node!.confidence).toBe("medium");
  });

  it("yields fallback when no class hints exist", () => {
    const node = classify(el("button"));
    expect(node!.confidence).toBe("fallback");
  });

  it("treats fromMap nodes as medium regardless of class hints", () => {
    const node = classify(el("li", "w-64 h-8", [], true));
    expect(node!.confidence).toBe("medium");
  });
});

describe("classify (fill-leaf kinds strip children)", () => {
  it("button drops its inner JSX children (label/icon)", () => {
    const node = classify(
      el("button", "", [el("p", "", [], false, {}, true, "message")]),
    );
    expect(node!.kind).toBe("button");
    expect(node!.children).toBeUndefined();
  });

  it("text wrapping a span drops the span child", () => {
    const node = classify(el("p", "", [el("span")]));
    expect(node!.kind).toBe("paragraph");
    expect(node!.children).toBeUndefined();
  });

  it("image / input / avatar never carry children", () => {
    expect(
      classify(el("img", "", [el("span")]))!.children,
    ).toBeUndefined();
    expect(
      classify(el("Avatar", "", [el("span")]))!.children,
    ).toBeUndefined();
  });
});

describe("classify (margin → parent gap aggregation)", () => {
  it("max child mt becomes parent gap in column layout", () => {
    const parent = classify(
      el("div", "flex flex-col", [
        el("p", "mt-3", [], false, {}, true, "Kelvin John"),
        el("p", "", [], false, {}, true, "email"),
        el("button", "mt-5"),
      ]),
    );
    expect(parent!.layout?.gap).toBe(20);
  });

  it("strips margin from children after aggregation", () => {
    const parent = classify(
      el("div", "flex flex-col", [
        el("p", "mt-3", [], false, {}, true, "x"),
      ]),
    );
    expect(parent!.children![0].margin).toBeUndefined();
  });

  it("explicit gap-* wins over inferred margin gap", () => {
    const parent = classify(
      el("div", "flex flex-col gap-2", [el("p", "mt-5", [], false, {}, true, "x")]),
    );
    expect(parent!.layout?.gap).toBe(8);
  });

  it("row layout uses horizontal margins (ml/mr)", () => {
    const parent = classify(
      el("div", "flex flex-row", [
        el("span", "ml-4", [], false, {}, true, "a"),
        el("span", "", [], false, {}, true, "b"),
      ]),
    );
    expect(parent!.layout?.gap).toBe(16);
  });

  it("creates layout even when parent has no flex class but children carry margins", () => {
    const parent = classify(
      el("div", "", [
        el("p", "mb-3", [], false, {}, true, "x"),
        el("p", "", [], false, {}, true, "y"),
      ]),
    );
    expect(parent!.layout).toBeDefined();
    expect(parent!.layout?.gap).toBe(12);
  });
});

describe("classify (decorative overlay dropping)", () => {
  it("drops empty absolute overlay (no children, no text)", () => {
    const node = classify(el("div", "absolute inset-0 bg-black/35"));
    expect(node).toBeNull();
  });

  it("drops empty fixed overlay", () => {
    const node = classify(el("div", "fixed bg-black/50"));
    expect(node).toBeNull();
  });

  it("keeps absolute element with child content (e.g. positioned badge)", () => {
    const node = classify(
      el("div", "absolute -top-2 bg-blue-500", [
        el("p", "", [], false, {}, true, "New"),
      ]),
    );
    expect(node).not.toBeNull();
    expect(node!.kind).toBe("container");
  });

  it("keeps absolute element with text content (e.g. positioned label)", () => {
    const node = classify(
      el("div", "absolute", [], false, {}, true, "Label"),
    );
    expect(node).not.toBeNull();
  });

  it("relative/sticky positioning never drops the node", () => {
    const node = classify(el("div", "relative"));
    expect(node).not.toBeNull();
  });
});

describe("classify (avatar inference)", () => {
  it("rounded-full sized container with single img child collapses to avatar", () => {
    const node = classify(
      el("div", "w-28 h-28 rounded-full", [el("img")]),
    );
    expect(node!.kind).toBe("avatar");
    expect(node!.width).toBe(112);
    expect(node!.height).toBe(112);
    expect(node!.children).toBeUndefined();
  });

  it("does NOT promote when container has multiple children", () => {
    const node = classify(
      el("div", "w-28 h-28 rounded-full", [el("img"), el("span")]),
    );
    expect(node!.kind).toBe("container");
  });

  it("does NOT promote when container lacks rounded-full radius", () => {
    const node = classify(
      el("div", "w-28 h-28 rounded-lg", [el("img")]),
    );
    expect(node!.kind).toBe("container");
  });

  it("does NOT promote when container has no dimensions", () => {
    const node = classify(el("div", "rounded-full", [el("img")]));
    expect(node!.kind).toBe("container");
  });
});

describe("classify (text width heuristics)", () => {
  it("short paragraph with text sizes to character count", () => {
    const node = classify(el("p", "", [], false, {}, true, "Kelvin John"));
    expect(node!.kind).toBe("paragraph");
    expect(node!.width).toBe(85);
  });

  it("text-kind block sizes to content length (subject to 40px floor)", () => {
    const node = classify(el("span", "", [], false, {}, true, "Job"));
    expect(node!.kind).toBe("text");
    // 3 chars * 7 + 8 = 29, raised to the 40px floor for readability.
    expect(node!.width).toBe(40);
  });

  it("long copy caps at 320px", () => {
    const long = "x".repeat(100);
    const node = classify(el("p", "", [], false, {}, true, long));
    expect(node!.width).toBe(320);
  });

  it("width floor of 40px for very short tokens", () => {
    const node = classify(el("span", "", [], false, {}, true, "a"));
    expect(node!.width).toBe(40);
  });

  it("explicit w-* class beats the content heuristic", () => {
    const node = classify(el("p", "w-32", [], false, {}, true, "Kelvin John"));
    expect(node!.width).toBe(128);
  });

  it("p with no text content keeps tag-default full width", () => {
    const node = classify(el("p"));
    expect(node!.width).toBe("full");
  });

  it("content-sized text bumps confidence from fallback to medium", () => {
    const node = classify(el("p", "", [], false, {}, true, "Kelvin John"));
    expect(node!.confidence).toBe("medium");
  });
});

describe("classify (visual-card heuristic)", () => {
  it("container with bg-white promotes to appearance=card", () => {
    const node = classify(el("div", "bg-white", [el("p")]));
    expect(node!.kind).toBe("container");
    expect(node!.appearance).toBe("card");
  });

  it("container with border promotes to appearance=card", () => {
    const node = classify(el("div", "border", [el("p")]));
    expect(node!.appearance).toBe("card");
  });

  it("container with only rounded-2xl does NOT promote (rounded alone is wrapper, not card)", () => {
    const node = classify(el("div", "rounded-2xl", [el("p")]));
    expect(node!.appearance).toBeUndefined();
  });

  it("fill-leaf kinds never get appearance=card even if classes match", () => {
    // <button className="bg-white border"> still resolves to button kind,
    // not a card surface; appearance stays unset.
    const node = classify(el("button", "bg-white border"));
    expect(node!.kind).toBe("button");
    expect(node!.appearance).toBeUndefined();
  });

  it("user-style card (bg + border + rounded + padding) is fully captured", () => {
    const node = classify(
      el(
        "div",
        "bg-white rounded-2xl pb-4 border border-gray-200",
        [el("p")],
      ),
    );
    expect(node!.appearance).toBe("card");
    expect(node!.radius).toBe(16);
    expect(node!.padding).toEqual({ bottom: 16 });
  });
});

describe("classify (card-with-children height)", () => {
  it("strips default height from Card when it has children so it grows with content", () => {
    const node = classify(el("Card", "", [el("p"), el("p")]));
    expect(node!.kind).toBe("card");
    expect(node!.width).toBe(320);
    expect(node!.height).toBeUndefined();
  });

  it("keeps height when class hints explicitly pinned it on a card", () => {
    const node = classify(el("Card", "h-96", [el("p")]));
    expect(node!.height).toBe(384);
  });

  it("leaves leaf card with default height intact (no children to grow with)", () => {
    const node = classify(el("Card"));
    expect(node!.kind).toBe("card");
    expect(node!.height).toBe(200);
  });
});

describe("classify (leaf-container promotion)", () => {
  it("promotes empty sized div to card", () => {
    const node = classify(el("div", "w-12 h-12 rounded-full"));
    expect(node!.kind).toBe("card");
    expect(node!.radius).toBe(9999);
  });

  it("keeps container kind when div has children", () => {
    const node = classify(el("div", "w-12 h-12", [el("span")]));
    expect(node!.kind).toBe("container");
  });

  it("keeps container kind for bare empty div with no hints", () => {
    const node = classify(el("div"));
    expect(node!.kind).toBe("container");
  });

  it("promotes empty custom component (no hints) to card with default dims", () => {
    const node = classify(el("FancyWidget"));
    expect(node!.kind).toBe("card");
    expect(node!.width).toBe(200);
    expect(node!.height).toBe(80);
    expect(node!.radius).toBe(8);
  });

  it("promotes empty shadcn CardHeader leaf to card with full-width strip", () => {
    // CardHeader now has an explicit shadcn hint that pins width:"full" + a
    // column layout, so the leaf-promotion path keeps that width and falls
    // back to default height/radius for the empty case.
    const node = classify(el("CardHeader"));
    expect(node!.kind).toBe("card");
    expect(node!.width).toBe("full");
    expect(node!.height).toBe(80);
  });

  it("promotes empty pattern-only container (MysteryHeader leaf) to card with default dims", () => {
    const node = classify(el("MysteryHeader"));
    expect(node!.kind).toBe("card");
    expect(node!.width).toBe(200);
    expect(node!.height).toBe(80);
  });

  it("keeps pattern-matched container with children as container", () => {
    const node = classify(el("CardHeader", "", [el("h1"), el("p")]));
    expect(node!.kind).toBe("container");
    expect(node!.children).toHaveLength(2);
  });

  it("keeps unresolved custom component with children as container", () => {
    const node = classify(el("MysteryBox", "", [el("p")]));
    expect(node!.kind).toBe("container");
    expect(node!.children).toHaveLength(1);
  });

  it("respects custom component's class hints over fallback dims", () => {
    const node = classify(el("FancyWidget", "w-32 h-8"));
    expect(node!.kind).toBe("card");
    expect(node!.width).toBe(128);
    expect(node!.height).toBe(32);
  });

  it("leaves HTML container tags (section, ul) invisible when empty without hints", () => {
    expect(classify(el("section"))!.kind).toBe("container");
    expect(classify(el("ul"))!.kind).toBe("container");
    expect(classify(el("nav"))!.kind).toBe("container");
  });

  it("promotes leaf with literal text content to text kind", () => {
    const node = classify(el("div", "", [], false, {}, true));
    expect(node!.kind).toBe("text");
    expect(node!.width).toBe(120);
    expect(node!.height).toBe(16);
  });
});

describe("classify (.map repeat counts)", () => {
  it("fromMap node gets default repeat of 3", () => {
    const node = classify(el("li", "", [], true));
    expect(node!.repeat).toBe(3);
  });

  it("non-map node has no repeat", () => {
    const node = classify(el("li"));
    expect(node!.repeat).toBeUndefined();
  });

  it("uniform default repeat of 3 inside any list-style parent", () => {
    const body = classify(el("TableBody", "", [el("TableRow", "", [], true)]));
    expect(body!.children![0].repeat).toBe(3);
    const ul = classify(el("ul", "", [el("li", "", [], true)]));
    expect(ul!.children![0].repeat).toBe(3);
  });

  it("non-list parent also leaves fromMap repeat at default 3", () => {
    const div = classify(el("div", "", [el("span", "", [], true)]));
    expect(div!.children![0].repeat).toBe(3);
  });
});

describe("classify (shadcn Table primitives)", () => {
  it("TableRow lays out children in a row", () => {
    const node = classify(
      el("TableRow", "", [
        el("TableCell", "", [], false, {}, false, ""),
        el("TableCell", "", [], false, {}, false, ""),
      ]),
    );
    expect(node!.kind).toBe("container");
    expect(node!.layout?.direction).toBe("row");
  });

  it("TableCell and TableHead resolve to text kind with flex-full width", () => {
    expect(classify(el("TableCell"))!.kind).toBe("text");
    expect(classify(el("TableCell"))!.width).toBe("full");
    expect(classify(el("TableHead"))!.kind).toBe("text");
    expect(classify(el("TableHead"))!.width).toBe("full");
  });

  it("table cells skip content-aware width override (stays full for equal columns)", () => {
    const node = classify(
      el("TableCell", "", [], false, {}, true, "Short text"),
    );
    expect(node!.width).toBe("full");
  });

  it("Table component is forced to appearance=card", () => {
    const node = classify(el("Table", "", [el("TableRow")]));
    expect(node!.appearance).toBe("card");
  });

  it("explicit w-* on TableHead overrides default", () => {
    const node = classify(el("TableHead", "w-[100px]"));
    expect(node!.width).toBe(100);
  });

  it("TableRow with bg/border classes does NOT become a card", () => {
    const node = classify(
      el("TableRow", "bg-gray-50 border-b", [el("TableCell")]),
    );
    expect(node!.appearance).toBeUndefined();
  });

  it("Table/TableHeader/TableBody stack rows vertically", () => {
    expect(classify(el("Table"))!.layout?.direction).toBe("col");
    expect(classify(el("TableHeader"))!.layout?.direction).toBe("col");
    expect(classify(el("TableBody"))!.layout?.direction).toBe("col");
    expect(classify(el("TableFooter"))!.layout?.direction).toBe("col");
  });
});

describe("classify (table tags skip surface promotion)", () => {
  it("tr with bg + border does NOT become a card", () => {
    const node = classify(
      el("tr", "bg-neutral-primary border-b border-default", [
        el("td", "", [], false, {}, true, "x"),
      ]),
    );
    expect(node!.appearance).toBeUndefined();
  });

  it("thead with bg + border stays plain container", () => {
    const node = classify(
      el("thead", "bg-gray-100 border-b", [
        el("tr", "", [el("th", "", [], false, {}, true, "Header")]),
      ]),
    );
    expect(node!.appearance).toBeUndefined();
  });

  it("non-table div with same classes still becomes a card", () => {
    const node = classify(
      el("div", "bg-neutral-primary border", [el("p")]),
    );
    expect(node!.appearance).toBe("card");
  });
});

describe("classify (table tags)", () => {
  it("th renders as text with full width (flex distributes via row)", () => {
    const node = classify(el("th", "", [], false, {}, true));
    expect(node!.kind).toBe("text");
    expect(node!.width).toBe("full");
  });

  it("td renders as text with full width", () => {
    const node = classify(el("td", "", [], false, {}, true));
    expect(node!.kind).toBe("text");
    expect(node!.width).toBe("full");
  });

  it("tr renders as a flex-row container with gap", () => {
    const node = classify(
      el("tr", "", [el("th", "", [], false, {}, true)]),
    );
    expect(node!.kind).toBe("container");
    expect(node!.layout).toEqual({ direction: "row", gap: 12 });
  });

  it("table/thead/tbody render as flex-col containers", () => {
    const tbody = classify(
      el("tbody", "", [el("tr", "", [el("th", "", [], false, {}, true)])]),
    );
    expect(tbody!.kind).toBe("container");
    expect(tbody!.layout).toEqual({ direction: "col", gap: 8 });
  });
});

describe("classify (fragments)", () => {
  it("returns null for empty fragment", () => {
    const node = classify({ kind: "fragment", children: [], fromMap: false });
    expect(node).toBeNull();
  });

  it("unwraps single-child fragment", () => {
    const node = classify({
      kind: "fragment",
      children: [el("h1")],
      fromMap: false,
    });
    expect(node!.kind).toBe("text");
    expect(node!.sourceTag).toBe("h1");
  });

  it("wraps multi-child fragment in container with col layout", () => {
    const node = classify({
      kind: "fragment",
      children: [el("h1"), el("p")],
      fromMap: false,
    });
    expect(node!.kind).toBe("container");
    expect(node!.layout).toEqual({ direction: "col" });
    expect(node!.children).toHaveLength(2);
  });
});

describe("classify (semantic patterns)", () => {
  it("maps custom *Button names to button kind with defaults", () => {
    const node = classify(el("SubmitButton"));
    expect(node!.kind).toBe("button");
    expect(node!.width).toBe(100);
    expect(node!.height).toBe(40);
    expect(node!.confidence).toBe("medium");
  });

  it("maps IconButton to button", () => {
    const node = classify(el("IconButton"));
    expect(node!.kind).toBe("button");
  });

  it("maps custom *Image names to image kind", () => {
    const node = classify(el("HeroImage"));
    expect(node!.kind).toBe("image");
    expect(node!.width).toBe(200);
    expect(node!.height).toBe(150);
  });

  it("maps Picture to image kind", () => {
    expect(classify(el("Picture"))!.kind).toBe("image");
  });

  it("maps Typography to text kind", () => {
    const node = classify(el("Typography"));
    expect(node!.kind).toBe("text");
    expect(node!.height).toBe(16);
  });

  it("maps Heading/Title/Headline to text with heading dimensions", () => {
    expect(classify(el("Heading"))!.kind).toBe("text");
    expect(classify(el("Title"))!.kind).toBe("text");
    expect(classify(el("Headline"))!.kind).toBe("text");
    expect(classify(el("Heading"))!.height).toBe(28);
  });

  it("maps Paragraph and Description to paragraph kind", () => {
    expect(classify(el("Paragraph"))!.kind).toBe("paragraph");
    expect(classify(el("Description"))!.kind).toBe("paragraph");
    expect(classify(el("Paragraph"))!.lineCount).toBe(3);
  });

  it("maps Input/TextField/Select to input kind", () => {
    expect(classify(el("TextField"))!.kind).toBe("input");
    expect(classify(el("Combobox"))!.kind).toBe("input");
    expect(classify(el("SearchField"))!.kind).toBe("input");
  });

  it("maps CardHeader / CardBody / CardFooter (with children) to container", () => {
    const wrap = (tag: string) => classify(el(tag, "", [el("p")]))!;
    expect(wrap("CardHeader").kind).toBe("container");
    expect(wrap("CardBody").kind).toBe("container");
    expect(wrap("CardFooter").kind).toBe("container");
  });

  it("maps generic *Section / *Wrapper / *Stack (with children) to container", () => {
    const wrap = (tag: string) => classify(el(tag, "", [el("p")]))!;
    expect(wrap("HeroSection").kind).toBe("container");
    expect(wrap("PageWrapper").kind).toBe("container");
    expect(wrap("ButtonStack").kind).toBe("container");
  });

  it("unknown name with children and no pattern falls back to container", () => {
    const node = classify(el("FancyWidget", "", [el("p")]));
    expect(node!.kind).toBe("container");
    expect(node!.confidence).toBe("fallback");
  });

  it("name-inferred kinds get medium confidence even without class hints", () => {
    expect(classify(el("Avatar"))!.confidence).toBe("medium");
    expect(classify(el("SubmitButton"))!.confidence).toBe("medium");
    expect(classify(el("Card"))!.confidence).toBe("medium");
  });
});

describe("classify (shadcn Card subcomponents)", () => {
  it("CardTitle resolves to a tall text bar", () => {
    const node = classify(el("CardTitle"));
    expect(node!.kind).toBe("text");
    expect(node!.height).toBe(24);
    expect(node!.width).toBe("full");
  });

  it("CardDescription resolves to a paragraph block", () => {
    const node = classify(el("CardDescription"));
    expect(node!.kind).toBe("paragraph");
    expect(node!.height).toBe(14);
  });

  it("CardHeader with children stacks vertically with a tight gap", () => {
    const node = classify(
      el("CardHeader", "", [el("CardTitle"), el("CardDescription")]),
    );
    expect(node!.kind).toBe("container");
    expect(node!.layout?.direction).toBe("col");
    expect(node!.layout?.gap).toBe(6);
  });

  it("CardFooter lays out actions in a row", () => {
    const node = classify(el("CardFooter", "", [el("Button")]));
    expect(node!.kind).toBe("container");
    expect(node!.layout?.direction).toBe("row");
  });
});

describe("classify (shadcn Tabs)", () => {
  it("TabsList lays out triggers horizontally", () => {
    const node = classify(
      el("TabsList", "", [el("TabsTrigger"), el("TabsTrigger")]),
    );
    expect(node!.layout?.direction).toBe("row");
  });

  it("TabsTrigger resolves to a button", () => {
    const node = classify(el("TabsTrigger"));
    expect(node!.kind).toBe("button");
    expect(node!.height).toBe(32);
  });

  it("Tabs wraps a TabsList + TabsContent in a vertical stack", () => {
    const node = classify(
      el("Tabs", "", [el("TabsList"), el("TabsContent")]),
    );
    expect(node!.layout?.direction).toBe("col");
  });
});

describe("classify (shadcn Accordion)", () => {
  it("AccordionTrigger with children renders as a horizontal row at 48px tall", () => {
    const node = classify(
      el("AccordionTrigger", "", [el("span", "", [], false, {}, true, "Q")]),
    );
    expect(node!.kind).toBe("container");
    expect(node!.height).toBe(48);
    expect(node!.layout?.direction).toBe("row");
  });

  it("AccordionContent renders as a paragraph block", () => {
    const node = classify(el("AccordionContent"));
    expect(node!.kind).toBe("paragraph");
  });
});

describe("classify (shadcn Dialog / Sheet)", () => {
  it("DialogTitle and SheetTitle resolve to tall text", () => {
    expect(classify(el("DialogTitle"))!.kind).toBe("text");
    expect(classify(el("DialogTitle"))!.height).toBe(24);
    expect(classify(el("SheetTitle"))!.height).toBe(24);
  });

  it("DialogFooter lays out actions in a row", () => {
    const node = classify(el("DialogFooter", "", [el("Button")]));
    expect(node!.layout?.direction).toBe("row");
  });
});

describe("classify (shadcn Form)", () => {
  it("FormLabel resolves to a small caption-shaped text bar", () => {
    const node = classify(el("FormLabel"));
    expect(node!.kind).toBe("text");
    expect(node!.height).toBe(14);
    expect(node!.width).toBe(80);
  });

  it("FormItem stacks label + control + message vertically with tight gap", () => {
    const node = classify(
      el("FormItem", "", [el("FormLabel"), el("Input"), el("FormMessage")]),
    );
    expect(node!.layout?.direction).toBe("col");
    expect(node!.layout?.gap).toBe(6);
  });

  it("FormDescription / FormMessage resolve to thin helper text", () => {
    expect(classify(el("FormDescription"))!.height).toBe(12);
    expect(classify(el("FormMessage"))!.height).toBe(12);
  });
});

describe("classify (shadcn Select)", () => {
  it("Select and SelectTrigger resolve to input shape", () => {
    expect(classify(el("Select"))!.kind).toBe("input");
    expect(classify(el("SelectTrigger"))!.kind).toBe("input");
  });

  it("SelectItem rows render as full-width text bars", () => {
    const node = classify(el("SelectItem"));
    expect(node!.kind).toBe("text");
    expect(node!.width).toBe("full");
  });
});

describe("classify (shadcn standalone primitives)", () => {
  it("Badge resolves to a small pill", () => {
    const node = classify(el("Badge"));
    expect(node!.kind).toBe("button");
    expect(node!.width).toBe(60);
    expect(node!.height).toBe(22);
    expect(node!.radius).toBe(9999);
  });

  it("Skeleton resolves to a placeholder strip", () => {
    const node = classify(el("Skeleton"));
    expect(node!.kind).toBe("card");
    expect(node!.height).toBe(20);
  });

  it("Separator renders as a 1px-tall full-width strip", () => {
    const node = classify(el("Separator"));
    expect(node!.height).toBe(1);
    expect(node!.width).toBe("full");
  });

  it("Switch resolves to a pill-shaped toggle", () => {
    const node = classify(el("Switch"));
    expect(node!.width).toBe(44);
    expect(node!.height).toBe(24);
    expect(node!.radius).toBe(9999);
  });

  it("Checkbox resolves to a tiny square", () => {
    const node = classify(el("Checkbox"));
    expect(node!.width).toBe(16);
    expect(node!.height).toBe(16);
    expect(node!.radius).toBe(4);
  });

  it("Progress renders as a thin full-width pill bar", () => {
    const node = classify(el("Progress"));
    expect(node!.width).toBe("full");
    expect(node!.height).toBe(8);
  });
});

describe("classify (shadcn Alert)", () => {
  it("AlertTitle is a medium text bar; AlertDescription is paragraph", () => {
    expect(classify(el("AlertTitle"))!.height).toBe(18);
    expect(classify(el("AlertDescription"))!.kind).toBe("paragraph");
  });
});

describe("classify (variant prop resolution)", () => {
  it("Typography variant=\"h1\" → text with h1 height", () => {
    const node = classify(el("Typography", "", [], false, { variant: "h1" }));
    expect(node!.kind).toBe("text");
    expect(node!.height).toBe(32);
  });

  it("Typography variant=\"h3\" → text with h3 height", () => {
    const node = classify(el("Typography", "", [], false, { variant: "h3" }));
    expect(node!.height).toBe(24);
  });

  it("Typography variant=\"body1\" → paragraph with lineCount", () => {
    const node = classify(
      el("Typography", "", [], false, { variant: "body1" }),
    );
    expect(node!.kind).toBe("paragraph");
    expect(node!.lineCount).toBe(3);
  });

  it("Typography variant=\"caption\" → text with span dimensions", () => {
    const node = classify(
      el("Typography", "", [], false, { variant: "caption" }),
    );
    expect(node!.kind).toBe("text");
    expect(node!.width).toBe(80);
  });

  it("Typography with unknown variant falls back to pattern text mapping", () => {
    const node = classify(
      el("Typography", "", [], false, { variant: "bogus" }),
    );
    expect(node!.kind).toBe("text");
    expect(node!.height).toBe(16);
  });

  it("Typography with no variant uses pattern text mapping", () => {
    const node = classify(el("Typography"));
    expect(node!.kind).toBe("text");
    expect(node!.height).toBe(16);
  });

  it("variant prop on non-Typography tag is ignored", () => {
    const node = classify(el("Button", "", [], false, { variant: "h1" }));
    expect(node!.kind).toBe("button");
    expect(node!.height).toBe(40);
  });
});

describe("classify (layout)", () => {
  it("emits layout from flex-row + gap classes", () => {
    const node = classify(el("div", "flex flex-row gap-4"));
    expect(node!.layout).toEqual({ direction: "row", gap: 16 });
  });

  it("emits col layout from bare flex", () => {
    const node = classify(el("div", "flex"));
    expect(node!.layout).toEqual({ direction: "row", gap: undefined });
  });

  it("recurses children into SkeletonNodes", () => {
    const node = classify(
      el("div", "flex flex-col gap-2", [el("h1"), el("p")]),
    );
    expect(node!.children).toHaveLength(2);
    expect(node!.children![0].kind).toBe("text");
    expect(node!.children![1].kind).toBe("paragraph");
  });
});

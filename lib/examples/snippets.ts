/**
 * Shape of a single starter template entry used by the starter browser.
 * Contains metadata for categorization and search, plus JSX source code.
 */
export type ExampleSnippet = {
  id: string;
  name: string;
  category: "content" | "saas" | "dashboard" | "commerce";
  description: string;
  tag: string;
  source: string;
};

/**
 * Curated JSX components organized by category for the starter browser.
 * Each snippet renders convincingly with the parser's heuristics and
 * demonstrates key layout patterns.
 */
export const EXAMPLE_SNIPPETS: ExampleSnippet[] = [
  // ── CONTENT ──────────────────────────────────────────
  {
    id: "profile-card",
    name: "Profile Card",
    category: "content",
    description: "Content · 2 sections",
    tag: "card",
    source: `export default function ProfileCard() {
  return (
    <div className="flex flex-col gap-4 w-80">
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-full bg-zinc-200" />
        <div className="flex flex-col gap-2">
          <h2 className="w-32 h-4" />
          <p className="w-48 h-3" />
        </div>
      </div>
      <p className="w-full h-3" />
    </div>
  );
}`,
  },
  {
    id: "blog-card",
    name: "Blog card",
    category: "content",
    description: "Content · 3 sections",
    tag: "card",
    source: `export default function BlogCard() {
  return (
    <div className="flex flex-col gap-4 w-80 p-4 bg-white border rounded-2xl">
      <div className="flex gap-3">
        <img className="w-10 h-10 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <h3 className="w-24 h-4" />
          <p className="w-16 h-3" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="w-full h-5" />
        <p className="w-full h-3" />
        <p className="w-3/4 h-3" />
      </div>
      <img className="w-full h-40 rounded-lg" />
    </div>
  );
}`,
  },
  {
    id: "article-row",
    name: "Article row",
    category: "content",
    description: "Content · 4 fields",
    tag: "list",
    source: `export const ArticleRow = () => (
  <div className="flex gap-4 w-[640px]">
    <img className="w-40 h-28 rounded-lg" />
    <div className="flex flex-col gap-2 flex-1">
      <h2 className="w-64 h-5" />
      <p className="w-full h-3" />
      <p className="w-3/4 h-3" />
      <span className="w-20 h-3 mt-2" />
    </div>
  </div>
)`,
  },
  {
    id: "media-tile",
    name: "Media tile",
    category: "content",
    description: "Content · 2 sections",
    tag: "grid",
    source: `export function MediaTile() {
  return (
    <div className="w-64 flex flex-col gap-3">
      <img className="w-full h-36 rounded-xl" />
      <div className="flex flex-col gap-1.5 px-1">
        <h3 className="w-3/4 h-4" />
        <p className="w-1/2 h-3" />
      </div>
    </div>
  );
}`,
  },

  // ── SAAS ─────────────────────────────────────────────
  {
    id: "pricing-table",
    name: "Pricing table",
    category: "saas",
    description: "SaaS · 3 tiers · 12 nodes",
    tag: "pricing",
    source: `export default function PricingTable() {
  return (
    <div className="flex gap-6 w-[800px]">
      {tiers.map((t) => (
        <div className="flex-1 flex flex-col gap-4 p-6 border rounded-2xl">
          <h3 className="w-24 h-5" />
          <div className="w-16 h-8" />
          <p className="w-full h-3" />
          <div className="flex flex-col gap-2">
            <span className="w-3/4 h-3" />
            <span className="w-2/3 h-3" />
            <span className="w-4/5 h-3" />
          </div>
          <button className="w-full h-10 rounded-lg" />
        </div>
      ))}
    </div>
  );
}`,
  },
  {
    id: "feature-grid",
    name: "Feature grid",
    category: "saas",
    description: "SaaS · 6 cells",
    tag: "grid",
    source: `export function FeatureGrid() {
  return (
    <div className="grid grid-cols-3 gap-6 w-[720px]">
      {features.map((f) => (
        <div className="flex flex-col gap-3 p-4">
          <div className="w-10 h-10 rounded-lg" />
          <h3 className="w-32 h-4" />
          <p className="w-full h-3" />
          <p className="w-3/4 h-3" />
        </div>
      ))}
    </div>
  );
}`,
  },
  {
    id: "marketing-hero",
    name: "Marketing hero",
    category: "saas",
    description: "SaaS · 5 nodes",
    tag: "hero",
    source: `export default function Hero() {
  return (
    <div className="flex flex-col items-center gap-6 w-[560px] py-12">
      <span className="w-24 h-6 rounded-full" />
      <h1 className="w-96 h-10" />
      <p className="w-80 h-4" />
      <div className="flex gap-3">
        <button className="w-32 h-10 rounded-lg" />
        <button className="w-32 h-10 rounded-lg" />
      </div>
      <div className="w-full h-64 rounded-2xl mt-4" />
    </div>
  );
}`,
  },

  // ── DASHBOARD ────────────────────────────────────────
  {
    id: "stat-row",
    name: "Stat row",
    category: "dashboard",
    description: "Dashboard · 4 metrics",
    tag: "kpi",
    source: `export function StatRow() {
  return (
    <div className="flex gap-4 w-[640px]">
      {stats.map((s) => (
        <div className="flex-1 flex flex-col gap-2 p-4 border rounded-xl">
          <span className="w-20 h-3" />
          <span className="w-16 h-7" />
          <span className="w-12 h-3" />
        </div>
      ))}
    </div>
  );
}`,
  },
  {
    id: "chart-card",
    name: "Chart card",
    category: "dashboard",
    description: "Dashboard · header + body",
    tag: "chart",
    source: `export default function ChartCard() {
  return (
    <div className="w-96 p-4 border rounded-xl flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="w-28 h-4" />
        <span className="w-16 h-6 rounded" />
      </div>
      <div className="w-full h-48 rounded-lg" />
      <div className="flex gap-4">
        <span className="w-16 h-3" />
        <span className="w-16 h-3" />
        <span className="w-16 h-3" />
      </div>
    </div>
  );
}`,
  },
  {
    id: "data-table",
    name: "Data table",
    category: "dashboard",
    description: "Dashboard · 5 rows · 4 cols",
    tag: "table",
    source: `export default function DataTable() {
  return (
    <div className="flex flex-col w-[640px] border rounded-xl overflow-hidden">
      <div className="flex gap-4 px-4 py-3 bg-zinc-50 border-b">
        <span className="w-32 h-3" />
        <span className="w-24 h-3" />
        <span className="w-40 h-3" />
        <span className="w-20 h-3" />
      </div>
      {rows.map((r) => (
        <div className="flex gap-4 px-4 py-3 border-b">
          <span className="w-32 h-3" />
          <span className="w-24 h-3" />
          <span className="w-40 h-3" />
          <span className="w-20 h-3" />
        </div>
      ))}
    </div>
  );
}`,
  },

  // ── COMMERCE ─────────────────────────────────────────
  {
    id: "product-card",
    name: "Product card",
    category: "commerce",
    description: "Commerce · 4 nodes",
    tag: "card",
    source: `export default function ProductCard() {
  return (
    <div className="w-72 flex flex-col gap-3 border rounded-2xl overflow-hidden">
      <img className="w-full h-48" />
      <div className="flex flex-col gap-2 p-4">
        <h3 className="w-3/4 h-4" />
        <p className="w-1/2 h-3" />
        <div className="flex items-center justify-between mt-2">
          <span className="w-16 h-5" />
          <button className="w-20 h-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}`,
  },
  {
    id: "checkout-form",
    name: "Checkout form",
    category: "commerce",
    description: "Commerce · 6 fields",
    tag: "card",
    source: `export function CheckoutForm() {
  return (
    <div className="w-96 flex flex-col gap-4 p-6 border rounded-2xl">
      <h2 className="w-40 h-6" />
      <div className="flex flex-col gap-3">
        <input className="w-full h-10 rounded-lg" />
        <div className="flex gap-3">
          <input className="flex-1 h-10 rounded-lg" />
          <input className="w-20 h-10 rounded-lg" />
        </div>
        <input className="w-full h-10 rounded-lg" />
        <input className="w-full h-10 rounded-lg" />
      </div>
      <button className="w-full h-10 rounded-lg mt-2" />
    </div>
  );
}`,
  },
];

/** Group snippets by category for the starter browser. */
export const CATEGORIES = ["content", "saas", "dashboard", "commerce"] as const;

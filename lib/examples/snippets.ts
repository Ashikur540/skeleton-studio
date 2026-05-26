/**
 * Shape of a single preset example entry used by the UI's example loader.
 * Contains metadata and JSX source code for cold-start patterns.
 */
export type ExampleSnippet = {
  id: string;
  name: string;
  source: string;
};

/**
 * Curated JSX components used as cold-start examples in the paste panel.
 * Each snippet renders convincingly with the parser's heuristic + Tailwind reader,
 * ensuring first-paste output looks impressive and demonstrates key layout patterns.
 */
export const EXAMPLE_SNIPPETS: ExampleSnippet[] = [
  {
    id: "profile-card",
    name: "Profile Card",
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
    id: "blog-row",
    name: "Blog Row",
    source: `export const BlogRow = () => (
  <div className="flex gap-4 w-[640px]">
    <img className="w-40 h-28 rounded-lg" />
    <div className="flex flex-col gap-2 flex-1">
      <h2 className="w-64 h-5" />
      <p className="w-full h-3" />
      <p className="w-3/4 h-3" />
    </div>
  </div>
);`,
  },
  {
    id: "table-row",
    name: "Table Row",
    source: `export default function TableRow() {
  return (
    <ul className="flex flex-col gap-2 w-[640px]">
      {rows.map((r) => (
        <li className="flex gap-4 w-full h-10">
          <span className="w-32 h-4" />
          <span className="w-24 h-4" />
          <span className="w-40 h-4" />
        </li>
      ))}
    </ul>
  );
}`,
  },
];

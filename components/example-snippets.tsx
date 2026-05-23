"use client";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import { EXAMPLE_SNIPPETS } from "@/lib/examples/snippets";

/**
 * Quick-load pill buttons that drop a curated JSX snippet into the paste box
 * and immediately run the parser. Designed for first-time users who want to
 * explore the workflow without writing or pasting their own component first.
 * Uses queueMicrotask so parseNow reads the new source value Zustand just wrote.
 */
export function ExampleSnippets() {
  const setSource = useSkeletonStore((s) => s.setSource);
  const parseNow = useSkeletonStore((s) => s.parseNow);

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Try:</span>
      {EXAMPLE_SNIPPETS.map((snip) => (
        <button
          key={snip.id}
          onClick={() => {
            setSource(snip.source);
            // setState is sync in Zustand; queueMicrotask lets parseNow read the new source.
            queueMicrotask(parseNow);
          }}
          className="px-3 py-1 rounded-full bg-card border border-border text-foreground hover:bg-secondary/80"
        >
          {snip.name}
        </button>
      ))}
    </div>
  );
}

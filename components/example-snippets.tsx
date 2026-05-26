"use client";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import { EXAMPLE_SNIPPETS } from "@/lib/examples/snippets";
import { Button } from "@/components/ui/button";

/**
 * Quick-load pill buttons that drop a curated JSX snippet into the paste box
 * and immediately run the parser with the new source passed explicitly. Lets
 * first-time users explore the workflow without typing.
 */
export function ExampleSnippets() {
  const setSource = useSkeletonStore((s) => s.setSource);
  const parseNow = useSkeletonStore((s) => s.parseNow);

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Try:</span>
      {EXAMPLE_SNIPPETS.map((snip) => (
        <Button
          key={snip.id}
          variant="outline"
          size="sm"
          onClick={() => {
            setSource(snip.source);
            parseNow(snip.source);
          }}
        >
          {snip.name}
        </Button>
      ))}
    </div>
  );
}

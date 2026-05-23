"use client";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * Left-pane textarea where the user pastes JSX source, plus the Generate
 * button that triggers a full parse and an inline error banner when the
 * parser returns a structured error. All state lives in the Zustand store;
 * this component is purely a controlled view with no local state.
 */
export function PasteInput() {
  const source = useSkeletonStore((s) => s.source);
  const error = useSkeletonStore((s) => s.error);
  const setSource = useSkeletonStore((s) => s.setSource);
  const parseNow = useSkeletonStore((s) => s.parseNow);

  return (
    <div className="flex flex-col gap-2 h-full">
      <Label
        htmlFor="jsx-source"
        className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
      >
        Paste JSX
      </Label>
      <Textarea
        id="jsx-source"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        spellCheck={false}
        className="flex-1 font-mono text-sm resize-none"
        placeholder="export default function Card() { ... }"
      />
      <div className="flex items-center gap-3">
        <Button onClick={() => parseNow()}>Generate Skeleton</Button>
        {error && (
          <span className="text-sm text-destructive">
            {error.kind === "syntax-error" && "Syntax error: "}
            {error.kind === "no-return" && "No JSX return found. "}
            {error.kind === "no-component" && "Return is not JSX. "}
            {error.message}
          </span>
        )}
      </div>
    </div>
  );
}

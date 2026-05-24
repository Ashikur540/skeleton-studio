"use client";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CodeEditor } from "./code-editor";

/**
 * Left-pane code editor where the user pastes JSX source, plus the Generate
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
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Paste JSX
      </Label>
      <div className="flex-1 min-h-0">
        <CodeEditor
          value={source}
          onChange={setSource}
          error={error}
          placeholder="export default function Card() { ... }"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={() => parseNow()}>Generate Skeleton</Button>
        {error && (
          <span className="text-sm text-destructive">
            {error.kind === "syntax-error" && "Syntax error: "}
            {error.kind === "no-return" && "No JSX return found. "}
            {error.kind === "no-component" && "Return is not JSX. "}
            {error.message}
            {error.loc && (
              <span className="ml-1 opacity-70">
                (line {error.loc.line}, col {error.loc.column + 1})
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}

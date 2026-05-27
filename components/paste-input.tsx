"use client";
import { Button } from "@/components/ui/button";
import { formatSource } from "@/lib/format-source";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import {
  AiMagicIcon,
  CodeIcon,
  FolderLibraryIcon,
  ZapIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useState } from "react";
import { CodeEditor } from "./code-editor";

/**
 * Left-pane code editor with header bar (CodeIcon + label + format button),
 * the CodeMirror editor, and footer bar (Browse starters + Generate skeleton).
 */
export function PasteInput({
  onBrowseStarters,
}: {
  onBrowseStarters?: () => void;
}) {
  const source = useSkeletonStore((s) => s.source);
  const error = useSkeletonStore((s) => s.error);
  const setSource = useSkeletonStore((s) => s.setSource);
  const parseNow = useSkeletonStore((s) => s.parseNow);
  const [formatting, setFormatting] = useState(false);

  const handleFormat = useCallback(async () => {
    if (!source.trim() || formatting) return;
    setFormatting(true);
    const formatted = await formatSource(source);
    setSource(formatted);
    setFormatting(false);
  }, [source, formatting, setSource]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <HugeiconsIcon icon={CodeIcon} size={14} strokeWidth={2} />
          <span className="uppercase tracking-wider font-medium">
            Input UI · JSX
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleFormat}
          disabled={formatting || !source.trim()}
          title="Format code"
        >
          <HugeiconsIcon icon={AiMagicIcon} size={16} strokeWidth={2} />
        </Button>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0 px-1">
        <CodeEditor
          value={source}
          onChange={setSource}
          error={error}
          placeholder="export default function Card() { ... }"
        />
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-3 py-1.5 text-xs text-destructive border-t border-destructive/20 bg-destructive/5 shrink-0">
          {error.kind === "syntax-error" && "Syntax error: "}
          {error.kind === "no-return" && "No JSX return found. "}
          {error.kind === "no-component" && "Return is not JSX. "}
          {error.message}
          {error.loc && (
            <span className="ml-1 opacity-70">
              (line {error.loc.line}, col {error.loc.column + 1})
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2.5 border-t border-border shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="text-xs gap-1.5"
          onClick={onBrowseStarters}
        >
          <HugeiconsIcon icon={FolderLibraryIcon} size={14} strokeWidth={2} />
          Browse starters
        </Button>
        <Button
          size="sm"
          className="bg-primary text-primary-foreground text-xs gap-1.5"
          onClick={() => parseNow()}
        >
          <HugeiconsIcon icon={ZapIcon} size={14} strokeWidth={2} />
          Generate skeleton
        </Button>
      </div>
    </div>
  );
}

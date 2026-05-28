"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportHTML } from "@/lib/exporters/html-tailwind";
import { exportReact } from "@/lib/exporters/react-tailwind";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";

type Tab = "react" | "html";

/**
 * Split-pane export dialog: code area on the left with React/HTML tabs, and a
 * sidebar on the right with summary stats and option toggles. Footer shows
 * validation status, Cancel, and Download button.
 */
export function ExportModal({ onClose }: { onClose: () => void }) {
  const tree = useSkeletonStore((s) => s.tree);
  const settings = useSkeletonStore((s) => s.settings);
  const componentName = useSkeletonStore((s) => s.componentName);
  const [tab, setTab] = useState<Tab>("react");

  const reactOutput = useMemo(() => {
    if (!tree) return "";
    return exportReact(tree, settings);
  }, [tree, settings]);

  const htmlOutput = useMemo(() => {
    if (!tree) return "";
    return exportHTML(tree, settings);
  }, [tree, settings]);

  const output = tab === "react" ? reactOutput : htmlOutput;
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const download = useCallback(() => {
    const ext = tab === "react" ? "jsx" : "html";
    const name = componentName
      ? `${componentName}Skeleton.${ext}`
      : `skeleton.${ext}`;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }, [output, tab, componentName]);

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const cmExtensions = useMemo(
    () => [
      javascript({ jsx: true, typescript: true }),
      EditorView.lineWrapping,
      EditorView.editable.of(false),
    ],
    [],
  );

  const lines = output.split("\n").length;
  const sizeBytes = new Blob([output]).size;
  const sizeLabel = sizeBytes > 1024 ? `${(sizeBytes / 1024).toFixed(1)} KB` : `${sizeBytes} B`;
  const filename = componentName
    ? `${componentName}Skeleton.${tab === "react" ? "jsx" : "html"}`
    : `skeleton.${tab === "react" ? "jsx" : "html"}`;

  return (
    <Dialog open={true} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="flex! flex-col! max-h-[85vh] sm:max-w-200! lg:max-w-260!"
      >
        {/* Header with tabs + filename */}
        <div className="flex items-center gap-3 border-b border-border pb-2 -mt-2">
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as Tab)}
            className="flex-1"
          >
            <div className="flex items-center gap-3">
              <TabsList>
                <TabsTrigger value="react" className="text-xs">React · Tailwind</TabsTrigger>
                <TabsTrigger value="html" className="text-xs">HTML · Tailwind</TabsTrigger>
              </TabsList>
              <span className="text-xs text-muted-foreground font-mono">
                {filename}
              </span>
            </div>
          </Tabs>
        </div>

        {/* Split content: code + sidebar */}
        <div className="flex flex-col-reverse sm:flex-row flex-1 min-h-0 gap-4">
          {/* Code area */}
          <div className="flex-1 min-w-0 flex flex-col relative">
            <Button
              variant="outline"
              size="xs"
              className="absolute top-2 right-2 z-10"
              onClick={copy}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
            <div className="w-full flex-1 min-h-0 overflow-hidden rounded-lg bg-muted/30 [&_.cm-editor]:!bg-transparent [&_.cm-gutters]:!bg-transparent [&_.cm-editor]:h-full [&_.cm-scroller]:!overflow-auto">
              {output ? (
                <CodeMirror
                  value={output}
                  theme={isDark ? githubDark : githubLight}
                  extensions={cmExtensions}
                  readOnly
                  editable={false}
                  height="100%"
                  basicSetup={{
                    lineNumbers: true,
                    highlightActiveLine: false,
                    highlightActiveLineGutter: false,
                    foldGutter: true,
                    autocompletion: false,
                    searchKeymap: false,
                    bracketMatching: true,
                  }}
                  style={{ height: "100%", fontSize: "12px" }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                  Generate a skeleton first.
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="sm:w-48 shrink-0 flex sm:flex-col gap-4 text-xs">
            {/* Summary */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
                Summary
              </span>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lines</span>
                <span className="tabular-nums">{lines}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Size</span>
                <span className="tabular-nums">{sizeLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Animation</span>
                <span>animate-{settings.animation}</span>
              </div>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
                Options
              </span>
              <span className="text-xs text-muted-foreground">
                All output uses Tailwind v4-compatible arbitrary value syntax.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:justify-between border-t border-border pt-3 -mb-2">
          <span className="text-xs text-muted-foreground">
            ✓ Validated · 0 errors
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground"
              onClick={download}
              disabled={!output}
            >
              Download .{tab === "react" ? "jsx" : "html"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportHTML } from "@/lib/exporters/html-tailwind";
import { exportReact } from "@/lib/exporters/react-tailwind";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import { useCallback, useMemo, useRef, useState } from "react";

type Tab = "react" | "html";

/**
 * Fullscreen overlay that presents the generated React or HTML code in two
 * tabs and copies to the clipboard on demand. Closes via the built-in Dialog
 * X button. Output is memoized on tree + settings + tab so tab switches are
 * instant and don't re-run exporters unnecessarily.
 */
export function ExportModal({ onClose }: { onClose: () => void }) {
  const tree = useSkeletonStore((s) => s.tree);
  const settings = useSkeletonStore((s) => s.settings);
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

  return (
    <Dialog open={true} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className={
          // shadcn DialogContent defaults to `display: grid` with auto rows
          // which lets the middle Tabs row grow to fit its content, blowing
          // past max-h. Force flex-col so the middle row is a true flex-1
          // bounded by max-h-[85vh]. Plus responsive width caps that beat
          // the built-in sm:max-w-md.
          "flex! flex-col! max-h-[85vh] " +
          "sm:max-w-160! md:max-w-205! lg:max-w-250! xl:max-w-275!"
        }
      >
        <DialogHeader>
          <DialogTitle>Export</DialogTitle>
        </DialogHeader>
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as Tab)}
          className="flex flex-col flex-1 min-h-0 min-w-0"
        >
          <TabsList>
            <TabsTrigger value="react">React + Tailwind</TabsTrigger>
            <TabsTrigger value="html">HTML + Tailwind</TabsTrigger>
          </TabsList>
          <TabsContent value="react" className="flex-1 min-h-0 min-w-0">
            <pre
              className={
                " w-full max-h-125 min-w-0 overflow-auto p-4 text-xs text-foreground font-mono " +
                "whitespace-pre-wrap break-all bg-card rounded-lg"
              }
            >
              {reactOutput || "Generate a skeleton first."}
            </pre>
          </TabsContent>
          <TabsContent value="html" className="flex-1 min-h-0 min-w-0">
            <pre
              className={
                " w-full max-h-125 min-w-0 overflow-auto p-4 text-xs text-foreground font-mono " +
                "whitespace-pre-wrap break-all bg-card rounded-lg"
              }
            >
              {htmlOutput || "Generate a skeleton first."}
            </pre>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button onClick={copy} disabled={!output}>
            {copied ? "Copied!" : "Copy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

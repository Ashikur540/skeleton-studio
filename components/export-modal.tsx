"use client";
import { useMemo, useState } from "react";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import { exportReact } from "@/lib/exporters/react-tailwind";
import { exportHTML } from "@/lib/exporters/html-tailwind";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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

  const copy = async () => {
    await navigator.clipboard.writeText(output);
  };

  return (
    <Dialog open={true} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[720px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Export</DialogTitle>
        </DialogHeader>
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as Tab)}
          className="flex flex-col flex-1 min-h-0"
        >
          <TabsList>
            <TabsTrigger value="react">React + Tailwind</TabsTrigger>
            <TabsTrigger value="html">HTML + Tailwind</TabsTrigger>
          </TabsList>
          <TabsContent value="react" className="flex-1 min-h-0">
            <pre className="h-full overflow-auto p-4 text-xs text-foreground font-mono whitespace-pre bg-card rounded-lg">
              {reactOutput || "Generate a skeleton first."}
            </pre>
          </TabsContent>
          <TabsContent value="html" className="flex-1 min-h-0">
            <pre className="h-full overflow-auto p-4 text-xs text-foreground font-mono whitespace-pre bg-card rounded-lg">
              {htmlOutput || "Generate a skeleton first."}
            </pre>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button onClick={copy} disabled={!output}>Copy</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

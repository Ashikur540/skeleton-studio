"use client";
import { useMemo, useState } from "react";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import { exportReact } from "@/lib/exporters/react-tailwind";
import { exportHTML } from "@/lib/exporters/html-tailwind";

type Tab = "react" | "html";

/**
 * Fullscreen overlay that presents the generated React or HTML code in two
 * tabs and copies to the clipboard on demand. Closes on backdrop click or the
 * explicit Close button. Output is memoized on tree + settings + tab so tab
 * switches are instant and don't re-run exporters unnecessarily.
 */
export function ExportModal({ onClose }: { onClose: () => void }) {
  const tree = useSkeletonStore((s) => s.tree);
  const settings = useSkeletonStore((s) => s.settings);
  const [tab, setTab] = useState<Tab>("react");

  const output = useMemo(() => {
    if (!tree) return "";
    return tab === "react" ? exportReact(tree, settings) : exportHTML(tree, settings);
  }, [tree, settings, tab]);

  const copy = async () => {
    await navigator.clipboard.writeText(output);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="w-[720px] max-h-[80vh] bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex gap-2">
            <TabButton active={tab === "react"} onClick={() => setTab("react")}>
              React + Tailwind
            </TabButton>
            <TabButton active={tab === "html"} onClick={() => setTab("html")}>
              HTML + Tailwind
            </TabButton>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 text-sm"
          >
            Close
          </button>
        </header>
        <pre className="flex-1 overflow-auto p-4 text-xs text-zinc-200 font-mono whitespace-pre">
          {output || "Generate a skeleton first."}
        </pre>
        <footer className="p-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={copy}
            disabled={!output}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
          >
            Copy
          </button>
        </footer>
      </div>
    </div>
  );
}

/**
 * Visual toggle for the active vs inactive tab within the modal header. Kept
 * local because the modal is the only place in the app that needs tab-style
 * navigation at this stage.
 */
function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm ${
        active
          ? "bg-zinc-800 text-zinc-100"
          : "text-zinc-400 hover:text-zinc-200"
      }`}
    >
      {children}
    </button>
  );
}

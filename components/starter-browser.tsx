"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES, EXAMPLE_SNIPPETS } from "@/lib/examples/snippets";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import { Cancel01Icon, FolderLibraryIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Left side-sheet overlay listing starter templates organized by category.
 * Supports search filtering and keyboard navigation (↑↓ to move, Enter to
 * insert, Esc to close). Overlays the code editor pane when open.
 */
export function StarterBrowser({ onClose }: { onClose: () => void }) {
  const setSource = useSkeletonStore((s) => s.setSource);
  const parseNow = useSkeletonStore((s) => s.parseNow);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return EXAMPLE_SNIPPETS;
    const q = search.toLowerCase();
    return EXAMPLE_SNIPPETS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.tag.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q),
    );
  }, [search]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const cat of CATEGORIES) {
      const items = filtered.filter((s) => s.category === cat);
      if (items.length > 0) map.set(cat, items);
    }
    return map;
  }, [filtered]);

  const flatList = useMemo(() => filtered, [filtered]);

  const insert = useCallback(
    (index: number) => {
      const snip = flatList[index];
      if (!snip) return;
      setSource(snip.source);
      parseNow(snip.source);
      onClose();
    },
    [flatList, setSource, parseNow, onClose],
  );

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setSelectedIndex(0);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, flatList.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        insert(selectedIndex);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [flatList, selectedIndex, insert, onClose]);

  useEffect(() => {
    const active = listRef.current?.querySelector("[data-active=true]");
    active?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  let flatIndex = -1;

  return (
    <div className="absolute inset-0 z-50 flex flex-col sm:flex-row">
      {/* Side sheet */}
      <div className="w-full sm:w-80 bg-background sm:border-r border-b sm:border-b-0 border-border flex flex-col h-full shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={FolderLibraryIcon} size={14} strokeWidth={2} />
            <span className="text-sm font-medium">Starters</span>
          </div>
          <Button variant="ghost" size="icon-xs" onClick={onClose}>
            <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2} />
          </Button>
        </div>

        {/* Search */}
        <div className="px-3 py-2 shrink-0">
          <Input
            ref={searchRef}
            className="h-8 text-xs"
            placeholder="Search starters by name, category, tag..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* List */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-1">
          {Array.from(grouped.entries()).map(([cat, items]) => (
            <div key={cat} className="mb-2">
              <div className="px-2 py-1.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                {cat} {items.length}
              </div>
              {items.map((snip) => {
                flatIndex++;
                const idx = flatIndex;
                const isActive = idx === selectedIndex;
                return (
                  <div
                    key={snip.id}
                    data-active={isActive}
                    className={
                      "flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer text-sm " +
                      (isActive
                        ? "bg-primary/10 text-foreground"
                        : "hover:bg-muted/50 text-foreground")
                    }
                    onClick={() => insert(idx)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    {/* Thumbnail placeholder */}
                    <div className="w-9 h-9 rounded bg-muted/60 shrink-0 flex items-center justify-center">
                      <div className="w-5 h-3 rounded-sm bg-muted-foreground/15" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">
                        {snip.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {snip.description}
                      </div>
                    </div>
                    <span className="text-[11px] px-1.5 py-0.5 rounded border border-border text-muted-foreground font-mono shrink-0">
                      {snip.tag}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
          {flatList.length === 0 && (
            <div className="px-3 py-8 text-xs text-muted-foreground text-center">
              No starters match &ldquo;{search}&rdquo;
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 text-[11px] text-muted-foreground border-t border-border shrink-0 flex items-center gap-3">
          <span>↕ navigate</span>
          <span>↵ insert</span>
          <span>esc close</span>
        </div>
      </div>

      {/* Backdrop */}
      <div className="hidden sm:block flex-1 bg-black/20" onClick={onClose} />
    </div>
  );
}

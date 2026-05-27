"use client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Reusable collapsible section for the properties panel. Renders an uppercase
 * title with optional badge and toggle switch. Chevron rotates to indicate
 * open/closed state. First section omits the top border separator.
 */
export function SectionWrapper({
  title,
  badge,
  toggle,
  defaultOpen = true,
  noBorder,
  children,
}: {
  title: string;
  badge?: string;
  toggle?: { checked: boolean; onChange: (v: boolean) => void };
  defaultOpen?: boolean;
  noBorder?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          "flex items-center justify-between pt-3 pb-1",
          !noBorder && "border-t border-border mt-1",
        )}
      >
        <CollapsibleTrigger className="flex items-center gap-2 group cursor-pointer">
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            className={cn(
              "text-muted-foreground transition-transform duration-200",
              open && "rotate-90",
            )}
          >
            <path d="M3 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
            {title}
          </span>
          {badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono leading-none">
              {badge}
            </span>
          )}
        </CollapsibleTrigger>
        {toggle && (
          <Switch
            size="sm"
            checked={toggle.checked}
            onCheckedChange={toggle.onChange}
          />
        )}
      </div>
      <CollapsibleContent className="flex flex-col gap-3 pt-2 pb-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

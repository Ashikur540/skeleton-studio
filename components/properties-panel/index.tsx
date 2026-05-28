"use client";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { HugeiconsIcon } from "@hugeicons/react";
import { WebDesign01Icon, KeyframesMultipleIcon } from "@hugeicons/core-free-icons";
import { DesignTab } from "./design-tab";
import { AnimationTab } from "./animation-tab";

/**
 * Right-pane properties panel with two tabs: Design (node properties) and
 * Animation (global render settings). Uses shadcn Tabs with line variant for
 * the underline indicator style matching the Figma-inspired design.
 */
export function PropertiesPanel() {
  return (
    <Tabs defaultValue="design" className="flex flex-col flex-1 min-h-0">
        <TabsList variant="line" className="px-3 pt-2 shrink-0">
          <TabsTrigger value="design" className="text-xs gap-1.5">
            <HugeiconsIcon icon={WebDesign01Icon} size={14} strokeWidth={2} />
            Design
          </TabsTrigger>
          <TabsTrigger value="animation" className="text-xs gap-1.5">
            <HugeiconsIcon icon={KeyframesMultipleIcon} size={14} strokeWidth={2} />
            Animation
          </TabsTrigger>
        </TabsList>
        <TabsContent value="design" className="overflow-y-auto px-3 pt-1">
          <DesignTab />
        </TabsContent>
        <TabsContent value="animation" className="overflow-y-auto px-3 pt-1">
          <AnimationTab />
        </TabsContent>
      </Tabs>
  );
}

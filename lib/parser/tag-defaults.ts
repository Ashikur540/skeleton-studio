import type { SkeletonKind, StyleHints } from "@/lib/ir/types";

/**
 * Describes the shape of a tag's fallback skeleton metadata.
 * Pairs a skeleton kind with default style hints (dimensions, radius) used when no Tailwind classes are found.
 */
export type TagDefault = {
  kind: SkeletonKind;
  defaults: StyleHints;
};

/**
 * Fallback dimensions and skeleton kind for common HTML tags.
 * Consulted by the parser when a tag has no Tailwind class hints; enables reasonable skeleton generation without class analysis.
 */
export const TAG_DEFAULTS: Record<string, TagDefault> = {
  h1: { kind: "text", defaults: { height: 32, width: "full", radius: 4 } },
  h2: { kind: "text", defaults: { height: 28, width: "full", radius: 4 } },
  h3: { kind: "text", defaults: { height: 24, width: "full", radius: 4 } },
  h4: { kind: "text", defaults: { height: 20, width: "full", radius: 4 } },
  h5: { kind: "text", defaults: { height: 18, width: "full", radius: 4 } },
  h6: { kind: "text", defaults: { height: 16, width: "full", radius: 4 } },
  p:  { kind: "paragraph", defaults: { height: 16, width: "full", radius: 4 } },
  span: { kind: "text", defaults: { height: 16, width: 80, radius: 4 } },
  a:    { kind: "text", defaults: { height: 16, width: 80, radius: 4 } },
  img:      { kind: "image", defaults: { width: 200, height: 150, radius: 8 } },
  button:   { kind: "button", defaults: { width: 100, height: 40, radius: 8 } },
  input:    { kind: "input", defaults: { width: 240, height: 40, radius: 6 } },
  textarea: { kind: "input", defaults: { width: 320, height: 80, radius: 6 } },
  select:   { kind: "input", defaults: { width: 200, height: 40, radius: 6 } },
  // Table elements — th/td become text cells; tr is a row-flow container, and
  // the wrapper tags (table/thead/tbody/tfoot) stack vertically. width:"full"
  // throughout the chain so cells distribute via flex-shrink instead of
  // cascading their width demand up to an unbounded ancestor.
  th: { kind: "text", defaults: { height: 16, width: "full", radius: 4 } },
  td: { kind: "text", defaults: { height: 16, width: "full", radius: 4 } },
  tr: { kind: "container", defaults: { direction: "row", gap: 12, width: "full" } },
  table:   { kind: "container", defaults: { direction: "col", gap: 8, width: "full" } },
  thead:   { kind: "container", defaults: { direction: "col", gap: 8, width: "full" } },
  tbody:   { kind: "container", defaults: { direction: "col", gap: 8, width: "full" } },
  tfoot:   { kind: "container", defaults: { direction: "col", gap: 8, width: "full" } },
  caption: { kind: "text", defaults: { height: 14, width: 120, radius: 4 } },
};

/**
 * Set of HTML tags that represent layout containers (flex/grid wrappers).
 * The parser skips generating skeleton content for these tags, treating them as structural-only containers.
 */
export const CONTAINER_TAGS = new Set([
  "div", "section", "article", "header", "footer", "main",
  "nav", "aside", "ul", "ol", "li", "form", "label",
]);

/**
 * Curated map of well-known React component identifiers to skeleton kind + defaults.
 * Higher precedence than the regex pattern matcher; reserve for component names whose
 * intent is unambiguous (Avatar, Card) or where the defaults differ meaningfully from
 * the generic suffix-based guess. shadcn primitives are registered explicitly so each
 * subcomponent lands on the right kind and direction rather than a generic container.
 */
export const COMPONENT_TAG_HINTS: Record<string, TagDefault> = {
  Avatar: { kind: "avatar", defaults: { width: 48, height: 48, radius: 9999 } },
  Card:   { kind: "card", defaults: { width: 320, height: 200, radius: 12 } },

  // shadcn / Radix Table primitives — match the HTML equivalents in semantics.
  // width:"full" propagates so cells share a bounded row width via flex-shrink.
  Table:         { kind: "container", defaults: { direction: "col", gap: 8, width: "full" } },
  TableHeader:   { kind: "container", defaults: { direction: "col", gap: 8, width: "full" } },
  TableBody:     { kind: "container", defaults: { direction: "col", gap: 8, width: "full" } },
  TableFooter:   { kind: "container", defaults: { direction: "col", gap: 8, width: "full" } },
  TableRow:      { kind: "container", defaults: { direction: "row", gap: 12, width: "full" } },
  // Cells use width:"full" so flex shrink distributes row width equally among
  // siblings — gives roughly aligned columns without a real grid layout.
  TableHead:     { kind: "text", defaults: { height: 16, width: "full", radius: 4 } },
  TableCell:     { kind: "text", defaults: { height: 16, width: "full", radius: 4 } },
  TableCaption:  { kind: "text", defaults: { height: 14, width: 160, radius: 4 } },

  // shadcn Card subcomponents. CardTitle is intentionally not pattern-matched
  // (no `*Title` regex) so the explicit hint pins the right text height.
  CardHeader:      { kind: "container", defaults: { direction: "col", gap: 6, width: "full" } },
  CardTitle:       { kind: "text", defaults: { height: 24, width: "full", radius: 4 } },
  CardDescription: { kind: "paragraph", defaults: { height: 14, width: "full", radius: 4 } },
  CardContent:     { kind: "container", defaults: { direction: "col", gap: 8, width: "full" } },
  CardFooter:      { kind: "container", defaults: { direction: "row", gap: 8, width: "full" } },
  CardAction:      { kind: "container", defaults: { direction: "row", gap: 4 } },

  // shadcn Tabs. TabsList is a horizontal pill bar of triggers; TabsContent
  // wraps the active panel and stacks its body vertically.
  Tabs:        { kind: "container", defaults: { direction: "col", gap: 8, width: "full" } },
  TabsList:    { kind: "container", defaults: { direction: "row", gap: 4, height: 40, width: "full" } },
  TabsTrigger: { kind: "button", defaults: { width: 100, height: 32, radius: 6 } },
  TabsContent: { kind: "container", defaults: { direction: "col", gap: 8, width: "full" } },

  // shadcn Accordion. AccordionTrigger renders as a full-width row with text +
  // chevron; AccordionContent collapses into a paragraph-like body when open.
  Accordion:        { kind: "container", defaults: { direction: "col", gap: 4, width: "full" } },
  AccordionItem:    { kind: "container", defaults: { direction: "col", gap: 4, width: "full" } },
  AccordionTrigger: { kind: "container", defaults: { direction: "row", gap: 8, height: 48, width: "full" } },
  AccordionContent: { kind: "paragraph", defaults: { height: 16, width: "full", radius: 4 } },

  // shadcn Dialog. The header/footer/body roles map to the same shapes as
  // Card subcomponents so skeletons read consistently across surface types.
  Dialog:            { kind: "container", defaults: { direction: "col", gap: 16, width: "full" } },
  DialogContent:     { kind: "container", defaults: { direction: "col", gap: 16, width: "full" } },
  DialogHeader:      { kind: "container", defaults: { direction: "col", gap: 6, width: "full" } },
  DialogTitle:       { kind: "text", defaults: { height: 24, width: "full", radius: 4 } },
  DialogDescription: { kind: "paragraph", defaults: { height: 14, width: "full", radius: 4 } },
  DialogFooter:      { kind: "container", defaults: { direction: "row", gap: 8, width: "full" } },

  // shadcn Sheet — same shape as Dialog; separate entries so sourceTag survives
  // the IR and panel/exporter can show the real tag the user wrote.
  Sheet:            { kind: "container", defaults: { direction: "col", gap: 16, width: "full" } },
  SheetContent:     { kind: "container", defaults: { direction: "col", gap: 16, width: "full" } },
  SheetHeader:      { kind: "container", defaults: { direction: "col", gap: 6, width: "full" } },
  SheetTitle:       { kind: "text", defaults: { height: 24, width: "full", radius: 4 } },
  SheetDescription: { kind: "paragraph", defaults: { height: 14, width: "full", radius: 4 } },
  SheetFooter:      { kind: "container", defaults: { direction: "row", gap: 8, width: "full" } },

  // shadcn Form. FormLabel is a small caption-height bar; FormDescription /
  // FormMessage are even shorter to read as helper text rather than body copy.
  Form:            { kind: "container", defaults: { direction: "col", gap: 16, width: "full" } },
  FormItem:        { kind: "container", defaults: { direction: "col", gap: 6, width: "full" } },
  FormLabel:       { kind: "text", defaults: { height: 14, width: 80, radius: 4 } },
  FormControl:     { kind: "container", defaults: { direction: "col", gap: 4, width: "full" } },
  FormDescription: { kind: "text", defaults: { height: 12, width: 200, radius: 4 } },
  FormMessage:     { kind: "text", defaults: { height: 12, width: 160, radius: 4 } },

  // shadcn Select. The visible bit is the trigger (input-shaped); SelectItem
  // rows render as full-width text bars so a dropdown list reads as a stack.
  Select:          { kind: "input", defaults: { width: 200, height: 40, radius: 6 } },
  SelectTrigger:   { kind: "input", defaults: { width: 200, height: 40, radius: 6 } },
  SelectValue:     { kind: "text", defaults: { height: 16, width: 120, radius: 4 } },
  SelectContent:   { kind: "container", defaults: { direction: "col", gap: 4 } },
  SelectItem:      { kind: "text", defaults: { height: 32, width: "full", radius: 4 } },
  SelectLabel:     { kind: "text", defaults: { height: 12, width: 80, radius: 4 } },
  SelectSeparator: { kind: "text", defaults: { height: 1, width: "full", radius: 0 } },

  // shadcn Alert. Header + body roles same shape as Card.
  Alert:            { kind: "container", defaults: { direction: "col", gap: 8, width: "full" } },
  AlertTitle:       { kind: "text", defaults: { height: 18, width: "full", radius: 4 } },
  AlertDescription: { kind: "paragraph", defaults: { height: 14, width: "full", radius: 4 } },

  // shadcn Popover / Tooltip — the trigger picks up button shape, the content
  // is a small floating column of children.
  Popover:        { kind: "container", defaults: { direction: "col" } },
  PopoverTrigger: { kind: "button", defaults: { width: 100, height: 40, radius: 8 } },
  PopoverContent: { kind: "container", defaults: { direction: "col", gap: 8, width: "full" } },
  Tooltip:        { kind: "container", defaults: { direction: "col" } },
  TooltipTrigger: { kind: "button", defaults: { width: 100, height: 40, radius: 8 } },
  TooltipContent: { kind: "container", defaults: { direction: "col", gap: 4 } },
  DropdownMenu:        { kind: "container", defaults: { direction: "col" } },
  DropdownMenuTrigger: { kind: "button", defaults: { width: 100, height: 40, radius: 8 } },
  DropdownMenuContent: { kind: "container", defaults: { direction: "col", gap: 4 } },
  DropdownMenuItem:    { kind: "text", defaults: { height: 32, width: "full", radius: 4 } },
  DropdownMenuLabel:   { kind: "text", defaults: { height: 12, width: 80, radius: 4 } },
  DropdownMenuSeparator: { kind: "text", defaults: { height: 1, width: "full", radius: 0 } },

  // shadcn primitives that render as small fixed shapes. Skeleton is treated
  // as a literal placeholder (pass-through dimensions); the rest take pill /
  // square shapes that match the real component's visual footprint.
  Badge:          { kind: "button", defaults: { width: 60, height: 22, radius: 9999 } },
  Skeleton:       { kind: "card", defaults: { width: 200, height: 20, radius: 6 } },
  Separator:      { kind: "text", defaults: { height: 1, width: "full", radius: 0 } },
  Progress:       { kind: "card", defaults: { width: "full", height: 8, radius: 9999 } },
  Slider:         { kind: "card", defaults: { width: "full", height: 20, radius: 9999 } },
  Switch:         { kind: "card", defaults: { width: 44, height: 24, radius: 9999 } },
  Toggle:         { kind: "button", defaults: { width: 80, height: 36, radius: 6 } },
  ToggleGroup:    { kind: "container", defaults: { direction: "row", gap: 4 } },
  ToggleGroupItem:{ kind: "button", defaults: { width: 36, height: 36, radius: 6 } },
  Checkbox:       { kind: "card", defaults: { width: 16, height: 16, radius: 4 } },
  RadioGroup:     { kind: "container", defaults: { direction: "col", gap: 8 } },
  RadioGroupItem: { kind: "card", defaults: { width: 16, height: 16, radius: 9999 } },
};

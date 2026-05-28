export function SectionEyebrow({ children, centered = false }: { children: React.ReactNode; centered?: boolean }) {
  return (
    <span className={`flex items-center gap-2 font-mono text-[11px] font-medium text-muted-foreground uppercase tracking-[0.14em] mb-[18px] ${centered ? "justify-center" : ""}`}>
      <span className="w-4 h-px bg-white/[0.14]" />
      {children}
      {centered && <span className="w-4 h-px bg-white/[0.14]" />}
    </span>
  );
}

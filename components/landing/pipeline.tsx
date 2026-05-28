import { SectionEyebrow } from "./shared";
import { type ReactNode } from "react";

const stages = [
  {
    title: "Parse", step: "01 / JSX", desc: "Babel-based tokenizer reads your component verbatim.",
    visual: <><span className="tok-punct">&lt;</span><span className="tok-tag">article</span><span className="tok-punct">&gt;</span><br />&nbsp;&nbsp;<span className="tok-punct">&lt;</span><span className="tok-tag">img</span> <span className="tok-attr">src</span>={"{"}u{"}"}<span className="tok-punct">/&gt;</span><br />&nbsp;&nbsp;<span className="tok-punct">&lt;</span><span className="tok-tag">h3</span><span className="tok-punct">&gt;</span>{"{"}u.name{"}"}<span className="tok-punct">&lt;/</span><span className="tok-tag">h3</span><span className="tok-punct">&gt;</span><br />&nbsp;&nbsp;<span className="tok-punct">&lt;</span><span className="tok-tag">p</span><span className="tok-punct">&gt;</span>{"{"}u.bio{"}"}<span className="tok-punct">&lt;/</span><span className="tok-tag">p</span><span className="tok-punct">&gt;</span><br /><span className="tok-punct">&lt;/</span><span className="tok-tag">article</span><span className="tok-punct">&gt;</span></>,
  },
  { title: "AST", step: "02 / TREE", desc: "Identifies tags, attributes, and template expressions.", visual: <div className="font-mono text-[10.5px] text-muted-foreground leading-[1.7]"><span className="text-muted-foreground/50">▾</span> JSXElement <span className="text-[#7dd3fc]">&quot;article&quot;</span><br /><span className="text-muted-foreground/50">&nbsp;&nbsp;▾</span> children <span className="text-[#86efac]">[3]</span><br /><span className="text-muted-foreground/50">&nbsp;&nbsp;&nbsp;&nbsp;</span> JSXElement <span className="text-[#7dd3fc]">&quot;img&quot;</span><br /><span className="text-muted-foreground/50">&nbsp;&nbsp;&nbsp;&nbsp;</span> JSXElement <span className="text-[#7dd3fc]">&quot;h3&quot;</span><br /><span className="text-muted-foreground/50">&nbsp;&nbsp;&nbsp;&nbsp;</span> JSXElement <span className="text-[#7dd3fc]">&quot;p&quot;</span></div> },
  { title: "Skeleton", step: "03 / NODES", desc: "Tags resolve to typed skeleton primitives.", visual: <div className="font-mono text-[10.5px] text-muted-foreground leading-[1.7]"><span className="text-muted-foreground/50">▾</span> Frame <span className="text-[#86efac]">&quot;card&quot;</span><br /><span className="text-muted-foreground/50">&nbsp;&nbsp;</span> Circle <span className="text-[#86efac]">48 × 48</span><br /><span className="text-muted-foreground/50">&nbsp;&nbsp;</span> Rect <span className="text-[#86efac]">60% × 14</span><br /><span className="text-muted-foreground/50">&nbsp;&nbsp;</span> Rect <span className="text-[#86efac]">100% × 10</span><br /><span className="text-muted-foreground/50">&nbsp;&nbsp;</span> Rect <span className="text-[#86efac]">70% × 10</span></div> },
  { title: "Preview", step: "04 / LIVE", desc: "Rendered on a pannable, zoomable canvas.", visual: <MiniCanvas><div className="flex items-center gap-1.5"><div className="sk-shimmer w-3.5 h-3.5 rounded-full shrink-0 bg-[#232428] relative overflow-hidden" /><div className="flex-1 flex flex-col gap-[3px]"><div className="sk-shimmer w-[70%] h-1.5 rounded-[2px] bg-[#232428] relative overflow-hidden" /><div className="sk-shimmer w-[40%] h-1 rounded-[2px] bg-[#232428] relative overflow-hidden" /></div></div><div className="sk-shimmer w-full h-[5px] rounded-[2px] bg-[#232428] relative overflow-hidden" /><div className="sk-shimmer w-[84%] h-[5px] rounded-[2px] bg-[#232428] relative overflow-hidden" /><div className="sk-shimmer w-[62%] h-[5px] rounded-[2px] bg-[#232428] relative overflow-hidden" /></MiniCanvas> },
  { title: "Export", step: "05 / CODE", desc: "Production-ready React + Tailwind, copied or saved.", visual: <div className="font-mono text-[9.5px] text-muted-foreground leading-[1.65]"><span className="tok-punct">&lt;</span><span className="tok-tag">div</span> <span className="tok-attr">className</span>=<span className="tok-str">&quot;animate-</span><br /><span className="tok-str">pulse rounded-full</span><br /><span className="tok-str">bg-zinc-800 h-12</span><br /><span className="tok-str">w-12&quot;</span><span className="tok-punct">/&gt;</span></div> },
];

export function Pipeline() {
  return (
    <section className="relative py-[120px] overflow-hidden isolate border-t border-white/[0.04]" style={{ background: "#060d09" }} id="pipeline">
      <div className="detail-aurora absolute top-[-120px] left-[-180px] w-[720px] h-[520px] pointer-events-none z-0 opacity-90" />
      <div className="detail-stars-bg absolute inset-0 pointer-events-none z-0" />
      <div className="max-w-[1240px] mx-auto px-8 relative z-[1]">
        <div className="text-center mb-16">
          <SectionEyebrow centered>Pipeline</SectionEyebrow>
          <h2 className="gradient-heading-sm text-[48px] font-semibold leading-[1.08] tracking-[-0.028em] m-0">From JSX to skeleton in seconds.</h2>
          <p className="mt-[18px] mx-auto text-[18px] leading-relaxed text-muted-foreground max-w-[620px]">The compiler that powers it all — parse, infer, render, export. No round-trip through your IDE.</p>
        </div>

        <div className="pipeline-card aurora-card relative rounded-2xl p-10 md:p-12 isolate">
          <span className="aurora-card__sheen" />
          <div className="grid grid-cols-5 gap-4 relative z-[2] max-md:grid-cols-1">
            {stages.map((stage, i) => (
              <div key={stage.title} className="relative flex flex-col gap-3 p-4 rounded-lg min-h-[200px] bg-card border border-white/[0.09]">
                <div className="flex items-center justify-between">
                  <h4 className="m-0 text-sm font-semibold tracking-[-0.005em] text-foreground">{stage.title}</h4>
                  <span className="font-mono text-[10.5px] text-muted-foreground tracking-[0.08em]">{stage.step}</span>
                </div>
                <p className="m-0 text-[11.5px] text-muted-foreground leading-[1.45]">{stage.desc}</p>
                <div className="flex-1 p-2.5 rounded-md bg-background border border-white/[0.06] font-mono text-[10px] text-muted-foreground leading-[1.6] overflow-hidden min-h-[90px]">{stage.visual}</div>
                {i < stages.length - 1 && (
                  <div className="absolute right-[-16px] top-1/2 -translate-y-1/2 w-4 flex items-center z-[2] text-muted-foreground/30 max-md:hidden">
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 6h14M11 2l4 4-4 4"/></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniCanvas({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 p-2 rounded bg-background">
      {children}
    </div>
  );
}

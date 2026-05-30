import { SectionEyebrow } from "./shared";

export function ExportShowcase() {
  return (
    <section className="relative py-[120px] overflow-hidden isolate border-t border-white/[0.04]" style={{ background: "#060d09" }} id="export">
      <div className="detail-aurora absolute top-[-120px] left-[-180px] w-[720px] h-[520px] pointer-events-none z-0 opacity-90" />
      <div className="detail-stars-bg absolute inset-0 pointer-events-none z-0" />
      <div className="max-w-[1240px] mx-auto px-8 relative z-[1]">
        <div className="text-center mb-16">
          <SectionEyebrow centered>Export</SectionEyebrow>
          <h2 className="gradient-heading-sm text-[48px] font-semibold leading-[1.08] tracking-[-0.028em] m-0">Export React + Tailwind CSS skeleton code.</h2>
          <p className="mt-[18px] mx-auto text-[18px] leading-relaxed text-muted-foreground max-w-[620px]">Copy production-ready skeleton loader code — React with Tailwind CSS or plain HTML with Tailwind. Syntax-highlighted, validated, ready to paste into your project.</p>
        </div>

        <div className="max-w-[940px] mx-auto">
          <div className="export-modal-card aurora-card relative rounded-2xl overflow-hidden isolate">
            <span className="aurora-card__sheen" />
            {/* Header */}
            <div className="relative z-[2] flex items-center justify-between px-4 py-3 bg-[rgba(8,15,12,0.4)] border-b border-primary/10">
              <div className="flex items-center gap-3">
                <div className="inline-flex p-0.5 rounded-[7px] bg-card border border-white/[0.06]">
                  <button className="h-[26px] px-3.5 rounded-md text-[12.5px] text-foreground whitespace-nowrap bg-muted">React · Tailwind</button>
                  <button className="h-[26px] px-3.5 rounded-md text-[12.5px] text-muted-foreground whitespace-nowrap">HTML · Tailwind</button>
                </div>
                <span className="font-mono text-[11.5px] text-foreground/30">ProfileCardSkeleton.jsx</span>
              </div>
              <button className="w-7 h-7 rounded-md grid place-items-center text-muted-foreground">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Body */}
            <div className="grid grid-cols-[1fr_240px] max-md:grid-cols-1">
              <div className="relative z-[2] p-[18px_22px] font-mono text-xs leading-[1.7] whitespace-pre overflow-hidden bg-background border-r border-white/[0.04] max-md:border-r-0">
                <button className="absolute top-3 right-3.5 font-sans text-[11.5px] text-muted-foreground py-1 px-2.5 rounded-md border border-white/[0.06] bg-card inline-flex items-center gap-1.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy
                </button>
                <span className="tok-key">export const</span> <span className="tok-fn">ProfileCardSkeleton</span> = () =&gt; {"{"}{"\n"}
                {"  "}<span className="tok-key">return</span> ({'\n'}
                {"    "}<span className="tok-punct">&lt;</span><span className="tok-tag">div</span> <span className="tok-attr">className</span>=<span className="tok-str">&quot;rounded-2xl border{'\n'}
                {"      "}border-zinc-800 bg-zinc-950 p-6&quot;</span><span className="tok-punct">&gt;</span>{'\n'}
                {"      "}<span className="tok-punct">&lt;</span><span className="tok-tag">div</span> <span className="tok-attr">className</span>=<span className="tok-str">&quot;flex gap-4&quot;</span><span className="tok-punct">&gt;</span>{'\n'}
                {"        "}<span className="tok-punct">&lt;</span><span className="tok-tag">div</span> <span className="tok-attr">className</span>=<span className="tok-str">&quot;h-12 w-12 animate-pulse{'\n'}
                {"          "}rounded-full bg-zinc-800&quot;</span> <span className="tok-punct">/&gt;</span>{'\n'}
                {"        "}<span className="tok-punct">&lt;</span><span className="tok-tag">div</span> <span className="tok-attr">className</span>=<span className="tok-str">&quot;flex-1 space-y-2&quot;</span><span className="tok-punct">&gt;</span>{'\n'}
                {"          "}<span className="tok-punct">&lt;</span><span className="tok-tag">div</span> <span className="tok-attr">className</span>=<span className="tok-str">&quot;h-4 w-3/5 ...&quot;</span> <span className="tok-punct">/&gt;</span>{'\n'}
                {"        "}<span className="tok-punct">&lt;/</span><span className="tok-tag">div</span><span className="tok-punct">&gt;</span>{'\n'}
                {"      "}<span className="tok-punct">&lt;/</span><span className="tok-tag">div</span><span className="tok-punct">&gt;</span>{'\n'}
                {"      "}<span className="tok-com">{"{/* …body, hero, footer */}"}</span>{'\n'}
                {"    "}<span className="tok-punct">&lt;/</span><span className="tok-tag">div</span><span className="tok-punct">&gt;</span>{'\n'}
                {"  "});{'\n'}{"}"}
              </div>

              {/* Sidebar */}
              <div className="relative z-[2] p-[18px] flex flex-col gap-3.5">
                <h5 className="m-0 text-[11px] tracking-[0.1em] uppercase text-muted-foreground font-semibold">Summary</h5>
                {[["Nodes", "12"], ["Lines", "34"], ["Size", "1.2 KB"], ["Animation", "pulse"]].map(([label, val]) => (
                  <div key={label as string} className="flex justify-between items-center gap-3 text-[12.5px] text-muted-foreground whitespace-nowrap">
                    <span>{label}</span> <strong className="text-foreground font-mono font-medium">{val}</strong>
                  </div>
                ))}
                <div className="h-px bg-white/[0.06] my-1" />
                <h5 className="m-0 text-[11px] tracking-[0.1em] uppercase text-muted-foreground font-semibold">Options</h5>
                {[
                  ["Tailwind v4", true],
                  ["Inline styles", false],
                  ["Add comments", true],
                  ["TypeScript", false],
                ].map(([label, on]) => (
                  <div key={label as string} className="flex items-center justify-between gap-3 text-[12.5px] text-muted-foreground whitespace-nowrap">
                    <span>{label}</span>
                    <span className={`toggle-thumb relative w-7 h-4 rounded-full ${on ? "toggle-thumb-on bg-primary" : "bg-white/[0.14]"}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="relative z-[2] flex items-center justify-between px-4 py-3 bg-[rgba(8,15,12,0.4)] border-t border-primary/10 max-md:flex-col max-md:gap-2 max-md:items-start">
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Validated · 0 errors
              </span>
              <div className="flex gap-2 items-center">
                <button className="h-8 px-3 text-[13px] font-medium rounded-lg border border-white/[0.06] btn-ghost bg-transparent!">Cancel</button>
                <button className="h-8 px-3 text-[13px] font-medium rounded-lg border border-white/[0.06] btn-ghost bg-transparent!">Save preset</button>
                <button className="btn-primary relative h-8 px-3 inline-flex items-center gap-2 text-[13px] font-semibold rounded-lg" style={{ background: "linear-gradient(180deg, #14d39d 0%, #0fb87f 100%)", color: "#03291e", boxShadow: "0 0 0 1px rgba(0,0,0,0.25)" }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                  Download .jsx
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

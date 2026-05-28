import { SectionEyebrow } from "./shared";

export function Value() {
  return (
    <section className="py-[120px] border-t border-white/[0.04]">
      <div className="max-w-[1240px] mx-auto px-8">
        <div className="text-center mb-16">
          <SectionEyebrow centered>The value</SectionEyebrow>
          <h2 className="gradient-heading-sm text-[48px] font-semibold leading-[1.08] tracking-[-0.028em] m-0">Skeleton states, finally cheap to ship.</h2>
          <p className="mt-[18px] mx-auto text-[18px] leading-relaxed text-muted-foreground max-w-[620px]">Skip the manual measuring, the className guesswork, the QA loop. Skeleton Studio gives you the perceptual win without the engineering tax.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden border border-white/[0.04] bg-white/[0.04] mb-6 max-md:grid-cols-1">
          {[
            { big: "12", unit: "×", label: "Faster than building skeletons by hand", sub: "Measured against typical React component skeletoning workflows." },
            { big: "0", unit: "px", label: "Layout shift on load", sub: "Skeletons match real dimensions — no CLS, no jumpy hydration." },
            { big: "~2", unit: "min", label: "From paste to merged PR", sub: "Edit, export, copy. No CLI, no design handoff, no Figma round-trip." },
          ].map((stat) => (
            <div key={stat.label} className="p-9 bg-card flex flex-col gap-1.5">
              <div className="gradient-stat text-[56px] leading-none font-semibold tracking-[-0.035em]">
                {stat.big}<span className="text-2xl ml-1 text-muted-foreground" style={{ WebkitTextFillColor: "var(--muted-foreground)" }}>{stat.unit}</span>
              </div>
              <div className="text-sm text-foreground font-semibold mt-2">{stat.label}</div>
              <div className="text-[13px] text-muted-foreground">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Before/After */}
        <div className="grid grid-cols-2 rounded-2xl overflow-hidden border border-white/[0.06] bg-card mt-14 mx-auto max-w-[1080px] max-md:grid-cols-1">
          <div className="p-9 min-h-[380px] flex flex-col">
            <span className="compare-tag-before inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full font-mono text-[10.5px] tracking-[0.08em] uppercase self-start mb-[18px] whitespace-nowrap">Before · By hand</span>
            <div className="text-xl font-semibold tracking-[-0.015em] text-foreground mb-2">An afternoon you&apos;ll never get back.</div>
            <p className="text-[13.5px] text-muted-foreground mb-5 leading-relaxed">Measuring divs in devtools, hardcoding pixel widths, hoping it matches the real UI.</p>
            <div className="bg-background border border-white/[0.06] rounded-lg p-3.5 font-mono text-[11.5px] leading-[1.7] text-muted-foreground mb-[18px] overflow-hidden whitespace-pre">
              {"&lt;div className=\"h-?? w-???\" /&gt;\n&lt;div className=\"h-?? w-???\" /&gt;\n"}
              <span style={{ color: "#f472b6" }}>{"// width guessed — looks off on mobile"}</span>
            </div>
            <ul className="flex flex-col gap-2 mt-auto">
              {["Drift from the real component over time", "Boring single-bar shimmer, every time", "Layout shift when real content arrives"].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-[13px] text-muted-foreground list-none">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2.2" strokeLinecap="round" className="shrink-0"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-9 min-h-[380px] flex flex-col border-l border-white/[0.04] max-md:border-l-0 max-md:border-t max-md:border-t-white/[0.04]">
            <span className="compare-tag-after inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full font-mono text-[10.5px] tracking-[0.08em] uppercase self-start mb-[18px] whitespace-nowrap">After · Skeleton Studio</span>
            <div className="text-xl font-semibold tracking-[-0.015em] text-foreground mb-2">A skeleton that <em className="text-primary not-italic">earns</em> its place.</div>
            <p className="text-[13.5px] text-muted-foreground mb-5 leading-relaxed">Inferred from your actual JSX, hand-tunable in the canvas, copy-paste straight to your file.</p>
            <div className="bg-background border border-white/[0.06] rounded-lg p-3.5 font-mono text-[11.5px] leading-[1.7] text-muted-foreground mb-[18px] overflow-hidden whitespace-pre">
              {'&lt;article className="rounded-2xl bg-zinc-950 p-6"&gt;\n  &lt;div className="h-12 w-12 animate-pulse rounded-full bg-zinc-800" /&gt;\n'}
              <span style={{ color: "#86efac" }}>{"{/* 11 more nodes · variance applied */}"}</span>
              {"\n&lt;/article&gt;"}
            </div>
            <ul className="flex flex-col gap-2 mt-auto">
              {["Pixel-aligned to the real component", "Natural width variance & staggered shimmer", "Zero layout shift, zero rewrites"].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-[13px] text-muted-foreground list-none">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Testimonial */}
        <div className="max-w-[820px] mx-auto text-center mt-[88px]">
          <p className="text-[26px] leading-[1.4] font-medium tracking-[-0.015em] text-foreground m-0 mb-7">
            &ldquo;We shipped 14 loading states in an afternoon. <span className="text-muted-foreground">What used to be a Friday-evening yak-shave is now a five-minute step in the PR.</span>&rdquo;
          </p>
          <div className="inline-flex items-center gap-3 text-[13px] text-muted-foreground">
            <span className="quote-av w-8 h-8 rounded-full grid place-items-center font-bold text-[13px] text-[#03291e]">A</span>
            <span><strong className="text-foreground font-semibold">Aanya Mehra</strong> · Staff frontend engineer, Lumen</span>
          </div>
        </div>
      </div>
    </section>
  );
}

import { type ReactNode } from "react";
import { SectionEyebrow } from "./shared";

export function Features() {
  return (
    <section className="py-[120px]" id="features">
      <div className="max-w-[1240px] mx-auto px-8">
        <div className="text-center mb-16">
          <SectionEyebrow centered>Workflow</SectionEyebrow>
          <h2 className="gradient-heading-sm text-[48px] font-semibold leading-[1.08] tracking-[-0.028em] m-0">
            A Tailwind skeleton generator
            <br />
            built for your workflow.
          </h2>
          <p className="mt-[18px] mx-auto text-[18px] leading-relaxed text-muted-foreground max-w-[620px]">
            Every interaction Skeleton Studio gives you is something you&apos;d
            otherwise grind out by hand. We just packaged it properly.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Card 1 — Full */}
          <BentoCard span="full">
            <BentoDust />
            <div className="relative z-[2] flex-1 flex items-center justify-center min-h-[280px] p-11 pt-[44px]">
              <div className="grid grid-cols-[1fr_80px_1fr] items-center gap-6 w-full max-w-[920px] max-md:grid-cols-1">
                <BentoCode>
                  <span className="tok-punct">&lt;</span>
                  <span className="tok-tag">article</span>{" "}
                  <span className="tok-attr">className</span>=
                  <span className="tok-str">&quot;card&quot;</span>
                  <span className="tok-punct">&gt;</span>
                  <br />
                  {"  "}
                  <span className="tok-punct">&lt;</span>
                  <span className="tok-tag">img</span>{" "}
                  <span className="tok-attr">src</span>={"{"}u.av{"}"}
                  <span className="tok-punct">/&gt;</span>
                  <br />
                  {"  "}
                  <span className="tok-punct">&lt;</span>
                  <span className="tok-tag">h3</span>
                  <span className="tok-punct">&gt;</span>
                  {"{"}u.name{"}"}
                  <span className="tok-punct">&lt;/</span>
                  <span className="tok-tag">h3</span>
                  <span className="tok-punct">&gt;</span>
                  <br />
                  {"  "}
                  <span className="tok-punct">&lt;</span>
                  <span className="tok-tag">p</span>
                  <span className="tok-punct">&gt;</span>
                  {"{"}u.bio{"}"}
                  <span className="tok-punct">&lt;/</span>
                  <span className="tok-tag">p</span>
                  <span className="tok-punct">&gt;</span>
                  <br />
                  {"  "}
                  <span className="tok-punct">&lt;</span>
                  <span className="tok-tag">button</span>
                  <span className="tok-punct">&gt;</span>Follow
                  <span className="tok-punct">&lt;/</span>
                  <span className="tok-tag">button</span>
                  <span className="tok-punct">&gt;</span>
                  <br />
                  <span className="tok-punct">&lt;/</span>
                  <span className="tok-tag">article</span>
                  <span className="tok-punct">&gt;</span>
                </BentoCode>
                <div className="bento-arrow relative flex items-center justify-center max-md:hidden">
                  <span
                    className="relative z-[1] w-9 h-9 rounded-full grid place-items-center bg-card border border-primary/20 text-primary"
                    style={{
                      boxShadow:
                        "0 0 0 4px rgba(16,185,129,0.18), inset 0 1px 0 rgba(255,255,255,0.04)",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
                <div
                  className="flex flex-col gap-2.5 py-4 px-[18px] rounded-[10px]"
                  style={{
                    background: "rgba(8,9,11,0.85)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="sk-block sk-shimmer w-9 h-9 rounded-full shrink-0 bg-[#232428]" />
                    <div className="flex flex-col gap-1.5 flex-1">
                      <div className="sk-block sk-shimmer w-[60%] h-2.5 rounded-[3px] bg-[#232428]" />
                      <div className="sk-block sk-shimmer w-[40%] h-2 rounded-[3px] bg-[#232428]" />
                    </div>
                  </div>
                  <div className="sk-block sk-shimmer w-full h-2 rounded-[3px] bg-[#232428]" />
                  <div className="sk-block sk-shimmer w-[88%] h-2 rounded-[3px] bg-[#232428]" />
                  <div className="sk-block sk-shimmer w-[70%] h-2 rounded-[3px] bg-[#232428]" />
                  <div className="sk-block sk-shimmer w-16 h-[22px] rounded-md mt-1 bg-[#232428]" />
                </div>
              </div>
            </div>
            <div className="relative z-[2] text-center pt-7 pb-8 px-9">
              <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-primary mb-2 inline-block">
                Paste · Parse · Preview
              </span>
              <h3 className="text-xl font-semibold tracking-[-0.015em] m-0 mb-2 text-foreground">
                From JSX to skeleton, automatically.
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed m-0 mx-auto max-w-[460px]">
                Drop any React component and Skeleton Studio walks the tree,
                infers each element&apos;s archetype, and renders a hand-tunable
                skeleton in milliseconds.
              </p>
            </div>
          </BentoCard>

          {/* Card 2 — Direct manipulation */}
          <BentoCard span="third">
            <BentoDust />
            <div className="relative z-[2] flex-1 flex items-center justify-center min-h-[220px] p-8">
              <div
                className="flex flex-col gap-3 w-full max-w-80 relative p-5 rounded-[10px]"
                style={{
                  background: "rgba(8,9,11,0.7)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  boxShadow: "0 12px 36px rgba(0,0,0,0.4)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="sk-block sk-shimmer w-[30px] h-[30px] rounded-full shrink-0 bg-[#232428]" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="sk-block sk-shimmer sk-selected w-[60%] h-[11px] rounded-[3px] relative bg-[#232428]">
                      <span className="absolute w-[7px] h-[7px] bg-primary rounded-[1.5px] z-[3] right-[-5px] top-1/2 -translate-y-1/2 border-2 border-black/20" />
                      <span className="absolute w-[7px] h-[7px] bg-primary rounded-[1.5px] z-[3] bottom-[-5px] left-1/2 -translate-x-1/2 border-2 border-black/20" />
                      <span className="absolute w-[7px] h-[7px] bg-primary rounded-[1.5px] z-[3] bottom-[-5px] right-[-5px] border-2 border-black/20" />
                      <span className="sel-dim absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] py-px px-[5px] font-semibold font-mono rounded-[3px] whitespace-nowrap bg-primary text-[#03291e]">
                        192 × 11
                      </span>
                    </div>
                    <div className="sk-block sk-shimmer w-[38%] h-2 rounded-[3px] bg-[#232428]" />
                  </div>
                </div>
                <div className="sk-block sk-shimmer w-full h-2 rounded-[3px] bg-[#232428]" />
                <div className="sk-block sk-shimmer w-[84%] h-2 rounded-[3px] bg-[#232428]" />
                <svg
                  className="absolute right-9 bottom-[38px] z-[5] w-[18px] h-[18px]"
                  viewBox="0 0 24 24"
                  fill="#fff"
                  style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.6))" }}
                >
                  <path
                    d="M5.5 3.5l13 6.5-5.5 1.5-1.5 5.5z"
                    stroke="#000"
                    strokeWidth="0.6"
                  />
                </svg>
              </div>
            </div>
            <div className="relative z-[2] pt-6 pb-8 px-9">
              <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-primary mb-2 inline-block">
                Direct manipulation
              </span>
              <h3 className="text-xl font-semibold tracking-[-0.015em] m-0 mb-2 text-foreground">
                Click anything. Tune it live.
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed m-0">
                An emerald selection ring, three resize handles, a live
                dimension badge — the editing model you already know, on the
                canvas.
              </p>
            </div>
          </BentoCard>

          {/* Card 3 — Scrub inputs */}
          <BentoCard span="third">
            <BentoDust />
            <div className="relative z-[2] flex-1 flex items-center justify-center min-h-[220px] p-8">
              <div className="flex flex-col gap-2.5 w-full max-w-[280px]">
                <div className="grid grid-cols-[48px_1fr] items-center gap-2.5">
                  <label className="text-xs text-foreground/80">Size</label>
                  <div className="grid grid-cols-2 gap-2">
                    <ScrubField focus>
                      <span className="text-[11px] text-muted-foreground font-semibold">
                        W
                      </span>
                      <span className="text-foreground">60</span>
                      <span className="text-muted-foreground text-[11px] ml-auto">
                        %
                      </span>
                    </ScrubField>
                    <ScrubField>
                      <span className="text-[11px] text-muted-foreground font-semibold">
                        H
                      </span>
                      <span className="text-foreground">14</span>
                      <span className="text-muted-foreground text-[11px] ml-auto">
                        px
                      </span>
                    </ScrubField>
                  </div>
                </div>
                <div className="grid grid-cols-[48px_1fr] items-center gap-2.5">
                  <label className="text-xs text-foreground/80">Position</label>
                  <div className="grid grid-cols-2 gap-2">
                    <ScrubField>
                      <span className="text-[11px] text-muted-foreground font-semibold">
                        X
                      </span>
                      <span className="text-foreground">0</span>
                      <span className="text-muted-foreground text-[11px] ml-auto">
                        px
                      </span>
                    </ScrubField>
                    <ScrubField>
                      <span className="text-[11px] text-muted-foreground font-semibold">
                        Y
                      </span>
                      <span className="text-foreground">0</span>
                      <span className="text-muted-foreground text-[11px] ml-auto">
                        px
                      </span>
                    </ScrubField>
                  </div>
                </div>
                <div className="grid grid-cols-[48px_1fr] items-center gap-2.5">
                  <label className="text-xs text-foreground/80">Radius</label>
                  <ScrubField>
                    <span className="text-[11px] text-muted-foreground font-semibold">
                      R
                    </span>
                    <span className="text-foreground">4</span>
                    <span className="text-muted-foreground text-[11px] ml-auto">
                      px
                    </span>
                  </ScrubField>
                </div>
                <div className="scrub-hint flex items-center gap-1.5 mt-1 font-mono text-[11px] text-primary">
                  drag W → to scrub
                </div>
              </div>
            </div>
            <div className="relative z-[2] pt-6 pb-8 px-9">
              <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-primary mb-2 inline-block">
                Pixel control
              </span>
              <h3 className="text-xl font-semibold tracking-[-0.015em] m-0 mb-2 text-foreground">
                Every number is a slider.
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed m-0">
                Hold the W, H, X or Y label and drag horizontally. The skeleton
                block follows your cursor in real time, pixel-by-pixel.
              </p>
            </div>
          </BentoCard>

          {/* Card 4 — Tailwind export (cool) */}
          <BentoCard span="third" cool>
            <BentoDust />
            <div className="relative z-[2] flex-1 flex items-center justify-center min-h-[220px] p-8">
              <div
                className="font-mono text-[11.5px] leading-[1.7] w-full max-w-80 relative py-4 px-[18px] overflow-hidden rounded-[10px]"
                style={{
                  background: "rgba(8,9,11,0.85)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  boxShadow: "0 12px 36px rgba(0,0,0,0.4)",
                }}
              >
                <span className="absolute top-2.5 right-2.5 font-sans text-[11px] py-1 px-2 border border-white/[0.06] rounded-md bg-card text-muted-foreground inline-flex items-center gap-1.5">
                  <svg
                    width="9"
                    height="9"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy
                </span>
                <span className="tok-punct">&lt;</span>
                <span className="tok-tag">article</span>{" "}
                <span className="tok-attr">className</span>=
                <span className="tok-str">&quot;rounded-2xl</span>
                <br />
                <span className="tok-str"> bg-zinc-950 p-6&quot;</span>
                <span className="tok-punct">&gt;</span>
                <br />
                {"  "}
                <span className="tok-punct">&lt;</span>
                <span className="tok-tag">div</span>{" "}
                <span className="tok-attr">className</span>=
                <span className="tok-str">&quot;h-12 w-12</span>
                <br />
                <span className="tok-str"> animate-pulse rounded-full</span>
                <br />
                <span className="tok-str"> bg-zinc-800&quot;</span>{" "}
                <span className="tok-punct">/&gt;</span>
                <br />
                {"  "}
                <span className="tok-com">{"{/* 11 more nodes */}"}</span>
                <br />
                <span className="tok-punct">&lt;/</span>
                <span className="tok-tag">article</span>
                <span className="tok-punct">&gt;</span>
              </div>
            </div>
            <div className="relative z-[2] pt-6 pb-8 px-9">
              <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-[#7dd3fc] mb-2 inline-block">
                Production output
              </span>
              <h3 className="text-xl font-semibold tracking-[-0.015em] m-0 mb-2 text-foreground">
                Ship the code, not a screenshot.
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed m-0">
                Clean React + Tailwind, syntax-highlighted, validated, ready to
                paste into your file. Toggle to plain HTML if you prefer.
              </p>
            </div>
          </BentoCard>

          {/* Card 5 — Starter library (wide) */}
          <BentoCard span="wide">
            <BentoDust />
            <div className="relative z-[2] flex-1 flex items-start justify-center min-h-[220px] p-8 pt-9">
              <div className="grid grid-cols-4 gap-3 w-full max-w-[600px]">
                {[
                  {
                    bars: [
                      "w-[60%] h-1.5",
                      "w-[80%] h-1.5",
                      "w-full h-3.5 rounded",
                    ],
                    active: true,
                  },
                  {
                    bars: [
                      "w-3.5 h-3.5 rounded-full",
                      "w-[70%] h-[5px]",
                      "w-[40%] h-1",
                      "w-full h-[5px]",
                      "w-[80%] h-[5px]",
                    ],
                    active: false,
                  },
                  {
                    bars: [
                      "w-full h-8 rounded",
                      "w-[60%] h-[5px]",
                      "w-[40%] h-[5px]",
                    ],
                    active: false,
                  },
                  {
                    bars: [
                      "w-full h-1.5",
                      "w-full h-1.5",
                      "w-full h-1.5",
                      "w-full h-1.5",
                    ],
                    active: false,
                  },
                ].map(({ bars, active }, i) => (
                  <div
                    key={i}
                    className={`flex flex-col gap-1.5 p-3 rounded-lg min-h-[88px] border bg-white/[0.01] ${active ? "border-primary" : "border-white/[0.06]"}`}
                    style={
                      active
                        ? { boxShadow: "0 0 0 3px rgba(16,185,129,0.18)" }
                        : undefined
                    }
                  >
                    {bars.map((bar, j) => (
                      <div
                        key={j}
                        className={`sk-shimmer ${bar} relative overflow-hidden shrink-0 bg-[#232428] rounded-[3px]`}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <span
                className="absolute bottom-6 right-7 z-[4] inline-flex items-center gap-1.5 py-1.5 px-2.5 pl-2 rounded-full text-[11px] text-foreground/80 border border-white/[0.14]"
                style={{
                  background: "rgba(15,16,18,0.92)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                }}
              >
                <strong className="font-mono text-foreground">⌘K</strong> search
                20+ starters
              </span>
            </div>
            <div className="relative z-[2] pt-6 pb-8 px-9">
              <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-primary mb-2 inline-block">
                Starter library
              </span>
              <h3 className="text-xl font-semibold tracking-[-0.015em] m-0 mb-2 text-foreground">
                A keystroke away from a starting point.
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed m-0 max-w-[460px]">
                Twenty curated archetypes — profile, blog, dashboard, pricing,
                tables. Hover to preview in the canvas. Press ↵ to insert.
                Recents bubble to the top automatically.
              </p>
            </div>
          </BentoCard>

          {/* Card 6 — Animation presets */}
          <BentoCard span="third">
            <BentoDust />
            <div className="relative z-[2] flex-1 flex items-center justify-center min-h-[220px] p-8">
              <div className="grid grid-cols-3 gap-2 w-full max-w-80">
                {[
                  { label: "shimmer", active: true },
                  { label: "pulse", active: false },
                  { label: "wave", active: false },
                ].map((a) => (
                  <div
                    key={a.label}
                    className={`py-3 px-2 pb-2.5 border border-white/[0.06] rounded-lg text-center ${a.active ? "bg-primary/5 border-primary text-primary" : "bg-white/[0.01] text-muted-foreground"}`}
                    style={
                      a.active
                        ? { boxShadow: "0 0 0 3px rgba(16,185,129,0.18)" }
                        : undefined
                    }
                  >
                    <div className="anim-preview-shimmer relative h-6 mb-2 rounded-[3px] overflow-hidden bg-[#232428]" />
                    <span className="text-[11px] font-mono">{a.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative z-[2] pt-6 pb-8 px-9">
              <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-primary mb-2 inline-block">
                Motion
              </span>
              <h3 className="text-xl font-semibold tracking-[-0.015em] m-0 mb-2 text-foreground">
                Three animation presets, no fuss.
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed m-0">
                Shimmer, pulse, wave — with speed and easing controls, plus a
                reduced-motion fallback you&apos;ll never need to disable.
              </p>
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}

function BentoCard({
  children,
  span,
  cool,
}: {
  children: ReactNode;
  span: "full" | "wide" | "third";
  cool?: boolean;
}) {
  const cols =
    span === "full"
      ? "col-span-12"
      : span === "wide"
        ? "col-span-8"
        : "col-span-4";
  return (
    <article
      className={`bento-card ${cool ? "bento-card-cool" : ""} ${cols} relative flex flex-col rounded-[18px] overflow-hidden bg-[lab(5 -4.02 -6.35)] border border-white/[0.09] isolate transition-all duration-200 ease-in-out hover:border-white/[0.14]`}
    >
      {children}
    </article>
  );
}

function BentoDust() {
  return (
    <div className="bento-dust absolute inset-0 pointer-events-none z-[1]" />
  );
}

function BentoCode({ children }: { children: ReactNode }) {
  return (
    <div
      className="grid grid-cols-[22px_1fr] gap-3 font-mono text-[11.5px] leading-[1.7] py-3.5 px-4 rounded-[10px]"
      style={{
        background: "rgba(8,9,11,0.85)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
      }}
    >
      <div className="text-foreground/30 text-right">
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i} className="block">
            {i + 1}
          </span>
        ))}
      </div>
      <div className="overflow-hidden whitespace-pre">{children}</div>
    </div>
  );
}

function ScrubField({
  children,
  focus,
}: {
  children: ReactNode;
  focus?: boolean;
}) {
  return (
    <div
      className={`h-[30px] flex items-center gap-2 px-2.5 rounded-md font-mono text-xs bg-muted border ${focus ? "border-primary" : "border-white/[0.06]"}`}
      style={
        focus ? { boxShadow: "0 0 0 3px rgba(16,185,129,0.18)" } : undefined
      }
    >
      {children}
    </div>
  );
}

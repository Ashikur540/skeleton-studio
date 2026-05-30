"use client";
import { SectionEyebrow } from "./shared";

const editingFeatures = [
  {
    icon: "▭",
    title: "Green selection overlay",
    desc: "Click any block. The emerald ring matches the editor selection — same affordance, in the browser.",
  },
  {
    icon: "↔",
    title: "Resize handles &amp; dimension badge",
    desc: "Three handles per block. The badge below shows the live size in px or %.",
  },
  {
    icon: "∿",
    title: "Scrub inputs",
    desc: "Drag the W / H / X / Y label letters horizontally. Every numeric input is a slider in disguise.",
  },
  {
    icon: "▥",
    title: "Padding editor",
    desc: "Inline box widget — drag any of the four sides, type values, or paste shorthand. Just works.",
  },
];

export function Editing() {
  return (
    <section
      className="relative py-[120px] overflow-hidden isolate border-t border-white/[0.04]"
      style={{ background: "#060d09" }}
    >
      <div className="detail-aurora absolute top-[-120px] left-[-180px] w-[720px] h-[520px] pointer-events-none z-0 opacity-90" />
      <div className="detail-stars-bg absolute inset-0 pointer-events-none z-0" />
      <div className="max-w-[1240px] mx-auto px-8 relative z-[1]">
        <div className="grid grid-cols-[1.05fr_0.95fr] gap-16 items-center max-md:grid-cols-1">
          {/* Left: Full editor mockup in aurora card */}
          <div className="aurora-card relative p-7 rounded-3xl isolate">
            <span className="aurora-card__sheen" />
            <div
              className="relative z-[2] rounded-xl overflow-visible border border-[#1e1e21] shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
              style={{ background: "#0d0d0f" }}
            >
              {/* Titlebar */}
              <div className="flex items-center gap-2.5 py-[9px] px-3 bg-[#111113] border-b border-[#1a1a1d] rounded-t-xl">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ee3248]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e3c51e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#13c498]" />
                </div>
                <div className="flex-1 text-center text-[11px] text-[#71717a] font-medium tracking-[0.01em] whitespace-nowrap">
                  BlogCard&nbsp;&nbsp;·&nbsp;&nbsp;414 × 496
                </div>
                <div className="flex gap-1">
                  <span className="py-[2px] px-2 rounded text-[10px] text-[#ededed] font-semibold bg-[#1f1f23] border border-[#2a2a2e]">
                    Design
                  </span>
                  <span className="py-[2px] px-2 rounded text-[10px] text-[#52525b]">
                    Animation
                  </span>
                </div>
              </div>

              {/* Canvas with dot grid */}
              <div
                className="relative min-h-[360px] py-[56px] px-7 flex items-center justify-center"
                style={{
                  background:
                    "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0) 0 0 / 16px 16px, #0d0d0f",
                }}
              >
                {/* White skeleton card */}
                <div className="relative w-full max-w-[268px] bg-background rounded-xl py-[22px] px-5 shadow-[0_0_0_1px_#22c55e,0_0_0_5px_rgba(34,197,94,0.18),0_4px_24px_rgba(0,0,0,0.35)]">
                  {/* Green name badge */}
                  <span className="absolute -top-[22px] left-1/2 -translate-x-1/2 py-0.5 px-[7px] rounded-[3px] bg-[#22c55e] text-[10px] font-bold text-[#04190a] tracking-[0.02em] whitespace-nowrap">
                    BlogCard
                  </span>

                  {/* 8 resize handles */}
                  {["tl", "tc", "tr", "mr", "br", "bc", "bl", "ml"].map(
                    (pos) => (
                      <span
                        key={pos}
                        className={`em-handle absolute z-[3] ${handleMap[pos]}`}
                      />
                    ),
                  )}

                  {/* Avatar + heading */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="ls-bar w-[50px] h-[50px] rounded-full shrink-0" />
                    <div className="flex flex-col gap-[7px] flex-1">
                      <span className="ls-bar em-bar block h-[11px] rounded w-[62%]" />
                      <span className="ls-bar ls-bar--slow em-bar block h-[9px] rounded w-[42%]" />
                    </div>
                  </div>

                  {/* Text lines */}
                  <div className="flex flex-col gap-[7px]">
                    <span className="ls-bar ls-bar--slow em-bar block h-[9px] rounded w-full" />
                    <span className="ls-bar em-bar block h-[9px] rounded w-full" />
                    <span className="ls-bar ls-bar--slow em-bar block h-[9px] rounded w-[88%]" />
                    <span className="ls-bar em-bar block h-[9px] rounded w-[76%]" />
                    <span className="ls-bar ls-bar--slow em-bar block h-[9px] rounded w-[55%]" />
                  </div>

                  {/* Outlined button skeleton */}
                  <span className="block mt-3.5 h-8 w-full rounded-md border-[1.5px] border-[#e2e2e2] bg-transparent" />
                </div>
              </div>

              {/* Action bar */}
              <div className="flex items-center justify-between py-2.5 px-3 bg-[#111113] border-t border-[#1a1a1d] rounded-b-xl">
                <span className="text-[11px] py-1.5 px-3 rounded-md text-[#71717a] border border-[#27272a] bg-[#0d0d0f] font-medium whitespace-nowrap">
                  Browse starters
                </span>
                <span className="text-[11px] py-1.5 px-3 rounded-md text-[#04190a] bg-[#22c55e] font-semibold whitespace-nowrap shadow-[0_0_10px_rgba(34,197,94,0.25)]">
                  Generate Skeleton
                </span>
              </div>

              {/* Floating Properties panel */}
              <div
                className="em-float-panel absolute top-[60px] -right-[22px] w-[178px] z-[5] rounded-[10px] overflow-hidden border border-[#1e1e22] shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
                style={{
                  background: "rgba(15,16,18,0.92)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                }}
              >
                {/* BLOCK */}
                <div className="py-[9px] px-3 border-b border-[#1a1a1d]">
                  <div className="flex items-center gap-1 text-[9.5px] font-semibold tracking-[0.06em] text-[#52525b] mb-2">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ transform: "rotate(90deg)" }}
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    BLOCK
                  </div>
                  <div className="flex items-center justify-between gap-2 mb-[7px]">
                    <span className="text-[11px] text-[#71717a]">Type</span>
                    <span className="inline-flex items-center gap-1 py-[2px] px-1.5 rounded-md bg-[#1e1e22] border border-[#2a2a2e] text-[11px] text-[#d4d4d8]">
                      Text
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path
                          d="M2 3l2-2 2 2M2 5l2 2 2-2"
                          stroke="#52525b"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#71717a]">
                      Visibility
                    </span>
                    <span className="relative w-[26px] h-[14px] rounded-full bg-[#22c55e] shrink-0">
                      <span className="absolute w-2.5 h-2.5 rounded-full bg-white top-[2px] right-[2px] shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
                    </span>
                  </div>
                </div>

                {/* DIMENSIONS */}
                <div className="py-[9px] px-3 border-b border-[#1a1a1d]">
                  <div className="flex items-center gap-1 text-[9.5px] font-semibold tracking-[0.06em] text-[#52525b] mb-2">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ transform: "rotate(90deg)" }}
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    DIMENSIONS
                  </div>
                  <div className="flex items-center justify-between gap-2 mb-[7px]">
                    <span className="text-[11px] text-[#71717a]">Size</span>
                    <div className="flex gap-1">
                      <span className="inline-flex items-center gap-1 py-[2px] px-1.5 rounded-md bg-[#1e1e22] border border-[#2a2a2e] text-[11px] text-[#d4d4d8]">
                        <span className="text-[8.5px] text-[#52525b] font-semibold">
                          W
                        </span>
                        100
                        <span className="text-[8.5px] text-[#52525b]">%</span>
                      </span>
                      <span className="inline-flex items-center gap-1 py-[2px] px-1.5 rounded-md bg-[#1e1e22] border border-[#2a2a2e] text-[11px] text-[#d4d4d8]">
                        <span className="text-[8.5px] text-[#52525b] font-semibold">
                          H
                        </span>
                        20
                        <span className="text-[8.5px] text-[#52525b]">px</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#71717a]">Radius</span>
                    <span className="inline-flex items-center gap-1 py-[2px] px-1.5 rounded-md bg-[#1e1e22] border border-[#2a2a2e] text-[11px] text-[#d4d4d8]">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M2 8V4a2 2 0 012-2h4"
                          stroke="#71717a"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                      </svg>
                      4<span className="text-[8.5px] text-[#52525b]">px</span>
                    </span>
                  </div>
                </div>

                {/* REPEAT */}
                <div className="py-[9px] px-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-[9.5px] font-semibold tracking-[0.06em] text-[#52525b]">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ transform: "rotate(90deg)" }}
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                      REPEAT
                    </div>
                    <span className="relative w-[26px] h-[14px] rounded-full bg-[#2a2a2e] shrink-0">
                      <span className="absolute w-2.5 h-2.5 rounded-full bg-white/40 top-[2px] left-[2px] shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: feature list */}
          <div>
            <SectionEyebrow>Interactive editing</SectionEyebrow>
            <h2 className="gradient-heading-sm text-[48px] font-semibold leading-[1.08] tracking-[-0.028em] m-0 mb-4">
              Every block is yours to shape.
            </h2>
            <p className="text-[18px] leading-relaxed text-muted-foreground mb-8 max-w-[620px]">
              Selection isn&apos;t a popup or a sidebar. It&apos;s a real
              overlay rendered on the block, with handles you can drag and a
              dimension badge that updates as you go.
            </p>
            <div className="flex flex-col gap-[22px]">
              {editingFeatures.map((f) => (
                <div key={f.title} className="flex gap-4 items-start">
                  <div className="detail-feature-bullet shrink-0 w-8 h-8 rounded-lg grid place-items-center font-mono text-xs font-semibold text-primary">
                    {f.icon}
                  </div>
                  <div>
                    <h4 className="mt-1 mb-1.5 text-[15.5px] font-semibold tracking-[-0.005em] text-foreground">
                      {f.title}
                    </h4>
                    <p className="m-0 text-[13.5px] text-muted-foreground leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const handleMap: Record<string, string> = {
  tl: "top-[-5px] left-[-5px]",
  tc: "top-[-5px] left-1/2 -translate-x-1/2",
  tr: "top-[-5px] right-[-5px]",
  mr: "top-1/2 right-[-5px] -translate-y-1/2",
  br: "bottom-[-5px] right-[-5px]",
  bc: "bottom-[-5px] left-1/2 -translate-x-1/2",
  bl: "bottom-[-5px] left-[-5px]",
  ml: "top-1/2 left-[-5px] -translate-y-1/2",
};

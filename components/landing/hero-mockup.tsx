"use client";

export function HeroMockup() {
  return (
    <>
      {/* Floating chips */}
      <div className="float-chip float-chip-1 absolute z-[6] flex items-center gap-1.5 py-1.5 px-2.5 rounded-full text-[11.5px] text-muted-foreground bg-black/85 border border-white/[0.14]">
        <span className="text-primary">✦</span> Auto-detects{" "}
        <strong className="text-foreground font-semibold">.map()</strong>
      </div>
      <div className="float-chip float-chip-2 absolute z-[6] flex items-center gap-1.5 py-1.5 px-2.5 rounded-full text-[11.5px] text-muted-foreground bg-black/85 border border-white/[0.14]">
        <span className="text-primary">⚡</span>{" "}
        <strong className="text-foreground font-semibold">0ms</strong> roundtrip
      </div>
      <div className="float-chip float-chip-3 absolute z-[6] flex items-center gap-1.5 py-1.5 px-2.5 rounded-full text-[11.5px] text-muted-foreground bg-black/85 border border-white/[0.14]">
        <span className="text-primary">⌘K</span>{" "}
        <strong className="text-foreground font-semibold">20+</strong> starters
      </div>
      <div className="float-chip float-chip-4 absolute z-[6] flex items-center gap-1.5 py-1.5 px-2.5 rounded-full text-[11.5px] text-muted-foreground bg-black/85 border border-white/[0.14]">
        <span className="text-primary">↓</span> Ships{" "}
        <strong className="text-foreground font-semibold">Tailwind</strong>
      </div>

      <div
        className="mockup-beam relative rounded-[20px] overflow-hidden bg-card border border-white/[0.14]"
        style={{
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.02), 0 24px 80px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)",
        }}
      >
        {/* Chrome */}
        <div className="flex items-center justify-between h-10 px-3.5 bg-muted border-b border-white/[0.04]">
          <div className="flex gap-1.5">
            <span className="w-[11px] h-[11px] rounded-full bg-[#ed6a5e]" />
            <span className="w-[11px] h-[11px] rounded-full bg-[#f4bf4f]" />
            <span className="w-[11px] h-[11px] rounded-full bg-[#61c554]" />
          </div>
          <div className="flex items-center gap-2 h-6 px-3 rounded-md bg-card border border-white/[0.06] font-mono text-[11.5px] text-muted-foreground">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            studio.skeleton<span className="text-primary">.app</span>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground py-1 px-2 rounded-md border border-white/[0.06] bg-card">
            ⌘K
          </span>
        </div>

        {/* Topbar */}
        <div className="flex items-center justify-between h-12 px-4 bg-background border-b border-white/[0.04]">
          <div className="flex items-center gap-2 text-[13.5px] font-semibold text-foreground whitespace-nowrap shrink-0">
            <span className="brand-mark relative w-5 h-5 rounded-[5px] grid place-items-center">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.4"
                strokeLinecap="round"
              >
                <path d="M4 7h16M4 12h10M4 17h16" />
              </svg>
            </span>
            Skeleton Studio
          </div>
          <div className="flex items-center gap-1.5 py-[5px] px-3 rounded-full bg-card border border-white/[0.06] text-xs text-muted-foreground whitespace-nowrap shrink-0">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="6" width="18" height="12" rx="1" />
            </svg>
            ProfileCard
            <span className="text-foreground/30 text-[11.5px]">
              · 12 nodes · edited 4m ago
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1.5 py-1 px-2.5 pl-2 rounded-full text-[11.5px] text-muted-foreground bg-card border border-white/[0.06] whitespace-nowrap">
              <span
                className="w-1.5 h-1.5 rounded-full bg-primary"
                style={{ boxShadow: "0 0 0 2px rgba(16,185,129,0.18)" }}
              />
              0 errors
            </span>
            <span
              className="h-7 px-3 rounded-[7px] bg-primary text-[#03291e] font-semibold text-[12.5px] inline-flex items-center gap-1.5"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.18)",
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export
            </span>
          </div>
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-[320px_1fr_280px] h-[540px] max-[1100px]:grid-cols-[280px_1fr_240px] max-md:grid-cols-1">
          <MockupEditor />
          <MockupCanvas />
          <MockupInspector />
        </div>
      </div>
    </>
  );
}

function MockupEditor() {
  return (
    <div className="flex flex-col bg-card border-r border-white/[0.04] min-h-0">
      <div className="flex items-center justify-between h-8 px-3.5 border-b border-white/[0.04] text-[10.5px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        <span className="flex items-center gap-1.5">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          Input · JSX
        </span>
        <span>⌘↵</span>
      </div>
      <div className="flex-1 font-mono text-xs leading-[1.6] p-3.5 pb-0 grid grid-cols-[28px_1fr] overflow-hidden min-h-0">
        <div className="text-right text-foreground/30 select-none pr-2">
          {Array.from({ length: 16 }, (_, i) => (
            <span key={i} className="block">
              {i + 1}
            </span>
          ))}
        </div>
        <div className="text-foreground whitespace-pre pl-2 overflow-hidden">
          <span className="tok-key">import</span> React{" "}
          <span className="tok-key">from</span>{" "}
          <span className="tok-str">&apos;react&apos;</span>;{"\n\n"}
          <span className="tok-key">export function</span>{" "}
          <span className="tok-fn">ProfileCard</span>({"{ user }"}) {"{"}
          {"\n"}
          {"  "}
          <span className="tok-key">return</span> ({"\n"}
          {"    "}
          <span className="tok-punct">&lt;</span>
          <span className="tok-tag">article</span>{" "}
          <span className="tok-attr">className</span>=
          <span className="tok-str">&quot;card&quot;</span>
          <span className="tok-punct">&gt;</span>
          {"\n"}
          {"      "}
          <span className="tok-punct">&lt;</span>
          <span className="tok-tag">header</span>
          <span className="tok-punct">&gt;</span>
          {"\n"}
          {"        "}
          <span className="tok-punct">&lt;</span>
          <span className="tok-tag">img</span>{" "}
          <span className="tok-attr">src</span>={"{"}user.avatar{"}"}{" "}
          <span className="tok-punct">/&gt;</span>
          {"\n"}
          {"        "}
          <span className="tok-punct">&lt;</span>
          <span className="tok-tag">h3</span>
          <span className="tok-punct">&gt;</span>
          {"{"}user.name{"}"}
          <span className="tok-punct">&lt;/</span>
          <span className="tok-tag">h3</span>
          <span className="tok-punct">&gt;</span>
          {"\n"}
          {"      "}
          <span className="tok-punct">&lt;/</span>
          <span className="tok-tag">header</span>
          <span className="tok-punct">&gt;</span>
          {"\n"}
          {"      "}
          <span className="tok-punct">&lt;</span>
          <span className="tok-tag">p</span>
          <span className="tok-punct">&gt;</span>
          {"{"}user.bio{"}"}
          <span className="tok-punct">&lt;/</span>
          <span className="tok-tag">p</span>
          <span className="tok-punct">&gt;</span>
          {"\n"}
          {"      "}
          <span className="tok-punct">&lt;</span>
          <span className="tok-tag">footer</span>
          <span className="tok-punct">&gt;</span>
          {"\n"}
          {"        "}
          <span className="tok-punct">&lt;</span>
          <span className="tok-tag">button</span>
          <span className="tok-punct">&gt;</span>Follow
          <span className="tok-punct">&lt;/</span>
          <span className="tok-tag">button</span>
          <span className="tok-punct">&gt;</span>
          {"\n"}
          {"      "}
          <span className="tok-punct">&lt;/</span>
          <span className="tok-tag">footer</span>
          <span className="tok-punct">&gt;</span>
          {"\n"}
          {"    "}
          <span className="tok-punct">&lt;/</span>
          <span className="tok-tag">article</span>
          <span className="tok-punct">&gt;</span>
          {"\n"}
          {"  "});{"\n"}
          {"}"}
        </div>
      </div>
      <div className="mx-3 mb-3 flex flex-col gap-1.5">
        <button className="h-[30px] flex items-center gap-2 px-3 rounded-[7px] text-xs border border-white/[0.06] bg-card text-foreground">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span className="flex-1 text-left">Browse starters</span>
          <span className="font-mono text-[10.5px] py-px px-[5px] rounded-[3px] bg-black/25 text-white/40 border border-white/5">
            ⌘K
          </span>
        </button>
        <button className="h-[30px] flex items-center gap-2 px-3 rounded-[7px] text-xs bg-primary text-[#03291e] font-semibold">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span className="flex-1 text-left">Generate skeleton</span>
          <span className="font-mono text-[10.5px] py-px px-[5px] rounded-[3px] bg-black/25 text-[#03291e]/70 border border-black/20">
            ⌘↵
          </span>
        </button>
      </div>
    </div>
  );
}

function MockupCanvas() {
  return (
    <div
      className="relative flex items-center justify-center p-9 overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0) 0 0 / 20px 20px, #060709",
      }}
    >
      <div
        className="w-80 bg-card border border-white/[0.14] rounded-xl p-5 flex flex-col gap-3.5 relative"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
      >
        <div className="absolute -top-[22px] left-0 text-[10.5px] text-muted-foreground flex gap-2">
          ProfileCard · v3{" "}
          <span className="text-foreground/30 font-mono">560 × 312</span>
        </div>
        <div className="flex gap-3.5">
          <div className="sk-block sk-shimmer w-11 h-11 rounded-full shrink-0 bg-[#232428]" />
          <div className="flex flex-col gap-2 flex-1 justify-center">
            <div className="sk-block sk-shimmer sk-selected w-[60%] h-3.5 rounded relative bg-[#232428]">
              <span className="absolute w-[7px] h-[7px] bg-primary rounded-[1.5px] z-[3] right-[-5px] top-1/2 -translate-y-1/2 border-2 border-card" />
              <span className="absolute w-[7px] h-[7px] bg-primary rounded-[1.5px] z-[3] bottom-[-5px] left-1/2 -translate-x-1/2 border-2 border-card" />
              <span className="absolute w-[7px] h-[7px] bg-primary rounded-[1.5px] z-[3] bottom-[-5px] right-[-5px] border-2 border-card" />
              <span className="sel-dim absolute -bottom-[22px] left-1/2 -translate-x-1/2 py-0.5 px-[7px] text-[10.5px] font-semibold font-mono rounded-[3px] whitespace-nowrap bg-primary text-[#03291e]">
                60% × 14
              </span>
            </div>
            <div className="sk-block sk-shimmer w-[38%] h-2.5 rounded bg-[#232428]" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="sk-block sk-shimmer w-full h-2.5 rounded bg-[#232428]" />
          <div className="sk-block sk-shimmer w-[92%] h-2.5 rounded bg-[#232428]" />
          <div className="sk-block sk-shimmer w-[70%] h-2.5 rounded bg-[#232428]" />
        </div>
        <div className="sk-block sk-shimmer w-full h-24 rounded-lg bg-[#232428]" />
        <div className="flex gap-2.5 items-center">
          <div className="sk-block sk-shimmer w-[88px] h-[30px] rounded-[7px] bg-[#232428]" />
          <div className="sk-block sk-shimmer w-[88px] h-[30px] rounded-[7px] bg-[#232428]" />
          <div className="flex-1" />
          <div className="sk-block sk-shimmer w-[30px] h-[30px] rounded-full bg-[#232428]" />
        </div>
      </div>
    </div>
  );
}

function MockupInspector() {
  return (
    <div className="flex flex-col bg-card border-l border-white/[0.04]">
      <div className="flex h-8 p-1 gap-0.5 border-b border-white/[0.04]">
        {["Design", "Animation", "Layers"].map((tab, i) => (
          <button
            key={tab}
            className={`flex-1 text-[11px] rounded-md flex items-center justify-center gap-1 ${i === 0 ? "bg-muted text-foreground" : "text-muted-foreground"}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="p-3 pb-2.5 border-b border-white/[0.04]">
        <h5 className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground font-semibold mb-2.5">
          Dimensions
        </h5>
        <div className="grid grid-cols-[56px_1fr] gap-2 items-center mb-2">
          <label className="text-[11.5px] text-foreground/80">Size</label>
          <div className="grid grid-cols-2 gap-1.5">
            <div
              className="h-[26px] px-2 rounded-md flex items-center gap-1.5 font-mono text-[11px] text-foreground bg-muted border border-primary"
              style={{ boxShadow: "0 0 0 3px rgba(16,185,129,0.18)" }}
            >
              <span className="text-[10px] text-muted-foreground font-semibold">
                W
              </span>
              60
              <span className="text-muted-foreground text-[10px] ml-auto">
                %
              </span>
            </div>
            <div className="h-[26px] px-2 rounded-md flex items-center gap-1.5 font-mono text-[11px] text-foreground bg-muted border border-white/[0.06]">
              <span className="text-[10px] text-muted-foreground font-semibold">
                H
              </span>
              14
              <span className="text-muted-foreground text-[10px] ml-auto">
                px
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-[56px_1fr] gap-2 items-center mb-2">
          <label className="text-[11.5px] text-foreground/80">Position</label>
          <div className="grid grid-cols-2 gap-1.5">
            {["X", "Y"].map((axis) => (
              <div
                key={axis}
                className="h-[26px] px-2 rounded-md flex items-center gap-1.5 font-mono text-[11px] text-foreground bg-muted border border-white/[0.06]"
              >
                <span className="text-[10px] text-muted-foreground font-semibold">
                  {axis}
                </span>
                0
                <span className="text-muted-foreground text-[10px] ml-auto">
                  px
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-[56px_1fr] gap-2 items-center">
          <label className="text-[11.5px] text-foreground/80">Radius</label>
          <div className="h-[26px] px-2 rounded-md flex items-center gap-1.5 font-mono text-[11px] text-foreground bg-muted border border-white/[0.06]">
            <span className="text-[10px] text-muted-foreground font-semibold">
              R
            </span>
            4
            <span className="text-muted-foreground text-[10px] ml-auto">
              px
            </span>
          </div>
        </div>
      </div>
      <div className="p-3 pb-2.5 border-b border-white/[0.04]">
        <h5 className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground font-semibold mb-2.5">
          Animation
        </h5>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: "shimmer", active: true },
            { label: "pulse", active: false },
            { label: "wave", active: false },
          ].map((a) => (
            <div
              key={a.label}
              className={`py-2 px-1.5 border border-white/[0.06] rounded-md text-center text-[10.5px] ${a.active ? "bg-primary/10 border-primary text-primary" : "bg-muted text-muted-foreground"}`}
              style={
                a.active
                  ? { boxShadow: "0 0 0 3px rgba(16,185,129,0.18)" }
                  : undefined
              }
            >
              <div className="anim-preview-shimmer relative h-3.5 mb-1.5 rounded-[2px] overflow-hidden bg-[#232428]" />
              {a.label}
            </div>
          ))}
        </div>
      </div>
      <div className="p-3 pb-2.5">
        <h5 className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground font-semibold mb-2.5">
          Base color
        </h5>
        <div className="grid grid-cols-[56px_1fr] gap-2 items-center">
          <label className="text-[11.5px] text-foreground/80">Base</label>
          <div className="h-[26px] px-2 rounded-md flex items-center gap-1.5 font-mono text-[11px] text-foreground bg-muted border border-white/[0.06]">
            <span className="w-3 h-3 rounded-[3px] bg-[#232428] border border-white/[0.06]" />
            #232428
          </div>
        </div>
      </div>
    </div>
  );
}

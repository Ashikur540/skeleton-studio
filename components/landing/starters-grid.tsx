import { GhostButton } from "./buttons";
import { SectionEyebrow } from "./shared";

const starters = [
  {
    name: "Dashboard",
    tag: "kpi · chart · table",
    bars: ["row-bar"],
    extra: "full-bar",
  },
  { name: "Pricing", tag: "3 tiers · 12 nodes", bars: ["three-col"] },
  {
    name: "Blog",
    tag: "cover · title · meta",
    bars: ["hero-bar", "text-70", "text-60", "chip"],
  },
  {
    name: "SaaS hero",
    tag: "headline · cta",
    bars: ["text-60", "text-90", "text-75", "two-btn"],
  },
  {
    name: "Ecommerce",
    tag: "product · price · cta",
    bars: ["image-bar", "split-text"],
  },
  {
    name: "Profile",
    tag: "avatar · bio · actions",
    bars: ["avatar-row", "text-full", "text-85", "two-btn"],
  },
  {
    name: "Tables",
    tag: "5 rows · 4 cols",
    bars: ["text-full", "text-full", "text-full", "text-full", "text-full"],
  },
  {
    name: "Analytics",
    tag: "metric · chart",
    bars: ["two-stat", "full-bar-chart"],
  },
];

function StarterPreview({ bars }: { bars: string[] }) {
  const bar = (w: string, h = "8px", rounded = "rounded-[3px]") => (
    <div
      className={`sk-shimmer ${w} relative overflow-hidden shrink-0 bg-[#232428] ${rounded}`}
      style={{ height: h }}
    />
  );

  return (
    <div className="flex flex-col gap-2 p-3.5 rounded-md mb-3.5 h-[116px] overflow-hidden bg-background border border-white/[0.06]">
      {bars.map((key, i) => {
        if (key === "row-bar")
          return (
            <div key={i} className="flex gap-2">
              {bar("w-[30%]", "30px", "rounded-md")}
              <div className="flex flex-col gap-1.5 flex-1">
                {bar("w-[80%]")}
                {bar("w-[50%]", "6px")}
              </div>
            </div>
          );
        if (key === "full-bar")
          return <div key={i}>{bar("w-full", "38px", "rounded")}</div>;
        if (key === "three-col")
          return (
            <div key={i} className="flex gap-1.5">
              {Array.from({ length: 3 }, (_, j) => (
                <div key={j} className="flex flex-col gap-1.5 flex-1">
                  {bar("w-[60%]", "6px")}
                  {bar("w-[80%]", "14px")}
                  {bar("w-full", "24px", "rounded-md")}
                </div>
              ))}
            </div>
          );
        if (key === "hero-bar")
          return <div key={i}>{bar("w-full", "48px", "rounded-md")}</div>;
        if (key === "text-70") return <div key={i}>{bar("w-[70%]")}</div>;
        if (key === "text-60") return <div key={i}>{bar("w-[60%]")}</div>;
        if (key === "text-90")
          return <div key={i}>{bar("w-[90%]", "6px")}</div>;
        if (key === "text-75")
          return <div key={i}>{bar("w-[75%]", "6px")}</div>;
        if (key === "text-full") return <div key={i}>{bar("w-full")}</div>;
        if (key === "text-85")
          return <div key={i}>{bar("w-[85%]", "6px")}</div>;
        if (key === "chip")
          return <div key={i}>{bar("w-[30%]", "6px", "rounded-full")}</div>;
        if (key === "two-btn")
          return (
            <div key={i} className="flex gap-2">
              <div className="w-[32%] h-3 rounded-md bg-[#232428]" />
              <div className="w-[32%] h-3 rounded-md bg-[#232428]" />
            </div>
          );
        if (key === "image-bar")
          return <div key={i}>{bar("w-full", "50px", "rounded-md")}</div>;
        if (key === "split-text")
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-col gap-2 flex-1">
                {bar("w-[70%]", "8px")}
                {bar("w-[40%]", "8px")}
              </div>
              {bar("w-[24%]", "14px", "rounded-md")}
            </div>
          );
        if (key === "avatar-row")
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#232428] shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                {bar("w-[60%]")}
                {bar("w-[40%]", "6px")}
              </div>
            </div>
          );
        if (key === "two-stat")
          return (
            <div key={i} className="flex gap-2">
              {Array.from({ length: 2 }, (_, j) => (
                <div key={j} className="flex flex-col gap-1.5 flex-1">
                  {bar("w-[40%]", "6px")}
                  {bar("w-[70%]", "18px")}
                  {bar("w-[20%]", "6px")}
                </div>
              ))}
            </div>
          );
        if (key === "full-bar-chart")
          return <div key={i}>{bar("w-full", "34px", "rounded-md")}</div>;
        return <div key={i}>{bar(`w-[${key}]`)}</div>;
      })}
    </div>
  );
}

export function StartersGrid() {
  return (
    <section className="py-20 border-t border-white/[0.04]" id="starters">
      <div className="max-w-[1240px] mx-auto px-8">
        <div className="text-center mb-16">
          <SectionEyebrow centered>Starter Library</SectionEyebrow>
          <h2 className="gradient-heading-sm text-[48px] font-semibold leading-[1.08] tracking-[-0.028em] m-0">
            Skip manual skeleton loaders. Start from real UI patterns.
          </h2>
          <p className="mt-[18px] mx-auto text-[18px] leading-relaxed text-muted-foreground max-w-[620px]">
            Production-ready skeleton screen templates for common layouts. Pick
            one, tweak dimensions, copy the Tailwind CSS code — no manual
            drawing required.
          </p>
        </div>
        <div className="grid grid-cols-[1fr_2fr] gap-4 mb-4 max-lg:grid-cols-1">
          <div
            className="rounded-[10px] p-[22px] pb-5 bg-card border border-primary/20 hover:border-primary/30 hover:bg-muted transition-[border-color,background] duration-150 cursor-default relative"
            style={{ boxShadow: "0 0 0 2px rgba(16,185,129,0.12)" }}
          >
            <span className="absolute top-3.5 right-4 font-mono text-[10px] text-primary tracking-[0.08em] uppercase bg-primary/10 border border-primary/20 rounded-full py-0.5 px-2">
              Popular
            </span>
            <StarterPreview bars={starters[0].bars} />
            <h4 className="m-0 text-[14px] font-medium tracking-[-0.005em] text-foreground">
              {starters[0].name}
            </h4>
            <p className="mt-1 mb-0 text-[11.5px] font-mono text-muted-foreground">
              {starters[0].tag}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 max-md:grid-cols-2">
            {starters.slice(1, 4).map((s) => (
              <div
                key={s.name}
                className="rounded-[10px] p-[18px] pb-4 bg-card border border-white/[0.09] hover:border-white/[0.14] hover:bg-muted transition-[border-color,background] duration-150 cursor-default"
              >
                <StarterPreview bars={s.bars} />
                <h4 className="m-0 text-[13.5px] font-medium tracking-[-0.005em] text-foreground">
                  {s.name}
                </h4>
                <p className="mt-1 mb-0 text-[11.5px] font-mono text-muted-foreground">
                  {s.tag}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-12 max-md:grid-cols-2">
          {starters.slice(4).map((s) => (
            <div
              key={s.name}
              className="rounded-[10px] p-[18px] pb-4 bg-card border border-white/[0.09] hover:border-white/[0.14] hover:bg-muted transition-[border-color,background] duration-150 cursor-default"
            >
              <StarterPreview bars={s.bars} />
              <h4 className="m-0 text-[13.5px] font-medium tracking-[-0.005em] text-foreground">
                {s.name}
              </h4>
              <p className="mt-1 mb-0 text-[11.5px] font-mono text-muted-foreground">
                {s.tag}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <GhostButton href="/builder">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Open all 20 starters
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </GhostButton>
        </div>
      </div>
    </section>
  );
}

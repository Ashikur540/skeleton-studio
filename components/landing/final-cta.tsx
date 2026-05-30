import { GhostButton, PrimaryButton } from "./buttons";

export function FinalCTA() {
  return (
    <section className="relative py-40 text-center overflow-hidden isolate">
      <div className="final-glow absolute inset-0 z-0 pointer-events-none" />
      <div className="final-stars-bg absolute inset-0 z-0 pointer-events-none" />
      <div className="max-w-[1240px] mx-auto px-8 relative z-[2]">
        <span className="inline-flex items-center gap-2 py-1.5 px-3.5 border border-white/[0.06] rounded-full bg-white/[0.025] text-[12.5px] font-mono text-muted-foreground tracking-[0.04em] mb-7 whitespace-nowrap">
          <span
            className="w-1.5 h-1.5 rounded-full bg-primary"
            style={{ boxShadow: "0 0 0 2px rgba(16,185,129,0.18)" }}
          />
          Public beta · {process.env.NEXT_PUBLIC_PROJECT_VERSION}
        </span>
        <h2 className="gradient-heading text-[40px] md:text-[60px] font-semibold leading-[1.05] tracking-[-0.035em] m-0 mx-auto max-w-[820px]">
          Stop designing
          <br />
          skeletons manually.
        </h2>
        <p className="mt-[22px] mb-9 mx-auto text-[17px] text-muted-foreground max-w-[540px]">
          Paste your JSX, tweak the blocks, copy the code. The loop everyone
          secretly wants.
        </p>
        <div className="flex items-center justify-center gap-3">
          <PrimaryButton href="/app">
            Open Studio
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </PrimaryButton>
          <GhostButton href="#starters">Browse starters</GhostButton>
        </div>
        <p className="mt-9 text-[13px] font-mono text-foreground/30">
          No signup · No credit card · Free for personal use
        </p>
      </div>
    </section>
  );
}

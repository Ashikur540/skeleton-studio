import { GhostButton, PrimaryButton } from "./buttons";

export function FinalCTA() {
  return (
    <section className="relative py-40 overflow-hidden isolate">
      <div className="final-glow absolute inset-0 z-0 pointer-events-none" />
      <div className="final-stars-bg absolute inset-0 z-0 pointer-events-none" />
      <div className="max-w-[1240px] mx-auto px-8 relative z-[2] grid grid-cols-[1.2fr_0.8fr] gap-16 items-center max-md:grid-cols-1 max-md:text-center">
        <div>
          <span className="inline-flex items-center gap-2 py-1.5 px-3.5 border border-white/[0.06] rounded-full bg-white/[0.025] text-[12.5px] font-mono text-muted-foreground tracking-[0.04em] mb-7 whitespace-nowrap">
            <span
              className="w-1.5 h-1.5 rounded-full bg-primary"
              style={{ boxShadow: "0 0 0 2px rgba(16,185,129,0.18)" }}
            />
            Public beta · {process.env.NEXT_PUBLIC_PROJECT_VERSION}
          </span>
          <h2 className="gradient-heading text-[40px] md:text-[60px] font-semibold leading-[1.05] tracking-[-0.035em] m-0">
            Stop building skeleton
            <br />
            loaders by hand.
          </h2>
          <p className="mt-[22px] text-[17px] text-muted-foreground max-w-[540px] max-md:mx-auto">
            The free skeleton generator for React developers. Paste your JSX,
            tweak the blocks, copy the Tailwind CSS code — ship better loading
            states in minutes.
          </p>
          <p className="mt-9 text-[13px] font-mono text-foreground/30">
            No signup · No credit card · Free for personal use
          </p>
        </div>
        <div className="flex flex-col items-end gap-3 max-md:items-center">
          <PrimaryButton href="/builder">
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
      </div>
    </section>
  );
}

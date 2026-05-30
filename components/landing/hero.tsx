"use client";

import { useEffect, useRef } from "react";
import { PrimaryButton } from "./buttons";
import { HeroMockup } from "./hero-mockup";

export function Hero() {
  const mockupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mockupRef.current;
    if (!el) return;
    let ticking = false;
    function update() {
      const rect = el!.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = 1 - Math.min(1, Math.max(0, rect.top / vh));
      let tilt = 14 - p * 16;
      if (tilt < -2) tilt = -2;
      const lift = -p * 20;
      el!.style.setProperty("--tilt", tilt + "deg");
      el!.style.setProperty("--lift", lift + "px");
    }
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section className="relative pt-[100px] pb-0 text-center isolate overflow-hidden">
      {/* Aurora blobs */}
      <div
        className="absolute -inset-x-[10%] top-0 h-[1100px] pointer-events-none z-0 overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(180deg, #000 0%, #000 70%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, #000 0%, #000 70%, transparent 100%)",
        }}
        aria-hidden="true"
      >
        <span className="aurora-blob aurora-blob-1" />
        <span className="aurora-blob aurora-blob-2" />
        <span className="aurora-blob aurora-blob-3" />
        <span className="aurora-blob aurora-blob-4" />
        <div className="aurora-rays absolute top-[-60px] left-1/2 -translate-x-1/2 w-[1100px] h-[680px] opacity-60" />
      </div>

      {/* Stars */}
      <div
        className="stars-bg absolute inset-0 pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* Grid */}
      <div
        className="bg-grid absolute inset-0 pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* Spotlight */}
      <div
        className="spotlight-glow absolute top-[-120px] left-1/2 -translate-x-1/2 w-[1100px] h-[700px] pointer-events-none z-0 opacity-35"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="max-w-[1240px] mx-auto px-8 relative z-[1]">
        <a
          href="#changelog"
          className="inline-flex items-center gap-2 py-[5px] pr-3 pl-1.5 border border-white/[0.06] rounded-full bg-white/[0.025] text-[12.5px] text-muted-foreground mb-[26px] whitespace-nowrap"
        >
          <span className="font-mono text-[11px] text-primary py-0.5 px-[7px] rounded-full tracking-[0.04em] bg-primary/10 border border-primary/20">
            NEW
          </span>
          {process.env.NEXT_PUBLIC_PROJECT_VERSION} &mdash; Repeat &amp;
          archetype detection
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </a>

        <h1 className="gradient-heading text-[56px] md:text-[76px] font-semibold leading-[1.02] tracking-[-0.035em] m-0">
          The Skeleton Generator
          <br />
          for Tailwind CSS.
        </h1>

        <p className="mt-6 mb-9 mx-auto text-[18.5px] leading-relaxed text-[#d4d4d8] max-w-[600px]">
          A free loading skeleton generator that turns your React components
          into production-ready Tailwind CSS skeleton loaders. Paste JSX,
          fine-tune every block visually, and export clean React or HTML code in
          seconds.
        </p>

        <div className="flex items-center justify-center gap-3">
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
          {/* <GhostButton href="#starters">
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
            Browse starters
          </GhostButton> */}
        </div>

        <div className="mt-7 inline-flex items-center gap-4 text-[12.5px] text-muted-foreground whitespace-nowrap">
          <strong className="text-foreground/80 font-medium">⌘K</strong> to
          search
          <span className="w-[3px] h-[3px] rounded-full bg-foreground/30" />
          Works offline
          <span className="w-[3px] h-[3px] rounded-full bg-foreground/30" />
          Free for personal use
        </div>
      </div>

      {/* Mockup */}
      <div className="mockup-frame mt-[88px] mx-auto max-w-[1200px] px-8 relative">
        <div
          ref={mockupRef}
          className="mockup-tilt"
          style={{
            transform:
              "rotateX(var(--tilt, 8deg)) translateY(var(--lift, 0px))",
          }}
        >
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}

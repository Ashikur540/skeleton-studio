"use client";
import { ProjectVersion } from "@/lib/globalConstant";
import { useEffect, useState } from "react";
import { GhostButton, PrimaryButton } from "./buttons";

const NAV_LINKS = ["Features", "Starters", "Pipeline", "Export"];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-30 border-b transition-all duration-300 ${
        scrolled
          ? "nav-blur bg-background/62 border-white/[0.04]"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-[1240px] mx-auto px-8 flex items-center justify-between h-[60px]">
        {/* Brand */}
        <a
          href="#"
          className="flex items-center gap-2.5 font-semibold text-[15px] text-foreground tracking-[-0.01em]"
        >
          <span className="brand-mark relative w-[26px] h-[26px] rounded-[7px] grid place-items-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 7h16M4 12h10M4 17h16" />
            </svg>
          </span>
          Skeleton Studio
          <span className="font-mono text-[10.5px] text-muted-foreground px-[7px] py-0.5 rounded border border-white/[0.06] bg-card ml-0.5">
            {ProjectVersion}
          </span>
        </a>

        {/* Links */}
        <div className="nav-links absolute left-1/2 -translate-x-1/2 flex items-center gap-1 max-[1100px]:hidden">
          {NAV_LINKS.map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="h-8 px-2.5 flex items-center text-[13.5px] font-medium text-muted-foreground hover:text-foreground rounded-md transition-colors"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <a
            href="#"
            className="w-8 h-8 rounded-lg grid place-items-center text-muted-foreground hover:bg-white/[0.04] hover:text-foreground transition-colors"
            title="GitHub"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .5C5.6.5.5 5.6.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.4-1.3-5.4-5.8 0-1.3.5-2.3 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.5-5.4 5.8.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.6 18.4.5 12 .5z" />
            </svg>
          </a>
          <GhostButton href="/app" className="h-8! px-3! text-[13px]!">
            Sign in
          </GhostButton>
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
        </div>
      </div>
    </nav>
  );
}

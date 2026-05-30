import { DevDetailsSection } from "@/components/landing/details";
import { Editing } from "@/components/landing/editing";
import { ExportShowcase } from "@/components/landing/export-showcase";
import { Features } from "@/components/landing/features";
import { FinalCTA } from "@/components/landing/final-cta";
import { FooterSimplified } from "@/components/landing/footer-simple";
import { Hero } from "@/components/landing/hero";
import { Nav } from "@/components/landing/nav";
import { Pipeline } from "@/components/landing/pipeline";
import { StartersGrid } from "@/components/landing/starters-grid";
import "./landing.css";

export default function LandingPage() {
  return (
    <div
      className="dark landing text-foreground text-[15px] leading-[1.55] tracking-[-0.005em]"
      style={{ background: "#010d16" }}
    >
      <a
        href="#features"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-2 focus:outline-ring"
      >
        Skip to content
      </a>
      <Nav />
      <Hero />
      <div className="bg-background">
        {/* <ProofBar /> */}
        <Features />
        <StartersGrid />
        <Pipeline />
        <Editing />
        <ExportShowcase />
        <DevDetailsSection />
        {/* <Value /> */}
        <FinalCTA />
        <FooterSimplified />
      </div>
    </div>
  );
}

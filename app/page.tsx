import { DevDetailsSection } from "@/components/landing/details";
import { Editing } from "@/components/landing/editing";
import { ExportShowcase } from "@/components/landing/export-showcase";
import { Features } from "@/components/landing/features";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Nav } from "@/components/landing/nav";
import { Pipeline } from "@/components/landing/pipeline";
import { StartersGrid } from "@/components/landing/starters-grid";
import "./landing.css";

export default function LandingPage() {
  return (
    <div
      className="dark text-foreground text-[15px] leading-[1.55] tracking-[-0.005em]"
      style={{ background: "#010d16" }}
    >
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
        <Footer />
      </div>
    </div>
  );
}

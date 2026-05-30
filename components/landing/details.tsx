import { Keyboard } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { SectionEyebrow } from "./shared";

const DEV_TAGS = [
  "shadcn/ui aware",
  "Tailwind v4 ready",
  ".map() detection",
  "Grid inference",
  "Repeat variance",
  "Archetype detection",
  "Local persistence",
  "Keyboard shortcuts",
  "Copy to clipboard",
  "Undo/redo stack",
  "Dark mode native",
  "Responsive export",
  "TypeScript types",
  "React 18 ready",
  "No signup",
  "RSC compatible",
  "0 runtime deps",
  "Open format JSON",
  "Figma-friendly",
  "12KB bundle",
];

export function DevDetailsSection() {
  return (
    <section
      className="relative py-32 px-6"
      style={{ borderTop: "1px solid #111113" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 70% 55% at 12% 50%,  rgba(34,197,94,0.10) 0%, transparent 68%),
            radial-gradient(ellipse 55% 45% at 88% 45%,  rgba(99,102,241,0.07) 0%, transparent 62%),
            radial-gradient(ellipse 90% 35% at 50% -5%,  rgba(34,197,94,0.06) 0%, transparent 65%),
            radial-gradient(ellipse 65% 30% at 50% 108%, rgba(56,189,248,0.05) 0%, transparent 65%),
            radial-gradient(ellipse 40% 40% at 50% 50%,  rgba(134,239,172,0.03) 0%, transparent 55%)
          `,
        }}
      />
      <div className="max-w-4xl mx-auto text-center">
        <div>
          <SectionEyebrow centered>Details</SectionEyebrow>
          <h2
            style={{
              fontSize: "clamp(26px, 3vw, 40px)",
              fontWeight: 640,
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
              color: "#ededed",
            }}
            className="mb-3"
          >
            Obsessed with the details
          </h2>
          <p
            className="mb-12 max-w-md mx-auto"
            style={{ fontSize: 16, color: "#71717a", lineHeight: 1.6 }}
          >
            Every edge case frontend engineers actually hit — handled.
          </p>
        </div>

        <div>
          <div className="flex flex-wrap justify-center gap-2">
            {DEV_TAGS.map((tag, i) => (
              <div
                key={i}
                className="card-glow rounded-lg cursor-default"
                style={{
                  padding: "6px 12px",
                  background: "#111113",
                  border: "1px solid #1e1e21",
                  fontSize: 12,
                  color: "#71717a",
                  fontWeight: 500,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>

        {/* Keyboard shortcut callout */}
        <div className="mt-16">
          <div
            className="inline-flex items-center gap-6 rounded-2xl px-8 py-5"
            style={{ background: "#111113", border: "1px solid #1e1e21" }}
          >
            <HugeiconsIcon icon={Keyboard} size={16} strokeWidth={2} />
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {[
                { key: "⌘Z", desc: "Undo" },
                { key: "⌘⇧Z", desc: "Redo" },
                { key: "⌘E", desc: "Export" },
                { key: "⌘K", desc: "Starters" },
                { key: "⌘G", desc: "Generate" },
                { key: "Esc", desc: "Deselect" },
              ].map((s) => (
                <div key={s.key} className="flex items-center gap-1.5">
                  <kbd
                    style={{
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontSize: 10,
                      background: "#1a1a1d",
                      border: "1px solid #2a2a2e",
                      color: "#a1a1a8",
                      fontFamily: "monospace",
                      fontWeight: 600,
                    }}
                  >
                    {s.key}
                  </kbd>
                  <span style={{ fontSize: 11, color: "#3f3f46" }}>
                    {s.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

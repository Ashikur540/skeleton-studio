"use client";

import { SectionEyebrow } from "./shared";

const faqs = [
  {
    q: "What is a skeleton generator?",
    a: "A skeleton generator is a tool that automatically creates skeleton screen loaders — placeholder UI shapes that mimic your page layout while content loads. Our skeleton generator parses your React JSX, detects element types and dimensions, and generates matching Tailwind CSS skeleton loaders you can copy directly into your project.",
  },
  {
    q: "How does this skeleton generator work with Tailwind CSS?",
    a: "This skeleton generator tailwind css workflow is simple: paste your JSX component, and the tool parses it using Babel to build an IR tree. It reads your Tailwind classes, infers dimensions, and renders matching skeleton blocks. You can tweak sizes, add shimmer animations, and export clean React+Tailwind or HTML+Tailwind code — no external dependencies required.",
  },
  {
    q: "How is this different from other tailwind loading skeleton generators?",
    a: "Unlike most loading skeleton generator tools that give you generic placeholder shapes, this tailwind loading skeleton generator parses your actual component code. It understands your layout structure, preserves flex/grid relationships, handles repeat patterns from .map(), and produces skeleton loaders that match your real UI — not a one-size-fits-all block.",
  },
  {
    q: "How do I go from code to loading skeleton?",
    a: "The 'code to loading skeleton' workflow is three steps: (1) paste your React/JSX component into the editor, (2) the skeleton generator automatically parses it into an editable skeleton tree with correct dimensions, (3) use the overlay handles to adjust any block, then copy the exported React+Tailwind or HTML code into your project. It's that fast.",
  },
  {
    q: "Can I use this as a React tailwind skeleton generator?",
    a: "Yes — this is built specifically as a React tailwind skeleton generator. It parses React JSX, handles component props like className, and exports ready-to-use React components with Tailwind CSS classes. The generated code includes shimmer animations, rounded corners, and responsive dimensions that match your original UI.",
  },
  {
    q: "Is this skeleton generator free?",
    a: "Yes, this skeleton generator is completely free for personal use. You can generate unlimited skeleton loaders, export as React or HTML with Tailwind CSS, and use the code in your projects. No sign-up required, works entirely in your browser.",
  },
  {
    q: "What export formats does the skeleton generator support?",
    a: "The skeleton generator exports two formats: React components with Tailwind CSS classes (JSX), and plain HTML with Tailwind CSS classes. Both include shimmer animation keyframes, proper ARIA attributes for accessibility, and pre-formatted code ready to paste into your project.",
  },
  {
    q: "Does it work with complex nested components?",
    a: "Yes. The skeleton generator handles deeply nested JSX, flex and grid layouts, conditional rendering, and even repeated elements from .map() calls. It automatically detects repeated children and applies deterministic width variance so each skeleton row looks natural.",
  },
];

export function Faq() {
  const schemaJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
      />
      <section className="py-20 border-t border-white/[0.04]" id="faq">
        <div className="max-w-[840px] mx-auto px-8">
          <div className="text-center mb-14">
            <SectionEyebrow centered>FAQ</SectionEyebrow>
            <h2 className="gradient-heading-sm text-[48px] font-semibold leading-[1.08] tracking-[-0.028em] m-0">
              Skeleton generator
              <br />
              questions answered.
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-xl border border-white/[0.06] bg-card/50 hover:border-white/[0.1] transition-colors"
              >
                <summary className="flex items-center justify-between py-4 px-6 cursor-pointer select-none list-none">
                  <h3 className="text-[15px] font-semibold tracking-[-0.005em] text-foreground pr-6">
                    {faq.q}
                  </h3>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-muted-foreground group-open:rotate-180 transition-transform"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div className="px-6 pb-5 text-[14.5px] leading-relaxed text-muted-foreground">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

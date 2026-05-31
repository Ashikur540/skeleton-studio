export function FooterSimplified() {
  return (
    <footer style={{ borderTop: "1px solid #111113", background: "#0a0a0b" }}>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 13, fontWeight: 600, color: "#52525b" }}>
              Skeleton Studio
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="#features"
              style={{ fontSize: 12, color: "#3f3f46" }}
              className="hover:text-[#71717a] transition-colors"
            >
              Features
            </a>
            <a
              href="#starters"
              style={{ fontSize: 12, color: "#3f3f46" }}
              className="hover:text-[#71717a] transition-colors"
            >
              Starters
            </a>
            <a
              href="#faq"
              style={{ fontSize: 12, color: "#3f3f46" }}
              className="hover:text-[#71717a] transition-colors"
            >
              FAQ
            </a>
          </div>

          <div style={{ fontSize: 11, color: "#27272a" }}>
            © 2026 Skeleton Studio
          </div>
        </div>
      </div>
    </footer>
  );
}

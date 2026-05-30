export function Footer() {
  const columns = [
    { title: "Product", links: ["Features", "Starters", "Export", "Changelog"] },
    { title: "Developers", links: ["Docs", "CLI", "API reference", "GitHub"] },
    { title: "Resources", links: ["Templates", "Examples", "Blog", "Discord"] },
    { title: "Company", links: ["About", "Pricing", "Security", "Contact"] },
  ];

  return (
    <footer className="border-t border-white/[0.04] bg-card py-14 pb-8">
      <div className="max-w-[1240px] mx-auto px-8">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-10 mb-12 max-md:grid-cols-2">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5 font-semibold text-[15px] text-foreground tracking-[-0.01em]">
              <span className="brand-mark relative w-[26px] h-[26px] rounded-[7px] grid place-items-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h10M4 17h16" /></svg>
              </span>
              Skeleton Studio
            </div>
            <p className="text-[13px] text-muted-foreground max-w-[280px] m-0">Editable loading skeletons for modern frontends. Built in Berlin &amp; Bangalore.</p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h6 className="m-0 mb-3.5 text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">{col.title}</h6>
              <ul className="list-none m-0 p-0 flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link}><a href="#" className="text-[13.5px] text-muted-foreground hover:text-foreground">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal */}
        <div className="border-t border-white/[0.04] pt-6 flex justify-between items-center">
          <span className="text-[12.5px] text-muted-foreground">© 2026 Skeleton Studio. All rights reserved.</span>
          <div className="flex gap-2">
            {[
              <svg key="gh" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.6.5.5 5.6.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.4-1.3-5.4-5.8 0-1.3.5-2.3 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.5-5.4 5.8.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.6 18.4.5 12 .5z"/></svg>,
              <svg key="tw" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M22 5.8c-.7.3-1.5.5-2.4.7.8-.5 1.5-1.3 1.8-2.2-.8.5-1.7.8-2.6 1-.7-.8-1.8-1.3-3-1.3-2.3 0-4.1 1.9-4.1 4.1 0 .3 0 .6.1 1-3.4-.2-6.4-1.8-8.4-4.3-.4.6-.6 1.3-.6 2.1 0 1.4.7 2.7 1.8 3.4-.7 0-1.3-.2-1.8-.5v.1c0 2 1.4 3.7 3.3 4.1-.3.1-.7.2-1.1.2-.3 0-.5 0-.8-.1.5 1.6 2 2.8 3.8 2.9-1.4 1.1-3.2 1.7-5.1 1.7H2c1.9 1.2 4.1 1.9 6.4 1.9 7.7 0 11.9-6.4 11.9-11.9v-.5c.9-.6 1.6-1.4 2.2-2.3"/></svg>,
              <svg key="em" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4.5H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-11c0-1.1-.9-2-2-2zm-3.6 4.4l-4.1 3.3c-.2.1-.4.1-.6 0l-4.1-3.3c-.3-.2-.4-.7-.1-1 .2-.3.6-.3.9-.1l3.6 2.9 3.6-2.9c.3-.2.7-.2.9.1.3.3.2.7-.1 1z"/></svg>,
            ].map((icon, i) => (
              <a key={i} href="#" className="w-7 h-7 rounded-md grid place-items-center text-muted-foreground hover:text-foreground border border-white/[0.06] bg-card">{icon}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

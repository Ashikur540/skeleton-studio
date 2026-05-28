export function ProofBar() {
  const logos = ["▲ Vercel", "Linear", "Supabase", "Raycast", "Resend", "Liveblocks"];
  return (
    <section className="py-[60px] border-y border-white/[0.04] bg-card">
      <div className="max-w-[1240px] mx-auto px-8">
        <p className="text-center font-mono text-[11px] tracking-[0.14em] uppercase text-muted-foreground mb-7">
          Trusted by engineering teams shipping fast
        </p>
        <div className="flex justify-around items-center flex-wrap gap-8 opacity-55">
          {logos.map((name, i) => (
            <span key={name} className="flex items-center gap-2">
              <span className="text-[17px] font-semibold text-foreground/80 tracking-[-0.02em]">{name}</span>
              {i < logos.length - 1 && <span className="text-foreground/30">●</span>}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

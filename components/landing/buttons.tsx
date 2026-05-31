"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

export function PrimaryButton({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "btn-primary relative inline-flex items-center gap-2 h-10 px-5 text-sm font-semibold rounded-lg text-primary-foreground bg-primary [&>svg]:transition-transform [&>svg]:duration-300 transition-all duration-200 active:translate-y-px hover:brightness-105 hover:px-6.5 hover:py-0",
        className,
      )}
      style={{
        background: "linear-gradient(180deg, #14d39d 0%, #0fb87f 100%)",
        boxShadow:
          "0 0 0 1px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.30), inset 0 -1px 0 rgba(0,0,0,0.20), 0 6px 24px rgba(16,185,129,0.18)",
        color: "#03291e",
      }}
    >
      {children}
    </Link>
  );
}

export function GhostButton({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "btn-ghost relative inline-flex items-center gap-2 h-10 px-5 text-sm font-medium rounded-lg text-foreground bg-white/[0.03] border border-white/[0.09] transition-all duration-200 active:translate-y-px",
        className,
      )}
    >
      {children}
    </Link>
  );
}

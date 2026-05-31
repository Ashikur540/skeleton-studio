/**
 * Resolve the canonical site URL from environment variables with defensive
 * normalization so `new URL(...)` never throws at build/runtime.
 *
 * Handles three foot-guns:
 *   1. Env var set to empty string or whitespace (??-chain won't fall through
 *      because empty string is not nullish).
 *   2. Value missing a protocol (e.g. "skeletons-studio.vercel.app").
 *   3. VERCEL_URL preview deployments which omit the scheme by convention.
 */
const DEFAULT_SITE_URL = "https://skeletons-studio.vercel.app";

function normalize(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/**
 * Returns a fully-qualified site URL string. Order of preference:
 * `NEXT_PUBLIC_SITE_URL` → `VERCEL_URL` → built-in default. Each candidate is
 * trimmed and prefixed with `https://` if it lacks a protocol; empty/whitespace
 * values are skipped rather than passed through.
 */
export function resolveSiteUrl(): string {
  return (
    normalize(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalize(process.env.VERCEL_URL) ??
    DEFAULT_SITE_URL
  );
}

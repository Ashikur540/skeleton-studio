import { describe, expect, it } from "vitest";
import { PRESETS, findPreset } from "./presets";

describe("PRESETS", () => {
  it("contains at least 4 named presets", () => {
    expect(PRESETS.length).toBeGreaterThanOrEqual(4);
  });

  it("every preset has unique id", () => {
    const ids = PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every preset has valid animation value", () => {
    for (const p of PRESETS) {
      expect(["pulse", "shimmer"]).toContain(p.settings.animation);
    }
  });

  it("every preset has valid speed value", () => {
    for (const p of PRESETS) {
      expect(["slow", "normal", "fast"]).toContain(p.settings.speed);
    }
  });

  it("every preset baseColor starts with bg-", () => {
    for (const p of PRESETS) {
      expect(p.settings.baseColor).toMatch(/^bg-/);
    }
  });
});

describe("findPreset", () => {
  it("matches Tailwind preset by exact settings", () => {
    const result = findPreset({
      animation: "pulse",
      speed: "normal",
      baseColor: "bg-zinc-200",
      cardBackground: "transparent",
    });
    expect(result?.id).toBe("tailwind");
  });

  it("matches Vercel preset", () => {
    const result = findPreset({
      animation: "shimmer",
      speed: "fast",
      baseColor: "bg-zinc-800",
      cardBackground: "transparent",
    });
    expect(result?.id).toBe("vercel");
  });

  it("returns undefined for non-matching settings", () => {
    const result = findPreset({
      animation: "pulse",
      speed: "fast",
      baseColor: "bg-blue-200",
      cardBackground: "transparent",
    });
    expect(result).toBeUndefined();
  });
});

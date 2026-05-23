import { describe, expect, it } from "vitest";
import { readClasses } from "./tailwind-class-reader";

describe("readClasses", () => {
  it("returns empty hints for empty string", () => {
    expect(readClasses("")).toEqual({});
  });

  it("reads spacing-scale width", () => {
    expect(readClasses("w-32")).toEqual({ width: 128 });
  });

  it("reads w-full", () => {
    expect(readClasses("w-full")).toEqual({ width: "full" });
  });

  it("reads arbitrary px width", () => {
    expect(readClasses("w-[240px]")).toEqual({ width: 240 });
  });

  it("reads arbitrary rem width", () => {
    expect(readClasses("w-[2rem]")).toEqual({ width: 32 });
  });

  it("reads spacing-scale height", () => {
    expect(readClasses("h-10")).toEqual({ height: 40 });
  });

  it("reads radius keywords", () => {
    expect(readClasses("rounded-lg")).toEqual({ radius: 8 });
    expect(readClasses("rounded")).toEqual({ radius: 4 });
    expect(readClasses("rounded-full")).toEqual({ radius: 9999 });
  });

  it("reads arbitrary radius", () => {
    expect(readClasses("rounded-[12px]")).toEqual({ radius: 12 });
  });

  it("reads gap", () => {
    expect(readClasses("gap-4")).toEqual({ gap: 16 });
  });

  it("reads flex direction", () => {
    expect(readClasses("flex flex-row")).toEqual({ direction: "row" });
    expect(readClasses("flex flex-col")).toEqual({ direction: "col" });
  });

  it("defaults flex alone to row", () => {
    expect(readClasses("flex")).toEqual({ direction: "row" });
  });

  it("combines multiple hints", () => {
    expect(readClasses("w-64 h-12 rounded-xl gap-2 flex flex-col")).toEqual({
      width: 256,
      height: 48,
      radius: 12,
      gap: 8,
      direction: "col",
    });
  });

  it("ignores responsive/state modifiers in MVP", () => {
    expect(readClasses("md:w-64 dark:bg-black")).toEqual({});
  });

  it("ignores unknown utility classes", () => {
    expect(readClasses("bg-red-500 text-center hover:underline")).toEqual({});
  });
});

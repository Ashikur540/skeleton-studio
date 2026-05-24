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

  it("ignores text-* / hover:* but bg-* still flags surface", () => {
    expect(readClasses("bg-red-500 text-center hover:underline")).toEqual({
      surface: "card",
    });
  });

  it("ignores unknown utility classes that aren't surface signals", () => {
    expect(readClasses("text-center hover:underline")).toEqual({});
  });

  it("reads p-4 as padding on all sides", () => {
    expect(readClasses("p-4")).toEqual({
      padding: { top: 16, right: 16, bottom: 16, left: 16 },
    });
  });

  it("reads px-6 as horizontal padding", () => {
    expect(readClasses("px-6")).toEqual({
      padding: { left: 24, right: 24 },
    });
  });

  it("reads py-1 as vertical padding", () => {
    expect(readClasses("py-1")).toEqual({
      padding: { top: 4, bottom: 4 },
    });
  });

  it("reads pt-10 / pr-2 / pb-4 / pl-3 as individual sides", () => {
    expect(readClasses("pt-10 pr-2 pb-4 pl-3")).toEqual({
      padding: { top: 40, right: 8, bottom: 16, left: 12 },
    });
  });

  it("combines shorthand + override (p-4 then pt-10)", () => {
    expect(readClasses("p-4 pt-10")).toEqual({
      padding: { top: 40, right: 16, bottom: 16, left: 16 },
    });
  });

  it("reads arbitrary padding p-[12px]", () => {
    expect(readClasses("p-[12px]")).toEqual({
      padding: { top: 12, right: 12, bottom: 12, left: 12 },
    });
  });

  it("flags surface from bg-*", () => {
    expect(readClasses("bg-white")).toEqual({ surface: "card" });
    expect(readClasses("bg-zinc-200")).toEqual({ surface: "card" });
  });

  it("flags surface from bare border", () => {
    expect(readClasses("border")).toEqual({ surface: "card" });
  });

  it("flags surface from border-{color} or border-{width}", () => {
    expect(readClasses("border-gray-200")).toEqual({ surface: "card" });
    expect(readClasses("border-2")).toEqual({ surface: "card" });
  });

  it("does NOT flag surface from side-specific borders (divider intent)", () => {
    expect(readClasses("border-t")).toEqual({});
    expect(readClasses("border-l-2")).toEqual({});
    expect(readClasses("border-x")).toEqual({});
  });

  it("ignores bg-gradient-* for surface flag", () => {
    expect(readClasses("bg-gradient-to-r")).toEqual({});
  });

  it("combines surface + bg + border + radius + padding", () => {
    expect(
      readClasses("bg-white rounded-2xl border border-gray-200 p-4"),
    ).toEqual({
      surface: "card",
      radius: 16,
      padding: { top: 16, right: 16, bottom: 16, left: 16 },
    });
  });

  it("reads items-* alignment", () => {
    expect(readClasses("items-center").alignItems).toBe("center");
    expect(readClasses("items-start").alignItems).toBe("start");
    expect(readClasses("items-end").alignItems).toBe("end");
    expect(readClasses("items-stretch").alignItems).toBe("stretch");
  });

  it("reads justify-* main-axis distribution", () => {
    expect(readClasses("justify-center").justifyContent).toBe("center");
    expect(readClasses("justify-between").justifyContent).toBe("between");
    expect(readClasses("justify-around").justifyContent).toBe("around");
    expect(readClasses("justify-evenly").justifyContent).toBe("evenly");
  });

  it("reads flex-wrap / flex-nowrap", () => {
    expect(readClasses("flex-wrap").wrap).toBe(true);
    expect(readClasses("flex-nowrap").wrap).toBe(false);
  });

  it("reads positioning tokens (absolute/fixed/relative/sticky)", () => {
    expect(readClasses("absolute").position).toBe("absolute");
    expect(readClasses("fixed").position).toBe("fixed");
    expect(readClasses("relative").position).toBe("relative");
    expect(readClasses("sticky").position).toBe("sticky");
  });

  it("reads m-2 as margin on all sides", () => {
    expect(readClasses("m-2")).toEqual({
      margin: { top: 8, right: 8, bottom: 8, left: 8 },
    });
  });

  it("reads mt-3 / mb-5 / mx-* / my-* margin shorthands", () => {
    expect(readClasses("mt-3")).toEqual({ margin: { top: 12 } });
    expect(readClasses("mb-5")).toEqual({ margin: { bottom: 20 } });
    expect(readClasses("mx-4")).toEqual({ margin: { left: 16, right: 16 } });
    expect(readClasses("my-2")).toEqual({ margin: { top: 8, bottom: 8 } });
  });

  it("combines flex + direction + wrap + alignment + justify", () => {
    expect(
      readClasses("flex flex-wrap items-center justify-center gap-8"),
    ).toEqual({
      direction: "row",
      gap: 32,
      alignItems: "center",
      justifyContent: "center",
      wrap: true,
    });
  });
});

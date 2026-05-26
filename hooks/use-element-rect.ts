"use client";
import { useCallback, useLayoutEffect, useState, type RefObject } from "react";

type Rect = { x: number; y: number; width: number; height: number };

/**
 * Track a DOM element's position + size relative to a scrollable container.
 * Returns null when the selector doesn't match any element. Re-measures on
 * target resize, container resize, and container scroll so resize handles
 * stay glued to the skeleton block they decorate.
 */
export function useElementRect(
  containerRef: RefObject<HTMLDivElement | null>,
  selector: string | null,
): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container || !selector) {
      setRect(null);
      return;
    }
    const el = container.querySelector(selector);
    if (!el) {
      setRect(null);
      return;
    }
    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    setRect({
      x: eRect.left - cRect.left + container.scrollLeft,
      y: eRect.top - cRect.top + container.scrollTop,
      width: eRect.width,
      height: eRect.height,
    });
  }, [containerRef, selector]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !selector) {
      setRect(null);
      return;
    }

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(container);

    const el = container.querySelector(selector);
    if (el) ro.observe(el);

    container.addEventListener("scroll", measure, { passive: true });

    return () => {
      ro.disconnect();
      container.removeEventListener("scroll", measure);
    };
  }, [containerRef, selector, measure]);

  return rect;
}

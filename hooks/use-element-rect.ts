"use client";
import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from "react";

type Rect = { x: number; y: number; width: number; height: number };

/**
 * Track a DOM element's position + size relative to a scrollable container.
 * Returns null when the selector doesn't match any element. Re-measures on
 * target resize, container resize, and container scroll so resize handles
 * stay glued to the skeleton block they decorate. Measurements are batched
 * via requestAnimationFrame to avoid multiple re-renders per frame.
 */
export function useElementRect(
  containerRef: RefObject<HTMLDivElement | null>,
  selector: string | null,
): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null);
  const rafId = useRef(0);
  const prevRect = useRef<Rect | null>(null);

  const measure = useCallback(() => {
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container || !selector) {
        if (prevRect.current !== null) {
          prevRect.current = null;
          setRect(null);
        }
        return;
      }
      const el = container.querySelector(selector);
      if (!el) {
        if (prevRect.current !== null) {
          prevRect.current = null;
          setRect(null);
        }
        return;
      }
      const cRect = container.getBoundingClientRect();
      const eRect = el.getBoundingClientRect();
      const next: Rect = {
        x: eRect.left - cRect.left + container.scrollLeft,
        y: eRect.top - cRect.top + container.scrollTop,
        width: eRect.width,
        height: eRect.height,
      };
      const prev = prevRect.current;
      if (prev && prev.x === next.x && prev.y === next.y && prev.width === next.width && prev.height === next.height) {
        return;
      }
      prevRect.current = next;
      setRect(next);
    });
  }, [containerRef, selector]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !selector) {
      prevRect.current = null;
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
      cancelAnimationFrame(rafId.current);
      ro.disconnect();
      container.removeEventListener("scroll", measure);
    };
  }, [containerRef, selector, measure]);

  return rect;
}

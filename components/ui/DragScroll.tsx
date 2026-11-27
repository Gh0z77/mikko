'use client';

import { useEffect } from 'react';

/** Nearest ancestor that actually scrolls sideways (overflow-x auto/scroll with hidden content). */
function sideScroller(start: EventTarget | null): HTMLElement | null {
  for (let n = start instanceof Element ? (start as HTMLElement) : null; n && n !== document.body; n = n.parentElement) {
    const ox = getComputedStyle(n).overflowX;
    if ((ox === 'auto' || ox === 'scroll') && n.scrollWidth > n.clientWidth + 2) return n;
  }
  return null;
}

/**
 * Mouse support for every horizontal row (Telegram Desktop / laptops): drag to scroll and
 * turn the vertical wheel into sideways scrolling while hovering a row. Touch is left to the browser.
 */
export function DragScroll() {
  useEffect(() => {
    let drag: { el: HTMLElement; x: number; left: number; moved: boolean; snap: string } | null = null;
    let swallowClick = false;

    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      const el = sideScroller(e.target);
      if (el) drag = { el, x: e.clientX, left: el.scrollLeft, moved: false, snap: el.style.scrollSnapType };
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) < 5) return; // a small wobble is still a click
      if (!drag.moved) {
        drag.moved = true;
        drag.el.style.scrollSnapType = 'none'; // snapping fights a live drag
        drag.el.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
      }
      drag.el.scrollLeft = drag.left - dx;
    };
    const up = () => {
      if (!drag) return;
      if (drag.moved) {
        swallowClick = true;
        const { el, snap } = drag;
        el.style.cursor = '';
        document.body.style.userSelect = '';
        requestAnimationFrame(() => (el.style.scrollSnapType = snap)); // re-snap to the nearest card
        setTimeout(() => (swallowClick = false), 0);
      }
      drag = null;
    };
    // A drag must not also open the product under the cursor.
    const click = (e: MouseEvent) => {
      if (!swallowClick) return;
      e.preventDefault();
      e.stopPropagation();
      swallowClick = false;
    };
    const wheel = (e: WheelEvent) => {
      if (e.shiftKey || e.ctrlKey || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
      const el = sideScroller(e.target);
      if (!el) return;
      const atStart = el.scrollLeft <= 0 && e.deltaY < 0;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 && e.deltaY > 0;
      if (atStart || atEnd) return; // let the page scroll on once the row ends
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    window.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    window.addEventListener('click', click, true);
    window.addEventListener('wheel', wheel, { passive: false });
    return () => {
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      window.removeEventListener('click', click, true);
      window.removeEventListener('wheel', wheel);
    };
  }, []);
  return null;
}

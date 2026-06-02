import { useEffect, useRef, useState } from 'react';

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Animates a number from 0 to `value` once on mount.
export function useCountUp(value, duration = 900) {
  const [display, setDisplay] = useState(prefersReduced ? value : 0);
  const raf = useRef(null);

  useEffect(() => {
    // reduced-motion: initial state already equals `value`, nothing to animate
    if (prefersReduced) return;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(Math.round(eased * value));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);

  return display;
}

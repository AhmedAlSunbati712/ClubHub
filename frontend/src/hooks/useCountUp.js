import { useEffect, useState } from 'react';

// Smoothly animates a number from 0 to the target value.
export function useCountUp(targetValue = 0, duration = 700) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frameId = 0;
    let startTime = 0;
    const safeDuration = Math.max(0, duration);

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = safeDuration === 0 ? 1 : Math.min(elapsed / safeDuration, 1);
      const nextValue = Math.round(targetValue * progress);
      setValue(nextValue);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      }
    };

    setValue(0);
    frameId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [targetValue, duration]);

  return value;
}

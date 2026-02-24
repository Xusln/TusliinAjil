import { useState, useRef, useEffect } from 'react';

export function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const startValue = useRef(0);

  useEffect(() => {
    const start = startValue.current;
    const end = target;
    const startTime = performance.now();

    function animate(time: number) {
      const progress = Math.min((time - startTime) / duration, 1);
      const current = Math.floor(start + (end - start) * progress);
      setValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        startValue.current = end;
      }
    }

    requestAnimationFrame(animate);
  }, [target, duration]);

  return value;
}
/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { useEffect, useRef } from 'react';

export function useRenderTracker(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());
  const lastRenderTime = useRef(performance.now());

  renderCount.current += 1;

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      const now = performance.now();
      const timeSinceLastRender = now - lastRenderTime.current;
      console.log(`[Render Tracker] ${componentName} rendered. Count: ${renderCount.current}, Time since last: ${timeSinceLastRender.toFixed(2)}ms`);
      lastRenderTime.current = now;
    }
  });

  useEffect(() => {
    return () => {
      if (process.env.NODE_ENV !== 'production') {
        const mountedDuration = performance.now() - startTime.current;
        console.log(`[Render Tracker] ${componentName} unmounted. Mounted for: ${mountedDuration.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
}

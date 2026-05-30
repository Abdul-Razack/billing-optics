"use client";

import { useEffect } from "react";

export function PerformancePatch() {
  useEffect(() => {
    if (typeof performance === "undefined" || !performance.measure) return;
    
    // Only apply in development to suppress known Turbopack/React negative timestamp bugs
    if (process.env.NODE_ENV === 'development') {
      const originalMeasure = performance.measure;
      performance.measure = function(name, options) {
        try {
          return originalMeasure.call(performance, name, options);
        } catch (e: any) {
          // Silence negative timestamp errors in development
          if (e instanceof TypeError && e.message.includes('negative time stamp')) {
            return null as any;
          }
          throw e;
        }
      };
    }
  }, []);

  return null;
}

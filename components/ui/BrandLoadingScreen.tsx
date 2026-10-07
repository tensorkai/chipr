"use client";

import { ChiprBirdMascot } from "@/components/ui/ChiprBirdMascot";
import { useEffect, useState, type ComponentPropsWithoutRef } from "react";

export interface BrandLoadingScreenProps extends ComponentPropsWithoutRef<"div"> {
  className?: string;
  partner?: unknown;
  message?: string;
  /** Duration in ms to stay visible before initiating smooth exit fade */
  minDuration?: number;
  /** Callback fired when the exit fade animation finishes */
  onComplete?: () => void;
}

/**
 * BrandLoadingScreen — High-end minimalist loading & splash screen.
 * Displays only the Chipr bird mascot and the "Chipr" wordmark in a smooth fading animation
 * on a plain canvas background.
 */
export function BrandLoadingScreen({
  className = "",
  minDuration = 2600,
  onComplete,
  partner: _partner,
  message: _message,
  ...props
}: BrandLoadingScreenProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!onComplete) return;

    let exitTimer: ReturnType<typeof setTimeout> | undefined;

    // Display for the requested duration before starting exit fade
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      exitTimer = setTimeout(() => {
        onComplete?.();
      }, 450); // 450ms smooth fadeout
    }, minDuration);

    return () => {
      clearTimeout(timer);
      clearTimeout(exitTimer);
    };
  }, [minDuration, onComplete]);

  return (
    <div
      {...props}
      aria-busy="true"
      aria-live="polite"
      role="status"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-canvas select-none transition-opacity duration-500 ease-out ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      } ${className}`}
    >
      <style>{`
        @keyframes chiprLoadingFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .chipr-loading-brand {
          animation: chiprLoadingFadeIn 900ms ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .chipr-loading-brand { animation: none; }
        }
      `}</style>

      <div className="chipr-loading-brand flex flex-col items-center justify-center">
        {/* Bird Mascot Logo */}
        <ChiprBirdMascot size="lg" animated={false} withSparkles={false} />

        {/* "Chipr" Wordmark with Smooth Fading Animation */}
        <h1 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight text-text-primary">
          Chipr
        </h1>
      </div>
    </div>
  );
}

export default BrandLoadingScreen;

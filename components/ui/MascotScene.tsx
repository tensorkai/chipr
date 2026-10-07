import type { ReactNode } from "react";
import { ChiprBirdMascot, type ChiprMood } from "./ChiprBirdMascot";

interface MascotSceneProps {
  /** Decorative scenes share the existing mascot; surrounding text supplies meaning. */
  variant?: "ledger" | "chat" | "perch";
  badge?: ReactNode;
  mood?: ChiprMood;
  className?: string;
}

export function MascotScene({ variant = "ledger", badge, mood, className = "" }: MascotSceneProps) {
  return (
    <div className={`mascot-scene mascot-scene--${variant} ${className}`} aria-hidden="true">
      <div className="mascot-scene-orbit" />
      {variant === "ledger" && (
        <div className="mascot-ledger">
          <span className="mascot-ledger-binding" />
          <span /><span /><span />
          <i className="mascot-ledger-check">✓</i>
        </div>
      )}
      {variant === "chat" && <div className="mascot-speech">Let’s untangle it.<span /></div>}
      <ChiprBirdMascot size="md" mood={mood ?? (variant === "ledger" ? "focus" : "wave")} animated={false} withSparkles={false} className="mascot-scene-bird" />
      {badge && <span className="mascot-scene-badge">{badge}</span>}
      <span className="mascot-scene-spark">+</span>
    </div>
  );
}

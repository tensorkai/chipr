import React from "react";

export type BirdMascotSize = "xs" | "sm" | "md" | "lg" | "xl";
export type ChiprMood = "idle" | "wave" | "thinking" | "celebrate" | "focus" | "privacy" | "alert";

export interface ChiprBirdMascotProps {
  className?: string;
  size?: BirdMascotSize;
  /** A single entrance gesture; never an idle loop or blinking effect. */
  animated?: boolean;
  withSparkles?: boolean;
  mood?: ChiprMood;
  variant?: "full" | "face";
}

const sizeClasses: Record<BirdMascotSize, string> = {
  xs: "h-8 w-8", sm: "h-16 w-16", md: "h-24 w-24", lg: "h-32 w-32", xl: "h-40 w-40",
};
const moodLabels: Record<ChiprMood, string> = {
  idle: "ready to help", wave: "welcoming you", thinking: "thinking", celebrate: "celebrating",
  focus: "reviewing your records", privacy: "covering its eyes", alert: "paying attention",
};

/** Chipr character master: round silhouette, twin tuft, cream face, gold beak and mint coin.
 * Shared geometry and token colors keep every expression recognizable at icon and illustration sizes.
 */
export function ChiprBirdMascot({ className = "", size = "lg", animated = false, withSparkles = false, mood = "idle", variant = "full" }: ChiprBirdMascotProps) {
  const happy = mood === "celebrate";
  const waving = mood === "wave" || happy;
  const looking = mood === "thinking";
  return (
    <span role="img" aria-label={`Chipr, ${moodLabels[mood]}`} data-mascot-mood={mood}
      className={`chipr-character chipr-character--${mood} ${animated ? "chipr-character--greet" : ""} ${sizeClasses[size]} ${className}`}>
      <svg viewBox={variant === "face" ? "18 8 84 86" : "0 0 120 120"} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        {variant === "full" && <ellipse cx="60" cy="112" rx="30" ry="4" fill="var(--mascot-shadow)" />}
        <g stroke="var(--mascot-outline)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          {/* Tiny feet and asymmetric twin tuft are fixed recognition landmarks. */}
          <path d="M43 100v8h-8m8 0h7m24-8v8h-7m7 0h8" stroke="var(--mascot-gold)" strokeWidth="5" />
          <path d="M26 62C11 56 7 66 13 80l17 8M93 64c16-8 19 4 13 17l-13 7" fill="var(--mascot-wing)" />
          <path d="M53 24c-6-11-3-16 3-17 4 4 6 8 6 13C65 8 73 7 77 10c-1 8-5 13-11 16" fill="var(--mascot-body)" />
          <path d="M23 62c0-27 14-40 37-40s37 13 37 40v13c0 23-14 31-37 31s-37-8-37-31Z" fill="var(--mascot-body)" />
          <path d="M32 69c0-17 12-30 28-30s28 13 28 30v9c0 16-10 22-28 22S32 94 32 78Z" fill="var(--mascot-cream)" stroke="none" />
          {/* Paired facial discs read clearly at 24–32px without gradients or filters. */}
          <ellipse cx="43" cy="53" rx="17" ry="19" fill="var(--mascot-cream)" stroke="none" />
          <ellipse cx="77" cy="53" rx="17" ry="19" fill="var(--mascot-cream)" stroke="none" />
          {happy ? <g stroke="var(--mascot-ink)" strokeWidth="4"><path d="M35 53q8-10 16 0M69 53q8-10 16 0" /></g> : <g stroke="none">
            <ellipse cx={looking ? 47 : 44} cy="53" rx="6" ry="8" fill="var(--mascot-ink)" />
            <ellipse cx={looking ? 80 : 76} cy="53" rx="6" ry="8" fill="var(--mascot-ink)" />
            <circle cx={looking ? 49 : 46} cy="50" r="2" fill="var(--mascot-highlight)" />
            <circle cx={looking ? 82 : 78} cy="50" r="2" fill="var(--mascot-highlight)" />
          </g>}
          {(mood === "alert" || mood === "focus" || looking) && <path d={looking ? "M35 39l12-3M71 37l10 2" : "M36 38l12 3M72 41l12-3"} stroke="var(--mascot-ink)" strokeWidth="2.5" />}
          <ellipse cx="33" cy="65" rx="5" ry="3" fill="var(--mascot-cheek)" stroke="none" />
          <ellipse cx="87" cy="65" rx="5" ry="3" fill="var(--mascot-cheek)" stroke="none" />
          <path d="M53 63q7-5 14 0l-7 9Z" fill="var(--mascot-gold)" strokeWidth="2" />
          <circle cx="60" cy="86" r="8" fill="var(--mascot-mint)" stroke="none" />
          <path d="M56 86h8m-4-4v8" stroke="var(--mascot-coin-ink)" strokeWidth="2.5" />
          {/* Wings change pose; body and face proportions never change. */}
          {mood === "privacy" ? <g fill="var(--mascot-wing)"><path d="M27 76C16 62 22 43 38 42c12 0 16 7 14 18L36 79Z" /><path d="M93 76c11-14 5-33-11-34-12 0-16 7-14 18l16 19Z" /></g>
            : <g fill="var(--mascot-wing)">
              <path d={waving ? "M28 76C10 73 4 54 9 43c5-5 10-1 12 7l14 18Z" : "M27 63c-11 2-14 18-3 26 5 3 10-1 12-8Z"} />
              <path d={happy ? "M92 76c18-3 24-22 19-33-5-5-10-1-12 7L85 68Z" : looking ? "M93 65c13 6 8 23-4 24L72 76c-2-5 2-9 7-7l10 5Z" : "M93 63c11 2 14 18 3 26-5 3-10-1-12-8Z"} />
            </g>}
        </g>
        {(withSparkles || happy) && <g stroke="var(--mascot-gold)" strokeWidth="2.5" strokeLinecap="round"><path d="M10 20v8m-4-4h8M108 29v8m-4-4h8" /></g>}
        {looking && <g fill="var(--mascot-body)"><circle cx="104" cy="17" r="3" /><circle cx="111" cy="11" r="2" /></g>}
      </svg>
    </span>
  );
}

export default ChiprBirdMascot;

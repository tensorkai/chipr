import type { ReactNode } from "react";
import { ChiprBirdMascot, type ChiprMood } from "./ChiprBirdMascot";

/** Inline, entity-aware guidance beside an active control or financial status. */
export function MascotNote({ mood = "focus", children, className = "" }: { mood?: ChiprMood; children: ReactNode; className?: string }) {
  return <div className={`mascot-note ${className}`}>
    <span aria-hidden="true"><ChiprBirdMascot size="sm" mood={mood} /></span>
    <div>{children}</div>
  </div>;
}

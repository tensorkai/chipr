import { NextResponse } from "next/server";

/** Keep route failures consistent even when a dependency throws a non-Error value. */
export function apiError(error: unknown, fallback: string) {
  const message = error && typeof error === "object" && "message" in error && typeof error.message === "string" ? error.message : fallback;
  return NextResponse.json({ error: message || fallback }, { status: 500 });
}

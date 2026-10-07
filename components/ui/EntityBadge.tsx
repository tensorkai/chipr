import React from "react";

interface EntityBadgeProps {
  type: "personal" | "business";
  label?: string;
  size?: "sm" | "md";
}

export function EntityBadge({ type, label, size = "md" }: EntityBadgeProps) {
  const isPersonal = type === "personal";

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-caption" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold tracking-wide ${sizeClasses} ${
        isPersonal
          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
          : "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isPersonal
            ? "bg-indigo-600 dark:bg-indigo-400"
            : "bg-sky-600 dark:bg-sky-400"
        }`}
      />
      {label || (isPersonal ? "Personal Household" : "Commercial Entity")}
    </span>
  );
}

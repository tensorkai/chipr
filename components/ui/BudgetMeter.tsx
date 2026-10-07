import React from "react";
import { ChiprBirdMascot } from "./ChiprBirdMascot";
import { MoneyAmount } from "./MoneyAmount";
import { EditIcon, TrashIcon, SparklesIcon } from "./Icons";

interface BudgetMeterProps {
  category: string;
  spent: number;
  budget: number;
  currency?: string;
  privacyMask?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewLogs?: () => void;
  promptCount?: number;
  className?: string;
}

export function BudgetMeter({
  category,
  spent,
  budget,
  currency = "PHP",
  privacyMask = false,
  onEdit,
  onDelete,
  onViewLogs,
  promptCount = 0,
  className = "",
}: BudgetMeterProps) {
  const hasLimit = budget > 0;
  const percentage = hasLimit ? Math.round((spent / budget) * 100) : 0;
  const clampedPercentage = Math.min(percentage, 100);
  const isOverBudget = hasLimit && spent > budget;
  const isWarning = hasLimit && percentage >= 80 && !isOverBudget;

  let progressColor = "bg-inflow";
  if (isOverBudget) progressColor = "bg-outflow";
  else if (isWarning) progressColor = "bg-warning";
  else if (!hasLimit) progressColor = "bg-indigo-500/60";

  return (
    <div
      className={`group rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5 shadow-xs transition-all duration-150 hover:shadow-md hover:border-border-strong flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between text-sm gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-text-primary truncate">{category}</span>
          </div>

          <div className="flex items-baseline gap-1 text-xs text-text-muted shrink-0">
            <MoneyAmount
              amount={spent}
              currency={currency}
              size="sm"
              colored
              privacyMask={privacyMask}
            />
            {hasLimit ? (
              <>
                <span>/</span>
                <MoneyAmount
                  amount={budget}
                  currency={currency}
                  size="sm"
                  privacyMask={privacyMask}
                />
              </>
            ) : (
              <span className="text-caption text-text-muted italic">(No limit)</span>
            )}
          </div>
        </div>

        {/* Meter Progress Bar */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-raised">
          <div
            className={`h-full transition-all duration-500 ease-out ${progressColor}`}
            style={{ width: `${hasLimit ? clampedPercentage : Math.min(spent > 0 ? 100 : 0, 100)}%` }}
          />
        </div>

        {/* Status indicator line */}
        <div className="mt-2.5 flex items-center justify-between text-xs">
          {hasLimit ? (
            <>
              <span className="font-mono text-text-muted">
                {percentage}% allocated
              </span>
              {isOverBudget ? (
                <span className="font-semibold text-outflow flex items-center gap-1">
                  <span>Over by</span>
                  <MoneyAmount
                    amount={spent - budget}
                    currency={currency}
                    size="xs"
                    privacyMask={privacyMask}
                  />
                </span>
              ) : isWarning ? (
                <span className="font-semibold text-warning">
                  80% limit threshold
                </span>
              ) : (
                <span className="text-text-muted flex items-center gap-1">
                  <MoneyAmount
                    amount={budget - spent}
                    currency={currency}
                    size="xs"
                    privacyMask={privacyMask}
                  />
                  <span>remaining</span>
                </span>
              )}
            </>
          ) : (
            <>
              <span className="text-text-muted text-caption">
                Tracked Spending
              </span>
              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="text-caption font-semibold text-brand hover:underline cursor-pointer"
                >
                  Set Budget Ceiling
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="chipr-budget-status">
        <span aria-hidden="true"><ChiprBirdMascot size="xs" mood={isOverBudget || isWarning ? "alert" : hasLimit ? "focus" : "idle"} variant="face" /></span>
        <p>{isOverBudget ? "Over your plan. Review this category’s spending." : isWarning ? "Getting close. Check what’s still planned." : hasLimit ? "Within your plan. Room for what comes next." : "Set a limit to give this category a plan."}</p>
      </div>
      {/* Action Footer: View Logs & Guard Controls */}
      <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
        {onViewLogs ? (
          <button
            type="button"
            onClick={onViewLogs}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
          >
            <SparklesIcon className="w-3 h-3 text-indigo-500" />
            <span>View Logs</span>
            {promptCount > 0 && (
              <span className="ml-0.5 rounded-full bg-indigo-200 dark:bg-indigo-800 px-1.5 py-0.2 text-caption font-mono">
                {promptCount}
              </span>
            )}
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-raised transition-colors cursor-pointer"
              title="Edit Envelope"
            >
              <EditIcon className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 rounded-lg text-text-muted hover:text-outflow hover:bg-outflow-subtle transition-colors cursor-pointer"
              title="Delete Envelope"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { MoneyAmount } from "./MoneyAmount";

interface PnLSummaryCardProps {
  grossRevenue: number;
  cogs: number;
  operatingExpenses: number;
  currency?: string;
  privacyMask?: boolean;
  periodLabel?: string;
  className?: string;
}

export function PnLSummaryCard({
  grossRevenue,
  cogs,
  operatingExpenses,
  currency = "PHP",
  privacyMask = false,
  periodLabel,
  className = "",
}: PnLSummaryCardProps) {
  const currentPeriod =
    periodLabel ||
    new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const grossProfit = grossRevenue - cogs;
  const netOperatingIncome = grossProfit - operatingExpenses;
  const grossMargin = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;
  const netMargin = grossRevenue > 0 ? (netOperatingIncome / grossRevenue) * 100 : 0;

  return (
    <div
      className={`rounded-2xl border border-border-subtle bg-surface p-4 sm:p-6 shadow-xs transition-all duration-200 hover:shadow-md ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
        <div>
          <h3 className="text-base font-semibold text-text-primary">
            Profit & Loss (P&L) Statement
          </h3>
          <p className="text-xs text-text-muted">{currentPeriod} • Accrual Basis</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold ${
              netMargin >= 0
                ? "bg-inflow-subtle text-inflow"
                : "bg-outflow-subtle text-outflow"
            }`}
          >
            Net Margin: {netMargin.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {/* Gross Revenue */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-inflow" />
            <span className="text-text-secondary">Gross Revenue</span>
          </div>
          <MoneyAmount
            amount={grossRevenue}
            currency={currency}
            privacyMask={privacyMask}
            size="sm"
            colored
            showSign
          />
        </div>

        {/* Cost of Goods Sold */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-outflow" />
            <span className="text-text-secondary">
              <span className="hidden sm:inline">Cost of Goods Sold (Subcontractors)</span>
              <span className="sm:hidden">COGS (1099)</span>
            </span>
          </div>
          <MoneyAmount
            amount={-cogs}
            currency={currency}
            privacyMask={privacyMask}
            size="sm"
            colored
          />
        </div>

        {/* Gross Profit Subtotal */}
        <div className="flex items-center justify-between border-t border-border-subtle pt-2.5 text-sm font-semibold">
          <span className="text-text-primary">Gross Profit</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-text-muted">
              ({grossMargin.toFixed(1)}%)
            </span>
            <MoneyAmount
              amount={grossProfit}
              currency={currency}
              privacyMask={privacyMask}
              size="sm"
              colored
            />
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-outflow" />
            <span className="text-text-secondary">
              <span className="hidden sm:inline">Operating Expenses (OpEx)</span>
              <span className="sm:hidden">OpEx</span>
            </span>
          </div>
          <MoneyAmount
            amount={-operatingExpenses}
            currency={currency}
            privacyMask={privacyMask}
            size="sm"
            colored
          />
        </div>

        {/* Net Operating Income Total */}
        <div className="flex items-center justify-between border-t border-border-strong pt-3.5">
          <div>
            <span className="text-base font-bold text-text-primary">
              Net Operating Income
            </span>
            <p className="text-caption text-text-muted">
              Pre-tax operational net profit
            </p>
          </div>
          <MoneyAmount
            amount={netOperatingIncome}
            currency={currency}
            privacyMask={privacyMask}
            size="lg"
            colored
            showSign
          />
        </div>
      </div>
    </div>
  );
}

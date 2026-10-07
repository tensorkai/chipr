"use client";

import React, { useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { PnLSummaryCard } from "@/components/ui/PnLSummaryCard";
import { RunwayCard } from "@/components/ui/RunwayCard";
import { ScheduleCCategory } from "@/types/finance";
import { ShieldCheckIcon, CheckCircleIcon, TaxIcon } from "@/components/ui/Icons";

export function ReportsView() {
  const { metrics, transactions, markReimbursed, privacyMask, settings } = useFinance();

  const deductibleTransactions = useMemo(() => {
    return transactions.filter((t) => t.isTaxDeductible && t.amount < 0);
  }, [transactions]);

  const crossEntityPending = useMemo(() => {
    return transactions.filter((t) => t.reimbursementStatus === "pending");
  }, [transactions]);

  const ownerDraws = useMemo(() => {
    return transactions.filter((t) => t.isOwnerDraw);
  }, [transactions]);

  // Dynamic receipt compliance rate
  const complianceRate = useMemo(() => {
    if (deductibleTransactions.length === 0) return 100;
    const withReceipts = deductibleTransactions.filter((t) => t.receiptAttached).length;
    return Math.round((withReceipts / deductibleTransactions.length) * 100);
  }, [deductibleTransactions]);

  // Breakdown by Schedule C category
  const categoryBreakdown = useMemo(() => {
    const map = new Map<ScheduleCCategory, { total: number; deductibleAmount: number; count: number }>();

    deductibleTransactions.forEach((t) => {
      const cat = t.scheduleCCategory || "Other Business Expenses";
      const current = map.get(cat) || { total: 0, deductibleAmount: 0, count: 0 };
      const pct = (t.deductiblePercentage ?? 100) / 100;
      const amount = Math.abs(t.amount);

      map.set(cat, {
        total: current.total + amount,
        deductibleAmount: current.deductibleAmount + amount * pct,
        count: current.count + 1,
      });
    });

    return Array.from(map.entries()).map(([category, stats]) => ({
      category,
      ...stats,
    }));
  }, [deductibleTransactions]);

  return (
    <div className="view-page space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Financial Reports & Tax Summary
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Consolidated commercial P&L statement, operational cash runway, and Schedule C tax deductions for {settings.businessName || "your business"}.
        </p>
      </div>

      {/* Primary Financial Statements: P&L + Runway */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PnLSummaryCard
          grossRevenue={metrics.grossRevenue}
          cogs={metrics.cogs}
          operatingExpenses={metrics.operatingExpenses}
          privacyMask={privacyMask}
        />
        <RunwayCard
          monthlyBurnRate={metrics.monthlyBurnRate}
          cashRunwayMonths={metrics.cashRunwayMonths}
          liquidReserves={metrics.businessLiquidCash}
          privacyMask={privacyMask}
        />
      </div>

      {/* Tax Deductions Section */}
      <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-4">
          <div>
            <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <TaxIcon className="w-4 h-4 text-emerald-500" />
              <span>Schedule C Tax Deductions</span>
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Identified write-offs and estimated tax liability reduction
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-text-muted block text-caption">Total Deductible</span>
              <MoneyAmount amount={metrics.taxDeductibleTotal} size="sm" colored privacyMask={privacyMask} />
            </div>
            <div>
              <span className="text-text-muted block text-caption">Est. Tax Offset (25%)</span>
              <span className="font-mono font-bold text-inflow">
                <MoneyAmount amount={metrics.estimatedTaxSavings} size="sm" privacyMask={privacyMask} />
              </span>
            </div>
          </div>
        </div>

        {/* Category Breakdown Component Cards */}
        {categoryBreakdown.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {categoryBreakdown.map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-border-subtle bg-canvas/60 hover:bg-surface hover:border-border-strong hover:shadow-xs transition-all duration-150 group"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-xs text-text-primary truncate">{item.category}</p>
                  <p className="text-caption text-text-muted font-mono mt-0.5">
                    {item.count} record{item.count > 1 ? "s" : ""}
                    {item.category.includes("50%") && " (50% rule)"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <MoneyAmount
                    amount={item.deductibleAmount}
                    size="sm"
                    colored
                    privacyMask={privacyMask}
                  />
                  <span className="text-caption uppercase tracking-wider text-text-muted block font-mono">
                    Write-off
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-text-muted">
            No tax deductible business expenses recorded yet. Tag commercial transactions as deductible to calculate tax write-offs.
          </div>
        )}
      </div>

      {/* Anti-Commingling & Equity Section */}
      <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
        <div className="flex items-center justify-between border-b border-border-subtle pb-4">
          <div>
            <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-brand" />
              <span>Anti-Commingling & Reimbursements</span>
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Preserve accounting boundaries between personal accounts and corporate entities
            </p>
          </div>
          <span className="text-xs font-mono text-text-muted">
            {crossEntityPending.length} pending
          </span>
        </div>

        {crossEntityPending.length > 0 ? (
          <div className="space-y-2.5">
            {crossEntityPending.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 text-xs rounded-2xl border border-border-subtle bg-surface hover:border-border-strong hover:shadow-xs transition-all duration-150 shadow-2xs group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-text-primary">{item.merchant}</p>
                    <span className="rounded-md bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 text-caption font-bold text-amber-700 dark:text-amber-300">
                      Reimbursement Due
                    </span>
                  </div>
                  <p className="text-caption text-text-muted mt-0.5 font-mono">
                    {item.date} • {item.accountName}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle/50">
                  <MoneyAmount
                    amount={Math.abs(item.amount)}
                    size="sm"
                    privacyMask={privacyMask}
                  />
                  <button
                    type="button"
                    onClick={() => markReimbursed(item.id)}
                    className="rounded-xl bg-brand hover:bg-brand-hover active:scale-[0.98] text-white px-3.5 py-1.5 text-xs font-semibold transition-all shadow-xs cursor-pointer"
                  >
                    Mark Reimbursed
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-text-muted flex items-center justify-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-inflow" />
            <span>All personal out-of-pocket expenses for the business have been reimbursed.</span>
          </div>
        )}
      </div>
    </div>
  );
}

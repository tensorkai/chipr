"use client";

import React, { useState, useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import { BudgetMeter } from "@/components/ui/BudgetMeter";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { NewBudgetModal } from "@/components/modals/NewBudgetModal";
import { CategoryLogsModal } from "@/components/modals/CategoryLogsModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { BudgetIcon, PlusIcon, SparklesIcon, EditIcon } from "@/components/ui/Icons";
import { getPersonalCategories } from "@/lib/categories";

export function BudgetsView() {
  const {
    budgets,
    subscriptions,
    metrics,
    privacyMask,
    deleteBudget,
    transactions,
    settings,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<{
    id?: string;
    category: string;
    limit: number;
  }>({ category: "", limit: 500 });

  const [logsModalCategory, setLogsModalCategory] = useState<string | null>(null);
  const [searchCategory, setSearchCategory] = useState("");

  const personalCategories = useMemo(() => getPersonalCategories(), []);

  const currentMonthLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const effectiveCurrency =
    settings.currency ||
    transactions.find((t) => t.currency)?.currency ||
    "PHP";

  const totalMonthlyBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalMonthlySpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalBudgetRemaining = totalMonthlyBudget - totalMonthlySpent;
  const overallPercentage =
    totalMonthlyBudget > 0
      ? Math.min(Math.round((totalMonthlySpent / totalMonthlyBudget) * 100), 100)
      : 0;

  // Calculate prompt logs per category from transactions
  const promptLogCounts = useMemo(() => {
    const counts = new Map<string, number>();
    transactions.forEach((t) => {
      const isPrompt =
        t.createdVia === "ai_chat" ||
        (t.note && t.note.toLowerCase().includes("prompt:"));
      if (isPrompt && t.category) {
        const key = t.category.toLowerCase().trim();
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    });
    return counts;
  }, [transactions]);

  // Calculate total spent per category for the explorer
  const categorySpentMap = useMemo(() => {
    const spentMap = new Map<string, number>();
    const currentMonthPrefix = new Date().toISOString().slice(0, 7);
    transactions.forEach((t) => {
      if (t.entity === "personal" && t.amount < 0) {
        const isCur = !t.date || t.date.startsWith(currentMonthPrefix);
        if (isCur) {
          const key = t.category.toLowerCase().trim();
          spentMap.set(key, (spentMap.get(key) || 0) + Math.abs(t.amount));
        }
      }
    });
    return spentMap;
  }, [transactions]);

  const handleOpenEdit = (b: { id: string; category: string; monthlyLimit: number }) => {
    setSelectedBudget({
      id: b.id,
      category: b.category,
      limit: b.monthlyLimit,
    });
    setIsModalOpen(true);
  };

  const handleOpenNew = (initialCat?: string) => {
    setSelectedBudget({
      id: undefined,
      category: initialCat || "",
      limit: 500,
    });
    setIsModalOpen(true);
  };

  const handleOpenLogs = (categoryName: string) => {
    setLogsModalCategory(categoryName);
  };

  // Filter categories for the category explorer
  const filteredCategories = useMemo(() => {
    if (!searchCategory.trim()) return personalCategories;
    const q = searchCategory.toLowerCase();
    return personalCategories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.examples.some((ex) => ex.toLowerCase().includes(q))
    );
  }, [personalCategories, searchCategory]);

  return (
    <div className="view-page space-y-6 sm:space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-2xl border border-border-subtle bg-surface p-4 sm:p-6 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
              Budgets & spending
            </h1>
            <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              Personal Finance
            </span>
            <span className="inline-flex items-center rounded-full bg-raised px-2.5 py-0.5 text-xs font-mono font-semibold text-text-muted">
              {effectiveCurrency}
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-text-muted">
            Track monthly spending ceilings, live prompt expenses, and provenance logs across all personal categories.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenNew()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 sm:px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-hover active:scale-[0.98] transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          <span>Create Envelope</span>
        </button>
      </div>

      {/* Monthly Allocation Overview */}
      <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-4">
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              {currentMonthLabel} Monthly Overview
            </h3>
            <p className="text-xs text-text-muted">
              {totalMonthlyBudget > 0
                ? `${overallPercentage}% of established budgeted ceilings utilized`
                : "Live spending tracked dynamically from transactions and AI chat prompts"}
            </p>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-1 sm:pt-0">
            <span className="text-xs text-text-muted">
              {totalMonthlyBudget > 0 ? "Remaining Balance:" : "Total Spent This Month:"}
            </span>
            <MoneyAmount
              amount={totalMonthlyBudget > 0 ? totalBudgetRemaining : -totalMonthlySpent}
              currency={effectiveCurrency}
              size="md"
              colored
              privacyMask={privacyMask}
            />
          </div>
        </div>

        {totalMonthlyBudget > 0 && (
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-raised">
            <div
              className={`h-full transition-all duration-500 ease-out ${
                overallPercentage > 90
                  ? "bg-outflow"
                  : overallPercentage > 75
                  ? "bg-warning"
                  : "bg-inflow"
              }`}
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 pt-2">
          <div className="rounded-xl border border-border-subtle bg-canvas p-3">
            <span className="text-caption sm:text-xs text-text-muted">Total Budgeted</span>
            <div className="mt-1">
              <MoneyAmount
                amount={totalMonthlyBudget}
                currency={effectiveCurrency}
                size="md"
                privacyMask={privacyMask}
              />
            </div>
          </div>
          <div className="rounded-xl border border-border-subtle bg-canvas p-3">
            <span className="text-caption sm:text-xs text-text-muted">Total Spent</span>
            <div className="mt-1">
              <MoneyAmount
                amount={-totalMonthlySpent}
                currency={effectiveCurrency}
                size="md"
                colored
                privacyMask={privacyMask}
              />
            </div>
          </div>
          <div className="rounded-xl border border-border-subtle bg-canvas p-3">
            <span className="text-caption sm:text-xs text-text-muted">Active Categories</span>
            <div className="mt-1 font-mono font-bold text-sm sm:text-base text-text-primary">
              {budgets.length} active
            </div>
          </div>
          <div className="rounded-xl border border-border-subtle bg-canvas p-3">
            <span className="text-caption sm:text-xs text-text-muted">Savings Velocity</span>
            <div className="mt-1 font-mono font-bold text-sm sm:text-base text-inflow">
              {metrics.savingsRate.toFixed(1)}% Saved
            </div>
          </div>
        </div>
      </div>

      {/* Active Category Envelopes Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-text-primary">
            Active Category Envelopes & Spending ({budgets.length})
          </h3>
          <p className="text-xs text-text-muted hidden sm:block">
            Categories with prompt activity or defined spending limits
          </p>
        </div>

        {budgets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((b) => {
              const catKey = b.category.toLowerCase().trim();
              const pCount =
                promptLogCounts.get(catKey) ||
                transactions.filter(
                  (t) =>
                    t.category.toLowerCase().includes(catKey) &&
                    (t.createdVia === "ai_chat" ||
                      (t.note && t.note.toLowerCase().includes("prompt:")))
                ).length;

              return (
                <BudgetMeter
                  key={b.id}
                  category={b.category}
                  spent={b.spent}
                  budget={b.monthlyLimit}
                  currency={effectiveCurrency}
                  privacyMask={privacyMask}
                  promptCount={pCount}
                  onViewLogs={() => handleOpenLogs(b.category)}
                  onEdit={() => handleOpenEdit(b)}
                  onDelete={() => {
                    if (confirm(`Delete budget envelope "${b.category}"?`)) {
                      deleteBudget(b.id, b.category);
                    }
                  }}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<BudgetIcon className="w-6 h-6 text-text-muted" />}
            title="No spending recorded or envelopes created"
            description="Whenever you prompt an expense in AI Chat (e.g. 'Spent 250 pesos on jollibee') or create an envelope, it will appear here automatically."
            actionLabel="Create Envelope"
            onAction={() => handleOpenNew()}
          />
        )}
      </div>

      {/* Category Explorer & Prompt Logs Viewer */}
      <div className="rounded-2xl border border-border-subtle bg-surface p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-4">
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              All Expense Categories & Prompt Logs
            </h3>
            <p className="text-xs text-text-muted">
              Explore all categories, view prompt provenance history, or establish custom budget ceilings.
            </p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search categories (e.g. food, bills)..."
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {filteredCategories.map((cat) => {
            const catKey = cat.name.toLowerCase().trim();
            const spent = categorySpentMap.get(catKey) || 0;
            const pCount =
              promptLogCounts.get(catKey) ||
              transactions.filter(
                (t) =>
                  t.category.toLowerCase().includes(catKey) &&
                  (t.createdVia === "ai_chat" ||
                    (t.note && t.note.toLowerCase().includes("prompt:")))
              ).length;
            const activeEnvelope = budgets.find(
              (b) => b.category.toLowerCase() === catKey
            );
            const hasActiveEnvelope = !!activeEnvelope && activeEnvelope.monthlyLimit > 0;

            return (
              <div
                key={cat.id}
                className="flex flex-col justify-between p-3.5 rounded-2xl border border-border-subtle bg-canvas/40 hover:bg-canvas hover:border-border-strong transition-all duration-150 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-text-primary">
                      {cat.name}
                    </h4>
                    {hasActiveEnvelope && (
                      <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 text-caption font-semibold text-indigo-700 dark:text-indigo-300 shrink-0">
                        Envelope Active
                      </span>
                    )}
                  </div>
                  <p className="text-text-muted text-caption line-clamp-2 mt-1">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-border-subtle flex items-center justify-between">
                  <div>
                    <span className="text-caption text-text-muted block">This Month</span>
                    <MoneyAmount
                      amount={-spent}
                      currency={effectiveCurrency}
                      size="xs"
                      colored
                      privacyMask={privacyMask}
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenLogs(cat.name)}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-caption font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
                    >
                      <SparklesIcon className="w-2.5 h-2.5 text-indigo-500" />
                      <span>View Logs</span>
                      {pCount > 0 && (
                        <span className="rounded-full bg-indigo-200 dark:bg-indigo-800 px-1 text-caption font-mono">
                          {pCount}
                        </span>
                      )}
                    </button>

                    {activeEnvelope ? (
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(activeEnvelope)}
                        className="rounded-lg p-1 text-text-muted hover:text-text-primary hover:bg-raised transition-colors cursor-pointer text-caption"
                        title="Edit Envelope Limit"
                      >
                        <EditIcon className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenNew(cat.name)}
                        className="rounded-lg p-1 text-text-muted hover:text-text-primary hover:bg-raised transition-colors cursor-pointer text-caption"
                        title="Set Limit"
                      >
                        <PlusIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recurring Subscriptions & Fixed Bills */}
      {subscriptions.length > 0 && (
        <div className="rounded-2xl border border-border-subtle bg-surface p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div>
              <h3 className="text-base font-semibold text-text-primary">
                Recurring Subscriptions Audit
              </h3>
              <p className="text-xs text-text-muted">
                Household recurring charges with automated renewal tracking
              </p>
            </div>
            <span className="text-xs font-mono text-text-muted">
              {subscriptions.length} active services
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-border-subtle bg-canvas/60 hover:bg-surface hover:border-border-strong hover:shadow-xs transition-all duration-150 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-raised border border-border-subtle text-text-primary font-bold font-mono text-sm shadow-2xs group-hover:scale-105 transition-transform">
                    {sub.name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-bold text-xs text-text-primary truncate">{sub.name}</p>
                      <span className="rounded-md bg-raised px-1.5 py-0.5 text-caption font-mono text-text-muted uppercase">
                        {sub.entity}
                      </span>
                      {sub.recommendation === "cancel" && (
                        <span className="rounded-md bg-outflow-subtle px-1.5 py-0.5 text-caption font-bold text-outflow">
                          Audit Alert
                        </span>
                      )}
                    </div>
                    <p className="text-text-muted text-caption truncate mt-0.5">
                      {sub.category} • Renews <span className="font-mono">{sub.nextRenewalDate}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <MoneyAmount
                    amount={sub.amount}
                    currency={effectiveCurrency}
                    size="sm"
                    privacyMask={privacyMask}
                  />
                  <span className="text-text-muted text-caption block font-mono">
                    /{sub.cadence === "monthly" ? "mo" : "yr"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New / Edit Budget Modal */}
      <NewBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialCategory={selectedBudget.category}
        initialLimit={selectedBudget.limit}
        budgetId={selectedBudget.id}
      />

      {/* Category Logs Modal */}
      {logsModalCategory && (
        <CategoryLogsModal
          isOpen={Boolean(logsModalCategory)}
          onClose={() => setLogsModalCategory(null)}
          category={logsModalCategory}
        />
      )}
    </div>
  );
}

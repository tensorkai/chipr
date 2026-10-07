"use client";

import React, { useState, useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { ChiprCompanion } from "@/components/ui/ChiprCompanion";
import { MascotScene } from "@/components/ui/MascotScene";
import { BalanceCard } from "@/components/ui/BalanceCard";
import { RecordCard } from "@/components/ui/RecordCard";
import { RunwayCard } from "@/components/ui/RunwayCard";
import { CashFlowTrendChart } from "@/components/ui/Charts";
import { DebitCardMockup } from "@/components/ui/DebitCardMockup";
import { NewTransactionModal } from "@/components/modals/NewTransactionModal";
import { AccountModal } from "@/components/modals/AccountModal";
import { FinancialAccount, Transaction } from "@/types/finance";
import {
  PlusIcon,
  SparklesIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  BankIcon,
  PiggyBankIcon,
  CreditCardIcon,
  GridIcon,
  ListIcon,
  CreditPlusIcon,
  TaxIcon,
  InvoiceIcon,
  ArrowRightIcon,
  WalletIcon,
  ShieldCheckIcon,
} from "@/components/ui/Icons";

export function DashboardView() {
  const {
    privacyMask,
    metrics,
    accounts,
    transactions,
    invoices,
    settings,
    markReimbursed,
    deleteTransaction,
    setActiveTab,
    openAddCreditModal,
  } = useFinance();

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<FinancialAccount | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [accountFilter, setAccountFilter] = useState<"all" | "liquid" | "savings" | "credit" | "investment">("all");
  const [activityViewMode, setActivityViewMode] = useState<"cards" | "compact">("compact");

  // Filter accounts by type
  const filteredAccounts = useMemo(() => {
    if (accountFilter === "liquid") {
      return accounts.filter((a) => a.type === "checking");
    }
    if (accountFilter === "savings") {
      return accounts.filter((a) => a.type === "savings");
    }
    if (accountFilter === "credit") {
      return accounts.filter((a) => a.type === "credit" || a.type === "loan");
    }
    if (accountFilter === "investment") {
      return accounts.filter((a) => a.type === "investment");
    }
    return accounts;
  }, [accounts, accountFilter]);

  // Account category counts and sums
  const accountMetrics = useMemo(() => {
    let liquid = 0;
    let savings = 0;
    let credit = 0;
    let investment = 0;

    accounts.forEach((a) => {
      if (a.type === "checking") liquid += a.balance;
      if (a.type === "savings") savings += a.balance;
      if (a.type === "credit" || a.type === "loan") credit += a.balance;
      if (a.type === "investment") investment += a.balance;
    });

    return {
      liquid,
      savings,
      credit,
      investment,
      checkingCount: accounts.filter((a) => a.type === "checking").length,
      savingsCount: accounts.filter((a) => a.type === "savings").length,
      creditCount: accounts.filter((a) => a.type === "credit" || a.type === "loan").length,
      investCount: accounts.filter((a) => a.type === "investment").length,
    };
  }, [accounts]);

  // Recent transactions (latest 6)
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 6);
  }, [transactions]);

  const isCompletelyEmpty = accounts.length === 0 && transactions.length === 0;

  // Open invoices stats
  const pendingInvoices = useMemo(() => {
    return invoices.filter((i) => i.status === "sent" || i.status === "overdue");
  }, [invoices]);

  const overdueCount = useMemo(() => {
    return invoices.filter((i) => i.status === "overdue").length;
  }, [invoices]);

  // Owner or business name
  const displayName = settings.businessName || settings.personalName || "Operations";

  return (
    <div className="dashboard-view space-y-8">
      {/* ========================================================================= */}
      {/* 1. EXECUTIVE HERO: Greeting, Key Metrics & 3D Sapphire Card               */}
      {/* ========================================================================= */}
      <div className="dashboard-hero">
        {/* Left Column: Greeting, Action Bar & 4 Executive KPI Cards */}
        <div className="dashboard-summary">
          <div className="dashboard-heading">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
                  Your money, in focus.
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 text-caption font-bold text-emerald-700 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-text-muted">
                Business overview for {displayName}. A clearer view of what comes in and what comes next.
              </p>
            </div>

            {/* Quick Action Button Cluster */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openAddCreditModal()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white px-3.5 py-2 text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="Top up funds or add credit"
              >
                <CreditPlusIcon className="w-3.5 h-3.5" />
                <span>Add Credit</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingTx(null);
                  setIsTxModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand hover:bg-brand-hover active:scale-[0.98] text-white px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer shadow-xs"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                <span>New transaction</span>
              </button>
            </div>
          </div>

          {/* 4 Executive KPI Cards in a 2x2 grid */}
          <div className="dashboard-metrics grid grid-cols-2 gap-4">
            {/* Card 1: Liquid Reserves */}
            <div className="rounded-2xl border border-border-subtle bg-surface p-3.5 sm:p-4 shadow-xs flex flex-col justify-between hover:border-border-strong hover:shadow-sm transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-caption sm:text-xs font-semibold uppercase tracking-wider text-text-muted font-mono">
                  Liquid Reserves
                </span>
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
                  <BankIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="mt-2.5 sm:mt-3">
                <div className="text-lg sm:text-2xl font-extrabold font-mono tracking-tight text-text-primary">
                  <MoneyAmount
                    amount={metrics.businessLiquidCash}
                    size="lg"
                    privacyMask={privacyMask}
                  />
                </div>
                <p className="text-caption sm:text-caption text-text-muted mt-0.5">
                  Checking & Treasury accounts
                </p>
              </div>
            </div>

            {/* Card 2: Total Inflow */}
            <div className="rounded-2xl border border-border-subtle bg-surface p-3.5 sm:p-4 shadow-xs flex flex-col justify-between hover:border-border-strong hover:shadow-sm transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-caption sm:text-xs font-semibold uppercase tracking-wider text-text-muted font-mono">
                  Total Inflow
                </span>
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                  <TrendingUpIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="mt-2.5 sm:mt-3">
                <div className="text-lg sm:text-2xl font-extrabold font-mono tracking-tight text-inflow">
                  <MoneyAmount
                    amount={metrics.grossRevenue}
                    size="lg"
                    colored
                    showSign
                    privacyMask={privacyMask}
                  />
                </div>
                <p className="text-caption sm:text-caption text-text-muted mt-0.5">
                  Client invoices & deposits
                </p>
              </div>
            </div>

            {/* Card 3: Operating Outflow */}
            <div className="rounded-2xl border border-border-subtle bg-surface p-3.5 sm:p-4 shadow-xs flex flex-col justify-between hover:border-border-strong hover:shadow-sm transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-caption sm:text-xs font-semibold uppercase tracking-wider text-text-muted font-mono">
                  Operating Outflow
                </span>
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">
                  <TrendingDownIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="mt-2.5 sm:mt-3">
                <div className="text-lg sm:text-2xl font-extrabold font-mono tracking-tight text-outflow">
                  <MoneyAmount
                    amount={-metrics.monthlyBurnRate}
                    size="lg"
                    colored
                    privacyMask={privacyMask}
                  />
                </div>
                <p className="text-caption sm:text-caption text-text-muted mt-0.5">
                  OpEx, contractor fees & SaaS
                </p>
              </div>
            </div>

            {/* Card 4: Cash Runway */}
            <div className="rounded-2xl border border-border-subtle bg-surface p-3.5 sm:p-4 shadow-xs flex flex-col justify-between hover:border-border-strong hover:shadow-sm transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-caption sm:text-xs font-semibold uppercase tracking-wider text-text-muted font-mono">
                  Cash Runway
                </span>
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                  <WalletIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="mt-2.5 sm:mt-3">
                <div className="text-lg sm:text-2xl font-extrabold font-mono tracking-tight text-brand">
                  {metrics.cashRunwayMonths >= 99 || !isFinite(metrics.cashRunwayMonths)
                    ? "> 24 mo"
                    : `${metrics.cashRunwayMonths.toFixed(1)} mo`}
                </div>
                <p className="text-caption sm:text-caption text-text-muted mt-0.5">
                  Net margin: {metrics.netMargin.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ultra-Creative Chipr Sapphire Debit Card */}
        <div className="preserved-credit-card">
          <div className="credit-card-heading"><span>Your business card</span><span>CHIPR / WALLET</span></div>
          <DebitCardMockup />
        </div>
      </div>

      {!isCompletelyEmpty && <ChiprCompanion />}

      {/* Empty State Guided Starter */}
      {isCompletelyEmpty && (
        <div className="rounded-2xl border border-border-subtle bg-surface p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-start gap-4">
            <MascotScene variant="perch" className="shrink-0" />
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Every big picture starts small.
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-text-muted leading-relaxed max-w-xl">
                Give your business finances a place to land. Add your first account, then record a transaction or ask Chipr to help organize your expenses.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => openAddCreditModal()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition-all cursor-pointer"
            >
              <CreditPlusIcon className="w-3.5 h-3.5" />
              <span>Add Credit / Top-Up</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingAccount(null);
                setIsAccountModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-hover transition-all cursor-pointer"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>Add Operating Account</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-canvas px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-raised transition-all cursor-pointer"
            >
              <SparklesIcon className="w-3.5 h-3.5 text-brand" />
              <span>Log via AI Assistant</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ACCOUNTS & BALANCES SECTION                                            */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
                Accounts & Reserves
              </h3>
              <span className="rounded-full bg-brand-subtle px-2 py-0.5 text-caption font-mono font-bold text-brand">
                {accounts.length} Total
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Operating checking, treasury reserves, corporate credit cards & investment funds
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => openAddCreditModal()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Add credit or top up funds"
            >
              <CreditPlusIcon className="w-3.5 h-3.5" />
              <span>Add Credit</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingAccount(null);
                setIsAccountModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-raised hover:border-border-strong transition-all cursor-pointer shadow-xs"
            >
              <PlusIcon className="w-3.5 h-3.5 text-brand" />
              <span>Connect Account</span>
            </button>
          </div>
        </div>

        {/* Account Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          <button
            type="button"
            onClick={() => setAccountFilter("all")}
            className={`rounded-xl px-3 py-1.5 font-semibold transition-all cursor-pointer shrink-0 ${
              accountFilter === "all"
                ? "bg-text-primary text-text-inverse shadow-xs"
                : "bg-surface border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-raised"
            }`}
          >
            All Accounts ({accounts.length})
          </button>

          {accountMetrics.checkingCount > 0 && (
            <button
              type="button"
              onClick={() => setAccountFilter("liquid")}
              className={`rounded-xl px-3 py-1.5 font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                accountFilter === "liquid"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-surface border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-raised"
              }`}
            >
              <BankIcon className="w-3.5 h-3.5" />
              <span>Checking ({accountMetrics.checkingCount})</span>
            </button>
          )}

          {accountMetrics.savingsCount > 0 && (
            <button
              type="button"
              onClick={() => setAccountFilter("savings")}
              className={`rounded-xl px-3 py-1.5 font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                accountFilter === "savings"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-surface border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-raised"
              }`}
            >
              <PiggyBankIcon className="w-3.5 h-3.5" />
              <span>Treasury & Reserves ({accountMetrics.savingsCount})</span>
            </button>
          )}

          {accountMetrics.creditCount > 0 && (
            <button
              type="button"
              onClick={() => setAccountFilter("credit")}
              className={`rounded-xl px-3 py-1.5 font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                accountFilter === "credit"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-surface border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-raised"
              }`}
            >
              <CreditCardIcon className="w-3.5 h-3.5" />
              <span>Credit Lines ({accountMetrics.creditCount})</span>
            </button>
          )}

          {accountMetrics.investCount > 0 && (
            <button
              type="button"
              onClick={() => setAccountFilter("investment")}
              className={`rounded-xl px-3 py-1.5 font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                accountFilter === "investment"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-surface border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-raised"
              }`}
            >
              <TrendingUpIcon className="w-3.5 h-3.5" />
              <span>Investments ({accountMetrics.investCount})</span>
            </button>
          )}
        </div>

        {/* Balance Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredAccounts.map((acc) => (
            <BalanceCard
              key={acc.id}
              account={acc}
              privacyMask={privacyMask}
              onEdit={(accountToEdit) => {
                setEditingAccount(accountToEdit);
                setIsAccountModalOpen(true);
              }}
              onClick={(accountToEdit) => {
                setEditingAccount(accountToEdit);
                setIsAccountModalOpen(true);
              }}
            />
          ))}

          {/* Clean Add Account Card */}
          <button
            type="button"
            onClick={() => {
              setEditingAccount(null);
              setIsAccountModalOpen(true);
            }}
            className="group rounded-2xl border-2 border-dashed border-border-subtle hover:border-brand/60 bg-surface/40 hover:bg-brand/5 p-5 flex flex-col items-center justify-center gap-2 text-center transition-all duration-200 cursor-pointer min-h-40"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-canvas border border-border-subtle text-text-muted group-hover:text-brand group-hover:border-brand/40 transition-colors shadow-2xs">
              <PlusIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-text-primary group-hover:text-brand transition-colors">
                Connect Financial Account
              </p>
              <p className="text-caption text-text-muted mt-0.5">
                Checking, Treasury, Credit Card, or Escrow
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CASH FLOW TRAJECTORY CHART                                             */}
      {/* ========================================================================= */}
      <CashFlowTrendChart transactions={transactions} privacyMask={privacyMask} />

      {/* ========================================================================= */}
      {/* 5. TWO-COLUMN WORKSPACE: RECENT ACTIVITY & OPERATING INTELLIGENCE         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Activity (65%) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-text-primary tracking-tight">
                  Recent Activity
                </h3>
                <span className="rounded-full bg-raised px-2 py-0.5 text-caption font-mono font-semibold text-text-muted">
                  {recentTransactions.length}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Real-time operational records, invoice receipts & tax write-offs
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Card vs Compact view toggle */}
              <div className="flex items-center rounded-xl border border-border-subtle bg-surface p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActivityViewMode("cards")}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    activityViewMode === "cards"
                      ? "bg-canvas text-brand shadow-xs"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                  title="Card view"
                >
                  <GridIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActivityViewMode("compact")}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    activityViewMode === "compact"
                      ? "bg-canvas text-brand shadow-xs"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                  title="Compact view"
                >
                  <ListIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("transactions")}
                className="text-xs text-brand hover:text-brand-hover font-semibold flex items-center gap-1 cursor-pointer pl-1"
              >
                <span>View All</span>
                <ArrowRightIcon className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Records Rendered as Component Cards */}
          {recentTransactions.length > 0 ? (
            activityViewMode === "cards" ? (
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <RecordCard
                    key={tx.id}
                    transaction={tx}
                    privacyMask={privacyMask}
                    onReimburse={() => markReimbursed(tx.id)}
                    onEdit={(transactionToEdit) => {
                      setEditingTx(transactionToEdit);
                      setIsTxModalOpen(true);
                    }}
                    onDelete={(id) => deleteTransaction(id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((tx) => (
                  <RecordCard
                    key={tx.id}
                    transaction={tx}
                    variant="compact"
                    privacyMask={privacyMask}
                    onReimburse={() => markReimbursed(tx.id)}
                    onEdit={(transactionToEdit) => {
                      setEditingTx(transactionToEdit);
                      setIsTxModalOpen(true);
                    }}
                    onDelete={(id) => deleteTransaction(id)}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="rounded-2xl border border-border-subtle bg-surface p-8 text-center text-xs text-text-muted shadow-xs">
              No recent transactions recorded. Click above to record an inflow or expense.
            </div>
          )}
        </div>

        {/* Right Column: Operating Solvency & Tax Intelligence (35%) */}
        <div className="space-y-5">
          {/* Cash Runway & Monthly Burn */}
          <RunwayCard
            monthlyBurnRate={metrics.monthlyBurnRate}
            cashRunwayMonths={metrics.cashRunwayMonths}
            liquidReserves={metrics.businessLiquidCash}
            privacyMask={privacyMask}
          />

          {/* Schedule C Tax Deductions Card */}
          <div className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <TaxIcon className="w-4 h-4" />
                <h4 className="text-sm font-bold text-text-primary tracking-tight">
                  Tax Deductions
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("reports")}
                className="text-caption font-bold text-brand hover:text-brand-hover transition-colors cursor-pointer"
              >
                Tax Summary →
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Total Write-Offs</span>
                <MoneyAmount
                  amount={metrics.taxDeductibleTotal}
                  size="sm"
                  colored
                  privacyMask={privacyMask}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Est. Tax Savings (25%)</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                  <MoneyAmount
                    amount={metrics.estimatedTaxSavings}
                    size="sm"
                    privacyMask={privacyMask}
                  />
                </span>
              </div>
            </div>
          </div>

          {/* Open Receivables & Invoices Card */}
          <div className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                <InvoiceIcon className="w-4 h-4" />
                <h4 className="text-sm font-bold text-text-primary tracking-tight">
                  Accounts Receivable
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("invoices")}
                className="text-caption font-bold text-brand hover:text-brand-hover transition-colors cursor-pointer"
              >
                View Invoices →
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Pending Invoices</span>
                <span className="font-mono font-semibold text-text-primary">
                  {pendingInvoices.length} invoices
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Total Outstanding</span>
                <MoneyAmount
                  amount={metrics.outstandingReceivables}
                  size="sm"
                  privacyMask={privacyMask}
                />
              </div>
              {overdueCount > 0 && (
                <div className="flex items-center justify-between pt-1 border-t border-border-subtle text-red-600 dark:text-red-400">
                  <span>Overdue Invoices</span>
                  <span className="font-mono font-bold">{overdueCount} overdue</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewTransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        editingTx={editingTx}
      />
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setEditingAccount(null);
        }}
        editingAccount={editingAccount}
      />
    </div>
  );
}

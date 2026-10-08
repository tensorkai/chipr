"use client";

import React, { useState, useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { ChiprCompanion } from "@/components/ui/ChiprCompanion";
import { MascotScene } from "@/components/ui/MascotScene";
import { BalanceCard } from "@/components/ui/BalanceCard";
import { RecordCard } from "@/components/ui/RecordCard";
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
    accounts: allAccounts,
    transactions: allTransactions,
    workspace,
    setWorkspace,
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

  // Overview is scoped to one entity and currency. Existing records use base
  // units; sum integer cents here without changing the persistence contract.
  const currency = settings.currency || "PHP";
  const accounts = useMemo(() => allAccounts.filter(a => a.entity === workspace && a.currency === currency), [allAccounts, workspace, currency]);
  const transactions = useMemo(() => allTransactions.filter(t => t.entity === workspace && (t.currency || allAccounts.find(a => a.id === t.accountId)?.currency || currency) === currency), [allTransactions, allAccounts, workspace, currency]);
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthTransactions = transactions.filter(t => t.date.startsWith(monthKey));
  const sumCents = (values: number[]) => values.reduce((sum, value) => sum + Math.round(value * 100), 0) / 100;
  const cash = sumCents(accounts.filter(a => a.type === "checking" || a.type === "savings").map(a => a.balance));
  const netWorth = sumCents(accounts.map(a => a.balance));
  const monthIn = sumCents(monthTransactions.filter(t => t.amount > 0).map(t => t.amount));
  const monthOut = sumCents(monthTransactions.filter(t => t.amount < 0).map(t => -t.amount));

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
    return [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  }, [transactions]);

  const isCompletelyEmpty = accounts.length === 0 && transactions.length === 0;

  // Open invoices stats
  const pendingInvoices = useMemo(() => {
    return invoices.filter((i) => i.status === "sent" || i.status === "overdue");
  }, [invoices]);

  const overdueCount = useMemo(() => {
    return invoices.filter((i) => i.status === "overdue").length;
  }, [invoices]);


  return (
    <div className="dashboard-view space-y-8">
      <section className="overview-card-hero" aria-label="Chipr card and overview">
        <div className="preserved-credit-card overview-top-card">
          <div className="credit-card-heading"><span>{workspace === "business" ? "Business" : "Personal"} card design</span><span>SAPPHIRE / CHIPR</span></div>
          <DebitCardMockup />
        </div>
      <header className="overview-heading">
        <div>
          <p className="overview-eyebrow">YOUR FINANCIAL WORKSPACE</p>
          <h1>Your money, in focus<span>.</span></h1>
          <p>{workspace === "business" ? settings.businessName || "Business" : settings.personalName || "Personal"} overview. A little clarity for your next move.</p>
        </div>
        <button type="button" className="finance-button finance-button-primary" onClick={() => { setEditingTx(null); setIsTxModalOpen(true); }}>
          <PlusIcon className="w-4 h-4" /> New transaction
        </button>
      </header>
      </section>

      <div className="overview-toolbar">
        <div className="workspace-segments" aria-label="Overview workspace">
          <button type="button" aria-pressed={workspace === "personal"} onClick={() => { setWorkspace("personal"); setAccountFilter("all"); }}>Personal</button>
          <button type="button" aria-pressed={workspace === "business"} onClick={() => { setWorkspace("business"); setAccountFilter("all"); }}>Business</button>
        </div>
        <span className="overview-period">{currency} <span aria-hidden="true">/</span> <time>{new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(now)}</time></span>
      </div>

      <section className="position-panel" aria-label="Financial position">
        <div className="position-total">
          <p><WalletIcon className="w-4 h-4" /> {workspace === "business" ? "Available cash" : "Net worth"}</p>
          <MoneyAmount amount={workspace === "business" ? cash : netWorth} currency={currency} privacyMask={privacyMask} className="position-amount" />
          <span>{workspace === "business" ? "Across your checking and savings accounts" : "Your account balances, including liabilities"}</span>
          <button className="position-link" type="button" onClick={() => document.getElementById("overview-accounts")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })}>Explore your accounts <ArrowRightIcon className="w-4 h-4" /></button>
        </div>
        <div className="position-detail">
          <div><p><TrendingUpIcon className="w-4 h-4 text-inflow" /> Money in</p><MoneyAmount amount={monthIn} currency={currency} privacyMask={privacyMask} colored showSign size="lg" /><span>This month</span></div>
          <div><p><TrendingDownIcon className="w-4 h-4 text-outflow" /> Money out</p><MoneyAmount amount={-monthOut} currency={currency} privacyMask={privacyMask} colored size="lg" /><span>This month</span></div>
          <div><p>Net cash flow</p><MoneyAmount amount={monthIn - monthOut} currency={currency} privacyMask={privacyMask} size="lg" /><span>Money in minus money out</span></div>
        </div>
      </section>

      <div className="overview-analysis">
        <CashFlowTrendChart transactions={transactions} privacyMask={privacyMask} currency={currency} className="overview-chart" />
        <section className="attention-panel">
          <div className="section-heading"><h2>On your radar</h2><span className="radar-dot" /></div>
          <p className="section-description">A few things worth a closer look.</p>
          {workspace === "business" && <button type="button" className="attention-row" onClick={() => setActiveTab("invoices")}><span className="attention-icon"><InvoiceIcon className="w-5 h-5" /></span><span><strong>Client invoices</strong><small>{overdueCount > 0 ? `${overdueCount} overdue ? ready to review` : `${pendingInvoices.length} awaiting payment`}</small></span><ArrowRightIcon className="w-4 h-4" /></button>}
          <button type="button" className="attention-row" onClick={() => setActiveTab("transactions")}><span className="attention-icon"><ShieldCheckIcon className="w-5 h-5" /></span><span><strong>Reimbursements</strong><small>{transactions.filter(t => t.reimbursementStatus === "pending").length} pending in this workspace</small></span><ArrowRightIcon className="w-4 h-4" /></button>
          <button type="button" className="attention-row" onClick={() => setActiveTab(workspace === "personal" ? "budgets" : "reports")}><span className="attention-icon"><TaxIcon className="w-5 h-5" /></span><span><strong>{workspace === "personal" ? "Your spending plan" : "Reports & deductions"}</strong><small>{workspace === "personal" ? "Check in on your budgets" : "Review your business records"}</small></span><ArrowRightIcon className="w-4 h-4" /></button>
          <div className="radar-note"><ShieldCheckIcon className="w-4 h-4" /><p>Personal and business.<br />Together here. Accounted for separately.</p></div>
        </section>
      </div>

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
                Give your finances a place to land. Add your first account, then record a transaction or ask Chipr to help organize your expenses.
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
              <span>Add your first account</span>
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
      <section id="overview-accounts" className="accounts-section space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
                Your accounts
              </h3>
              <span className="rounded-full bg-brand-subtle px-2 py-0.5 text-caption font-mono font-bold text-brand">
                {accounts.length} Total
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Balances in this workspace. Select an account to manage it.
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
              <span>Add account</span>
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
                Add another account
              </p>
              <p className="text-caption text-text-muted mt-0.5">
                Checking, savings, credit or investments
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. TWO-COLUMN WORKSPACE: RECENT ACTIVITY & OPERATING INTELLIGENCE         */}
      {/* ========================================================================= */}
      <div className="overview-lower">
        {/* Left Column: Recent activity (65%) */}
        <div className="activity-panel space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-text-primary tracking-tight">
                  Recent activity
                </h3>
                <span className="rounded-full bg-raised px-2 py-0.5 text-caption font-mono font-semibold text-text-muted">
                  {recentTransactions.length}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Your latest money movements, all in one place.
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
                <span>View all</span>
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
              Your activity will appear here. Record your first transaction to get started.
            </div>
          )}
        </div>

        <aside className="overview-companion">
          <ChiprCompanion />
        </aside>
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

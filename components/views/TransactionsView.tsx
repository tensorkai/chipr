"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { TransactionTable } from "@/components/ui/TransactionTable";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { NewTransactionModal } from "@/components/modals/NewTransactionModal";
import { Transaction } from "@/types/finance";
import {
  PlusIcon,
  TransactionIcon,
  TaxIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from "@/components/ui/Icons";

export function TransactionsView() {
  const { transactions, privacyMask, markReimbursed, metrics, settings } = useFinance();
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const displayedTransactions = transactions;

  return (
    <div className="view-page space-y-6 max-w-6xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-2xl border border-border-subtle bg-surface p-4 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
              Financial Ledger
            </h1>
            <span className="rounded-full bg-sky-50 dark:bg-sky-950/50 px-2.5 py-0.5 text-xs font-bold text-sky-700 dark:text-sky-300">
              {settings.businessName || "Operations"}
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-text-muted">
            Commercial transactions, invoice payments, operating disbursements & tax write-offs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingTx(null);
              setIsTxModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 sm:px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-hover active:scale-[0.98] transition-all cursor-pointer"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* Ledger Summary Stats (Component Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="rounded-2xl border border-border-subtle bg-surface p-3.5 sm:p-5 shadow-xs flex flex-col justify-between hover:border-border-strong hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-caption sm:text-xs font-semibold text-text-muted">
              Total Records
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400">
              <TransactionIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-xl font-extrabold font-mono text-text-primary">
            {displayedTransactions.length} <span className="text-xs font-normal text-text-muted">records</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface p-3.5 sm:p-5 shadow-xs flex flex-col justify-between hover:border-border-strong hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-caption sm:text-xs font-semibold text-text-muted">
              Total Inflows
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUpIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-xl font-extrabold font-mono text-inflow">
            <MoneyAmount
              amount={metrics.grossRevenue}
              size="md"
              colored
              showSign
              privacyMask={privacyMask}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface p-3.5 sm:p-5 shadow-xs flex flex-col justify-between hover:border-border-strong hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-caption sm:text-xs font-semibold text-text-muted">
              Total Outflows
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <TrendingDownIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-xl font-extrabold font-mono text-outflow">
            <MoneyAmount
              amount={-metrics.monthlyBurnRate}
              size="md"
              colored
              privacyMask={privacyMask}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface p-3.5 sm:p-5 shadow-xs flex flex-col justify-between hover:border-border-strong hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-caption sm:text-xs font-semibold text-text-muted">
              Tax Deductibles
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TaxIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <MoneyAmount
              amount={metrics.taxDeductibleTotal}
              size="md"
              colored
              privacyMask={privacyMask}
            />
          </div>
        </div>
      </div>

      {/* Full Transaction Table */}
      <TransactionTable
        transactions={displayedTransactions}
        privacyMask={privacyMask}
        onReimburse={markReimbursed}
        onAddNew={() => {
          setEditingTx(null);
          setIsTxModalOpen(true);
        }}
        onEditTx={(tx) => {
          setEditingTx(tx);
          setIsTxModalOpen(true);
        }}
      />

      {/* New/Edit Transaction Modal */}
      <NewTransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        editingTx={editingTx}
      />
    </div>
  );
}

"use client";

import React, { useState, useMemo, useRef } from "react";
import { Transaction } from "@/types/finance";
import { TransactionRow } from "./TransactionRow";
import { RecordCard } from "./RecordCard";
import { EmptyState } from "./EmptyState";
import { MoneyAmount } from "./MoneyAmount";
import {
  SearchIcon,
  PlusIcon,
  DownloadIcon,
  UploadIcon,
  GridIcon,
  ListIcon,
  TransactionIcon,
  XMarkIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from "./Icons";
import { useFinance } from "@/context/FinanceContext";

interface TransactionTableProps {
  transactions: Transaction[];
  privacyMask?: boolean;
  onReimburse?: (id: string) => void;
  onAddNew?: () => void;
  onEditTx?: (tx: Transaction) => void;
  title?: string;
  limit?: number;
}

type SortField = "date" | "amount" | "merchant";
type SortOrder = "asc" | "desc";
type FlowFilter = "all" | "inflow" | "outflow";

export function TransactionTable({
  transactions,
  privacyMask = false,
  onReimburse,
  onAddNew,
  onEditTx,
  title = "Ledger & Transaction Records",
  limit,
}: TransactionTableProps) {
  const { deleteTransaction, importTransactionsFromCSV } = useFinance();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterFlow, setFilterFlow] = useState<FlowFilter>("all");
  const [filterTag, setFilterTag] = useState<"all" | "deductible" | "pending_reimbursement">("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [viewMode, setViewMode] = useState<"cards" | "rows">("cards");

  // Filtering & Sorting
  const filteredTransactions = useMemo(() => {
    let list = [...transactions];

    if (filterFlow === "inflow") {
      list = list.filter((t) => t.amount > 0);
    } else if (filterFlow === "outflow") {
      list = list.filter((t) => t.amount < 0);
    }

    if (filterTag === "deductible") {
      list = list.filter((t) => t.isTaxDeductible);
    } else if (filterTag === "pending_reimbursement") {
      list = list.filter((t) => t.reimbursementStatus === "pending");
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (t) =>
          t.merchant.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.note && t.note.toLowerCase().includes(q)) ||
          t.accountName.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      if (sortField === "date") {
        const d1 = new Date(a.date).getTime();
        const d2 = new Date(b.date).getTime();
        return sortOrder === "desc" ? d2 - d1 : d1 - d2;
      }
      if (sortField === "amount") {
        return sortOrder === "desc" ? b.amount - a.amount : a.amount - b.amount;
      }
      if (sortField === "merchant") {
        return sortOrder === "desc"
          ? b.merchant.localeCompare(a.merchant)
          : a.merchant.localeCompare(b.merchant);
      }
      return 0;
    });

    return limit ? list.slice(0, limit) : list;
  }, [transactions, filterFlow, filterTag, searchTerm, sortField, sortOrder, limit]);

  const stats = useMemo(() => {
    let totalInflow = 0;
    let totalOutflow = 0;
    let net = 0;
    let inflowCount = 0;
    let outflowCount = 0;

    filteredTransactions.forEach((t) => {
      net += t.amount;
      if (t.amount > 0) {
        totalInflow += t.amount;
        inflowCount++;
      } else {
        totalOutflow += Math.abs(t.amount);
        outflowCount++;
      }
    });

    return { totalInflow, totalOutflow, net, inflowCount, outflowCount };
  }, [filteredTransactions]);

  const handleExportCSV = () => {
    if (transactions.length === 0) return;

    const headers = [
      "Date",
      "Merchant",
      "Category",
      "Amount",
      "Entity",
      "Account",
      "Tax Deductible",
      "Deductible %",
      "Schedule C",
      "Reimbursement Status",
      "Owner Draw",
      "Note",
    ];

    const rows = transactions.map((t) => [
      t.date,
      `"${t.merchant.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      t.amount.toFixed(2),
      t.entity,
      `"${t.accountName}"`,
      t.isTaxDeductible ? "YES" : "NO",
      t.deductiblePercentage ?? "",
      t.scheduleCCategory ? `"${t.scheduleCCategory}"` : "",
      t.reimbursementStatus ?? "none",
      t.isOwnerDraw ? "YES" : "NO",
      t.note ? `"${t.note.replace(/"/g, '""')}"` : "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `chipr_ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        const count = importTransactionsFromCSV(text);
        alert(`Successfully imported ${count} transactions.`);
      }
    };
    reader.readAsText(file);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface shadow-xs overflow-hidden">
      {/* Table Header / Controls */}
      <div className="p-4 sm:p-5 border-b border-border-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-text-primary tracking-tight">{title}</h3>
              <span className="rounded-full bg-raised px-2 py-0.5 text-caption font-mono font-semibold text-text-muted">
                {filteredTransactions.length}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Tactile component cards with category intelligence, tax tags & reimbursement controls
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center rounded-xl border border-border-subtle bg-canvas p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all cursor-pointer ${
                  viewMode === "cards"
                    ? "bg-surface text-brand shadow-xs font-bold"
                    : "text-text-muted hover:text-text-primary"
                }`}
                title="Component cards view"
              >
                <GridIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("rows")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all cursor-pointer ${
                  viewMode === "rows"
                    ? "bg-surface text-brand shadow-xs font-bold"
                    : "text-text-muted hover:text-text-primary"
                }`}
                title="Stacked rows view"
              >
                <ListIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Rows</span>
              </button>
            </div>

            {/* Import CSV input (hidden) */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />

            {!limit && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-canvas px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-raised transition-colors cursor-pointer"
                  title="Import transactions from CSV"
                >
                  <UploadIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Import</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  disabled={transactions.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-canvas px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-raised transition-colors disabled:opacity-50 cursor-pointer"
                  title="Export transactions to CSV"
                >
                  <DownloadIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </>
            )}

            {onAddNew && (
              <button
                type="button"
                onClick={onAddNew}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-brand-hover active:scale-[0.98] cursor-pointer"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                <span>Add Record</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Toolbar */}
        {!limit && (
          <div className="flex flex-col gap-2.5 pt-1">
            {/* Search Input */}
            <div className="relative w-full">
              <SearchIcon className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                placeholder="Search merchant, category, memo, or account..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-canvas pl-9 pr-8 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-2.5 text-text-muted hover:text-text-primary cursor-pointer"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Scrollable Filter Pills & Sorting Bar */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {/* Flow Filter (Inflow / Outflow) */}
              <div className="flex items-center rounded-xl border border-border-subtle bg-canvas p-0.5 text-xs font-medium shrink-0">
                <button
                  type="button"
                  onClick={() => setFilterFlow("all")}
                  className={`rounded-lg px-2 py-1.5 transition-colors cursor-pointer ${
                    filterFlow === "all"
                      ? "bg-surface text-text-primary shadow-xs font-semibold"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  Flow
                </button>
                <button
                  type="button"
                  onClick={() => setFilterFlow("inflow")}
                  className={`rounded-lg px-2 py-1.5 transition-colors cursor-pointer flex items-center gap-1 ${
                    filterFlow === "inflow"
                      ? "bg-surface text-inflow shadow-xs font-semibold"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  <TrendingUpIcon className="w-3 h-3 text-inflow" />
                  <span>Inflows</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterFlow("outflow")}
                  className={`rounded-lg px-2 py-1.5 transition-colors cursor-pointer flex items-center gap-1 ${
                    filterFlow === "outflow"
                      ? "bg-surface text-outflow shadow-xs font-semibold"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  <TrendingDownIcon className="w-3 h-3 text-outflow" />
                  <span>Outflows</span>
                </button>
              </div>

              {/* Tag Filters */}
              <div className="flex items-center gap-1.5 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setFilterTag(filterTag === "deductible" ? "all" : "deductible")
                  }
                  className={`rounded-xl px-2.5 py-1.5 border transition-all cursor-pointer font-medium ${
                    filterTag === "deductible"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "border-border-subtle bg-canvas text-text-secondary hover:border-border-strong"
                  }`}
                >
                  Deductibles
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFilterTag(
                      filterTag === "pending_reimbursement"
                        ? "all"
                        : "pending_reimbursement"
                    )
                  }
                  className={`rounded-xl px-2.5 py-1.5 border transition-all cursor-pointer font-medium ${
                    filterTag === "pending_reimbursement"
                      ? "border-amber-600 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                      : "border-border-subtle bg-canvas text-text-secondary hover:border-border-strong"
                  }`}
                >
                  Reimbursements
                </button>
              </div>

              {/* Sorting Toggles */}
              <div className="flex items-center gap-1 text-xs shrink-0 border-l border-border-subtle pl-2">
                <span className="text-caption text-text-muted">Sort:</span>
                <button
                  type="button"
                  onClick={() => toggleSort("date")}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    sortField === "date" ? "bg-raised font-bold text-text-primary" : "text-text-muted"
                  }`}
                >
                  Date {sortField === "date" ? (sortOrder === "desc" ? "↓" : "↑") : ""}
                </button>
                <button
                  type="button"
                  onClick={() => toggleSort("amount")}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    sortField === "amount" ? "bg-raised font-bold text-text-primary" : "text-text-muted"
                  }`}
                >
                  Amount {sortField === "amount" ? (sortOrder === "desc" ? "↓" : "↑") : ""}
                </button>
              </div>
            </div>

            {/* Quick Metrics Breakdown Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border-subtle/60 text-xs text-text-muted font-mono">
              <div className="flex items-center gap-3">
                <span>
                  Net:{" "}
                  <MoneyAmount
                    amount={stats.net}
                    size="sm"
                    colored
                    showSign
                    privacyMask={privacyMask}
                  />
                </span>
                <span>•</span>
                <span className="text-inflow">
                  +{stats.inflowCount} Inflows ($
                  {privacyMask ? "••••" : stats.totalInflow.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                </span>
                <span>•</span>
                <span className="text-outflow">
                  -{stats.outflowCount} Outflows ($
                  {privacyMask ? "••••" : stats.totalOutflow.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                </span>
              </div>

              <span>Showing {filteredTransactions.length} of {transactions.length} records</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Records Display: Component Cards or Stacked Rows */}
      {filteredTransactions.length > 0 ? (
        viewMode === "cards" ? (
          <div className="p-3.5 sm:p-5 bg-canvas/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              {filteredTransactions.map((tx) => (
                <RecordCard
                  key={tx.id}
                  transaction={tx}
                  privacyMask={privacyMask}
                  onReimburse={onReimburse}
                  onEdit={onEditTx}
                  onDelete={(id) => {
                    if (confirm(`Delete transaction "${tx.merchant}"?`)) {
                      deleteTransaction(id);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3.5 sm:p-5 space-y-2.5 bg-canvas/30">
            {filteredTransactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                id={tx.id}
                merchant={tx.merchant}
                category={tx.category}
                date={tx.date}
                amount={tx.amount}
                currency={tx.currency}
                entity={tx.entity}
                isTaxDeductible={tx.isTaxDeductible}
                reimbursementStatus={tx.reimbursementStatus}
                isOwnerDraw={tx.isOwnerDraw}
                accountName={tx.accountName}
                note={tx.note}
                privacyMask={privacyMask}
                onReimburse={onReimburse ? () => onReimburse(tx.id) : undefined}
                onEdit={onEditTx ? () => onEditTx(tx) : undefined}
                onDelete={() => {
                  if (confirm(`Delete transaction "${tx.merchant}"?`)) {
                    deleteTransaction(tx.id);
                  }
                }}
              />
            ))}
          </div>
        )
      ) : (
        <EmptyState
          icon={<TransactionIcon className="w-6 h-6 text-text-muted" />}
          title="No transactions recorded"
          description={
            searchTerm || filterTag !== "all" || filterFlow !== "all"
              ? "No entries match your search and filter criteria."
              : "Your financial ledger is currently empty. Record your first transaction or log an expense via AI chat."
          }
          actionLabel={onAddNew ? "Record Transaction" : undefined}
          onAction={onAddNew}
        />
      )}
    </div>
  );
}

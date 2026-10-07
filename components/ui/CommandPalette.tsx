"use client";

import React, { useState, useEffect } from "react";
import { useFinance, NavigationTab } from "@/context/FinanceContext";
import {
  SearchIcon,
  XMarkIcon,
  DashboardIcon,
  TransactionIcon,
  InvoiceIcon,
  TaxIcon,
  PnLIcon,
  EyeIcon,
  EyeSlashIcon,
  SunIcon,
  MoonIcon,
  PlusIcon,
  WalletIcon,
  DownloadIcon,
  RefreshIcon,
  TrashIcon,
  UserIcon,
  SparklesIcon,
  CreditPlusIcon,
} from "./Icons";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTxModal: () => void;
  onOpenInvoiceModal: () => void;
  onOpenAccountModal: () => void;
  onOpenBudgetModal?: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenTxModal,
  onOpenInvoiceModal,
  onOpenAccountModal,
  onOpenBudgetModal,
}: CommandPaletteProps) {
  const {
    setActiveTab,
    setWorkspace,
    togglePrivacyMask,
    privacyMask,
    toggleDarkMode,
    darkMode,
    loadDemoData,
    clearAllData,
    transactions,
    invoices,
    accounts,
    openAddCreditModal,
  } = useFinance();

  const [query, setQuery] = useState("");

  // Keyboard shortcut listener for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    onClose();
  };

  const q = query.toLowerCase().trim();

  // Search matching transactions
  const matchedTxs = q
    ? transactions.filter(
        (t) =>
          t.merchant.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  // Search matching invoices
  const matchedInvoices = q
    ? invoices.filter(
        (i) =>
          i.clientName.toLowerCase().includes(q) ||
          i.invoiceNumber.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  // Search matching accounts
  const matchedAccounts = q
    ? accounts.filter((a) => a.name.toLowerCase().includes(q)).slice(0, 3)
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-20 p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-border-subtle bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input field */}
        <div className="flex items-center gap-2.5 sm:gap-3 border-b border-border-subtle px-3.5 sm:px-4 py-2.5 sm:py-3 bg-canvas">
          <SearchIcon className="w-4 h-4 text-text-muted shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search or run command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="sm:hidden p-1 text-text-muted hover:text-text-primary cursor-pointer"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
          <kbd className="hidden sm:inline-block rounded-md border border-border-subtle bg-surface px-2 py-0.5 text-caption font-mono text-text-muted">
            ESC
          </kbd>
        </div>

        {/* Action groups */}
        <div className="p-3 max-h-96 overflow-y-auto space-y-4 text-xs">
          {/* Quick Actions */}
          <div className="space-y-1">
            <span className="px-2 text-caption font-bold uppercase tracking-wider text-text-muted">
              Quick Actions
            </span>
            <div className="grid grid-cols-2 gap-1 pt-1">
              <button
                type="button"
                onClick={() => {
                  openAddCreditModal();
                  onClose();
                }}
                className="flex items-center gap-2 rounded-xl p-2 text-left hover:bg-emerald-500/10 text-text-primary font-medium transition-colors cursor-pointer"
              >
                <CreditPlusIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Add Credit / Top-Up</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onOpenTxModal();
                  onClose();
                }}
                className="flex items-center gap-2 rounded-xl p-2 text-left hover:bg-raised text-text-primary font-medium transition-colors cursor-pointer"
              >
                <PlusIcon className="w-3.5 h-3.5 text-brand" />
                <span>Record Transaction</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onOpenInvoiceModal();
                  onClose();
                }}
                className="flex items-center gap-2 rounded-xl p-2 text-left hover:bg-raised text-text-primary font-medium transition-colors cursor-pointer"
              >
                <InvoiceIcon className="w-3.5 h-3.5 text-brand" />
                <span>Create Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onOpenAccountModal();
                  onClose();
                }}
                className="flex items-center gap-2 rounded-xl p-2 text-left hover:bg-raised text-text-primary font-medium transition-colors cursor-pointer"
              >
                <WalletIcon className="w-3.5 h-3.5 text-brand" />
                <span>Add Account</span>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-1 border-t border-border-subtle pt-3">
            <span className="px-2 text-caption font-bold uppercase tracking-wider text-text-muted">
              Navigation
            </span>
            <div className="grid grid-cols-2 gap-1 pt-1">
              <button
                type="button"
                onClick={() => handleSelectTab("dashboard")}
                className="flex items-center gap-2 rounded-xl p-2 text-left hover:bg-raised text-text-primary font-medium transition-colors cursor-pointer"
              >
                <DashboardIcon className="w-3.5 h-3.5 text-text-secondary" />
                <span>Overview Dashboard</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab("transactions")}
                className="flex items-center gap-2 rounded-xl p-2 text-left hover:bg-raised text-text-primary font-medium transition-colors cursor-pointer"
              >
                <TransactionIcon className="w-3.5 h-3.5 text-text-secondary" />
                <span>Ledger Stream</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab("invoices")}
                className="flex items-center gap-2 rounded-xl p-2 text-left hover:bg-raised text-text-primary font-medium transition-colors cursor-pointer"
              >
                <InvoiceIcon className="w-3.5 h-3.5 text-text-secondary" />
                <span>Invoicing & Receivables</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab("reports")}
                className="flex items-center gap-2 rounded-xl p-2 text-left hover:bg-raised text-text-primary font-medium transition-colors cursor-pointer"
              >
                <PnLIcon className="w-3.5 h-3.5 text-text-secondary" />
                <span>Reports, P&L & Tax</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab("chat")}
                className="flex items-center gap-2 rounded-xl p-2 text-left hover:bg-raised text-text-primary font-medium transition-colors cursor-pointer"
              >
                <SparklesIcon className="w-3.5 h-3.5 text-brand" />
                <span>Ask Chipr AI</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab("profile")}
                className="flex items-center gap-2 rounded-xl p-2 text-left hover:bg-raised text-text-primary font-medium transition-colors cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-text-secondary" />
                <span>Account & Profile</span>
              </button>
            </div>
          </div>

          {/* Preferences & Utilities */}
          <div className="space-y-1 border-t border-border-subtle pt-3">
            <span className="px-2 text-caption font-bold uppercase tracking-wider text-text-muted">
              Preferences & Data
            </span>
            <div className="grid grid-cols-2 gap-1 pt-1">
              <button
                type="button"
                onClick={() => {
                  togglePrivacyMask();
                  onClose();
                }}
                className="flex items-center gap-2 rounded-xl p-2 text-left hover:bg-raised text-text-primary font-medium transition-colors cursor-pointer"
              >
                {privacyMask ? (
                  <EyeIcon className="w-3.5 h-3.5 text-text-secondary" />
                ) : (
                  <EyeSlashIcon className="w-3.5 h-3.5 text-text-secondary" />
                )}
                <span>{privacyMask ? "Reveal Balances" : "Privacy Mask (₱••••••)"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleDarkMode();
                  onClose();
                }}
                className="flex items-center gap-2 rounded-xl p-2 text-left hover:bg-raised text-text-primary font-medium transition-colors cursor-pointer"
              >
                {darkMode ? (
                  <SunIcon className="w-3.5 h-3.5 text-text-secondary" />
                ) : (
                  <MoonIcon className="w-3.5 h-3.5 text-text-secondary" />
                )}
                <span>{darkMode ? "Light Theme" : "Dark Theme"}</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab("profile")}
                className="flex items-center gap-2 rounded-xl p-2 text-left hover:bg-raised text-text-primary font-medium transition-colors cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-brand" />
                <span>Configure Profile & Entity</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  loadDemoData();
                  onClose();
                }}
                className="flex items-center gap-2 rounded-xl p-2 text-left hover:bg-raised text-text-primary font-medium transition-colors cursor-pointer"
              >
                <RefreshIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Load Sample Template</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Reset and clear all financial data?")) {
                    clearAllData();
                    onClose();
                  }
                }}
                className="flex items-center gap-2 rounded-xl p-2 text-left hover:bg-outflow-subtle text-outflow font-medium transition-colors cursor-pointer"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                <span>Clear All Data</span>
              </button>
            </div>
          </div>

          {/* Quick Credit Match */}
          {q && ("add credit".includes(q) || "credit".includes(q) || "top up".includes(q) || "top-up".includes(q) || "deposit".includes(q) || "fund".includes(q)) && (
            <div className="space-y-1 border-t border-border-subtle pt-3">
              <span className="px-2 text-caption font-bold uppercase tracking-wider text-text-muted">
                Action Match
              </span>
              <div
                onClick={() => {
                  openAddCreditModal();
                  onClose();
                }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-xs cursor-pointer border border-emerald-500/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CreditPlusIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="font-bold text-emerald-700 dark:text-emerald-300">Add Credit / Top-Up Account</p>
                    <p className="text-caption text-text-muted">Simulate or record an inflow of funds into accounts</p>
                  </div>
                </div>
                <span className="text-caption font-mono text-emerald-600 dark:text-emerald-400 font-bold">↵ Run</span>
              </div>
            </div>
          )}

          {/* Search matches */}
          {(matchedTxs.length > 0 || matchedInvoices.length > 0 || matchedAccounts.length > 0) && (
            <div className="space-y-1 border-t border-border-subtle pt-3">
              <span className="px-2 text-caption font-bold uppercase tracking-wider text-text-muted">
                Search Results
              </span>
              <div className="space-y-1 pt-1">
                {matchedTxs.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setActiveTab("transactions");
                      onClose();
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-raised text-xs cursor-pointer"
                  >
                    <div>
                      <p className="font-semibold text-text-primary">{t.merchant}</p>
                      <p className="text-caption text-text-muted">{t.category} • {t.date}</p>
                    </div>
                    <span className="font-mono font-semibold">
                      {t.amount >= 0 ? "+" : "-"}₱{Math.abs(t.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
                {matchedInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => {
                      setActiveTab("invoices");
                      onClose();
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-raised text-xs cursor-pointer"
                  >
                    <div>
                      <p className="font-semibold text-text-primary">{inv.clientName}</p>
                      <p className="text-caption text-text-muted">{inv.invoiceNumber} • {inv.status}</p>
                    </div>
                    <span className="font-mono font-semibold">₱{inv.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border-subtle bg-canvas px-4 py-2 flex items-center justify-between text-caption text-text-muted">
          <span>Navigate with ⌘K / Ctrl+K</span>
          <span className="font-mono">Chipr v2.1</span>
        </div>
      </div>
    </div>
  );
}

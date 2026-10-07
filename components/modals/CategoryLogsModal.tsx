"use client";

import React, { useState, useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import {
  XMarkIcon,
  SparklesIcon,
  TrashIcon,
  CalendarIcon,
  BuildingOfficeIcon,
} from "@/components/ui/Icons";

interface CategoryLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
}

export function CategoryLogsModal({
  isOpen,
  onClose,
  category,
}: CategoryLogsModalProps) {
  const { transactions, deleteTransaction, settings, privacyMask } = useFinance();
  const [filter, setFilter] = useState<"all" | "ai" | "manual">("all");

  const categoryLower = (category || "").toLowerCase().trim();

  // Find all transactions matching this category (exact or partial keyword)
  const categoryTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const tCat = (t.category || "").toLowerCase().trim();
      return (
        tCat === categoryLower ||
        tCat.includes(categoryLower) ||
        categoryLower.includes(tCat)
      );
    });
  }, [transactions, categoryLower]);

  // Filter by AI chat vs manual
  const filteredTransactions = useMemo(() => {
    if (filter === "ai") {
      return categoryTransactions.filter(
        (t) => t.createdVia === "ai_chat" || (t.note && t.note.toLowerCase().includes("prompt:"))
      );
    }
    if (filter === "manual") {
      return categoryTransactions.filter(
        (t) => t.createdVia !== "ai_chat" && (!t.note || !t.note.toLowerCase().includes("prompt:"))
      );
    }
    return categoryTransactions;
  }, [categoryTransactions, filter]);

  // Total spent in this category
  const totalSpent = useMemo(() => {
    return categoryTransactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [categoryTransactions]);

  const promptLogsCount = useMemo(() => {
    return categoryTransactions.filter(
      (t) => t.createdVia === "ai_chat" || (t.note && t.note.toLowerCase().includes("prompt:"))
    ).length;
  }, [categoryTransactions]);

  const effectiveCurrency =
    categoryTransactions.find((t) => t.currency)?.currency ||
    settings.currency ||
    "PHP";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl rounded-t-3xl sm:rounded-2xl border border-border-subtle bg-surface p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] sm:max-h-[85vh] flex flex-col pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile sheet pull indicator */}
        <div className="sm:hidden w-10 h-1 bg-border-strong rounded-full mx-auto mb-1 opacity-70 shrink-0" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-border-subtle pb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
                {category || "Category"} Logs
              </h2>
              <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 text-caption font-semibold text-indigo-700 dark:text-indigo-300">
                {promptLogsCount} Prompt {promptLogsCount === 1 ? "Log" : "Logs"}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1">
              Complete provenance trail of purchases and expense prompts mapped to this category.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-raised hover:text-text-primary transition-colors cursor-pointer shrink-0"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Category Summary Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl border border-border-subtle bg-canvas/70 shrink-0">
          <div>
            <span className="text-caption text-text-muted block">Total Spent</span>
            <div className="mt-0.5">
              <MoneyAmount
                amount={-totalSpent}
                currency={effectiveCurrency}
                size="md"
                colored
                privacyMask={privacyMask}
              />
            </div>
          </div>
          <div>
            <span className="text-caption text-text-muted block">Total Records</span>
            <span className="text-sm font-mono font-bold text-text-primary">
              {categoryTransactions.length} entries
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-caption text-text-muted block">AI Prompt Logged</span>
            <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {promptLogsCount} from chat
            </span>
          </div>
        </div>

        {/* Filter Toggle Pills */}
        <div className="flex items-center gap-1.5 shrink-0 pt-1">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors cursor-pointer border ${
              filter === "all"
                ? "bg-brand text-white border-brand shadow-2xs"
                : "bg-surface border-border-subtle text-text-secondary hover:text-text-primary hover:bg-raised"
            }`}
          >
            All Entries ({categoryTransactions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("ai")}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors cursor-pointer border flex items-center gap-1.5 ${
              filter === "ai"
                ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                : "bg-surface border-border-subtle text-text-secondary hover:text-text-primary hover:bg-raised"
            }`}
          >
            <SparklesIcon className="w-3 h-3" />
            <span>AI Prompts Only ({promptLogsCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter("manual")}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors cursor-pointer border ${
              filter === "manual"
                ? "bg-brand text-white border-brand shadow-2xs"
                : "bg-surface border-border-subtle text-text-secondary hover:text-text-primary hover:bg-raised"
            }`}
          >
            Manual ({categoryTransactions.length - promptLogsCount})
          </button>
        </div>

        {/* Scrollable Transaction Log List */}
        <div className="overflow-y-auto flex-1 space-y-3 pr-1 pt-1">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => {
              const isAiPrompt =
                tx.createdVia === "ai_chat" ||
                (tx.note && tx.note.toLowerCase().includes("prompt:"));

              return (
                <div
                  key={tx.id}
                  className={`rounded-2xl border p-4 transition-all duration-150 ${
                    isAiPrompt
                      ? "border-indigo-200/70 dark:border-indigo-900/50 bg-indigo-50/20 dark:bg-indigo-950/20 hover:border-indigo-300 dark:hover:border-indigo-800"
                      : "border-border-subtle bg-canvas/40 hover:bg-surface hover:border-border-strong"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-text-primary truncate">
                          {tx.merchant}
                        </h4>
                        {isAiPrompt && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 text-caption font-semibold text-indigo-700 dark:text-indigo-300">
                            <SparklesIcon className="w-2.5 h-2.5" />
                            <span>AI Chat Prompt</span>
                          </span>
                        )}
                        <span className="rounded-md bg-raised px-1.5 py-0.5 text-caption font-mono text-text-muted uppercase">
                          {tx.entity}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-text-muted mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 font-mono">
                          <CalendarIcon className="w-3 h-3" />
                          {tx.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <BuildingOfficeIcon className="w-3 h-3" />
                          {tx.accountName || "Checking Account"}
                        </span>
                      </div>
                    </div>

                    {/* Amount & Delete */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <MoneyAmount
                          amount={tx.amount}
                          currency={tx.currency || effectiveCurrency}
                          size="md"
                          colored
                          showSign
                          privacyMask={privacyMask}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete record "${tx.merchant}" (${tx.amount})?`)) {
                            deleteTransaction(tx.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-text-muted hover:text-outflow hover:bg-outflow-subtle transition-colors cursor-pointer"
                        title="Delete record"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* AI Prompt Provenance Quote Card */}
                  {tx.note && (
                    <div className="mt-3 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/40 p-2.5 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-caption text-indigo-700 dark:text-indigo-300 mb-0.5">
                        <SparklesIcon className="w-3 h-3" />
                        <span>Prompt Provenance:</span>
                      </div>
                      <p className="font-mono text-indigo-950 dark:text-indigo-200 text-xs italic">
                        {tx.note.startsWith("Prompt: ") ? tx.note : `"${tx.note}"`}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-border-strong p-8 text-center space-y-2 my-4">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-raised text-text-muted">
                <SparklesIcon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">
                No logs found for {category}
              </h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                No purchases or prompts have been recorded in this category yet.
                Try chatting in the AI Chat tab (e.g. &quot;Spent 250 pesos on jollibee&quot;) to automatically categorize and log here.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-border-subtle shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-text-primary hover:bg-raised rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

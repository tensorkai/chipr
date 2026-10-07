"use client";

import React from "react";
import { MoneyAmount } from "./MoneyAmount";
import { ReimbursementStatus, Transaction } from "@/types/finance";
import {
  TrashIcon,
  EditIcon,
  CheckCircleIcon,
  TaxIcon,
  CoffeeIcon,
  LaptopIcon,
  BriefcaseIcon,
  ShoppingCartIcon,
  UtensilsIcon,
  ZapIcon,
  PlaneIcon,
  WalletIcon,
  ArrowDownLeftIcon,
} from "./Icons";

interface TransactionRowProps {
  id: string;
  merchant: string;
  category: string;
  date: string;
  amount: number; // Negative for expense, positive for income/revenue
  entity?: "personal" | "business";
  isTaxDeductible?: boolean;
  reimbursementStatus?: ReimbursementStatus;
  isOwnerDraw?: boolean;
  accountName?: string;
  note?: string;
  currency?: string;
  privacyMask?: boolean;
  onReimburse?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  className?: string;
}

export function TransactionRow({
  id,
  merchant,
  category,
  date,
  amount,
  entity = "personal",
  isTaxDeductible = false,
  reimbursementStatus = "none",
  isOwnerDraw = false,
  accountName,
  note,
  currency = "PHP",
  privacyMask = false,
  onReimburse,
  onEdit,
  onDelete,
  onClick,
  className = "",
}: TransactionRowProps) {
  const isInflow = amount > 0;

  // Category Icon & Tint Resolver
  const getCategoryTheme = () => {
    const cat = (category || "").toLowerCase();
    const merch = (merchant || "").toLowerCase();

    if (isInflow || cat.includes("salary") || cat.includes("retainer") || cat.includes("deposit")) {
      return {
        icon: <ArrowDownLeftIcon className="w-4 h-4" />,
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      };
    }
    if (cat.includes("coffee") || merch.includes("coffee") || merch.includes("cafe")) {
      return {
        icon: <CoffeeIcon className="w-4 h-4" />,
        color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      };
    }
    if (cat.includes("meal") || cat.includes("dining") || cat.includes("restaurant") || cat.includes("lunch")) {
      return {
        icon: <UtensilsIcon className="w-4 h-4" />,
        color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
      };
    }
    if (cat.includes("soft") || cat.includes("host") || cat.includes("cloud") || cat.includes("tech")) {
      return {
        icon: <LaptopIcon className="w-4 h-4" />,
        color: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
      };
    }
    if (cat.includes("contract") || cat.includes("consult") || cat.includes("client")) {
      return {
        icon: <BriefcaseIcon className="w-4 h-4" />,
        color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      };
    }
    if (cat.includes("grocer") || cat.includes("shop") || cat.includes("supply")) {
      return {
        icon: <ShoppingCartIcon className="w-4 h-4" />,
        color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      };
    }
    if (cat.includes("utilit") || cat.includes("electric") || cat.includes("water")) {
      return {
        icon: <ZapIcon className="w-4 h-4" />,
        color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
      };
    }
    if (cat.includes("travel") || cat.includes("flight") || cat.includes("hotel")) {
      return {
        icon: <PlaneIcon className="w-4 h-4" />,
        color: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
      };
    }
    return {
      icon: <WalletIcon className="w-4 h-4" />,
      color: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    };
  };

  const theme = getCategoryTheme();

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-border-subtle bg-surface p-3.5 sm:p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-border-strong ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        {/* Category Icon Badge */}
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${theme.color} shadow-xs transition-transform group-hover:scale-105`}
        >
          {theme.icon}
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <h4 className="truncate text-sm font-bold text-text-primary group-hover:text-brand transition-colors">
              {merchant}
            </h4>

            {/* Tax Deductible Badge */}
            {isTaxDeductible && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 text-caption font-bold text-emerald-700 dark:text-emerald-300">
                <TaxIcon className="w-2.5 h-2.5" />
                <span>Write-off</span>
              </span>
            )}

            {/* Owner Draw Badge */}
            {isOwnerDraw && (
              <span className="inline-flex items-center rounded-md bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 text-caption font-bold text-purple-700 dark:text-purple-300">
                Owner Draw
              </span>
            )}

            {/* Anti-Commingling Reimbursement Badge */}
            {reimbursementStatus === "pending" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 text-caption font-bold text-amber-700 dark:text-amber-300">
                Reimbursement Due
              </span>
            )}

            {reimbursementStatus === "reimbursed" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-caption font-bold text-slate-600 dark:text-slate-400">
                <CheckCircleIcon className="w-3 h-3 text-emerald-500" />
                Reimbursed
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
            <span className="font-medium text-text-secondary">{category}</span>
            {accountName && (
              <>
                <span>•</span>
                <span className="truncate max-w-[140px] font-mono text-caption">{accountName}</span>
              </>
            )}
            <span>•</span>
            <span className="shrink-0 font-mono text-caption">{date}</span>
            {note && (
              <>
                <span>•</span>
                <span className="italic truncate max-w-xs text-text-muted">
                  &quot;{note}&quot;
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Amount + Action Buttons */}
      <div className="mt-3 sm:mt-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 shrink-0 ml-0 sm:ml-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle/50">
        <div className="font-mono font-extrabold text-base sm:text-lg">
          <MoneyAmount
            amount={amount}
            currency={currency}
            showSign
            colored
            privacyMask={privacyMask}
            size="md"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {/* Action to settle reimbursement if pending */}
          {reimbursementStatus === "pending" && onReimburse && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReimburse();
              }}
              className="text-caption font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 cursor-pointer py-1 px-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-500/20 transition-colors"
            >
              Reimburse
            </button>
          )}

          {/* Edit / Delete actions */}
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 text-text-muted hover:text-text-primary transition-colors cursor-pointer rounded-lg hover:bg-raised"
              title="Edit Transaction"
            >
              <EditIcon className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 text-text-muted hover:text-outflow transition-colors cursor-pointer rounded-lg hover:bg-outflow-subtle"
              title="Delete Transaction"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

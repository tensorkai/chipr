"use client";

import React from "react";
import { Transaction } from "@/types/finance";
import { MoneyAmount } from "./MoneyAmount";
import {
  CoffeeIcon,
  LaptopIcon,
  BriefcaseIcon,
  ShoppingCartIcon,
  UtensilsIcon,
  ZapIcon,
  PlaneIcon,
  TaxIcon,
  WalletIcon,
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
  ArrowDownLeftIcon,
} from "./Icons";

interface RecordCardProps {
  transaction: Transaction;
  privacyMask?: boolean;
  onReimburse?: (id: string) => void;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
  onClick?: (tx: Transaction) => void;
  className?: string;
  variant?: "card" | "compact";
}

export function RecordCard({
  transaction,
  privacyMask = false,
  onReimburse,
  onEdit,
  onDelete,
  onClick,
  className = "",
  variant = "card",
}: RecordCardProps) {
  const {
    id,
    merchant,
    category,
    date,
    amount,
    isTaxDeductible = false,
    deductiblePercentage,
    scheduleCCategory,
    reimbursementStatus = "none",
    isOwnerDraw = false,
    accountName,
    currency = "PHP",
    note,
  } = transaction;

  const isInflow = amount > 0;

  // Category Icon & Tint Resolver
  const getCategoryTheme = () => {
    const cat = (category || "").toLowerCase();
    const merch = (merchant || "").toLowerCase();

    if (isInflow || cat.includes("salary") || cat.includes("retainer") || cat.includes("deposit")) {
      return {
        icon: <ArrowDownLeftIcon className="w-4 h-4" />,
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
      };
    }
    if (cat.includes("coffee") || merch.includes("coffee") || merch.includes("starbucks") || merch.includes("cafe")) {
      return {
        icon: <CoffeeIcon className="w-4 h-4" />,
        color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
      };
    }
    if (cat.includes("meal") || cat.includes("dining") || cat.includes("restaurant") || cat.includes("lunch") || cat.includes("dinner")) {
      return {
        icon: <UtensilsIcon className="w-4 h-4" />,
        color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
        badge: "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
      };
    }
    if (cat.includes("soft") || cat.includes("host") || cat.includes("cloud") || cat.includes("tech") || cat.includes("tool")) {
      return {
        icon: <LaptopIcon className="w-4 h-4" />,
        color: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
        badge: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
      };
    }
    if (cat.includes("contract") || cat.includes("consult") || cat.includes("client") || cat.includes("legal")) {
      return {
        icon: <BriefcaseIcon className="w-4 h-4" />,
        color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
        badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
      };
    }
    if (cat.includes("grocer") || cat.includes("shop") || cat.includes("supply") || cat.includes("store")) {
      return {
        icon: <ShoppingCartIcon className="w-4 h-4" />,
        color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        badge: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300",
      };
    }
    if (cat.includes("utilit") || cat.includes("electric") || cat.includes("water") || cat.includes("power")) {
      return {
        icon: <ZapIcon className="w-4 h-4" />,
        color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
        badge: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300",
      };
    }
    if (cat.includes("travel") || cat.includes("flight") || cat.includes("hotel") || cat.includes("uber") || cat.includes("lyft")) {
      return {
        icon: <PlaneIcon className="w-4 h-4" />,
        color: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
        badge: "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300",
      };
    }
    if (cat.includes("tax") || cat.includes("license")) {
      return {
        icon: <TaxIcon className="w-4 h-4" />,
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
      };
    }

    return {
      icon: <WalletIcon className="w-4 h-4" />,
      color: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
      badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    };
  };

  const theme = getCategoryTheme();

  // Compact Variant (e.g. for dense feeds or smaller sidebars)
  if (variant === "compact") {
    return (
      <div
        role={onClick || onEdit ? "button" : undefined}
        tabIndex={onClick || onEdit ? 0 : undefined}
        onKeyDown={event => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            (onClick || onEdit)?.(transaction);
          }
        }}
        onClick={() => (onClick || onEdit)?.(transaction)}
        className={`record-compact group relative flex items-center justify-between p-3 rounded-xl border border-border-subtle bg-surface hover:bg-canvas hover:border-border-strong transition-all duration-150 cursor-pointer shadow-xs ${className}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${theme.color}`}
          >
            {theme.icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text-primary truncate">
              {merchant}
            </p>
            <div className="flex items-center gap-1.5 text-caption text-text-muted font-mono">
              <span>{category}</span>
              <span>•</span>
              <span>{date}</span>
            </div>
          </div>
        </div>

        <div className="text-right shrink-0 pl-2">
          <MoneyAmount
            amount={amount}
            currency={transaction.currency}
            showSign
            colored
            privacyMask={privacyMask}
            size="sm"
          />
        </div>
      </div>
    );
  }

  // Full Rich Component Card (Default)
  return (
    <div
      onClick={() => onClick?.(transaction)}
      className={`group relative flex flex-col justify-between rounded-2xl border border-border-subtle bg-surface p-4 sm:p-4.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-border-strong cursor-pointer ${className}`}
    >
      {/* Top Section: Category Icon + Merchant Details + Amount */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Dynamic Category Icon Avatar */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${theme.color} shadow-xs transition-transform group-hover:scale-105`}
          >
            {theme.icon}
          </div>

          <div className="min-w-0 space-y-0.5">
            <h4 className="text-sm font-bold text-text-primary tracking-tight truncate group-hover:text-brand transition-colors">
              {merchant}
            </h4>

            <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
              <span className="font-medium text-text-secondary">{category}</span>
              <span>•</span>
              <span className="font-mono text-caption text-text-muted">{date}</span>
              {accountName && (
                <>
                  <span>•</span>
                  <span className="text-caption font-mono text-text-muted truncate max-w-[120px] sm:max-w-[160px]">
                    {accountName}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Big Monetary Value */}
        <div className="text-right shrink-0">
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
          <span className="text-caption uppercase font-mono tracking-wider text-text-muted block">
            {isInflow ? "Inflow" : "Outflow"}
          </span>
        </div>
      </div>

      {/* Note / Memo Quote Callout (if present) */}
      {note && (
        <div className="mt-3 p-2.5 rounded-xl bg-canvas/70 border border-border-subtle/80 text-xs text-text-secondary italic flex items-center gap-2">
          <span className="text-text-muted text-sm font-serif">“</span>
          <span className="truncate">{note}</span>
          <span className="text-text-muted text-sm font-serif">”</span>
        </div>
      )}

      {/* Bottom Metadata & Badges Row + Quick Action Buttons */}
      <div className="mt-3.5 pt-3 border-t border-border-subtle/70 flex flex-wrap items-center justify-between gap-2">
        {/* Badges Cluster */}
        <div className="flex flex-wrap items-center gap-1.5">

          {/* Tax Deductible Tag */}
          {isTaxDeductible && (
            <span
              className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 text-caption font-bold text-emerald-700 dark:text-emerald-300"
              title={scheduleCCategory || "Tax Deductible Write-Off"}
            >
              <TaxIcon className="w-2.5 h-2.5" />
              <span>Tax Deductible {deductiblePercentage ? `(${deductiblePercentage}%)` : ""}</span>
            </span>
          )}

          {/* Owner Draw Badge */}
          {isOwnerDraw && (
            <span className="inline-flex items-center rounded-md bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 text-caption font-bold text-purple-700 dark:text-purple-300">
              Owner Draw
            </span>
          )}

          {/* Anti-Commingling / Reimbursement Status */}
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

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Reimburse Button if pending */}
          {reimbursementStatus === "pending" && onReimburse && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReimburse(id);
              }}
              className="inline-flex items-center gap-1 text-caption font-bold text-amber-700 dark:text-amber-300 py-1 px-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
            >
              <span>Reimburse</span>
            </button>
          )}

          {/* Edit Action */}
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(transaction);
              }}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-raised transition-colors cursor-pointer"
              title="Edit transaction record"
            >
              <EditIcon className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Delete Action */}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete transaction "${merchant}"?`)) {
                  onDelete(id);
                }
              }}
              className="p-1.5 rounded-lg text-text-muted hover:text-outflow hover:bg-outflow-subtle transition-colors cursor-pointer"
              title="Delete transaction record"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { FinancialAccount } from "@/types/finance";
import { useFinance } from "@/context/FinanceContext";
import { MoneyAmount } from "./MoneyAmount";
import {
  BankIcon,
  CreditCardIcon,
  PiggyBankIcon,
  TrendingUpIcon,
  BuildingOfficeIcon,
  EditIcon,
  CopyIcon,
  CheckIcon,
  ArrowUpRightIcon,
  CreditPlusIcon,
} from "./Icons";

interface BalanceCardProps {
  account: FinancialAccount;
  privacyMask?: boolean;
  onEdit?: (account: FinancialAccount) => void;
  onClick?: (account: FinancialAccount) => void;
  className?: string;
  variant?: "default" | "compact";
}

export function BalanceCard({
  account,
  privacyMask = false,
  onEdit,
  onClick,
  className = "",
  variant = "default",
}: BalanceCardProps) {
  const { openAddCreditModal } = useFinance();
  const [copied, setCopied] = useState(false);

  const handleCopyMasked = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${account.institution} ${account.accountNumberMasked}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getAccountTheme = () => {
    switch (account.type) {
      case "checking":
        return {
          icon: <BankIcon className="w-4 h-4" />,
          label: "Checking",
          accentBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
          cardGradient: "from-sky-500/[0.04] via-transparent to-transparent",
          chip: "Liquid Asset",
          chipColor: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
        };
      case "savings":
        return {
          icon: <PiggyBankIcon className="w-4 h-4" />,
          label: "Savings / HYSA",
          accentBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          cardGradient: "from-emerald-500/[0.04] via-transparent to-transparent",
          chip: "APY 4.75% High Yield",
          chipColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
        };
      case "investment":
        return {
          icon: <TrendingUpIcon className="w-4 h-4" />,
          label: "Investment Portfolio",
          accentBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
          cardGradient: "from-indigo-500/[0.04] via-transparent to-transparent",
          chip: "Wealth Growth",
          chipColor: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
        };
      case "credit":
        return {
          icon: <CreditCardIcon className="w-4 h-4" />,
          label: "Credit Card",
          accentBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          cardGradient: "from-amber-500/[0.04] via-transparent to-transparent",
          chip: "Revolving Credit",
          chipColor: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
        };
      case "loan":
        return {
          icon: <BuildingOfficeIcon className="w-4 h-4" />,
          label: "Loan / Mortgage",
          accentBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
          cardGradient: "from-rose-500/[0.04] via-transparent to-transparent",
          chip: "Fixed Term Debt",
          chipColor: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
        };
    }
  };

  const theme = getAccountTheme();
  const isDebt = account.type === "credit" || account.type === "loan";

  if (variant === "compact") {
    return (
      <div
        onClick={() => onClick?.(account)}
        className={`group relative flex items-center justify-between p-3 rounded-2xl border border-border-subtle bg-surface hover:bg-canvas hover:border-border-strong transition-all duration-200 cursor-pointer shadow-xs ${className}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${theme.accentBg}`}
          >
            {theme.icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-text-primary truncate">
              {account.name}
            </p>
            <p className="text-caption text-text-muted font-mono truncate">
              {account.institution} • {account.accountNumberMasked}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-right shrink-0 pl-2">
          <div>
            <MoneyAmount
              amount={account.balance}
              size="sm"
              colored={isDebt}
              privacyMask={privacyMask}
            />
            <span className="text-caption uppercase tracking-wider text-text-muted block font-mono">
              {isDebt ? "Balance Due" : "Available"}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openAddCreditModal(account);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
            title={`Add credit to ${account.name}`}
          >
            <CreditPlusIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick?.(account)}
      className={`group relative overflow-hidden rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-border-strong flex flex-col justify-between cursor-pointer ${className}`}
    >
      {/* Background Soft Atmospheric Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${theme.cardGradient} pointer-events-none opacity-80`}
      />

      {/* Top Header: Account Type Icon + Badges + Quick Edit */}
      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${theme.accentBg} shadow-xs transition-transform group-hover:scale-105`}
          >
            {theme.icon}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-caption font-bold uppercase tracking-wider text-text-muted font-mono">
                {theme.label}
              </span>
            </div>
            <h4 className="text-sm font-bold text-text-primary tracking-tight truncate max-w-[180px] sm:max-w-[200px] mt-0.5">
              {account.name}
            </h4>
          </div>
        </div>

        {/* Quick Actions: Credit & Edit */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openAddCreditModal(account);
            }}
            className="flex items-center gap-1 py-1 px-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer text-caption font-bold border border-emerald-500/20 shadow-2xs"
            title={`Add credit to ${account.name}`}
          >
            <CreditPlusIcon className="w-3 h-3" />
            <span>Credit</span>
          </button>

          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(account);
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-raised transition-all cursor-pointer"
              title="Edit account details"
            >
              <EditIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Center: Prominent Balance Display */}
      <div className="relative z-10 my-4 space-y-1">
        <div className="flex items-baseline justify-between">
          <span className="text-caption uppercase font-mono tracking-wider text-text-muted">
            {isDebt ? "Outstanding Balance" : "Current Balance"}
          </span>
          <span
            className={`text-caption font-semibold px-2 py-0.5 rounded-full ${theme.chipColor}`}
          >
            {theme.chip}
          </span>
        </div>

        <div className="font-mono text-xl sm:text-2xl font-extrabold tracking-tight text-text-primary">
          <MoneyAmount
            amount={account.balance}
            size="lg"
            colored={isDebt}
            privacyMask={privacyMask}
          />
        </div>
      </div>

      {/* Bottom Footer: Institution + Masked Number + Copy Action */}
      <div className="relative z-10 pt-3 border-t border-border-subtle/80 flex items-center justify-between text-xs text-text-muted">
        <div className="flex items-center gap-1.5 truncate">
          <span className="font-medium text-text-secondary truncate">
            {account.institution}
          </span>
          <span>•</span>
          <span className="font-mono text-caption text-text-muted">
            {account.accountNumberMasked}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopyMasked}
          className="flex items-center gap-1 text-caption font-mono text-text-muted hover:text-text-primary py-0.5 px-1.5 rounded-md hover:bg-raised transition-colors cursor-pointer shrink-0"
          title="Copy account reference"
        >
          {copied ? (
            <>
              <CheckIcon className="w-3 h-3 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied</span>
            </>
          ) : (
            <>
              <CopyIcon className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

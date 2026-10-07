"use client";

import React, { useState, useEffect } from "react";
import { useFinance } from "@/context/FinanceContext";
import { FinancialAccount, WorkspaceEntity, AccountType } from "@/types/finance";
import {
  XMarkIcon,
  CreditPlusIcon,
  CreditCardIcon,
  BankIcon,
  CheckIcon,
  PlusIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  UserIcon,
} from "@/components/ui/Icons";
import { MoneyAmount } from "@/components/ui/MoneyAmount";

const PRESET_AMOUNTS = [50, 100, 250, 500, 1000, 2500, 5000];

const PERSONAL_CREDIT_CATEGORIES = [
  "Account Deposit / Top-Up",
  "Salary & Wages",
  "Freelance & Side Hustle",
  "Gifts & Bonuses",
  "Investment Dividends",
  "Refund & Reimbursement",
  "Other Inflow",
];

const BUSINESS_CREDIT_CATEGORIES = [
  "Client Payment / Retainer",
  "Sales & Operating Revenue",
  "Owner Capital Contribution",
  "Business Loan / Financing",
  "Vendor Refund",
  "Other Business Revenue",
];

export function AddCreditModal() {
  const {
    isAddCreditModalOpen,
    closeAddCreditModal,
    addCreditTargetAccount,
    accounts,
    workspace,
    settings,
    privacyMask,
    addCredit,
    addAccount,
  } = useFinance();

  const [activeMode, setActiveMode] = useState<"funds" | "account">("funds");
  const [entity, setEntity] = useState<WorkspaceEntity>(workspace);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [amount, setAmount] = useState<string>("500");
  const [category, setCategory] = useState<string>("Account Deposit / Top-Up");
  const [merchant, setMerchant] = useState<string>("Manual Credit Top-Up");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New Credit Account Form State
  const [newCardName, setNewCardName] = useState<string>("");
  const [newCardInstitution, setNewCardInstitution] = useState<string>("");
  const [newCardBalance, setNewCardBalance] = useState<string>("0");
  const [newCardMask, setNewCardMask] = useState<string>("•••• ");
  const [newCardType, setNewCardType] = useState<AccountType>("credit");

  // Filter accounts for current entity
  const availableAccounts = accounts.filter((a) => a.entity === entity);

  // Synchronize initial state when modal opens
  useEffect(() => {
    if (isAddCreditModalOpen) {
      const initialEntity = addCreditTargetAccount ? addCreditTargetAccount.entity : workspace;
      setEntity(initialEntity);

      if (addCreditTargetAccount) {
        setSelectedAccountId(addCreditTargetAccount.id);
      } else {
        const defaultAcc = accounts.find(
          (a) => a.entity === initialEntity && (a.type === "checking" || a.type === "savings")
        ) || accounts.find((a) => a.entity === initialEntity);
        setSelectedAccountId(defaultAcc ? defaultAcc.id : "");
      }

      setAmount("500");
      setCategory(
        initialEntity === "business"
          ? "Client Payment / Retainer"
          : "Account Deposit / Top-Up"
      );
      setMerchant("Manual Credit Top-Up");
      setDate(new Date().toISOString().split("T")[0]);
      setNote("");
      setSuccessMessage(null);
      setActiveMode("funds");
    }
  }, [isAddCreditModalOpen, addCreditTargetAccount, workspace, accounts]);

  // Update default category when entity toggles
  const handleEntityChange = (newEntity: WorkspaceEntity) => {
    setEntity(newEntity);
    const firstAcc = accounts.find((a) => a.entity === newEntity);
    setSelectedAccountId(firstAcc ? firstAcc.id : "");
    setCategory(
      newEntity === "business"
        ? "Client Payment / Retainer"
        : "Account Deposit / Top-Up"
    );
  };

  if (!isAddCreditModalOpen) return null;

  const handlePresetClick = (preset: number) => {
    setAmount(preset.toString());
  };

  const handleAddPresetIncrement = (increment: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + increment).toFixed(2).replace(/\.00$/, ""));
  };

  const handleFundsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setIsSubmitting(true);

    try {
      const result = addCredit({
        accountId: selectedAccountId || undefined,
        amount: parsedAmount,
        category,
        merchant: merchant.trim() || "Manual Credit Top-Up",
        entity,
        date,
        note: note.trim() || undefined,
      });

      setSuccessMessage(
        `Successfully added ₱${parsedAmount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} credit to ${result.accountName}!`
      );

      setTimeout(() => {
        setIsSubmitting(false);
        closeAddCreditModal();
      }, 1200);
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardName.trim()) return;

    setIsSubmitting(true);
    const parsedBalance = parseFloat(newCardBalance) || 0;

    addAccount({
      name: newCardName.trim(),
      type: newCardType,
      entity,
      balance: parsedBalance,
      institution: newCardInstitution.trim() || "Financial Institution",
      accountNumberMasked: newCardMask.trim() || "•••• 4821",
      currency: settings.currency || "PHP",
    });

    setSuccessMessage(`Added new ${newCardType === "credit" ? "credit card" : "credit account"} "${newCardName}"!`);

    setTimeout(() => {
      setIsSubmitting(false);
      closeAddCreditModal();
    }, 1200);
  };

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={closeAddCreditModal}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-border-subtle bg-surface p-5 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile sheet pull indicator */}
        <div className="sm:hidden w-10 h-1 bg-border-strong rounded-full mx-auto mb-1 opacity-70" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CreditPlusIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-text-primary">
                  Add Credit
                </h3>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-caption font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Tracker Mode
                </span>
              </div>
              <p className="text-xs text-text-muted">
                Manual balance top-up & fund crediting for financial tracking
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAddCreditModal}
            className="rounded-lg p-1.5 text-text-muted hover:bg-raised hover:text-text-primary transition-colors cursor-pointer"
            title="Close"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex rounded-xl border border-border-subtle bg-canvas p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveMode("funds")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeMode === "funds"
                ? "bg-surface text-emerald-600 dark:text-emerald-400 shadow-xs font-bold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <CreditPlusIcon className="w-3.5 h-3.5" />
            <span>Credit Account Funds</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode("account")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeMode === "account"
                ? "bg-surface text-brand shadow-xs font-bold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <CreditCardIcon className="w-3.5 h-3.5" />
            <span>Add Credit Card / Line</span>
          </button>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 animate-in zoom-in-95 duration-150">
            <CheckIcon className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* ================= MODE 1: CREDIT ACCOUNT FUNDS ================= */}
        {activeMode === "funds" && (
          <form onSubmit={handleFundsSubmit} className="space-y-4 text-xs sm:text-sm">
            {/* Entity Workspace Selector */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Workspace Scope
              </label>
              <div className="flex rounded-xl border border-border-subtle bg-canvas p-1">
                <button
                  type="button"
                  onClick={() => handleEntityChange("personal")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    entity === "personal"
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-xs font-bold"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Personal</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleEntityChange("business")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    entity === "business"
                      ? "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 shadow-xs font-bold"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  <BuildingOfficeIcon className="w-3.5 h-3.5" />
                  <span>{settings.businessName || "Business"}</span>
                </button>
              </div>
            </div>

            {/* Target Account to Credit */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-text-secondary">
                  Target Account
                </label>
                {selectedAccount && (
                  <span className="text-caption font-mono text-text-muted">
                    Current:{" "}
                    <MoneyAmount
                      amount={selectedAccount.balance}
                      size="sm"
                      privacyMask={privacyMask}
                      className="font-bold inline"
                    />
                  </span>
                )}
              </div>

              {availableAccounts.length > 0 ? (
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs sm:text-sm text-text-primary focus:border-brand focus:outline-none"
                >
                  {availableAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.institution} • {acc.accountNumberMasked}) — {acc.type.toUpperCase()}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="rounded-xl border border-dashed border-border-strong p-3 bg-canvas/60 text-center space-y-1">
                  <p className="text-xs text-text-muted">
                    No {entity} accounts currently exist.
                  </p>
                  <p className="text-caption text-brand font-semibold">
                    A new &ldquo;{entity === "business" ? "Operating Checking" : "Primary Checking"}&rdquo; will be auto-created with this credit!
                  </p>
                </div>
              )}
            </div>

            {/* Credit Amount Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-secondary">
                Credit Amount ({settings.currency || "PHP"})
              </label>

              <div className="relative flex items-center">
                <span className="absolute left-3.5 font-mono text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 select-none">
                  +₱
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-2xl border border-border-subtle bg-canvas pl-11 pr-4 py-3 font-mono text-xl sm:text-2xl font-black text-text-primary focus:border-emerald-500 focus:outline-none tabular-nums shadow-inner"
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-caption font-mono uppercase text-text-muted mr-1">
                  Presets:
                </span>
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className={`rounded-lg px-2.5 py-1 text-caption font-mono font-bold transition-all cursor-pointer ${
                      parseFloat(amount) === preset
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-canvas border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-raised"
                    }`}
                  >
                    +{preset >= 1000 ? `${preset / 1000}k` : preset}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddPresetIncrement(100)}
                  className="rounded-lg px-2 py-1 text-caption font-mono text-text-muted hover:text-text-primary hover:bg-raised transition-colors cursor-pointer border border-dashed border-border-subtle"
                  title="Add ₱100 to current amount"
                >
                  +100
                </button>
              </div>
            </div>

            {/* Credit Source & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Credit Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary focus:border-brand focus:outline-none"
                >
                  {(entity === "business"
                    ? BUSINESS_CREDIT_CATEGORIES
                    : PERSONAL_CREDIT_CATEGORIES
                  ).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Reference / Merchant
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Account Top-Up, Payroll, Client Wire"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            {/* Date & Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Credit Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary focus:border-brand focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Optional Memo
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly budget funding"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-border-subtle">
              <button
                type="button"
                onClick={closeAddCreditModal}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-raised transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-500 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditPlusIcon className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? "Crediting Account..."
                    : `Credit +₱${parseFloat(amount || "0").toLocaleString(
                        undefined,
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                      )}`}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* ================= MODE 2: ADD CREDIT CARD / LINE ================= */}
        {activeMode === "account" && (
          <form onSubmit={handleAccountSubmit} className="space-y-4 text-xs sm:text-sm">
            {/* Entity Selector */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Account Ownership
              </label>
              <div className="flex rounded-xl border border-border-subtle bg-canvas p-1">
                <button
                  type="button"
                  onClick={() => setEntity("personal")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    entity === "personal"
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-xs font-bold"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  Personal
                </button>
                <button
                  type="button"
                  onClick={() => setEntity("business")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    entity === "business"
                      ? "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 shadow-xs font-bold"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {settings.businessName || "Business"}
                </button>
              </div>
            </div>

            {/* Credit Account Nickname */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Card / Credit Line Nickname
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Travel Rewards Visa, Business Corporate Card"
                value={newCardName}
                onChange={(e) => setNewCardName(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
              />
            </div>

            {/* Type & Institution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Credit Type
                </label>
                <select
                  value={newCardType}
                  onChange={(e) => setNewCardType(e.target.value as AccountType)}
                  className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary focus:border-brand focus:outline-none"
                >
                  <option value="credit">Credit Card (Revolving)</option>
                  <option value="loan">Line of Credit / Loan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Issuer / Financial Institution
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chase, American Express, Brex"
                  value={newCardInstitution}
                  onChange={(e) => setNewCardInstitution(e.target.value)}
                  className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            {/* Current Balance & Masked Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Current Balance Due ({settings.currency || "PHP"})
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newCardBalance}
                  onChange={(e) => setNewCardBalance(e.target.value)}
                  className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 font-mono text-xs text-text-primary focus:border-brand focus:outline-none tabular-nums"
                />
                <span className="text-caption text-text-muted mt-0.5 block">
                  Enter 0.00 if freshly issued with no charges.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Masked Digits
                </label>
                <input
                  type="text"
                  placeholder="•••• 4821"
                  value={newCardMask}
                  onChange={(e) => setNewCardMask(e.target.value)}
                  className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 font-mono text-xs text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-border-subtle">
              <button
                type="button"
                onClick={closeAddCreditModal}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-raised transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !newCardName.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-brand-hover active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusIcon className="w-4 h-4" />
                <span>{isSubmitting ? "Creating..." : "Add Credit Account"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useFinance } from "@/context/FinanceContext";
import { AccountType, FinancialAccount } from "@/types/finance";
import { XMarkIcon, TrashIcon } from "@/components/ui/Icons";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAccount?: FinancialAccount | null;
}

export function AccountModal({
  isOpen,
  onClose,
  editingAccount,
}: AccountModalProps) {
  const { addAccount, updateAccount, deleteAccount, settings, workspace } = useFinance();

  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("checking");
  const [balance, setBalance] = useState("");
  const [institution, setInstitution] = useState("");
  const [accountNumberMasked, setAccountNumberMasked] = useState("•••• ");

  useEffect(() => {
    if (editingAccount) {
      setName(editingAccount.name);
      setType(editingAccount.type);
      setBalance(editingAccount.balance.toString());
      setInstitution(editingAccount.institution);
      setAccountNumberMasked(editingAccount.accountNumberMasked);
    } else {
      setName("");
      setType("checking");
      setBalance("0.00");
      setInstitution("");
      setAccountNumberMasked("•••• ");
    }
  }, [editingAccount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBalance = parseFloat(balance);
    if (isNaN(parsedBalance) || !name.trim()) return;

    if (editingAccount) {
      updateAccount(editingAccount.id, {
        name: name.trim(),
        type,
        entity: editingAccount.entity || "business",
        balance: parsedBalance,
        institution: institution.trim() || "Financial Institution",
        accountNumberMasked: accountNumberMasked.trim() || "••••",
      });
    } else {
      addAccount({
        name: name.trim(),
        type,
        entity: workspace,
        balance: parsedBalance,
        institution: institution.trim() || "Financial Institution",
        accountNumberMasked: accountNumberMasked.trim() || "••••",
        currency: settings.currency || "PHP",
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (editingAccount && confirm(`Are you sure you want to delete account "${editingAccount.name}"?`)) {
      deleteAccount(editingAccount.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md rounded-t-3xl sm:rounded-2xl border border-border-subtle bg-surface p-5 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile sheet pull indicator */}
        <div className="sm:hidden w-10 h-1 bg-border-strong rounded-full mx-auto mb-1 opacity-70" />
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              {editingAccount ? "Edit Financial Account" : "Add Financial Account"}
            </h3>
            <p className="text-xs text-text-muted">
              {editingAccount?.entity || workspace} account ? Checking, savings, credit or loans
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-raised hover:text-text-primary cursor-pointer"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Account Name */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Account Nickname
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Main Operating Checking, Treasury Reserve"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
            />
          </div>

          {/* Account Type & Institution */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Account Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary focus:border-brand focus:outline-none"
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings / HYSA</option>
                <option value="credit">Credit Card</option>
                <option value="investment">Investment / Treasury</option>
                <option value="loan">Loan / Line of Credit</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Institution Name
              </label>
              <input
                type="text"
                placeholder="e.g. BDO, BPI, Mercury, Chase"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          {/* Balance & Masked Number */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Current Balance
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs font-mono text-text-primary focus:border-brand focus:outline-none"
              />
              <span className="text-caption text-text-muted">
                {type === "credit" || type === "loan" ? "Negative for liability/debt" : "Positive for liquid/assets"}
              </span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Masked Digits
              </label>
              <input
                type="text"
                placeholder="•••• 1234"
                value={accountNumberMasked}
                onChange={(e) => setAccountNumberMasked(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs font-mono text-text-primary focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
            {editingAccount ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-outflow hover:bg-outflow-subtle rounded-xl transition-colors cursor-pointer"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary rounded-xl hover:bg-raised transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-hover active:scale-[0.98] rounded-xl shadow-sm transition-all cursor-pointer"
              >
                {editingAccount ? "Save Changes" : "Create Account"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

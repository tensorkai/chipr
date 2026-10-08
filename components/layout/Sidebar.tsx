"use client";

import React, { useState, useEffect } from "react";
import { useFinance, NavigationTab } from "@/context/FinanceContext";
import { FinancialAccount } from "@/types/finance";
import { ChiprBirdMascot } from "@/components/ui/ChiprBirdMascot";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { NewTransactionModal } from "@/components/modals/NewTransactionModal";
import { AccountModal } from "@/components/modals/AccountModal";
import {
  DashboardIcon,
  TransactionIcon,
  BudgetIcon,
  InvoiceIcon,
  PnLIcon,
  PlusIcon,
  WalletIcon,
  BankIcon,
  CreditCardIcon,
  TrendingUpIcon,
  TagIcon,
  EyeIcon,
  EyeSlashIcon,
  SunIcon,
  MoonIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  SparklesIcon,
  CreditPlusIcon,
  LockClosedIcon,
} from "@/components/ui/Icons";

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: "amber" | "red";
}

function getAccountIcon(type: FinancialAccount["type"]) {
  switch (type) {
    case "checking":
      return BankIcon;
    case "savings":
      return WalletIcon;
    case "credit":
      return CreditCardIcon;
    case "investment":
      return TrendingUpIcon;
    case "loan":
      return TagIcon;
    default:
      return WalletIcon;
  }
}

interface SidebarContentProps {
  onActionClose?: () => void;
  onOpenTxModal: () => void;
  onOpenAccountModal: () => void;
}

function SidebarBody({
  onActionClose,
  onOpenTxModal,
  onOpenAccountModal,
}: SidebarContentProps) {
  const {
    activeTab,
    setActiveTab,
    workspace,
    accounts,
    transactions,
    invoices,
    privacyMask,
    togglePrivacyMask,
    darkMode,
    toggleDarkMode,
    settings,
    openAddCreditModal,
    logout,
  } = useFinance();

  const pendingReimbursementsCount = transactions.filter(
    (t) => t.reimbursementStatus === "pending"
  ).length;

  const overdueInvoicesCount = invoices.filter(
    (i) => i.status === "overdue"
  ).length;

  const userInitials = settings.personalName
    ? settings.personalName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "U"
    : "U";

  const navItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Overview",
      icon: DashboardIcon,
    },
    {
      id: "transactions",
      label: "Ledger",
      icon: TransactionIcon,
      badge:
        pendingReimbursementsCount > 0
          ? `${pendingReimbursementsCount}`
          : undefined,
      badgeColor: "amber",
    },
    {
      id: "invoices",
      label: "Invoices",
      icon: InvoiceIcon,
      badge:
        overdueInvoicesCount > 0 ? `${overdueInvoicesCount}` : undefined,
      badgeColor: "red",
    },
    {
      id: "budgets",
      label: "Budgets",
      icon: BudgetIcon,
    },
    {
      id: "reports",
      label: "Reports & Tax",
      icon: PnLIcon,
    },
    {
      id: "chat",
      label: "Chipr AI",
      icon: SparklesIcon,
    },
    {
      id: "profile",
      label: "Profile & Settings",
      icon: UserIcon,
    },
  ];

  // Show all financial accounts
  const displayedAccounts = accounts.filter(account => account.entity === workspace && account.currency === settings.currency);

  const handleNavClick = (tab: NavigationTab) => {
    if (tab === "profile" && activeTab === "profile") {
      setActiveTab("dashboard");
    } else {
      setActiveTab(tab);
    }
    if (onActionClose) onActionClose();
  };

  const handleRecordClick = () => {
    onOpenTxModal();
    if (onActionClose) onActionClose();
  };

  const handleAddAccountClick = () => {
    onOpenAccountModal();
    if (onActionClose) onActionClose();
  };

  return (
    <div className="sidebar-body flex flex-col h-full justify-between">
      {/* Scrollable upper section */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-0.5">
        {/* Quick Action Button */}
        <button
          type="button"
          onClick={handleRecordClick}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand py-2.5 px-3 text-xs font-bold text-white shadow-xs hover:bg-brand-hover active:scale-[0.98] transition-all cursor-pointer"
        >
          <PlusIcon className="w-4 h-4" />
          <span>New transaction</span>
        </button>

        {/* Navigation Tabs */}
        <div className="space-y-1">
          <div className="px-2 pb-1 text-caption font-bold uppercase tracking-widest text-text-muted opacity-70">
            Menu
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const IconComponent = item.icon;

            return (
              <button
                key={item.id}
                aria-current={isActive ? "page" : undefined}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-brand text-white shadow-md ring-1 ring-brand-hover scale-[1.01]"
                    : "text-text-secondary hover:bg-raised hover:text-text-primary active:scale-[0.98]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <IconComponent className={`w-4 h-4 transition-transform duration-200 ${
                    isActive ? "text-white" : "text-text-muted group-hover:text-text-primary"
                  }`} />
                  <span className={isActive ? "text-white" : "text-text-secondary"}>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-caption font-mono font-bold transition-colors duration-200 ${
                      isActive
                        ? "bg-white/20 text-white"
                        : item.badgeColor === "red"
                        ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
                        : "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Linked Accounts Section */}
        <div className="space-y-2 pt-1 border-t border-border-subtle">
          <div className="flex items-center justify-between px-2">
            <span className="text-caption font-bold uppercase tracking-widest text-text-muted opacity-70">
              Accounts ({displayedAccounts.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  openAddCreditModal();
                  onActionClose?.();
                }}
                className="flex items-center gap-1 text-caption font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors cursor-pointer"
                title="Add credit or top up funds"
              >
                <CreditPlusIcon className="w-3 h-3" />
                <span>Credit</span>
              </button>
              <button
                type="button"
                onClick={handleAddAccountClick}
                className="flex items-center gap-1 text-caption font-semibold text-brand hover:text-brand-hover transition-colors cursor-pointer"
                title="Add financial account"
              >
                <PlusIcon className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {displayedAccounts.length === 0 ? (
            <button
              type="button"
              onClick={handleAddAccountClick}
              className="w-full rounded-xl border border-dashed border-border-subtle p-3 text-center text-xs text-text-muted hover:border-brand hover:text-brand transition-all duration-200 cursor-pointer bg-raised/50"
            >
              + Link account
            </button>
          ) : (
            <div className="space-y-1">
              {displayedAccounts.slice(0, 4).map((acc) => {
                const AccIcon = getAccountIcon(acc.type);
                return (
                  <div
                    key={acc.id}
                    onClick={() => {
                      openAddCreditModal(acc);
                      onActionClose?.();
                    }}
                    title={`Click to Add Credit to ${acc.name}`}
                    className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs text-text-secondary hover:bg-raised transition-all duration-200 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-1">
                      <div className="p-1.5 rounded-lg bg-surface border border-border-subtle text-text-muted shrink-0 group-hover:text-brand transition-colors">
                        <AccIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-caption font-semibold text-text-primary truncate group-hover:text-brand transition-colors">
                          {acc.name}
                        </p>
                        <p className="text-caption font-mono text-text-muted truncate opacity-70">
                          {acc.institution} {acc.accountNumberMasked}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <MoneyAmount
                        amount={acc.balance}
                        currency={acc.currency}
                        size="xs"
                        privacyMask={privacyMask}
                      />
                    </div>
                  </div>
                );
              })}

              {displayedAccounts.length > 4 && (
                <button
                  type="button"
                  onClick={() => handleNavClick("dashboard")}
                  className="w-full text-center text-caption font-medium text-text-muted hover:text-brand transition-colors pt-1 cursor-pointer"
                >
                  +{displayedAccounts.length - 4} more accounts
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <button type="button" className="chipr-sidebar-perch" onClick={() => handleNavClick("chat")}>
        <span aria-hidden="true"><ChiprBirdMascot size="sm" mood="wave" animated={false} withSparkles={false} /></span>
        <span><strong>A little help?</strong><span>Ask Chipr <span aria-hidden="true">↗</span></span></span>
      </button>

      {/* Bottom Section: Solvency Runway & User Profile */}
      <div className="pt-3 border-t border-border-subtle space-y-2.5 shrink-0">
        <div className="sidebar-workspace-label"><span className="radar-dot" />{workspace === "personal" ? "Personal workspace" : "Business workspace"}</div>

        {/* User Account / Profile Card */}
        <button
          type="button"
          onClick={() => handleNavClick("profile")}
          className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer text-left ${
            activeTab === "profile"
              ? "border-brand bg-brand/10 text-brand ring-1 ring-brand/40"
              : "border-border-subtle bg-canvas/60 hover:bg-raised text-text-primary"
          }`}
          title="Manage account profile & business settings"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-tr from-brand to-indigo-500 text-white font-bold text-xs shrink-0 shadow-xs">
              {userInitials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate text-text-primary">
                {workspace === "business" ? settings.businessName || "Business workspace" : settings.personalName || "Personal workspace"}
              </p>
              <p className="text-caption text-text-muted truncate">
                {workspace === "business" ? "Business accounts & records" : "Personal accounts & records"}
              </p>
            </div>
          </div>
          <ChevronRightIcon className="w-3.5 h-3.5 text-text-muted shrink-0" />
        </button>

        {/* Bottom Utility Controls */}
        <div className="flex items-center justify-between pt-1 border-t border-border-subtle">
          {/* Privacy Mask Toggle */}
          <button
            type="button"
            onClick={togglePrivacyMask}
            className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-caption font-semibold transition-colors cursor-pointer ${
              privacyMask
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                : "text-text-muted hover:bg-raised hover:text-text-primary"
            }`}
            title={privacyMask ? "Reveal balances" : "Hide balances (₱••••••)"}
          >
            {privacyMask ? (
              <>
                <EyeSlashIcon className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-mono text-caption">₱••••••</span>
              </>
            ) : (
              <>
                <EyeIcon className="w-3.5 h-3.5" />
                <span className="text-caption">Mask</span>
              </>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-caption font-semibold text-text-muted hover:bg-raised hover:text-text-primary transition-colors cursor-pointer"
            title="Toggle theme appearance"
          >
            {darkMode ? (
              <>
                <SunIcon className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-caption">Light</span>
              </>
            ) : (
              <>
                <MoonIcon className="w-3.5 h-3.5" />
                <span className="text-caption">Dark</span>
              </>
            )}
          </button>

          {/* Lock Workspace & Sign Out */}
          <button
            type="button"
            onClick={() => {
              if (confirm("Lock workspace and sign out of Chipr?")) {
                logout();
              }
            }}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-caption font-semibold text-text-muted hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
            title="Lock workspace and sign out"
          >
            <LockClosedIcon className="w-3.5 h-3.5" />
            <span className="text-caption">Lock</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const {
    isMobileSidebarOpen,
    setMobileSidebarOpen,
    isDesktopSidebarOpen,
    toggleDesktopSidebar,
    toggleSidebar,
    isDeviceFramed,
    setActiveTab,
  } = useFinance();

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Universal keyboard shortcut: ⌘B / Ctrl+B to slide toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === "b" &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          (e.target as HTMLElement)?.isContentEditable
        )
      ) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  return (
    <>
      {/* Desktop Left Rail Sidebar with Smooth Slide In & Out Animation */}
      <aside
        className={`workspace-sidebar ${
          isDeviceFramed ? "hidden" : "hidden md:flex"
        } flex-col justify-between shrink-0 border-r border-border-subtle bg-surface/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
          isDesktopSidebarOpen
            ? "w-64 p-4 opacity-100 translate-x-0"
            : "w-0 p-0 opacity-0 -translate-x-full border-r-0 pointer-events-none"
        }`}
        aria-hidden={!isDesktopSidebarOpen}
        inert={!isDesktopSidebarOpen}
      >
        <div className="w-56 h-full flex flex-col justify-between shrink-0">
          {/* Subtle desktop collapse header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle/70">
            <span className="text-caption font-bold uppercase tracking-wider text-text-muted">
              Your workspace
            </span>
            <button
              type="button"
              onClick={toggleDesktopSidebar}
              className="flex h-6 w-6 items-center justify-center rounded-lg text-text-muted hover:bg-raised hover:text-text-primary transition-colors cursor-pointer"
              title="Collapse sidebar (⌘B)"
              aria-label="Collapse sidebar"
            >
              <ChevronLeftIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            <SidebarBody
              onOpenTxModal={() => setIsTxModalOpen(true)}
              onOpenAccountModal={() => setIsAccountModalOpen(true)}
            />
          </div>
        </div>
      </aside>

      {/* Mobile Slide-out Drawer with Smooth Slide In & Slide Out Animation */}
      <div
        className={`fixed inset-0 z-50 flex ${
          isDeviceFramed ? "" : "md:hidden"
        } transition-[visibility,opacity] duration-300 ${
          isMobileSidebarOpen
            ? "visible pointer-events-auto opacity-100"
            : "invisible pointer-events-none opacity-0 delay-200"
        }`}
        aria-hidden={!isMobileSidebarOpen}
        inert={!isMobileSidebarOpen}
      >
        {/* Backdrop Overlay with Smooth Fade Transition */}
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
            isMobileSidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />

        {/* Drawer Container with Hardware-Accelerated Sliding Animation */}
        <div
          className={`relative flex flex-col w-72.5 max-w-[85vw] h-full bg-surface border-r border-border-subtle p-4 shadow-2xl z-10 transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Drawer Header with Close Button */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-border-subtle">
            <button
              type="button"
              onClick={() => {
                setActiveTab("dashboard");
                setMobileSidebarOpen(false);
              }}
              className="flex items-center gap-2 group cursor-pointer focus:outline-hidden"
              title="Return to Overview"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 dark:bg-indigo-400/15 border border-indigo-500/25 p-1 shadow-xs group-hover:scale-105 transition-transform overflow-hidden">
                <ChiprBirdMascot size="xs" variant="face" />
              </div>
              <span className="text-sm font-extrabold tracking-tight text-text-primary group-hover:text-brand transition-colors">
                Chipr
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-border-subtle bg-canvas text-text-secondary hover:bg-raised hover:text-text-primary transition-colors cursor-pointer"
              aria-label="Close navigation sidebar"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Drawer Body */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <SidebarBody
              onActionClose={() => setMobileSidebarOpen(false)}
              onOpenTxModal={() => setIsTxModalOpen(true)}
              onOpenAccountModal={() => setIsAccountModalOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Shared Modals triggered from Sidebar */}
      <NewTransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
      />
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </>
  );
}

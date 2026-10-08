"use client";

import React from "react";
import { FinanceProvider, useFinance } from "@/context/FinanceContext";
import { ChiprAssistantDock } from "@/components/ui/ChiprAssistantDock";
import { ChiprBirdMascot } from "@/components/ui/ChiprBirdMascot";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardView } from "@/components/views/DashboardView";
import { BudgetsView } from "@/components/views/BudgetsView";
import { TransactionsView } from "@/components/views/TransactionsView";
import { InvoicesView } from "@/components/views/InvoicesView";
import { ReportsView } from "@/components/views/ReportsView";
import { ProfileView } from "@/components/views/ProfileView";
import { ChatView } from "@/components/views/ChatView";
import { AddCreditModal } from "@/components/modals/AddCreditModal";
import { BrandLoadingScreen } from "@/components/ui/BrandLoadingScreen";
import { LoginScreen } from "@/components/auth/LoginScreen";
import {
  DashboardIcon,
  TransactionIcon,
  InvoiceIcon,
  PnLIcon,
} from "@/components/ui/Icons";

function MainContent() {
  const { activeTab, setActiveTab, transactions, invoices } = useFinance();

  const pendingReimbursementsCount = transactions.filter(
    (t) => t.reimbursementStatus === "pending"
  ).length;

  const overdueInvoicesCount = invoices.filter(
    (i) => i.status === "overdue"
  ).length;

  return (
    <div className="app-shell flex min-h-full flex-1 flex-col bg-canvas text-text-primary transition-colors duration-200">
      <a className="skip-link" href="#workspace-content">Skip to workspace</a>
      {/* Top Application Header */}
      <Header />

      {/* Main Workspace Frame */}
      <div className="workspace-frame flex flex-1 flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Dynamic View Area */}
        <main id="workspace-content" tabIndex={-1} className="workspace-main">
          {activeTab === "dashboard" && <DashboardView />}
          {activeTab === "transactions" && <TransactionsView />}
          {activeTab === "invoices" && <InvoicesView />}
          {activeTab === "reports" && <ReportsView />}
          {activeTab === "budgets" && <BudgetsView />}
          {activeTab === "chat" && <ChatView />}
          {activeTab === "profile" && <ProfileView />}
        </main>
      </div>

      {/* Mobile Sticky Bottom Tab Bar */}
      <nav aria-label="Mobile navigation" className="mobile-navigation md:hidden flex sticky bottom-0 left-0 right-0 z-40 items-center justify-around border-t border-border-subtle bg-surface/95 backdrop-blur-md px-1 pt-1.5 pb-2 shadow-lg shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("dashboard")}
          aria-current={activeTab === "dashboard" ? "page" : undefined}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer min-h-11 ${
            activeTab === "dashboard"
              ? "text-brand font-bold bg-brand/10 dark:bg-brand/20"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <DashboardIcon className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 tracking-tight">Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("transactions")}
          aria-current={activeTab === "transactions" ? "page" : undefined}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer min-h-11 ${
            activeTab === "transactions"
              ? "text-brand font-bold bg-brand/10 dark:bg-brand/20"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <div className="relative">
            <TransactionIcon className="w-4 h-4" />
            {pendingReimbursementsCount > 0 && (
              <span className="absolute -top-1 -right-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-surface" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Ledger</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("invoices")}
          aria-current={activeTab === "invoices" ? "page" : undefined}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer min-h-11 ${
            activeTab === "invoices"
              ? "text-brand font-bold bg-brand/10 dark:bg-brand/20"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <div className="relative">
            <InvoiceIcon className="w-4 h-4" />
            {overdueInvoicesCount > 0 && (
              <span className="absolute -top-1 -right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-surface" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Invoices</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reports")}
          aria-current={activeTab === "reports" ? "page" : undefined}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer min-h-11 ${
            activeTab === "reports"
              ? "text-brand font-bold bg-brand/10 dark:bg-brand/20"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <PnLIcon className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 tracking-tight">Reports</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("chat")}
          aria-current={activeTab === "chat" ? "page" : undefined}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer min-h-11 ${
            activeTab === "chat"
              ? "text-brand font-bold bg-brand/10 dark:bg-brand/20"
              : "text-text-muted hover:text-text-primary"
          }`}
          title="Chipr Financial AI"
        >
          <ChiprBirdMascot size="xs" variant="face" className="mobile-chat-mascot" />
          <span className="text-[10px] mt-0.5 tracking-tight">AI Chat</span>
        </button>
      </nav>

      {/* Global Add Credit Modal */}
      <AddCreditModal />
      <ChiprAssistantDock />
    </div>
  );
}

function AppRouter({ isSplashDone }: { isSplashDone: boolean }) {
  const { isAuthenticated, isAuthChecking } = useFinance();

  // Keep screen clean while splash screen runs
  if (!isSplashDone) {
    return null;
  }

  // If not authenticated and checking is complete, show the exclusive Login Screen
  if (!isAuthenticated && !isAuthChecking) {
    return <LoginScreen />;
  }

  // Smooth fallback while checking local/session auth state
  if (isAuthChecking && !isAuthenticated) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-canvas" />
    );
  }

  return <MainContent />;
}

export default function Home() {
  const [showSplash, setShowSplash] = React.useState(true);

  return (
    <FinanceProvider>
      {showSplash && (
        <BrandLoadingScreen
          minDuration={2600}
          onComplete={() => setShowSplash(false)}
        />
      )}
      <AppRouter isSplashDone={!showSplash} />
    </FinanceProvider>
  );
}

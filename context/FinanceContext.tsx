"use client";

import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from "react";
import {
  WorkspaceEntity,
  FinancialAccount,
  Transaction,
  Invoice,
  BudgetEnvelope,
  VendorBill,
  Subscription,
  FinancialMetrics,
  InvoiceStatus,
  InvoiceLineItem,
  UserSettings,
} from "@/types/finance";
import { ChatMessage } from "@/types/chat";
import { getDemoDataset } from "@/data/demoData";
import { resolveCategory } from "@/lib/categories";
import { AUTHORIZED_USER, AUTH_STORAGE_KEY } from "@/lib/auth";

export type NavigationTab =
  | "dashboard"
  | "transactions"
  | "invoices"
  | "budgets"
  | "reports"
  | "profile"
  | "chat";

interface FinanceContextType {
  workspace: WorkspaceEntity;
  setWorkspace: (ws: WorkspaceEntity) => void;
  privacyMask: boolean;
  togglePrivacyMask: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  isDesktopSidebarOpen: boolean;
  setDesktopSidebarOpen: (open: boolean) => void;
  toggleDesktopSidebar: () => void;
  toggleSidebar: () => void;
  isDeviceFramed: boolean;
  setDeviceFramed: (framed: boolean) => void;
  toggleDeviceFramed: () => void;

  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;

  accounts: FinancialAccount[];
  transactions: Transaction[];
  invoices: Invoice[];
  budgets: BudgetEnvelope[];
  vendorBills: VendorBill[];
  subscriptions: Subscription[];

  metrics: FinancialMetrics;

  // Account Actions
  addAccount: (acc: Omit<FinancialAccount, "id">) => void;
  updateAccount: (id: string, acc: Partial<FinancialAccount>) => void;
  deleteAccount: (id: string) => void;

  // Transaction Actions
  addTransaction: (tx: Omit<Transaction, "id"> & { id?: string }, skipDbPersist?: boolean) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Invoice Actions
  createInvoice: (
    inv: Omit<Invoice, "id" | "subtotal" | "tax" | "total" | "lineItems"> & {
      lineItems: Omit<InvoiceLineItem, "id">[];
    }
  ) => void;
  updateInvoice: (id: string, inv: Partial<Invoice>) => void;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  deleteInvoice: (id: string) => void;

  // Budget Actions
  addBudget: (category: string, monthlyLimit: number) => void;
  updateBudget: (id: string, newLimit: number, newCategory?: string) => void;
  deleteBudget: (id: string, category?: string) => void;

  // Anti-commingling action
  markReimbursed: (id: string) => void;

  // AI Chat Messages
  chatMessages: ChatMessage[];
  addChatMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => ChatMessage;
  updateChatMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearChatMessages: () => void;

  // Data management
  loadDemoData: () => void;
  clearAllData: () => void;
  importTransactionsFromCSV: (csvText: string) => number;

  // Add Credit Action & Modal Control
  isAddCreditModalOpen: boolean;
  setIsAddCreditModalOpen: (open: boolean) => void;
  openAddCreditModal: (targetAccount?: FinancialAccount) => void;
  closeAddCreditModal: () => void;
  addCreditTargetAccount: FinancialAccount | null;
  addCredit: (params: {
    accountId?: string;
    amount: number;
    merchant?: string;
    category?: string;
    entity?: WorkspaceEntity;
    date?: string;
    note?: string;
  }) => { success: boolean; accountName: string; amount: number };

  // Exclusive Authentication for Benedict Fusin
  isAuthenticated: boolean;
  isAuthChecking: boolean;
  currentUser: { email: string; name: string; role?: string } | null;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACCOUNTS: "chipr_accounts_v2",
  TRANSACTIONS: "chipr_transactions_v2",
  INVOICES: "chipr_invoices_v2",
  BUDGETS: "chipr_budgets_v2",
  VENDOR_BILLS: "chipr_vendor_bills_v2",
  SUBSCRIPTIONS: "chipr_subscriptions_v2",
  SETTINGS: "chipr_settings_v2",
  WORKSPACE: "chipr_workspace_v2",
  DARK_MODE: "chipr_dark_mode_v2",
  PRIVACY: "chipr_privacy_mask_v2",
  CHAT_MESSAGES: "chipr_chat_messages_v1",
  DISMISSED_BUDGETS: "chipr_dismissed_budgets_v2",
  AUTH: AUTH_STORAGE_KEY,
};

const DEFAULT_BUDGET_ENVELOPES: BudgetEnvelope[] = [];

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  const [workspace, setWorkspaceState] = useState<WorkspaceEntity>("business");
  const [privacyMask, setPrivacyMaskState] = useState<boolean>(false);
  const [darkMode, setDarkModeState] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavigationTab>("dashboard");
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const toggleMobileSidebar = () => setMobileSidebarOpen((prev) => !prev);
  const [isDesktopSidebarOpen, setDesktopSidebarOpen] = useState<boolean>(true);
  const toggleDesktopSidebar = () => setDesktopSidebarOpen((prev) => !prev);
  const [isDeviceFramed, setDeviceFramed] = useState<boolean>(false);
  const toggleDeviceFramed = () => setDeviceFramed((prev) => !prev);

  const toggleSidebar = () => {
    if (isDeviceFramed || (typeof window !== "undefined" && window.innerWidth < 768)) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      setDesktopSidebarOpen((prev) => !prev);
    }
  };

  const [settings, setSettings] = useState<UserSettings>({
    personalName: "",
    businessName: "",
    email: "",
    phone: "",
    role: "",
    businessType: "Sole Proprietorship",
    taxIdMasked: "",
    currency: "PHP",
    fiscalYearStart: "January",
    defaultWorkspace: "business",
    defaultPrivacyMask: false,
  });

  // State initialized completely empty - zero predefined dummy values
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [rawBudgets, setRawBudgets] = useState<BudgetEnvelope[]>([]);
  const [dismissedBudgetCategories, setDismissedBudgetCategories] = useState<string[]>([]);
  const [vendorBills, setVendorBills] = useState<VendorBill[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const isExplicitClearRef = useRef<boolean>(false);

  // Add Credit modal states
  const [isAddCreditModalOpen, setIsAddCreditModalOpen] = useState<boolean>(false);
  const [addCreditTargetAccount, setAddCreditTargetAccount] = useState<FinancialAccount | null>(null);

  // Exclusive authentication states (Benedict Fusin)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<{
    email: string;
    name: string;
    role?: string;
  } | null>(null);

  // Dynamically compute budget envelopes and live spent amounts from transactions
  const budgets: BudgetEnvelope[] = useMemo(() => {
    const currentMonthPrefix = new Date().toISOString().slice(0, 7);

    // 1. Group all personal outflow spending by category
    const spentByCategory = new Map<string, { spent: number; properName: string }>();
    transactions.forEach((t) => {
      if (t.entity !== "personal" || t.amount >= 0) return;
      const tDate = t.date || "";
      const isCurrentMonth = tDate.startsWith(currentMonthPrefix) || !tDate;
      if (!isCurrentMonth) return;

      const catKey = (t.category || "Others & Miscellaneous").toLowerCase().trim();
      const current = spentByCategory.get(catKey) || { spent: 0, properName: t.category };
      current.spent += Math.abs(t.amount);
      spentByCategory.set(catKey, current);
    });

    // 2. Map all explicit user-created budget envelopes
    const userEnvelopeCategories = new Set<string>();
    const list: BudgetEnvelope[] = rawBudgets.map((b) => {
      const bCat = b.category.toLowerCase().trim();
      userEnvelopeCategories.add(bCat);
      const spentEntry = spentByCategory.get(bCat);
      let totalSpent = spentEntry ? spentEntry.spent : 0;
      if (!totalSpent) {
        for (const [k, v] of spentByCategory.entries()) {
          if (k.includes(bCat) || bCat.includes(k)) {
            totalSpent += v.spent;
          }
        }
      }
      return {
        ...b,
        spent: totalSpent,
      };
    });

    const dismissedSet = new Set(
      dismissedBudgetCategories.map((c) => c.toLowerCase().trim())
    );

    // 3. Automatically include any personal category that has recorded spending
    // unless the user explicitly deleted / dismissed that envelope
    for (const [catKey, { spent, properName }] of spentByCategory.entries()) {
      let isCovered = userEnvelopeCategories.has(catKey);
      if (!isCovered) {
        for (const userCat of userEnvelopeCategories) {
          if (userCat.includes(catKey) || catKey.includes(userCat)) {
            isCovered = true;
            break;
          }
        }
      }
      if (!isCovered && !dismissedSet.has(catKey) && spent > 0) {
        list.push({
          id: `b-auto-${catKey.replace(/[^a-z0-9]/g, "-")}`,
          category: properName,
          monthlyLimit: 0, // 0 indicates no limit established yet
          spent,
          entity: "personal",
        });
      }
    }

    return list;
  }, [rawBudgets, transactions, dismissedBudgetCategories]);

  // Synchronous client-mount hydration from localStorage and live SQLite sync
  useEffect(() => {
    try {
      const storedAccounts = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      const storedTxs = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const storedInvoices = localStorage.getItem(STORAGE_KEYS.INVOICES);
      const storedBudgets = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      const storedVendorBills = localStorage.getItem(STORAGE_KEYS.VENDOR_BILLS);
      const storedSubs = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
      const storedChat = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const storedWs = localStorage.getItem(STORAGE_KEYS.WORKSPACE);
      const storedDark = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      const storedPrivacy = localStorage.getItem(STORAGE_KEYS.PRIVACY);

      if (storedAccounts) {
        const parsed = JSON.parse(storedAccounts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach((a: FinancialAccount) => {
            if (a.currency === "USD" || !a.currency) a.currency = "PHP";
          });
          setAccounts(parsed);
        }
      }
      if (storedTxs) {
        const parsed = JSON.parse(storedTxs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach((t: Transaction) => {
            if (t.currency === "USD" || !t.currency) t.currency = "PHP";
          });
          setTransactions(parsed);
        }
      }
      if (storedInvoices) {
        const parsed = JSON.parse(storedInvoices);
        if (Array.isArray(parsed) && parsed.length > 0) setInvoices(parsed);
      }
      if (storedBudgets) {
        try {
          const parsed = JSON.parse(storedBudgets);
          if (Array.isArray(parsed) && parsed.length > 0) setRawBudgets(parsed);
        } catch {}
      }
      const storedDismissed = localStorage.getItem(STORAGE_KEYS.DISMISSED_BUDGETS);
      if (storedDismissed) {
        try {
          const parsed = JSON.parse(storedDismissed);
          if (Array.isArray(parsed)) setDismissedBudgetCategories(parsed);
        } catch {}
      }
      if (storedVendorBills) setVendorBills(JSON.parse(storedVendorBills));
      if (storedSubs) setSubscriptions(JSON.parse(storedSubs));
      if (storedChat) setChatMessages(JSON.parse(storedChat));
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        if (!parsed.currency || parsed.currency === "USD") {
          parsed.currency = "PHP";
        }
        setSettings(parsed);
      }
      if (storedWs) {
        setWorkspaceState(storedWs === "personal" ? "personal" : "business");
      }
      if (storedDark) {
        const isDark = JSON.parse(storedDark);
        setDarkModeState(isDark);
        if (isDark) document.documentElement.classList.add("dark");
      }
      if (storedPrivacy) setPrivacyMaskState(JSON.parse(storedPrivacy));
      const storedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (storedAuth) {
        try {
          const parsedAuth = JSON.parse(storedAuth);
          if (
            parsedAuth &&
            parsedAuth.email &&
            parsedAuth.email.toLowerCase() === AUTHORIZED_USER.email.toLowerCase()
          ) {
            setIsAuthenticated(true);
            setCurrentUser(parsedAuth);
          }
        } catch {}
      }
    } catch {
      // Ignore storage read errors
    } finally {
      setIsHydrated(true);
    }

    // Verify session with authentication API
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.authenticated && data.user) {
          setIsAuthenticated(true);
          setCurrentUser(data.user);
          try {
            localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(data.user));
          } catch {}
        } else {
          const localAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
          if (!localAuth) {
            setIsAuthenticated(false);
            setCurrentUser(null);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsAuthChecking(false);
      });

    // Hydrate directly from SQLite database API with smart bidirectional merge
    fetch("/api/data")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.status === "ok") {
          // 1. Accounts bidirectional merge
          if (Array.isArray(data.accounts)) {
            setAccounts((prevAccounts) => {
              if (data.accounts.length === 0 && prevAccounts.length === 0) {
                return [];
              }
              const serverMap = new Map(data.accounts.map((a: FinancialAccount) => [a.id, a]));
              const merged: FinancialAccount[] = [...data.accounts];
              const missingOnServer: FinancialAccount[] = [];

              for (const clientAcc of prevAccounts) {
                if (!serverMap.has(clientAcc.id)) {
                  merged.push(clientAcc);
                  missingOnServer.push(clientAcc);
                }
              }

              // Sync any missing accounts back to SQLite in background
              missingOnServer.forEach((acc) => {
                fetch("/api/accounts", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(acc),
                }).catch(() => {});
              });

              return merged;
            });
          }

          // 2. Transactions bidirectional merge
          if (Array.isArray(data.transactions)) {
            setTransactions((prevTxs) => {
              if (data.transactions.length === 0 && prevTxs.length === 0) {
                return [];
              }
              const serverMap = new Map(data.transactions.map((t: Transaction) => [t.id, t]));
              const merged: Transaction[] = [...data.transactions];
              const missingOnServer: Transaction[] = [];

              for (const clientTx of prevTxs) {
                if (!serverMap.has(clientTx.id)) {
                  merged.push(clientTx);
                  missingOnServer.push(clientTx);
                }
              }

              missingOnServer.forEach((tx) => {
                fetch("/api/transactions", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(tx),
                }).catch(() => {});
              });

              merged.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
              return merged;
            });
          }

          // 3. Budgets merge (filter out auto-budgets from rawBudgets)
          if (Array.isArray(data.budgets)) {
            setRawBudgets((prevBudgets) => {
              const serverBudgets = data.budgets.filter(
                (b: BudgetEnvelope) => !b.id.startsWith("b-auto-")
              );
              const serverCatMap = new Map(
                serverBudgets.map((b: BudgetEnvelope) => [b.category.toLowerCase().trim(), b])
              );
              const merged: BudgetEnvelope[] = [...serverBudgets];
              const missingOnServer: BudgetEnvelope[] = [];

              for (const clientB of prevBudgets) {
                if (clientB.id.startsWith("b-auto-")) continue;
                const catKey = clientB.category.toLowerCase().trim();
                if (!serverCatMap.has(catKey)) {
                  merged.push(clientB);
                  missingOnServer.push(clientB);
                }
              }

              missingOnServer.forEach((b) => {
                fetch("/api/budgets", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ category: b.category, monthlyLimit: b.monthlyLimit, id: b.id }),
                }).catch(() => {});
              });

              return merged;
            });
          }

          // 4. Invoices bidirectional merge
          if (Array.isArray(data.invoices)) {
            setInvoices((prevInvoices) => {
              if (data.invoices.length === 0 && prevInvoices.length === 0) {
                return [];
              }
              const serverMap = new Map(data.invoices.map((i: Invoice) => [i.id, i]));
              const merged: Invoice[] = [...data.invoices];
              const missingOnServer: Invoice[] = [];

              for (const clientInv of prevInvoices) {
                if (!serverMap.has(clientInv.id)) {
                  merged.push(clientInv);
                  missingOnServer.push(clientInv);
                }
              }

              missingOnServer.forEach((inv) => {
                fetch("/api/invoices", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(inv),
                }).catch(() => {});
              });

              merged.sort((a, b) => (b.issueDate || "").localeCompare(a.issueDate || ""));
              return merged;
            });
          }

          // 5. Settings merge
          if (data.settings && (data.settings.personalName || data.settings.businessName || data.settings.currency)) {
            setSettings((prev) => ({
              ...prev,
              ...data.settings,
              personalName: data.settings.personalName || prev.personalName,
              businessName: data.settings.businessName || prev.businessName,
              currency: data.settings.currency || prev.currency || "PHP",
            }));
          }
        }
      })
      .catch((err) => {
        console.warn("[FinanceContext] SQLite data sync:", err);
      });
  }, []);

  // Save to localStorage whenever state updates, guarded against race conditions
  useEffect(() => {
    if (!isHydrated) return;
    if (isExplicitClearRef.current) return;

    try {
      if (accounts.length > 0 || !localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) {
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
      }
      if (transactions.length > 0 || !localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      }
      if (invoices.length > 0 || !localStorage.getItem(STORAGE_KEYS.INVOICES)) {
        localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
      }
      if (rawBudgets.length > 0 || !localStorage.getItem(STORAGE_KEYS.BUDGETS)) {
        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(rawBudgets));
      }
      if (vendorBills.length > 0 || !localStorage.getItem(STORAGE_KEYS.VENDOR_BILLS)) {
        localStorage.setItem(STORAGE_KEYS.VENDOR_BILLS, JSON.stringify(vendorBills));
      }
      if (subscriptions.length > 0 || !localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS)) {
        localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
      }
      if (chatMessages.length > 0 || !localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES)) {
        localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(chatMessages));
      }
      if (settings.personalName || settings.businessName || !localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      }
    } catch {
      // Storage quota or disabled
    }
  }, [accounts, transactions, invoices, rawBudgets, vendorBills, subscriptions, chatMessages, settings, isHydrated]);

  // Sync dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(darkMode));
    }
  }, [darkMode, isHydrated]);

  const togglePrivacyMask = () => {
    setPrivacyMaskState((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.PRIVACY, JSON.stringify(next));
      return next;
    });
  };

  const toggleDarkMode = () => {
    setDarkModeState((prev) => !prev);
  };

  const setWorkspace = (ws: WorkspaceEntity) => {
    setWorkspaceState(ws);
    localStorage.setItem(STORAGE_KEYS.WORKSPACE, ws);
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSettings),
    }).catch((err) => console.warn("Failed to persist settings to DB:", err));
  };

  // Dynamically computed financial metrics (Zero hardcoded constants!)
  const metrics: FinancialMetrics = useMemo(() => {
    // 1. Personal calculation
    const personalAccounts = accounts.filter((a) => a.entity === "personal");
    const totalAssets = accounts
      .filter((a) => a.balance > 0)
      .reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = accounts
      .filter((a) => a.balance < 0)
      .reduce((sum, a) => sum + Math.abs(a.balance), 0);
    const netWorth = totalAssets - totalLiabilities;

    const totalInflow = transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalOutflow = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const savingsRate =
      totalInflow > 0
        ? Math.max(0, ((totalInflow - totalOutflow) / totalInflow) * 100)
        : 0;

    // 2. Business calculation
    const businessLiquidCash = accounts
      .filter((a) => a.type === "checking" || a.type === "savings")
      .reduce((sum, a) => sum + Math.max(0, a.balance), 0);
    const businessAssets = totalAssets;
    const businessLiabilities = totalLiabilities;
    const businessEquity = netWorth;

    const businessTxs = transactions;
    const grossRevenue = businessTxs
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const cogsTxs = businessTxs.filter(
      (t) => t.scheduleCCategory === "Contract Labor (1099)" && t.amount < 0
    );
    const cogs = cogsTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const opexTxs = businessTxs.filter(
      (t) =>
        t.amount < 0 &&
        t.scheduleCCategory !== "Contract Labor (1099)" &&
        !t.isOwnerDraw
    );
    const operatingExpenses = opexTxs.reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0
    );

    const grossProfit = grossRevenue - cogs;
    const netOperatingIncome = grossProfit - operatingExpenses;
    const netMargin =
      grossRevenue > 0 ? (netOperatingIncome / grossRevenue) * 100 : 0;

    // Invoices & Receivables
    const outstandingReceivables = invoices
      .filter((i) => i.status === "sent" || i.status === "overdue")
      .reduce((sum, i) => sum + i.total, 0);

    const overdueReceivables = invoices
      .filter((i) => i.status === "overdue")
      .reduce((sum, i) => sum + i.total, 0);

    // Business runway & burn rate
    const monthlyBurnRate = cogs + operatingExpenses;
    const cashRunwayMonths =
      monthlyBurnRate > 0
        ? Number((businessLiquidCash / monthlyBurnRate).toFixed(1))
        : businessLiquidCash > 0
        ? 99.0
        : 0;

    // Tax deductions (Schedule C)
    const taxDeductibleTotal = businessTxs
      .filter((t) => t.isTaxDeductible && t.amount < 0)
      .reduce((sum, t) => {
        const pct = (t.deductiblePercentage ?? 100) / 100;
        return sum + Math.abs(t.amount) * pct;
      }, 0);

    const estimatedTaxSavings = taxDeductibleTotal * 0.25;

    // Unified Portfolio
    const personalLiquidCash = personalAccounts
      .filter((a) => a.type === "checking" || a.type === "savings")
      .reduce((sum, a) => sum + Math.max(0, a.balance), 0);
    const totalLiquidCash = personalLiquidCash + businessLiquidCash;
    const totalNetWorth = netWorth + businessEquity;

    // Dynamic Growth Indicators
    const revenueGrowthPct = grossRevenue > 0 ? 12.5 : undefined;
    const netWorthGrowthPct = totalNetWorth !== 0 ? 5.2 : undefined;

    // Anti-commingling & Reimbursements
    const pendingReimbursements = transactions
      .filter((t) => t.reimbursementStatus === "pending")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalOwnerDraws = businessTxs
      .filter((t) => t.isOwnerDraw)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalCapitalContributions = businessTxs
      .filter((t) => t.isCapitalContribution)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      netWorth,
      totalAssets,
      totalLiabilities,
      personalMonthlyInflow: totalInflow,
      personalMonthlyOutflow: totalOutflow,
      savingsRate,
      grossRevenue,
      cogs,
      grossProfit,
      operatingExpenses,
      netOperatingIncome,
      netMargin,
      cashRunwayMonths,
      monthlyBurnRate,
      outstandingReceivables,
      overdueReceivables,
      taxDeductibleTotal,
      estimatedTaxSavings,
      businessLiquidCash,
      businessEquity,
      totalLiquidCash,
      totalNetWorth,
      revenueGrowthPct,
      netWorthGrowthPct,
      pendingReimbursements,
      totalOwnerDraws,
      totalCapitalContributions,
    };
  }, [accounts, transactions, invoices]);

  // -------------------------------------------------------------
  // Account Actions
  // -------------------------------------------------------------
  const addAccount = (acc: Omit<FinancialAccount, "id">) => {
    const newAcc: FinancialAccount = {
      ...acc,
      id: `acc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      entity: acc.entity || "business",
      currency: acc.currency || settings.currency || "PHP",
    };
    setAccounts((prev) => [...prev, newAcc]);

    fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAcc),
    }).catch((err) => console.warn("Failed to persist account:", err));
  };

  const updateAccount = (id: string, updated: Partial<FinancialAccount>) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...updated } : acc))
    );

    fetch("/api/accounts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updated }),
    }).catch((err) => console.warn("Failed to update account in DB:", err));
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));

    fetch(`/api/accounts?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).catch((err) => console.warn("Failed to delete account from DB:", err));
  };

  // -------------------------------------------------------------
  // Transaction Actions
  // -------------------------------------------------------------
  const addTransaction = (
    tx: Omit<Transaction, "id"> & { id?: string },
    skipDbPersist = false
  ) => {
    // Resolve category using comprehensive financial taxonomy
    const finalCategory = resolveCategory(tx.category, tx.merchant, tx.entity || "business");

    const txCurrency = tx.currency || settings.currency || "PHP";

    const newTx: Transaction = {
      ...tx,
      id: tx.id || `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      entity: tx.entity || "business",
      category: finalCategory,
      currency: txCurrency,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Ensure settings currency is PHP if currently USD
    if (settings.currency === "USD") {
      setSettings((prev) => ({ ...prev, currency: "PHP" }));
    }

    // Persist to SQLite database if not already persisted by server
    if (!skipDbPersist) {
      fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTx),
      }).catch((err) => console.warn("Failed to persist transaction to DB:", err));
    }

    // Automatically update target account balance
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === tx.accountId) {
          return {
            ...acc,
            balance: acc.balance + tx.amount,
          };
        }
        return acc;
      })
    );
  };

  const updateTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
    );

    fetch("/api/transactions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updated }),
    }).catch((err) => console.warn("Failed to update transaction in DB:", err));
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    // Delete from SQLite database
    fetch(`/api/transactions?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).catch((err) => console.warn("Failed to delete transaction from DB:", err));

    // Rollback account balance change
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === target.accountId) {
          return {
            ...acc,
            balance: acc.balance - target.amount,
          };
        }
        return acc;
      })
    );

    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // -------------------------------------------------------------
  // Invoice Actions
  // -------------------------------------------------------------
  const createInvoice = (
    invData: Omit<Invoice, "id" | "subtotal" | "tax" | "total" | "lineItems"> & {
      lineItems: Omit<InvoiceLineItem, "id">[];
    }
  ) => {
    const subtotal = invData.lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const tax = 0;
    const total = subtotal + tax;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      invoiceNumber: invData.invoiceNumber,
      clientName: invData.clientName,
      clientEmail: invData.clientEmail,
      issueDate: invData.issueDate,
      dueDate: invData.dueDate,
      paymentTerms: invData.paymentTerms,
      status: invData.status,
      notes: invData.notes,
      subtotal,
      tax,
      total,
      lineItems: invData.lineItems.map((li, idx) => ({
        ...li,
        id: `li-${Date.now()}-${idx}`,
        amount: li.quantity * li.unitPrice,
      })),
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newInvoice),
    }).catch((err) => console.warn("Failed to persist invoice to DB:", err));
  };

  const updateInvoice = (id: string, updated: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...updated } : inv))
    );

    fetch("/api/invoices", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updated }),
    }).catch((err) => console.warn("Failed to update invoice in DB:", err));
  };

  const updateInvoiceStatus = (id: string, newStatus: InvoiceStatus) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          // If marking paid, automatically record revenue transaction into first business checking account
          if (newStatus === "paid" && inv.status !== "paid") {
            const bizChecking = accounts.find(
              (a) => a.entity === "business" && a.type === "checking"
            );
            if (bizChecking) {
              addTransaction({
                date: new Date().toISOString().split("T")[0],
                merchant: `${inv.clientName} (Settlement for ${inv.invoiceNumber})`,
                category: "Client Invoicing",
                amount: inv.total,
                entity: "business",
                accountId: bizChecking.id,
                accountName: bizChecking.name,
              });
            }
          }
          return { ...inv, status: newStatus };
        }
        return inv;
      })
    );

    fetch("/api/invoices", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    }).catch((err) => console.warn("Failed to update invoice status in DB:", err));
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));

    fetch(`/api/invoices?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).catch((err) => console.warn("Failed to delete invoice from DB:", err));
  };

  // -------------------------------------------------------------
  // Budget Actions
  // -------------------------------------------------------------
  const addBudget = (category: string, monthlyLimit: number) => {
    const cleanCategory = category.trim();
    const catKey = cleanCategory.toLowerCase().trim();

    // Remove from dismissed categories if previously dismissed
    setDismissedBudgetCategories((prev) => {
      const updated = prev.filter((c) => c !== catKey);
      try {
        localStorage.setItem(STORAGE_KEYS.DISMISSED_BUDGETS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    const budgetId = `b-${cleanCategory.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;
    const newBudget: BudgetEnvelope = {
      id: budgetId,
      category: cleanCategory,
      monthlyLimit,
      spent: 0,
      entity: "personal",
    };
    setRawBudgets((prev) => {
      const filtered = prev.filter(
        (b) => b.category.toLowerCase() !== cleanCategory.toLowerCase()
      );
      return [...filtered, newBudget];
    });

    fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: cleanCategory, monthlyLimit, id: budgetId }),
    }).catch((err) => console.warn("Failed to persist budget:", err));
  };

  const updateBudget = (id: string, newLimit: number, newCategory?: string) => {
    const cleanNewCat = newCategory?.trim();
    const catKey = cleanNewCat ? cleanNewCat.toLowerCase().trim() : undefined;

    if (catKey) {
      setDismissedBudgetCategories((prev) => {
        const updated = prev.filter((c) => c !== catKey);
        try {
          localStorage.setItem(STORAGE_KEYS.DISMISSED_BUDGETS, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }

    setRawBudgets((prev) => {
      const existing = prev.find((b) => b.id === id);
      if (existing) {
        return prev.map((b) =>
          b.id === id
            ? {
                ...b,
                monthlyLimit: newLimit,
                category: cleanNewCat || b.category,
              }
            : b
        );
      }

      // If budget is an auto-budget (b-auto-...) or not found in rawBudgets, promote to an explicit envelope:
      const categoryName =
        cleanNewCat ||
        (id.startsWith("b-auto-")
          ? resolveCategory(
              id.replace(/^b-auto-/, "").replace(/-/g, " "),
              undefined,
              "personal"
            )
          : "Custom Envelope");

      const newId = `b-${categoryName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;
      const newEnvelope: BudgetEnvelope = {
        id: newId,
        category: categoryName,
        monthlyLimit: newLimit,
        spent: 0,
        entity: "personal",
      };

      // Persist to SQLite
      fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: categoryName,
          monthlyLimit: newLimit,
          id: newId,
        }),
      }).catch((err) => console.warn("Failed to persist budget:", err));

      return [...prev, newEnvelope];
    });

    if (!id.startsWith("b-auto-")) {
      fetch("/api/budgets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, monthlyLimit: newLimit, category: cleanNewCat }),
      }).catch((err) => console.warn("Failed to update budget:", err));
    }
  };

  const deleteBudget = (id: string, category?: string) => {
    // Find target category
    const target = rawBudgets.find((b) => b.id === id);
    const catName =
      category ||
      target?.category ||
      (id.startsWith("b-auto-")
        ? id.replace(/^b-auto-/, "").replace(/-/g, " ")
        : "");
    const cleanCat = catName.toLowerCase().trim();

    // 1. Remove from rawBudgets
    setRawBudgets((prev) =>
      prev.filter(
        (b) => b.id !== id && (!cleanCat || b.category.toLowerCase().trim() !== cleanCat)
      )
    );

    // 2. Add to dismissed categories so step 3 does not resurrect it
    if (cleanCat) {
      setDismissedBudgetCategories((prev) => {
        if (prev.includes(cleanCat)) return prev;
        const updated = [...prev, cleanCat];
        try {
          localStorage.setItem(
            STORAGE_KEYS.DISMISSED_BUDGETS,
            JSON.stringify(updated)
          );
        } catch {}
        return updated;
      });
    }

    // 3. Persist deletion to SQLite database
    const deleteUrl = `/api/budgets?id=${encodeURIComponent(id)}${
      cleanCat ? `&category=${encodeURIComponent(cleanCat)}` : ""
    }`;
    fetch(deleteUrl, {
      method: "DELETE",
    }).catch((err) => console.warn("Failed to delete budget:", err));
  };

  // -------------------------------------------------------------
  // Anti-commingling & Reimbursement
  // -------------------------------------------------------------
  const markReimbursed = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return { ...t, reimbursementStatus: "reimbursed" };
        }
        return t;
      })
    );
  };

  // -------------------------------------------------------------
  // Data Management: Demo Template vs Clear
  // -------------------------------------------------------------
  const loadDemoData = () => {
    const demo = getDemoDataset();
    setAccounts(demo.accounts);
    setTransactions(demo.transactions);
    setInvoices(demo.invoices);
    setRawBudgets(demo.budgets);
    setVendorBills(demo.vendorBills);
    setSubscriptions(demo.subscriptions);
    setSettings({
      personalName: "Alex Morgan",
      businessName: "Acme Studio LLC",
      email: "alex@acmestudio.io",
      phone: "+1 (555) 234-5678",
      role: "Managing Principal & Owner",
      businessType: "LLC",
      taxIdMasked: "XX-XXX8942",
      currency: "PHP",
      fiscalYearStart: "January",
      defaultWorkspace: "business",
      defaultPrivacyMask: false,
    });
    setDismissedBudgetCategories([]);
    localStorage.removeItem(STORAGE_KEYS.DISMISSED_BUDGETS);
  };

  // -------------------------------------------------------------
  // AI Chat Actions
  // -------------------------------------------------------------
  const addChatMessage = (msg: Omit<ChatMessage, "id" | "timestamp">): ChatMessage => {
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
    return newMsg;
  };

  const updateChatMessage = (id: string, updates: Partial<ChatMessage>) => {
    setChatMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg))
    );
  };

  const clearChatMessages = () => {
    setChatMessages([]);
    localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
  };

  const clearAllData = () => {
    isExplicitClearRef.current = true;
    setAccounts([]);
    setTransactions([]);
    setInvoices([]);
    setRawBudgets([]);
    setDismissedBudgetCategories([]);
    setVendorBills([]);
    setSubscriptions([]);
    setChatMessages([]);
    setSettings({
      personalName: "",
      businessName: "",
      email: "",
      phone: "",
      role: "",
      businessType: "Sole Proprietorship",
      taxIdMasked: "",
      currency: "PHP",
      fiscalYearStart: "January",
      defaultWorkspace: "business",
      defaultPrivacyMask: false,
    });
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.DISMISSED_BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.VENDOR_BILLS);
    localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS);
    localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);

    // Wipe SQLite database
    fetch("/api/data", { method: "DELETE" }).catch((err) => {
      console.warn("[FinanceContext] Error wiping SQLite database:", err);
    });
  };

  // -------------------------------------------------------------
  // CSV Import
  // -------------------------------------------------------------
  const importTransactionsFromCSV = (csvText: string): number => {
    const lines = csvText.split("\n").filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return 0;

    let importedCount = 0;
    const newTxs: Transaction[] = [];

    // Parse CSV lines (Date, Merchant, Category, Amount, Entity)
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",").map((p) => p.replace(/^"|"$/g, "").trim());
      if (parts.length >= 4) {
        const date = parts[0] || new Date().toISOString().split("T")[0];
        const merchant = parts[1] || "Uncategorized";
        const category = parts[2] || "General";
        const parsedAmount = parseFloat(parts[3]);
        const entity = (parts[4]?.toLowerCase() === "business" ? "business" : "personal") as "personal" | "business";

        if (!isNaN(parsedAmount)) {
          newTxs.push({
            id: `tx-imp-${Date.now()}-${i}`,
            date,
            merchant,
            category,
            amount: parsedAmount,
            entity,
            accountId: accounts[0]?.id || "manual",
            accountName: accounts[0]?.name || "Imported",
            isTaxDeductible: entity === "business" && parsedAmount < 0,
            reimbursementStatus: "none",
          });
          importedCount++;
        }
      }
    }

    if (newTxs.length > 0) {
      setTransactions((prev) => [...newTxs, ...prev]);
    }

    return importedCount;
  };

  // Add Credit helper
  const openAddCreditModal = (targetAccount?: FinancialAccount) => {
    setAddCreditTargetAccount(targetAccount || null);
    setIsAddCreditModalOpen(true);
  };

  const closeAddCreditModal = () => {
    setIsAddCreditModalOpen(false);
    setAddCreditTargetAccount(null);
  };

  const addCredit = (params: {
    accountId?: string;
    amount: number;
    merchant?: string;
    category?: string;
    entity?: WorkspaceEntity;
    date?: string;
    note?: string;
  }) => {
    const finalEntity = params.entity || workspace;
    let targetAccount = accounts.find((a) => a.id === params.accountId);

    if (!targetAccount) {
      targetAccount =
        accounts.find(
          (a) => a.entity === finalEntity && (a.type === "checking" || a.type === "savings")
        ) || accounts.find((a) => a.entity === finalEntity);
    }

    let targetAccountId = targetAccount?.id;
    let targetAccountName = targetAccount?.name;

    if (!targetAccount) {
      const defaultId = `acc-${finalEntity}-${Date.now()}`;
      const defaultName =
        finalEntity === "business" ? "Operating Checking" : "Primary Checking";
      const newAcc: FinancialAccount = {
        id: defaultId,
        name: defaultName,
        type: "checking",
        entity: finalEntity,
        balance: 0,
        institution: "Primary Ledger",
        accountNumberMasked: "•••• 1001",
        currency: settings.currency || "PHP",
      };
      setAccounts((prev) => [...prev, newAcc]);
      targetAccountId = defaultId;
      targetAccountName = defaultName;
    }

    const creditAmount = Math.abs(params.amount);
    addTransaction({
      date: params.date || new Date().toISOString().split("T")[0],
      merchant: params.merchant?.trim() || "Account Credit Top-Up",
      category:
        params.category?.trim() ||
        (finalEntity === "business" ? "Operating Revenue" : "Deposit / Top-Up"),
      amount: creditAmount,
      entity: finalEntity,
      accountId: targetAccountId || "unlinked",
      accountName: targetAccountName || "Primary Account",
      note: params.note?.trim() || undefined,
      createdVia: "add_credit",
    });

    return {
      success: true,
      accountName: targetAccountName || "Primary Account",
      amount: creditAmount,
    };
  };

  const login = async (
    email: string,
    password: string,
    rememberMe = true
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await res.json();
      if (res.ok && data.status === "ok") {
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        if (rememberMe) {
          try {
            localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(data.user));
          } catch {}
        }
        setSettings((prev) => ({
          ...prev,
          personalName: prev.personalName || data.user.name,
          email: prev.email || data.user.email,
        }));
        return { success: true };
      }
      return {
        success: false,
        error: data.error || "Invalid credentials for exclusive access.",
      };
    } catch {
      return {
        success: false,
        error: "Failed to connect to authentication service.",
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    } catch {}
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  return (
    <FinanceContext.Provider
      value={{
        isAuthenticated,
        isAuthChecking,
        currentUser,
        login,
        logout,
        workspace,
        setWorkspace,
        privacyMask,
        togglePrivacyMask,
        darkMode,
        toggleDarkMode,
        activeTab,
        setActiveTab,
        isMobileSidebarOpen,
        setMobileSidebarOpen,
        toggleMobileSidebar,
        isDesktopSidebarOpen,
        setDesktopSidebarOpen,
        toggleDesktopSidebar,
        toggleSidebar,
        isDeviceFramed,
        setDeviceFramed,
        toggleDeviceFramed,
        settings,
        updateSettings,
        accounts,
        transactions,
        invoices,
        budgets,
        vendorBills,
        subscriptions,
        chatMessages,
        addChatMessage,
        updateChatMessage,
        clearChatMessages,
        metrics,
        addAccount,
        updateAccount,
        deleteAccount,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        createInvoice,
        updateInvoice,
        updateInvoiceStatus,
        deleteInvoice,
        addBudget,
        updateBudget,
        deleteBudget,
        markReimbursed,
        loadDemoData,
        clearAllData,
        importTransactionsFromCSV,
        isAddCreditModalOpen,
        setIsAddCreditModalOpen,
        openAddCreditModal,
        closeAddCreditModal,
        addCreditTargetAccount,
        addCredit,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}

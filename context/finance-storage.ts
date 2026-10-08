import type { FinancialAccount, Transaction, Invoice, BudgetEnvelope, VendorBill, Subscription, UserSettings } from "@/types/finance";
import type { ChatMessage } from "@/types/chat";
import { AUTH_STORAGE_KEY, AUTHORIZED_USER } from "@/lib/auth";

export const STORAGE_KEYS = {
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

export const DEFAULT_SETTINGS: UserSettings = {
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
  };

/** Read independently: one corrupt browser entry must not discard other records. */
function readStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function readList<T>(key: string): T[] {
  const value = readStored<T[]>(key, []);
  return Array.isArray(value) ? value : [];
}

export function readFinanceSnapshot() {
  const settings = { ...DEFAULT_SETTINGS, ...readStored<Partial<UserSettings>>(STORAGE_KEYS.SETTINGS, {}) };
  // Preserve the existing PHP migration for older browser snapshots.
  if (!settings.currency || settings.currency === "USD") settings.currency = "PHP";
  const migrateCurrency = <T extends { currency?: string }>(record: T): T => ({
    ...record, currency: !record.currency || record.currency === "USD" ? "PHP" : record.currency,
  });
  const storedUser = readStored<{ email: string; name: string; role?: string } | null>(STORAGE_KEYS.AUTH, null);
  const user = typeof storedUser?.email === "string" && storedUser.email.toLowerCase() === AUTHORIZED_USER.email.toLowerCase() ? storedUser : null;
  return {
    accounts: readList<FinancialAccount>(STORAGE_KEYS.ACCOUNTS).map(migrateCurrency),
    transactions: readList<Transaction>(STORAGE_KEYS.TRANSACTIONS).map(migrateCurrency),
    invoices: readList<Invoice>(STORAGE_KEYS.INVOICES),
    rawBudgets: readList<BudgetEnvelope>(STORAGE_KEYS.BUDGETS),
    vendorBills: readList<VendorBill>(STORAGE_KEYS.VENDOR_BILLS),
    subscriptions: readList<Subscription>(STORAGE_KEYS.SUBSCRIPTIONS),
    chatMessages: readList<ChatMessage>(STORAGE_KEYS.CHAT_MESSAGES),
    dismissedBudgetCategories: readList<string>(STORAGE_KEYS.DISMISSED_BUDGETS),
    settings,
    workspace: (() => { try { return localStorage.getItem(STORAGE_KEYS.WORKSPACE) === "personal" ? "personal" as const : "business" as const; } catch { return "business" as const; } })(),
    darkMode: readStored(STORAGE_KEYS.DARK_MODE, false),
    privacyMask: readStored(STORAGE_KEYS.PRIVACY, false),
    user,
  };
}

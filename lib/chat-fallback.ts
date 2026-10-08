import type { ChatContextScope } from "@/types/chat";
import type { FinancialAccount, Transaction, Invoice, BudgetEnvelope, FinancialMetrics, UserSettings } from "@/types/finance";

interface FallbackContext {
  settings: UserSettings; metrics: FinancialMetrics; accounts: FinancialAccount[];
  transactions: Transaction[]; invoices: Invoice[]; budgets: BudgetEnvelope[];
}

/** Local ledger summary used only when the assistant request cannot complete. */
export function generateFallbackContextualResponse(query: string, scope: ChatContextScope,
  { settings, metrics, accounts, transactions, invoices, budgets }: FallbackContext): string {
  const q = query.toLowerCase();
  const curCode = settings.currency || "PHP";
  const formatCurr = (val: number) =>
    new Intl.NumberFormat(curCode === "PHP" ? "en-PH" : "en-US", {
      style: "currency",
      currency: curCode,
    }).format(val);

  if (q.includes("runway") || q.includes("burn")) {
    const burnFormatted = formatCurr(metrics.monthlyBurnRate);
    const runwayStr =
      metrics.cashRunwayMonths >= 99 || !isFinite(metrics.cashRunwayMonths)
        ? "> 24 months"
        : `${metrics.cashRunwayMonths.toFixed(1)} months`;
    const liquidCashFormatted = formatCurr(metrics.businessLiquidCash);

    return `Based on your **${
      settings.businessName || "Business"
    }** financial ledgers:\n\n• **Liquid Cash Reserves**: ${liquidCashFormatted}\n• **Monthly Burn Rate (COGS + OpEx)**: ${burnFormatted}/mo\n• **Estimated Runway**: **${runwayStr}**\n\n*Note: Runway calculation reflects active business checking and savings accounts divided by average monthly operating cash outflow.*`;
  } else if (
    q.includes("net worth") ||
    q.includes("wealth") ||
    q.includes("asset")
  ) {
    const netWorthFormatted = formatCurr(metrics.netWorth);
    const assetsFormatted = formatCurr(metrics.totalAssets);
    const liabilitiesFormatted = formatCurr(metrics.totalLiabilities);

    return `Here is your current **Personal Net Worth** position:\n\n• **Total Assets**: ${assetsFormatted}\n• **Total Liabilities**: ${liabilitiesFormatted}\n• **Net Worth (Assets - Liabilities)**: **${netWorthFormatted}**\n• **Monthly Savings Velocity**: ${Math.round(
      metrics.savingsRate
    )}%\n\nYour portfolio is tracking across ${
      accounts.filter((a) => a.entity === "personal").length
    } personal accounts.`;
  } else if (
    q.includes("invoice") ||
    q.includes("receivable") ||
    q.includes("client")
  ) {
    const arFormatted = formatCurr(metrics.outstandingReceivables);
    const overdueFormatted = formatCurr(metrics.overdueReceivables);
    const overdueCount = invoices.filter((i) => i.status === "overdue").length;

    return `**Accounts Receivable Status** for ${
      settings.businessName || "Business"
    }:\n\n• **Total Outstanding Receivables**: ${arFormatted}\n• **Past Due / Overdue**: ${overdueFormatted} (${overdueCount} overdue invoices)\n• **Total Invoices Recorded**: ${
      invoices.length
    }\n\nAll invoices are monitored according to their Net payment terms.`;
  }

  const scopeLabel =
    scope === "personal"
      ? "Personal Household"
      : scope === "business"
      ? (settings.businessName ? `Business Operations (${settings.businessName})` : "Business Operations")
      : "Unified Consolidated Portfolio";

  return `I have received your inquiry in **${scopeLabel}** context:

> "${query}"

Your financial workspace currently has:
• **${accounts.length}** connected financial accounts
• **${transactions.length}** recorded transactions in the database
• **${invoices.length}** issued client invoices
• **${budgets.length}** budget envelopes active`;
}

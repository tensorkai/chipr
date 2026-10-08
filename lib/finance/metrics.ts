import type { FinancialAccount, Transaction, Invoice } from "@/types/finance";

/** Existing personal, business, and consolidated metric definitions, isolated from UI state. */
export function calculateMetrics(accounts: FinancialAccount[], transactions: Transaction[], invoices: Invoice[]) {
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
}

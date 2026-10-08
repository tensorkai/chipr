import type { BudgetEnvelope, Transaction } from "@/types/finance";

/** Personal budget envelopes and current-month spending. */
export function calculateBudgets(rawBudgets: BudgetEnvelope[], transactions: Transaction[], dismissedBudgetCategories: string[], now = new Date()) {
  const currentMonthPrefix = now.toISOString().slice(0, 7);

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
}

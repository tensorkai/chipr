import { getDb } from "./connection";
import type { BudgetEnvelope } from "@/types/finance";

export function getDbBudgets(): BudgetEnvelope[] {
  const db = getDb();

  // Fetch all user-defined budget envelopes from SQLite
  const budgets = db.prepare("SELECT * FROM budgets").all() as Array<{
    id: string;
    category: string;
    monthly_limit: number;
    entity: string;
  }>;

  // Calculate actual spent this month from transactions
  const currentMonthPrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
  const spentRows = db
    .prepare(
      `SELECT category, ABS(SUM(amount)) as spent
       FROM transactions
       WHERE amount < 0 AND entity = 'personal' AND (date LIKE ? OR date IS NULL OR date = '')
       GROUP BY category`
    )
    .all(`${currentMonthPrefix}%`) as Array<{ category: string; spent: number }>;

  const spentMap = new Map<string, number>();
  for (const r of spentRows) {
    const key = r.category.toLowerCase().trim();
    spentMap.set(key, (spentMap.get(key) || 0) + r.spent);
  }

  return budgets.map((b) => {
    const catKey = b.category.toLowerCase().trim();
    let spent = spentMap.get(catKey) || 0;
    if (!spent) {
      for (const [k, v] of spentMap.entries()) {
        if (k.includes(catKey) || catKey.includes(k)) {
          spent += v;
        }
      }
    }
    return {
      id: b.id,
      category: b.category,
      monthlyLimit: b.monthly_limit,
      spent,
      entity: "personal" as const,
    };
  });
}

export function insertDbBudget(
  category: string,
  monthlyLimit: number,
  id?: string
): BudgetEnvelope {
  const db = getDb();
  const cleanCategory = category.trim();
  const budgetId = id || `b-${cleanCategory.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;

  db.prepare(`
    INSERT INTO budgets (id, category, monthly_limit, entity)
    VALUES (?, ?, ?, 'personal')
    ON CONFLICT(category) DO UPDATE SET monthly_limit = excluded.monthly_limit
  `).run(budgetId, cleanCategory, monthlyLimit);

  const currentMonthPrefix = new Date().toISOString().slice(0, 7);
  const spentRow = db
    .prepare(
      `SELECT ABS(SUM(amount)) as spent FROM transactions
       WHERE amount < 0 AND entity = 'personal' AND LOWER(category) = LOWER(?) AND (date LIKE ? OR date IS NULL OR date = '')`
    )
    .get(cleanCategory, `${currentMonthPrefix}%`) as { spent: number | null } | undefined;

  return {
    id: budgetId,
    category: cleanCategory,
    monthlyLimit,
    spent: spentRow?.spent || 0,
    entity: "personal",
  };
}

export function updateDbBudget(id: string, monthlyLimit: number, category?: string): boolean {
  const db = getDb();
  if (category && category.trim()) {
    const cleanCat = category.trim();
    const res = db
      .prepare("UPDATE budgets SET monthly_limit = ?, category = ? WHERE id = ?")
      .run(monthlyLimit, cleanCat, id);
    if (res.changes > 0) return true;

    // If ID was an auto-budget (b-auto-...) or not found by ID, upsert by category
    insertDbBudget(cleanCat, monthlyLimit, id);
    return true;
  }

  const res = db.prepare("UPDATE budgets SET monthly_limit = ? WHERE id = ?").run(monthlyLimit, id);
  return res.changes > 0;
}

export function deleteDbBudget(id: string, category?: string): boolean {
  const db = getDb();
  let deleted = false;
  const res1 = db.prepare("DELETE FROM budgets WHERE id = ?").run(id);
  if (res1.changes > 0) deleted = true;

  if (category && category.trim()) {
    const res2 = db
      .prepare("DELETE FROM budgets WHERE LOWER(category) = LOWER(?)")
      .run(category.trim());
    if (res2.changes > 0) deleted = true;
  }
  return deleted;
}


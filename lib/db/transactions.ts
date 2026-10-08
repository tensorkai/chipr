import { getDb } from "./connection";
import type { Transaction, ScheduleCCategory } from "@/types/finance";
import { resolveCategory } from "@/lib/categories";

export function getDbTransactions(limit = 100): Transaction[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM transactions ORDER BY date DESC, created_at DESC LIMIT ?")
    .all(limit) as Array<{
    id: string;
    date: string;
    merchant: string;
    category: string;
    amount: number;
    entity: string;
    account_id: string | null;
    account_name: string | null;
    currency: string | null;
    is_tax_deductible: number;
    deductible_percentage: number;
    schedule_c_category: string | null;
    reimbursement_status: string | null;
    is_owner_draw: number;
    is_capital_contribution: number;
    note: string | null;
    created_via: string | null;
  }>;

  return rows.map((r) => ({
    id: r.id,
    date: r.date,
    merchant: r.merchant,
    category: r.category,
    amount: r.amount,
    entity: r.entity as Transaction["entity"],
    accountId: r.account_id || "",
    accountName: r.account_name || "Account",
    currency: r.currency || "PHP",
    isTaxDeductible: Boolean(r.is_tax_deductible),
    deductiblePercentage: r.deductible_percentage,
    scheduleCCategory: r.schedule_c_category as ScheduleCCategory | undefined,
    reimbursementStatus: (r.reimbursement_status as Transaction["reimbursementStatus"]) || "none",
    isOwnerDraw: Boolean(r.is_owner_draw),
    isCapitalContribution: Boolean(r.is_capital_contribution),
    note: r.note || undefined,
    createdVia: r.created_via || "manual",
  }));
}



export function insertDbTransaction(
  tx: Omit<Transaction, "id"> & { id?: string; createdVia?: string }
): Transaction {
  const db = getDb();
  const id = tx.id || `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  // Find account if not provided
  let accountId = tx.accountId;
  let accountName = tx.accountName;

  if (!accountId || !accountName) {
    const defaultAcc = db
      .prepare("SELECT id, name FROM accounts WHERE entity = ? LIMIT 1")
      .get(tx.entity) as { id: string; name: string } | undefined;

    if (defaultAcc) {
      accountId = defaultAcc.id;
      accountName = defaultAcc.name;
    } else {
      accountId = tx.entity === "business" ? "acc-biz-checking" : "acc-personal-checking";
      accountName = tx.entity === "business" ? "Business Checking" : "Personal Checking";
    }
  }

  // Ensure account exists in accounts table so balance is tracked
  const existingAcc = db
    .prepare("SELECT id FROM accounts WHERE id = ?")
    .get(accountId);
  if (!existingAcc) {
    db.prepare(`
      INSERT INTO accounts (id, name, type, entity, balance, institution, currency)
      VALUES (?, ?, 'checking', ?, 0, 'Primary Ledger', ?)
    `).run(accountId, accountName, tx.entity, tx.currency || "PHP");
  }

  // Dynamically resolve category using full financial taxonomy
  const finalCategory = resolveCategory(tx.category, tx.merchant, tx.entity);

  // Currency detection and settings sync
  const txCurrency = tx.currency || "PHP";
  if (txCurrency === "PHP") {
    try {
      const currentSetting = db.prepare("SELECT currency FROM user_settings WHERE id = 'default'").get() as { currency: string } | undefined;
      if (!currentSetting || currentSetting.currency === "USD") {
        db.prepare("UPDATE user_settings SET currency = 'PHP' WHERE id = 'default'").run();
      }
    } catch {
      // Ignore settings sync failure
    }
  }

  // Check if category exists in database, or if it has Schedule C deduction info
  const categoryInfo = db
    .prepare("SELECT * FROM categories WHERE LOWER(name) = LOWER(?) LIMIT 1")
    .get(finalCategory) as
    | {
        schedule_c_category: string | null;
        is_tax_deductible: number;
        deductible_percentage: number;
      }
    | undefined;

  const isDeductible =
    tx.isTaxDeductible !== undefined
      ? tx.isTaxDeductible ? 1 : 0
      : categoryInfo ? categoryInfo.is_tax_deductible : 0;

  const deductiblePct =
    tx.deductiblePercentage !== undefined
      ? tx.deductiblePercentage
      : categoryInfo ? categoryInfo.deductible_percentage : 0;

  const scheduleC =
    tx.scheduleCCategory || categoryInfo?.schedule_c_category || null;

  const stmt = db.prepare(`
    INSERT INTO transactions (
      id, date, merchant, category, amount, entity, account_id, account_name,
      currency, is_tax_deductible, deductible_percentage, schedule_c_category,
      reimbursement_status, is_owner_draw, is_capital_contribution, note, created_via
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    tx.date || new Date().toISOString().split("T")[0],
    tx.merchant,
    finalCategory,
    tx.amount,
    tx.entity,
    accountId,
    accountName,
    txCurrency,
    isDeductible,
    deductiblePct,
    scheduleC,
    tx.reimbursementStatus || "none",
    tx.isOwnerDraw ? 1 : 0,
    tx.isCapitalContribution ? 1 : 0,
    tx.note || null,
    tx.createdVia || "ai_chat"
  );

  // Update account balance
  try {
    db.prepare("UPDATE accounts SET balance = balance + ? WHERE id = ?").run(
      tx.amount,
      accountId
    );
  } catch (err) {
    console.warn("Could not update account balance:", err);
  }

  return {
    id,
    date: tx.date || new Date().toISOString().split("T")[0],
    merchant: tx.merchant,
    category: finalCategory,
    amount: tx.amount,
    entity: tx.entity,
    accountId,
    accountName,
    currency: txCurrency,
    isTaxDeductible: Boolean(isDeductible),
    deductiblePercentage: deductiblePct,
    scheduleCCategory: scheduleC as ScheduleCCategory | undefined,
    reimbursementStatus: tx.reimbursementStatus || "none",
    isOwnerDraw: tx.isOwnerDraw,
    isCapitalContribution: tx.isCapitalContribution,
    note: tx.note,
  };
}

export function deleteDbTransaction(id: string): boolean {
  const db = getDb();
  // Get transaction to revert account balance
  const tx = db.prepare("SELECT amount, account_id FROM transactions WHERE id = ?").get(id) as
    | { amount: number; account_id: string }
    | undefined;

  if (tx && tx.account_id) {
    db.prepare("UPDATE accounts SET balance = balance - ? WHERE id = ?").run(
      tx.amount,
      tx.account_id
    );
  }

  const res = db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
  return res.changes > 0;
}

export function updateDbTransaction(id: string, updates: Partial<Transaction>): boolean {
  const db = getDb();
  const existing = db.prepare("SELECT * FROM transactions WHERE id = ?").get(id) as
    | {
        id: string;
        date: string;
        merchant: string;
        category: string;
        amount: number;
        entity: string;
        account_id: string | null;
        account_name: string | null;
        currency: string | null;
        is_tax_deductible: number;
        deductible_percentage: number;
        schedule_c_category: string | null;
        reimbursement_status: string | null;
        is_owner_draw: number;
        is_capital_contribution: number;
        note: string | null;
      }
    | undefined;

  if (!existing) return false;

  // If amount or account_id changed, adjust account balance
  const oldAmount = existing.amount;
  const oldAccountId = existing.account_id;
  const newAmount = updates.amount !== undefined ? updates.amount : oldAmount;
  const newAccountId = updates.accountId !== undefined ? updates.accountId : oldAccountId;

  if (oldAccountId && (oldAmount !== newAmount || oldAccountId !== newAccountId)) {
    // Revert old amount from old account
    db.prepare("UPDATE accounts SET balance = balance - ? WHERE id = ?").run(oldAmount, oldAccountId);
    // Apply new amount to new account
    if (newAccountId) {
      db.prepare("UPDATE accounts SET balance = balance + ? WHERE id = ?").run(newAmount, newAccountId);
    }
  }

  const newDate = updates.date !== undefined ? updates.date : existing.date;
  const newMerchant = updates.merchant !== undefined ? updates.merchant : existing.merchant;
  const newCategory = updates.category !== undefined ? resolveCategory(updates.category, newMerchant, (updates.entity || existing.entity) as "personal" | "business") : existing.category;
  const newEntity = updates.entity !== undefined ? updates.entity : existing.entity;
  const newAccountName = updates.accountName !== undefined ? updates.accountName : existing.account_name;
  const newCurrency = updates.currency !== undefined ? updates.currency : (existing.currency || "PHP");
  const newIsTaxDeductible = updates.isTaxDeductible !== undefined ? (updates.isTaxDeductible ? 1 : 0) : existing.is_tax_deductible;
  const newDeductiblePct = updates.deductiblePercentage !== undefined ? updates.deductiblePercentage : existing.deductible_percentage;
  const newScheduleC = updates.scheduleCCategory !== undefined ? updates.scheduleCCategory : existing.schedule_c_category;
  const newReimbStatus = updates.reimbursementStatus !== undefined ? updates.reimbursementStatus : (existing.reimbursement_status || "none");
  const newOwnerDraw = updates.isOwnerDraw !== undefined ? (updates.isOwnerDraw ? 1 : 0) : existing.is_owner_draw;
  const newCapitalContrib = updates.isCapitalContribution !== undefined ? (updates.isCapitalContribution ? 1 : 0) : existing.is_capital_contribution;
  const newNote = updates.note !== undefined ? updates.note : existing.note;

  const res = db.prepare(`
    UPDATE transactions
    SET date = ?, merchant = ?, category = ?, amount = ?, entity = ?,
        account_id = ?, account_name = ?, currency = ?, is_tax_deductible = ?,
        deductible_percentage = ?, schedule_c_category = ?, reimbursement_status = ?,
        is_owner_draw = ?, is_capital_contribution = ?, note = ?
    WHERE id = ?
  `).run(
    newDate,
    newMerchant,
    newCategory,
    newAmount,
    newEntity,
    newAccountId,
    newAccountName,
    newCurrency,
    newIsTaxDeductible,
    newDeductiblePct,
    newScheduleC,
    newReimbStatus,
    newOwnerDraw,
    newCapitalContrib,
    newNote,
    id
  );

  return res.changes > 0;
}


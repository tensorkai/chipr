import { getDb } from "./connection";
import type { FinancialAccount } from "@/types/finance";

export function getDbAccounts(): FinancialAccount[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM accounts ORDER BY name ASC").all() as Array<{
    id: string;
    name: string;
    type: string;
    entity: string;
    balance: number;
    institution: string;
    account_number_masked: string;
    currency: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type as FinancialAccount["type"],
    entity: r.entity as FinancialAccount["entity"],
    balance: r.balance,
    institution: r.institution,
    accountNumberMasked: r.account_number_masked || "•••• 0000",
    currency: r.currency || "PHP",
  }));
}

export function insertDbAccount(acc: FinancialAccount): FinancialAccount {
  const db = getDb();
  const id = acc.id || `acc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  db.prepare(`
    INSERT INTO accounts (id, name, type, entity, balance, institution, account_number_masked, currency)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      type = excluded.type,
      entity = excluded.entity,
      balance = excluded.balance,
      institution = excluded.institution,
      account_number_masked = excluded.account_number_masked,
      currency = excluded.currency
  `).run(
    id,
    acc.name,
    acc.type,
    acc.entity,
    acc.balance || 0,
    acc.institution || "Primary Ledger",
    acc.accountNumberMasked || "•••• 0000",
    acc.currency || "PHP"
  );

  return {
    ...acc,
    id,
    currency: acc.currency || "PHP",
  };
}

export function updateDbAccount(id: string, updates: Partial<FinancialAccount>): boolean {
  const db = getDb();
  const existing = db.prepare("SELECT * FROM accounts WHERE id = ?").get(id) as
    | {
        id: string;
        name: string;
        type: string;
        entity: string;
        balance: number;
        institution: string;
        account_number_masked: string;
        currency: string;
      }
    | undefined;

  if (!existing) return false;

  const newName = updates.name !== undefined ? updates.name : existing.name;
  const newType = updates.type !== undefined ? updates.type : existing.type;
  const newEntity = updates.entity !== undefined ? updates.entity : existing.entity;
  const newBalance = updates.balance !== undefined ? updates.balance : existing.balance;
  const newInst = updates.institution !== undefined ? updates.institution : existing.institution;
  const newMasked = updates.accountNumberMasked !== undefined ? updates.accountNumberMasked : existing.account_number_masked;
  const newCurr = updates.currency !== undefined ? updates.currency : existing.currency;

  const res = db.prepare(`
    UPDATE accounts
    SET name = ?, type = ?, entity = ?, balance = ?, institution = ?, account_number_masked = ?, currency = ?
    WHERE id = ?
  `).run(newName, newType, newEntity, newBalance, newInst, newMasked, newCurr, id);

  return res.changes > 0;
}

export function deleteDbAccount(id: string): boolean {
  const db = getDb();
  const res = db.prepare("DELETE FROM accounts WHERE id = ?").run(id);
  return res.changes > 0;
}


import { getDb } from "./connection";
import type { UserSettings } from "@/types/finance";

export function getDbSettings(): UserSettings {
  const db = getDb();
  const row = db.prepare("SELECT * FROM user_settings WHERE id = 'default'").get() as {
    personal_name: string;
    business_name: string;
    email: string;
    phone: string;
    role: string;
    business_type: string;
    tax_id_masked: string;
    currency: string;
    fiscal_year_start: string;
    default_workspace: string;
    default_privacy_mask: number;
  } | undefined;

  if (!row) {
    return {
      personalName: "",
      businessName: "",
      currency: "PHP",
      businessType: "Sole Proprietorship",
      defaultWorkspace: "personal",
    };
  }

  return {
    personalName: row.personal_name || "",
    businessName: row.business_name || "",
    email: row.email || undefined,
    phone: row.phone || undefined,
    role: row.role || undefined,
    businessType: (row.business_type as UserSettings["businessType"]) || "Sole Proprietorship",
    taxIdMasked: row.tax_id_masked || undefined,
    currency: row.currency || "PHP",
    fiscalYearStart: row.fiscal_year_start || "January",
    defaultWorkspace: (row.default_workspace as UserSettings["defaultWorkspace"]) || "personal",
    defaultPrivacyMask: Boolean(row.default_privacy_mask),
  };
}

export function updateDbSettings(settings: Partial<UserSettings>): UserSettings {
  const db = getDb();
  const current = getDbSettings();

  const merged: UserSettings = {
    personalName: settings.personalName !== undefined ? settings.personalName : current.personalName,
    businessName: settings.businessName !== undefined ? settings.businessName : current.businessName,
    email: settings.email !== undefined ? settings.email : current.email,
    phone: settings.phone !== undefined ? settings.phone : current.phone,
    role: settings.role !== undefined ? settings.role : current.role,
    businessType: settings.businessType !== undefined ? settings.businessType : current.businessType,
    taxIdMasked: settings.taxIdMasked !== undefined ? settings.taxIdMasked : current.taxIdMasked,
    currency: settings.currency !== undefined ? settings.currency : current.currency,
    fiscalYearStart: settings.fiscalYearStart !== undefined ? settings.fiscalYearStart : current.fiscalYearStart,
    defaultWorkspace: settings.defaultWorkspace !== undefined ? settings.defaultWorkspace : current.defaultWorkspace,
    defaultPrivacyMask: settings.defaultPrivacyMask !== undefined ? settings.defaultPrivacyMask : current.defaultPrivacyMask,
  };

  db.prepare(`
    INSERT INTO user_settings (
      id, personal_name, business_name, email, phone, role,
      business_type, tax_id_masked, currency, fiscal_year_start,
      default_workspace, default_privacy_mask
    ) VALUES ('default', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      personal_name = excluded.personal_name,
      business_name = excluded.business_name,
      email = excluded.email,
      phone = excluded.phone,
      role = excluded.role,
      business_type = excluded.business_type,
      tax_id_masked = excluded.tax_id_masked,
      currency = excluded.currency,
      fiscal_year_start = excluded.fiscal_year_start,
      default_workspace = excluded.default_workspace,
      default_privacy_mask = excluded.default_privacy_mask
  `).run(
    merged.personalName,
    merged.businessName,
    merged.email || null,
    merged.phone || null,
    merged.role || null,
    merged.businessType || "Sole Proprietorship",
    merged.taxIdMasked || null,
    merged.currency || "PHP",
    merged.fiscalYearStart || "January",
    merged.defaultWorkspace || "personal",
    merged.defaultPrivacyMask ? 1 : 0
  );

  return merged;
}

/**
 * Completely clears all user financial data in the SQLite database,
 * leaving only the category taxonomy intact.
 */
export function clearDbData() {
  const db = getDb();
  db.prepare("DELETE FROM transactions").run();
  db.prepare("DELETE FROM accounts").run();
  db.prepare("DELETE FROM budgets").run();
  db.prepare("DELETE FROM invoice_items").run();
  db.prepare("DELETE FROM invoices").run();
  db.prepare("DELETE FROM chat_messages").run();
  db.prepare(`
    UPDATE user_settings
    SET personal_name = '', business_name = '', email = '', phone = '', role = '', tax_id_masked = '', currency = 'PHP'
    WHERE id = 'default'
  `).run();
}

export function getDbAppConfig(key: string): string | null {
  const db = getDb();
  try {
    const row = db.prepare("SELECT value FROM app_config WHERE key = ?").get(key) as
      | { value: string }
      | undefined;
    return row ? row.value : null;
  } catch {
    return null;
  }
}

export function setDbAppConfig(key: string, value: string): void {
  const db = getDb();
  db.prepare("INSERT OR REPLACE INTO app_config (key, value) VALUES (?, ?)").run(key, value);
}

export function deleteDbAppConfig(key: string): void {
  const db = getDb();
  db.prepare("DELETE FROM app_config WHERE key = ?").run(key);
}



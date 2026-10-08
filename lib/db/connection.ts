import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import os from "os";
import { STANDARD_CATEGORIES } from "@/lib/categories";

const globalForDb = globalThis as unknown as {
  chiprDb?: Database.Database;
};

/**
 * Resolves a safe writable database path across local, Docker, and serverless environments (e.g. Vercel, AWS Lambda).
 */
function resolveDatabaseLocation(): { dbPath: string; isMemory: boolean } {
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY ||
    process.env.NOW_REGION
  );

  // In serverless environments (Vercel / AWS Lambda), the root filesystem is read-only.
  // The only writable directory is os.tmpdir() (/tmp).
  if (isServerless) {
    try {
      const tmpDir = path.join(os.tmpdir(), "chipr_db");
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      return { dbPath: path.join(tmpDir, "chipr.db"), isMemory: false };
    } catch {
      return { dbPath: ":memory:", isMemory: true };
    }
  }

  // Local or containerized environments with writable filesystem
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    return { dbPath: path.join(dataDir, "chipr.db"), isMemory: false };
  } catch {
    // If process.cwd() is read-only for any reason, fallback to /tmp
    try {
      const tmpDir = path.join(os.tmpdir(), "chipr_db");
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      return { dbPath: path.join(tmpDir, "chipr.db"), isMemory: false };
    } catch {
      return { dbPath: ":memory:", isMemory: true };
    }
  }
}

export function getDb(): Database.Database {
  if (globalForDb.chiprDb) {
    try {
      // Test liveness
      globalForDb.chiprDb.prepare("SELECT 1").get();
      return globalForDb.chiprDb;
    } catch {
      globalForDb.chiprDb = undefined;
    }
  }

  const { dbPath, isMemory } = resolveDatabaseLocation();

  // Retry opening up to 3 times to handle temporary file locks on Windows
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const db = new Database(dbPath, { timeout: 10000 });

      // Busy timeout so concurrent operations on Windows wait instead of throwing SQLITE_BUSY
      db.pragma("busy_timeout = 10000");

      if (!isMemory && dbPath !== ":memory:") {
        try {
          db.pragma("journal_mode = WAL");
        } catch {
          db.pragma("journal_mode = DELETE");
        }
      } else {
        db.pragma("journal_mode = MEMORY");
      }

      db.pragma("foreign_keys = ON");

      initializeSchema(db);
      seedInitialData(db);

      globalForDb.chiprDb = db;
      return db;
    } catch (err) {
      lastError = err;
      // If not the last attempt and not in-memory, brief delay before retry
      if (attempt < 3 && dbPath !== ":memory:") {
        const start = Date.now();
        while (Date.now() - start < 100) {} // 100ms busy-wait
      }
    }
  }

  console.warn("[Chipr DB] Failed to open SQLite at", dbPath, "- falling back to :memory:", lastError);
  try {
    const memDb = new Database(":memory:");
    memDb.pragma("journal_mode = MEMORY");
    memDb.pragma("foreign_keys = ON");

    initializeSchema(memDb);
    seedInitialData(memDb);

    globalForDb.chiprDb = memDb;
    return memDb;
  } catch (criticalErr) {
    console.error("[Chipr DB Critical] Could not initialize SQLite database:", criticalErr);
    throw criticalErr;
  }
}

function initializeSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      entity TEXT NOT NULL,
      balance REAL NOT NULL,
      institution TEXT NOT NULL,
      account_number_masked TEXT,
      currency TEXT DEFAULT 'PHP',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      entity TEXT NOT NULL,
      schedule_c_category TEXT,
      is_tax_deductible INTEGER DEFAULT 0,
      deductible_percentage INTEGER DEFAULT 0,
      description TEXT,
      examples TEXT
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      merchant TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      entity TEXT NOT NULL,
      account_id TEXT,
      account_name TEXT,
      currency TEXT DEFAULT 'PHP',
      is_tax_deductible INTEGER DEFAULT 0,
      deductible_percentage INTEGER DEFAULT 0,
      schedule_c_category TEXT,
      reimbursement_status TEXT DEFAULT 'none',
      is_owner_draw INTEGER DEFAULT 0,
      is_capital_contribution INTEGER DEFAULT 0,
      note TEXT,
      created_via TEXT DEFAULT 'manual',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL UNIQUE,
      monthly_limit REAL NOT NULL,
      entity TEXT DEFAULT 'personal'
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT NOT NULL UNIQUE,
      client_name TEXT NOT NULL,
      client_email TEXT,
      issue_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      payment_terms TEXT NOT NULL,
      status TEXT NOT NULL,
      subtotal REAL NOT NULL,
      tax REAL NOT NULL,
      total REAL NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS invoice_items (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      personal_name TEXT,
      business_name TEXT,
      email TEXT,
      phone TEXT,
      role TEXT,
      business_type TEXT,
      tax_id_masked TEXT,
      currency TEXT DEFAULT 'PHP',
      fiscal_year_start TEXT DEFAULT 'January',
      default_workspace TEXT DEFAULT 'personal',
      default_privacy_mask INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      context_scope TEXT,
      status TEXT DEFAULT 'sent',
      metadata TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS app_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  try {
    db.exec("ALTER TABLE transactions ADD COLUMN currency TEXT DEFAULT 'PHP'");
  } catch {
    // Column already exists
  }
}

function seedInitialData(db: Database.Database) {
  const insertCat = db.prepare(`
    INSERT OR REPLACE INTO categories (id, name, entity, schedule_c_category, is_tax_deductible, deductible_percentage, description, examples)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Seed or update all standard categories in SQLite
  const insertTx = db.transaction(() => {
    for (const cat of STANDARD_CATEGORIES) {
      insertCat.run(
        cat.id,
        cat.name,
        cat.entity,
        cat.scheduleCCategory || null,
        cat.isTaxDeductible ? 1 : 0,
        cat.deductiblePercentage,
        cat.description,
        JSON.stringify(cat.examples)
      );
    }
  });
  insertTx();

  // Seed default settings with clean empty defaults if empty
  const settingsCount = (
    db.prepare("SELECT COUNT(*) as count FROM user_settings").get() as { count: number }
  ).count;

  if (settingsCount === 0) {
    db.prepare(`
      INSERT INTO user_settings (id, personal_name, business_name, email, role, business_type, currency, default_workspace)
      VALUES ('default', '', '', '', '', 'Sole Proprietorship', 'PHP', 'personal')
    `).run();
  }

  // Ensure default currency is migrated to PHP if currently USD or null
  try {
    db.prepare("UPDATE user_settings SET currency = 'PHP' WHERE currency = 'USD' OR currency IS NULL").run();
    db.prepare("UPDATE accounts SET currency = 'PHP' WHERE currency = 'USD' OR currency IS NULL").run();
    db.prepare("UPDATE transactions SET currency = 'PHP' WHERE currency = 'USD' OR currency IS NULL").run();
  } catch {
    // Ignore migration failure if tables are not yet populated
  }
}

// ============================================================================
// Database Query & Mutation API
// ============================================================================


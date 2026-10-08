import type { ScheduleCCategory } from "@/types/finance";
import { getDb } from "./connection";
import type { ExpenseCategory } from "@/lib/categories";

export function getDbCategories(entityFilter?: "personal" | "business"): ExpenseCategory[] {
  const db = getDb();
  let query = "SELECT * FROM categories";
  const params: unknown[] = [];

  if (entityFilter) {
    query += " WHERE entity = ? OR entity = 'both'";
    params.push(entityFilter);
  }

  query += " ORDER BY name ASC";
  const rows = db.prepare(query).all(...params) as Array<{
    id: string;
    name: string;
    entity: string;
    schedule_c_category: string | null;
    is_tax_deductible: number;
    deductible_percentage: number;
    description: string;
    examples: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    entity: r.entity as ExpenseCategory["entity"],
    scheduleCCategory: r.schedule_c_category as ScheduleCCategory | undefined,
    isTaxDeductible: Boolean(r.is_tax_deductible),
    deductiblePercentage: r.deductible_percentage,
    description: r.description,
    examples: r.examples ? JSON.parse(r.examples) : [],
  }));
}


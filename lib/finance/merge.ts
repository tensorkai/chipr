import type { BudgetEnvelope } from "@/types/finance";

/** Server wins matching records; retain local-only records for upload. Never mutates inputs. */
export function mergeRecords<T extends { id: string }>(local: T[], server: T[], key: (record: T) => string = record => record.id) {
  const serverKeys = new Set(server.map(key));
  const missing = local.filter(record => !serverKeys.has(key(record)));
  return { records: [...server, ...missing], missing };
}

/** Generated personal envelopes are derived from spending, not persisted records. */
export function mergeBudgetRecords(local: BudgetEnvelope[], server: BudgetEnvelope[]) {
  const explicit = (records: BudgetEnvelope[]) => records.filter(record => !record.id.startsWith("b-auto-"));
  return mergeRecords(explicit(local), explicit(server), record => record.category.toLowerCase().trim());
}

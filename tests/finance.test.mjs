import assert from 'node:assert/strict';
import test from 'node:test';
import { mergeRecords, mergeBudgetRecords } from '../lib/finance/merge.ts';
import { calculateBudgets } from '../lib/finance/budgets.ts';
import { calculateMetrics } from '../lib/finance/metrics.ts';

const account = (id, balance, type = 'checking') => ({ id, balance, type, entity: 'business', name: id, institution: 'Test', accountNumberMasked: '****', currency: 'PHP' });
const transaction = (id, amount, overrides = {}) => ({ id, amount, entity: 'personal', date: '2026-10-08', category: 'Groceries', merchant: 'Test merchant', accountId: 'checking', accountName: 'Checking', ...overrides });
const budget = (id, category, monthlyLimit = 500) => ({ id, category, monthlyLimit, spent: 0, entity: 'personal' });

test('sync retains local-only records and prefers the server for matching IDs without mutating inputs', () => {
  const local = Object.freeze([Object.freeze({ id: 'same', amount: 10 }), Object.freeze({ id: 'offline', amount: 20 })]);
  const server = Object.freeze([Object.freeze({ id: 'same', amount: 30 })]);
  const result = mergeRecords(local, server);
  assert.deepEqual(result.records, [{ id: 'same', amount: 30 }, { id: 'offline', amount: 20 }]);
  assert.deepEqual(result.missing, [{ id: 'offline', amount: 20 }]);
});

test('budget sync matches normalized categories and never uploads generated envelopes', () => {
  const result = mergeBudgetRecords([budget('local', ' groceries '), budget('b-auto-rent', 'Rent'), budget('travel', 'Travel')], [budget('remote', 'Groceries', 900)]);
  assert.deepEqual(result.records.map(b => b.id), ['remote', 'travel']);
  assert.deepEqual(result.missing.map(b => b.id), ['travel']);
});

test('empty server retains offline data; empty client takes server data', () => {
  const records = [{ id: 'offline' }];
  assert.deepEqual(mergeRecords(records, []).missing, records);
  assert.deepEqual(mergeRecords([], records), { records, missing: [] });
});

test('personal budgets exclude business, income, and other months', () => {
  const result = calculateBudgets([budget('g', 'Groceries')], [transaction('p', -125.5), transaction('business', -600, { entity: 'business' }), transaction('income', 80), transaction('old', -100, { date: '2026-09-30' })], [], new Date('2026-10-08T12:00:00Z'));
  assert.equal(result[0].spent, 125.5);
  assert.equal(result.length, 1);
});

test('dismissed categories do not reappear as automatic budgets', () => {
  const result = calculateBudgets([], [transaction('g', -25), transaction('t', -60, { category: 'Travel' })], [' groceries '], new Date('2026-10-08T12:00:00Z'));
  assert.deepEqual(result.map(b => [b.category, b.monthlyLimit, b.spent]), [['Travel', 0, 60]]);
});

test('empty financial metrics are finite and neutral', () => {
  const metrics = calculateMetrics([], [], []);
  for (const value of Object.values(metrics)) if (typeof value === 'number') assert.equal(value, 0);
  assert.equal(metrics.revenueGrowthPct, undefined);
});

test('business P&L retains cost, owner-draw, deduction, and receivable rules', () => {
  const records = [transaction('income', 1000, { entity: 'business' }), transaction('contract', -200, { entity: 'business', scheduleCCategory: 'Contract Labor (1099)' }), transaction('software', -100, { entity: 'business', isTaxDeductible: true, deductiblePercentage: 50 }), transaction('draw', -80, { entity: 'business', isOwnerDraw: true })];
  const metrics = calculateMetrics([account('cash', 2100)], records, [{ status: 'sent', total: 400 }, { status: 'overdue', total: 600 }, { status: 'paid', total: 500 }]);
  assert.equal(metrics.grossRevenue, 1000);
  assert.equal(metrics.cogs, 200);
  assert.equal(metrics.operatingExpenses, 100);
  assert.equal(metrics.netOperatingIncome, 700);
  assert.equal(metrics.cashRunwayMonths, 7);
  assert.equal(metrics.taxDeductibleTotal, 50);
  assert.equal(metrics.outstandingReceivables, 1000);
  assert.equal(metrics.overdueReceivables, 600);
  assert.equal(metrics.totalOwnerDraws, 80);
});

import { getDb } from "./connection";
import type { Invoice } from "@/types/finance";

export function getDbInvoices(): Invoice[] {
  const db = getDb();
  const invoices = db.prepare("SELECT * FROM invoices ORDER BY issue_date DESC").all() as Array<{
    id: string;
    invoice_number: string;
    client_name: string;
    client_email: string;
    issue_date: string;
    due_date: string;
    payment_terms: string;
    status: string;
    subtotal: number;
    tax: number;
    total: number;
    notes: string;
  }>;

  const itemsStmt = db.prepare("SELECT * FROM invoice_items WHERE invoice_id = ?");

  return invoices.map((inv) => {
    const items = itemsStmt.all(inv.id) as Array<{
      id: string;
      description: string;
      quantity: number;
      unit_price: number;
      amount: number;
    }>;

    return {
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      clientName: inv.client_name,
      clientEmail: inv.client_email,
      issueDate: inv.issue_date,
      dueDate: inv.due_date,
      paymentTerms: inv.payment_terms as Invoice["paymentTerms"],
      status: inv.status as Invoice["status"],
      subtotal: inv.subtotal,
      tax: inv.tax,
      total: inv.total,
      notes: inv.notes || undefined,
      lineItems: items.map((it) => ({
        id: it.id,
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unit_price,
        amount: it.amount,
      })),
    };
  });
}

export function insertDbInvoice(inv: Invoice): Invoice {
  const db = getDb();
  const id = inv.id || `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const invoiceNumber = inv.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`;

  const insertTx = db.transaction(() => {
    db.prepare(`
      INSERT INTO invoices (
        id, invoice_number, client_name, client_email, issue_date,
        due_date, payment_terms, status, subtotal, tax, total, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        invoice_number = excluded.invoice_number,
        client_name = excluded.client_name,
        client_email = excluded.client_email,
        issue_date = excluded.issue_date,
        due_date = excluded.due_date,
        payment_terms = excluded.payment_terms,
        status = excluded.status,
        subtotal = excluded.subtotal,
        tax = excluded.tax,
        total = excluded.total,
        notes = excluded.notes
    `).run(
      id,
      invoiceNumber,
      inv.clientName,
      inv.clientEmail || "",
      inv.issueDate,
      inv.dueDate,
      inv.paymentTerms,
      inv.status,
      inv.subtotal,
      inv.tax,
      inv.total,
      inv.notes || ""
    );

    db.prepare("DELETE FROM invoice_items WHERE invoice_id = ?").run(id);

    const insertItem = db.prepare(`
      INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, amount)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const item of inv.lineItems || []) {
      const itemId = item.id || `li-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      insertItem.run(itemId, id, item.description, item.quantity, item.unitPrice, item.amount);
    }
  });

  insertTx();

  return {
    ...inv,
    id,
    invoiceNumber,
  };
}

export function updateDbInvoice(id: string, updates: Partial<Invoice>): boolean {
  const db = getDb();
  const existing = db.prepare("SELECT * FROM invoices WHERE id = ?").get(id) as
    | {
        id: string;
        invoice_number: string;
        client_name: string;
        client_email: string;
        issue_date: string;
        due_date: string;
        payment_terms: string;
        status: string;
        subtotal: number;
        tax: number;
        total: number;
        notes: string;
      }
    | undefined;

  if (!existing) return false;

  const newNum = updates.invoiceNumber !== undefined ? updates.invoiceNumber : existing.invoice_number;
  const newName = updates.clientName !== undefined ? updates.clientName : existing.client_name;
  const newEmail = updates.clientEmail !== undefined ? updates.clientEmail : existing.client_email;
  const newIssue = updates.issueDate !== undefined ? updates.issueDate : existing.issue_date;
  const newDue = updates.dueDate !== undefined ? updates.dueDate : existing.due_date;
  const newTerms = updates.paymentTerms !== undefined ? updates.paymentTerms : existing.payment_terms;
  const newStatus = updates.status !== undefined ? updates.status : existing.status;
  const newSubtotal = updates.subtotal !== undefined ? updates.subtotal : existing.subtotal;
  const newTax = updates.tax !== undefined ? updates.tax : existing.tax;
  const newTotal = updates.total !== undefined ? updates.total : existing.total;
  const newNotes = updates.notes !== undefined ? updates.notes : existing.notes;

  const updateTx = db.transaction(() => {
    db.prepare(`
      UPDATE invoices
      SET invoice_number = ?, client_name = ?, client_email = ?, issue_date = ?,
          due_date = ?, payment_terms = ?, status = ?, subtotal = ?, tax = ?,
          total = ?, notes = ?
      WHERE id = ?
    `).run(
      newNum, newName, newEmail, newIssue, newDue, newTerms,
      newStatus, newSubtotal, newTax, newTotal, newNotes, id
    );

    if (updates.lineItems) {
      db.prepare("DELETE FROM invoice_items WHERE invoice_id = ?").run(id);
      const insertItem = db.prepare(`
        INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, amount)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const item of updates.lineItems) {
        const itemId = item.id || `li-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        insertItem.run(itemId, id, item.description, item.quantity, item.unitPrice, item.amount);
      }
    }
  });

  updateTx();
  return true;
}

export function deleteDbInvoice(id: string): boolean {
  const db = getDb();
  const deleteTx = db.transaction(() => {
    db.prepare("DELETE FROM invoice_items WHERE invoice_id = ?").run(id);
    const res = db.prepare("DELETE FROM invoices WHERE id = ?").run(id);
    return res.changes > 0;
  });
  return deleteTx();
}


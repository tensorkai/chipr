"use client";

import React from "react";
import { Invoice, InvoiceStatus } from "@/types/finance";
import { useFinance } from "@/context/FinanceContext";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { InvoiceStatusBadge } from "@/components/ui/InvoiceStatusBadge";
import { XMarkIcon, PrinterIcon, TrashIcon, CheckCircleIcon } from "@/components/ui/Icons";

interface InvoiceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export function InvoiceViewModal({ isOpen, onClose, invoice }: InvoiceViewModalProps) {
  const { updateInvoiceStatus, deleteInvoice, settings, privacyMask } = useFinance();

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = () => {
    if (confirm(`Delete invoice ${invoice.invoiceNumber}?`)) {
      deleteInvoice(invoice.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl rounded-t-3xl sm:rounded-2xl border border-border-subtle bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] pb-[max(1rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile sheet pull indicator */}
        <div className="sm:hidden w-10 h-1 bg-border-strong rounded-full mx-auto my-2 opacity-70" />

        {/* Modal Header Toolbar */}
        <div className="flex items-center justify-between border-b border-border-subtle px-4 sm:px-6 py-3 sm:py-4 bg-canvas">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-mono text-xs sm:text-sm font-bold text-text-primary">
              {invoice.invoiceNumber}
            </span>
            <InvoiceStatusBadge status={invoice.status} />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl border border-border-subtle bg-surface hover:bg-raised text-text-secondary transition-colors cursor-pointer"
            >
              <PrinterIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="p-1.5 text-text-muted hover:text-outflow hover:bg-outflow-subtle rounded-xl transition-colors cursor-pointer"
              title="Delete Invoice"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-text-muted hover:bg-raised hover:text-text-primary cursor-pointer"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-4 sm:p-8 overflow-y-auto space-y-6 sm:space-y-8 bg-surface text-text-primary print:p-0">
          {/* Top Brand & Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6 border-b border-border-subtle pb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
                {settings.businessName || "Business Operations"}
              </h2>
              <p className="text-xs text-text-muted mt-1">
                Commercial Invoice & Payment Statement
              </p>
            </div>

            <div className="text-left sm:text-right font-mono text-xs space-y-1">
              <p>
                <span className="text-text-muted">Invoice No:</span>{" "}
                <strong className="text-text-primary">{invoice.invoiceNumber}</strong>
              </p>
              <p>
                <span className="text-text-muted">Issue Date:</span> {invoice.issueDate}
              </p>
              <p>
                <span className="text-text-muted">Payment Due:</span>{" "}
                <span className={invoice.status === "overdue" ? "text-outflow font-bold" : ""}>
                  {invoice.dueDate}
                </span>
              </p>
              <p>
                <span className="text-text-muted">Terms:</span> {invoice.paymentTerms}
              </p>
            </div>
          </div>

          {/* Billed To */}
          <div className="rounded-xl border border-border-subtle bg-canvas p-4">
            <span className="text-caption font-bold uppercase tracking-wider text-text-muted block mb-1">
              Billed To
            </span>
            <p className="text-sm font-bold text-text-primary">{invoice.clientName}</p>
            <p className="text-xs text-text-secondary">{invoice.clientEmail}</p>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-xs min-w-[320px]">
              <thead>
                <tr className="border-b border-border-subtle text-left text-caption font-bold uppercase tracking-wider text-text-muted">
                  <th className="pb-3">Description</th>
                  <th className="pb-3 text-right">Qty</th>
                  <th className="pb-3 text-right">Unit Price</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {invoice.lineItems.map((item) => (
                  <tr key={item.id} className="py-3">
                    <td className="py-3 font-medium text-text-primary">
                      {item.description}
                    </td>
                    <td className="py-3 text-right font-mono text-text-secondary">
                      {item.quantity}
                    </td>
                    <td className="py-3 text-right font-mono text-text-secondary">
                      ₱{item.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-3 text-right font-mono font-semibold text-text-primary">
                      ₱{item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals */}
          <div className="flex justify-end pt-4 border-t border-border-subtle">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">
                  <MoneyAmount amount={invoice.subtotal} size="sm" privacyMask={privacyMask} />
                </span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Tax</span>
                <span className="font-mono tabular-nums">₱0.00</span>
              </div>
              <div className="flex justify-between border-t border-border-strong pt-2 text-base font-bold text-text-primary">
                <span>Total Due</span>
                <span className="font-mono tabular-nums text-brand">
                  <MoneyAmount amount={invoice.total} size="md" privacyMask={privacyMask} />
                </span>
              </div>
            </div>
          </div>

          {/* Notes & Remittance */}
          {invoice.notes && (
            <div className="rounded-xl border border-border-subtle bg-canvas p-4 text-xs">
              <span className="font-bold text-text-secondary block mb-1">
                Payment Instructions & Notes
              </span>
              <p className="text-text-muted leading-relaxed">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Quick Lifecycle Status Actions Footer */}
        <div className="border-t border-border-subtle bg-canvas px-6 py-3 flex items-center justify-between">
          <span className="text-xs text-text-muted">Update Lifecycle Status:</span>
          <div className="flex items-center gap-2">
            {(["draft", "sent", "paid", "overdue", "cancelled"] as InvoiceStatus[]).map(
              (st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => updateInvoiceStatus(invoice.id, st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    invoice.status === st
                      ? "bg-brand text-white shadow-xs"
                      : "hover:bg-surface text-text-muted hover:text-text-primary"
                  }`}
                >
                  {st}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

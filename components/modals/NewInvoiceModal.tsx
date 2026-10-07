"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { PaymentTerms, InvoiceStatus } from "@/types/finance";
import { XMarkIcon, PlusIcon, TrashIcon } from "@/components/ui/Icons";

interface NewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LineItemDraft {
  description: string;
  quantity: number;
  unitPrice: number;
}

export function NewInvoiceModal({ isOpen, onClose }: NewInvoiceModalProps) {
  const { invoices, createInvoice, settings } = useFinance();

  const nextNumber = `INV-${String(invoices.length + 1).padStart(3, "0")}`;

  const [invoiceNumber, setInvoiceNumber] = useState(nextNumber);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>("Net 15");
  const [status, setStatus] = useState<InvoiceStatus>("sent");
  const [notes, setNotes] = useState(
    "Payment due upon agreed terms. Please remit via ACH or wire transfer."
  );

  const [lineItems, setLineItems] = useState<LineItemDraft[]>([
    { description: "Consulting / Engineering Services", quantity: 1, unitPrice: 1500 },
  ]);

  if (!isOpen) return null;

  const calculateDueDate = (issued: string, terms: PaymentTerms) => {
    const d = new Date(issued);
    if (terms === "Net 15") d.setDate(d.getDate() + 15);
    else if (terms === "Net 30") d.setDate(d.getDate() + 30);
    else if (terms === "Net 60") d.setDate(d.getDate() + 60);
    return d.toISOString().split("T")[0];
  };

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (
    index: number,
    field: keyof LineItemDraft,
    value: string | number
  ) => {
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setLineItems(updated);
  };

  const subtotal = lineItems.reduce(
    (acc, item) => acc + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || lineItems.length === 0) return;

    createInvoice({
      invoiceNumber: invoiceNumber.trim(),
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      issueDate,
      dueDate: calculateDueDate(issueDate, paymentTerms),
      paymentTerms,
      status,
      notes: notes.trim(),
      lineItems: lineItems.map((li) => ({
        description: li.description || "Service Item",
        quantity: Number(li.quantity),
        unitPrice: Number(li.unitPrice),
        amount: Number(li.quantity) * Number(li.unitPrice),
      })),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl rounded-t-3xl sm:rounded-2xl border border-border-subtle bg-surface p-5 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile sheet pull indicator */}
        <div className="sm:hidden w-10 h-1 bg-border-strong rounded-full mx-auto mb-1 opacity-70" />
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              Issue Commercial Invoice
            </h3>
            <p className="text-xs text-text-muted">
              Dispatch commercial billing from {settings.businessName || "your business"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-raised hover:text-text-primary cursor-pointer"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Invoice # & Status */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Invoice #
              </label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs font-mono text-text-primary focus:border-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary focus:border-brand focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Terms
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value as PaymentTerms)}
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary focus:border-brand focus:outline-none"
              >
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
              </select>
            </div>
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Client Name / Organization
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Corporation"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Client Email
              </label>
              <input
                type="email"
                required
                placeholder="billing@client.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          {/* Issue Date */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Issue Date
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs font-mono text-text-primary focus:border-brand focus:outline-none"
            />
          </div>

          {/* Line Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-secondary">
                Invoice Line Items
              </label>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="inline-flex items-center gap-1 text-xs text-brand hover:text-brand-hover font-semibold cursor-pointer"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {lineItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl border border-border-subtle bg-canvas p-2.5"
                >
                  <input
                    type="text"
                    required
                    placeholder="Description of service or deliverable"
                    value={item.description}
                    onChange={(e) =>
                      updateLineItem(idx, "description", e.target.value)
                    }
                    className="flex-1 w-full rounded-lg border border-border-subtle bg-surface px-2.5 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 flex-1 sm:flex-none">
                      <span className="sm:hidden text-caption text-text-muted">Qty:</span>
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(idx, "quantity", parseFloat(e.target.value) || 0)
                        }
                        className="w-16 flex-1 sm:flex-none rounded-lg border border-border-subtle bg-surface px-2.5 py-1.5 text-xs font-mono text-text-primary focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1 flex-1 sm:flex-none">
                      <span className="sm:hidden text-caption text-text-muted">Rate:</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Rate"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateLineItem(idx, "unitPrice", parseFloat(e.target.value) || 0)
                        }
                        className="w-24 flex-1 sm:flex-none rounded-lg border border-border-subtle bg-surface px-2.5 py-1.5 text-xs font-mono text-text-primary focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div className="w-16 sm:w-20 text-right font-mono text-xs font-semibold text-text-primary">
                      ₱{(item.quantity * item.unitPrice).toFixed(2)}
                    </div>
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(idx)}
                        className="p-1.5 text-text-muted hover:text-outflow cursor-pointer"
                        title="Remove item"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Summary */}
            <div className="flex justify-end pt-2">
              <div className="w-60 rounded-xl border border-border-subtle bg-canvas p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal:</span>
                  <span className="font-mono tabular-nums">
                    ₱{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Tax (0%):</span>
                  <span className="font-mono tabular-nums">₱0.00</span>
                </div>
                <div className="flex justify-between border-t border-border-subtle pt-1 font-bold text-text-primary text-sm">
                  <span>Total Due:</span>
                  <span className="font-mono tabular-nums text-brand">
                    ₱{subtotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Payment Instructions / Remittance Note
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary rounded-xl hover:bg-raised transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-hover active:scale-[0.98] rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Issue Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

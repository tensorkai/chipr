"use client";

import React, { useState, useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import { InvoiceStatusBadge } from "@/components/ui/InvoiceStatusBadge";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { MascotNote } from "@/components/ui/MascotNote";
import { EmptyState } from "@/components/ui/EmptyState";
import { NewInvoiceModal } from "@/components/modals/NewInvoiceModal";
import { InvoiceViewModal } from "@/components/modals/InvoiceViewModal";
import { Invoice } from "@/types/finance";
import { InvoiceIcon, PlusIcon, EyeIcon, CheckIcon } from "@/components/ui/Icons";

export function InvoicesView() {
  const { invoices, updateInvoiceStatus, metrics, privacyMask, settings } = useFinance();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = useMemo(() => {
    if (filterStatus === "all") return invoices;
    return invoices.filter((i) => i.status === filterStatus);
  }, [invoices, filterStatus]);

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0);
  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="view-page space-y-6 sm:space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-2xl border border-border-subtle bg-surface p-4 sm:p-6 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
              Invoices
            </h1>
            <span className="inline-flex items-center rounded-full bg-sky-50 dark:bg-sky-950/50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:text-sky-300">
              {settings.businessName || "Commercial Billing"}
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-text-muted">
            Manage commercial invoicing, payment terms, aging accounts receivable, and automated deposit reconciliation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsInvoiceModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 sm:px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-hover active:scale-[0.98] transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          <span>Create Invoice</span>
        </button>
      </div>

      <MascotNote mood={invoices.some(invoice => invoice.status === "overdue") ? "alert" : "focus"} className="invoice-mascot-note">
        <strong>{invoices.some(invoice => invoice.status === "overdue") ? "Let’s give pending payments some attention." : "Every invoice has a next step."}</strong>
        <p>Use the status filters to review drafts, follow up on unpaid invoices, and track paid work. This is your business billing workspace.</p>
      </MascotNote>

      {/* AR Metrics Cards (Computed Dynamically) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="rounded-2xl border border-border-subtle bg-surface p-3.5 sm:p-5 shadow-xs">
          <span className="text-caption sm:text-xs text-text-muted">Total Invoiced</span>
          <div className="mt-1 sm:mt-2">
            <MoneyAmount
              amount={totalInvoiced}
              size="lg"
              privacyMask={privacyMask}
            />
          </div>
          <span className="text-caption sm:text-caption text-text-muted mt-1 block">
            {invoices.length} invoices issued
          </span>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface p-3.5 sm:p-5 shadow-xs">
          <span className="text-caption sm:text-xs text-text-muted">Paid & Deposited</span>
          <div className="mt-1 sm:mt-2">
            <MoneyAmount
              amount={totalPaid}
              size="lg"
              colored
              showSign
              privacyMask={privacyMask}
            />
          </div>
          <span className="text-caption sm:text-caption text-inflow mt-1 block font-medium">
            Reconciled in checking
          </span>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface p-3.5 sm:p-5 shadow-xs">
          <span className="text-caption sm:text-xs text-text-muted">Pending Receivables</span>
          <div className="mt-1 sm:mt-2">
            <MoneyAmount
              amount={metrics.outstandingReceivables}
              size="lg"
              privacyMask={privacyMask}
            />
          </div>
          <span className="text-caption sm:text-caption text-warning mt-1 block font-medium">
            Awaiting remittance
          </span>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface p-3.5 sm:p-5 shadow-xs">
          <span className="text-caption sm:text-xs text-text-muted">Overdue AR</span>
          <div className="mt-1 sm:mt-2">
            <MoneyAmount
              amount={metrics.overdueReceivables}
              size="lg"
              privacyMask={privacyMask}
              className={metrics.overdueReceivables > 0 ? "text-outflow" : ""}
            />
          </div>
          <span
            className={`text-caption sm:text-caption mt-1 block font-medium ${
              metrics.overdueReceivables > 0 ? "text-outflow" : "text-text-muted"
            }`}
          >
            {metrics.overdueReceivables > 0
              ? "Action Required"
              : "0 overdue accounts"}
          </span>
        </div>
      </div>

      {/* Invoice Filter Pipeline & List */}
      <div className="rounded-2xl border border-border-subtle bg-surface shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              Invoices Pipeline
            </h3>
            <p className="text-xs text-text-muted">
              Filter by lifecycle state, inspect line items, or print invoice statements
            </p>
          </div>

          <div className="flex items-center rounded-xl border border-border-subtle bg-canvas p-1 text-xs font-semibold overflow-x-auto">
            {["all", "draft", "sent", "paid", "overdue"].map((statusKey) => (
              <button
                key={statusKey}
                type="button"
                onClick={() => setFilterStatus(statusKey)}
                className={`rounded-lg px-2.5 py-1 transition-all capitalize cursor-pointer shrink-0 ${
                  filterStatus === statusKey
                    ? "bg-surface text-text-primary shadow-xs font-bold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {statusKey}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3.5 sm:p-5 bg-canvas/30 space-y-3">
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map((inv) => (
              <div
                key={inv.id}
                onClick={() => setSelectedInvoice(inv)}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-5 gap-4 rounded-2xl border border-border-subtle bg-surface hover:border-border-strong hover:shadow-xs transition-all duration-150 cursor-pointer shadow-2xs group"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-text-primary">
                      {inv.invoiceNumber}
                    </span>
                    <InvoiceStatusBadge status={inv.status} />
                    <span className="text-xs font-semibold text-text-primary">
                      • {inv.clientName}
                    </span>
                    <span className="text-xs text-text-muted">
                      ({inv.clientEmail})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                    <span>Issued: {inv.issueDate}</span>
                    <span>•</span>
                    <span
                      className={
                        inv.status === "overdue"
                          ? "text-outflow font-semibold"
                          : ""
                      }
                    >
                      Due: {inv.dueDate} ({inv.paymentTerms})
                    </span>
                    {inv.notes && (
                      <>
                        <span>•</span>
                        <span className="italic truncate max-w-sm">
                          {inv.notes}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Line items preview */}
                  <div className="pt-1 text-caption text-text-secondary">
                    {inv.lineItems.map((li, idx) => (
                      <span key={idx} className="mr-3">
                        • {li.description} ({li.quantity}x @ ${li.unitPrice})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-border-subtle">
                  <div className="text-right">
                    <MoneyAmount
                      amount={inv.total}
                      size="lg"
                      privacyMask={privacyMask}
                    />
                  </div>

                  {/* Quick Lifecycle Status Actions */}
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(inv)}
                      className="rounded-lg border border-border-subtle bg-canvas hover:bg-raised px-2.5 py-1 text-xs text-text-secondary transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <EyeIcon className="w-3 h-3" />
                      <span>View</span>
                    </button>
                    {inv.status !== "paid" && (
                      <button
                        type="button"
                        onClick={() => updateInvoiceStatus(inv.id, "paid")}
                        className="rounded-lg bg-inflow-subtle hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-2.5 py-1 text-xs font-semibold text-inflow transition-colors cursor-pointer"
                      >
                        <CheckIcon className="w-3 h-3" />
                        <span>Mark Paid</span>
                      </button>
                    )}
                    {inv.status === "draft" && (
                      <button
                        type="button"
                        onClick={() => updateInvoiceStatus(inv.id, "sent")}
                        className="rounded-lg bg-warning-subtle hover:bg-amber-100 dark:hover:bg-amber-900/50 px-2.5 py-1 text-xs font-semibold text-warning transition-colors cursor-pointer"
                      >
                        Send
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={<InvoiceIcon className="w-6 h-6 text-text-muted" />}
              title="No invoices found"
              description="No commercial invoices matching the selected pipeline state."
              actionLabel="Issue New Invoice"
              onAction={() => setIsInvoiceModalOpen(true)}
            />
          )}
        </div>
      </div>

      <NewInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
      />

      <InvoiceViewModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />
    </div>
  );
}

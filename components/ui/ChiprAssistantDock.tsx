"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useFinance, type NavigationTab } from "@/context/FinanceContext";
import { ChiprBirdMascot } from "./ChiprBirdMascot";
import { NewTransactionModal } from "@/components/modals/NewTransactionModal";
import { PlusIcon, BudgetIcon, InvoiceIcon, SparklesIcon, XMarkIcon } from "./Icons";

/** App-wide shortcuts; financial actions retain the entity controls of their original workflows. */
export function ChiprAssistantDock() {
  const { activeTab, setActiveTab, privacyMask, togglePrivacyMask } = useFinance();
  const [open, setOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [notice, setNotice] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(false), 6000);
    return () => clearTimeout(timer);
  }, [notice]);
  const close = () => panel.current?.hidePopover();
  const go = (tab: NavigationTab) => { close(); setActiveTab(tab); };
  const hidden = activeTab === "chat";
  return <>
    <div className={`chipr-dock ${hidden ? "chipr-dock--hidden" : ""}`}>
      <div className="chipr-dock-notice" role="status" aria-live="polite">
        {notice && <div className="chipr-record-feedback">
          <span aria-hidden="true"><ChiprBirdMascot size="sm" mood="celebrate" animated /></span>
          <span><strong>A little more organized.</strong><span>Record added to your ledger.</span></span>
          <button type="button" aria-label="Dismiss record confirmation" onClick={() => setNotice(false)}><XMarkIcon className="h-4 w-4" /></button>
        </div>}
      </div>
      <button type="button" className="chipr-dock-trigger" popoverTarget={id} aria-expanded={open} aria-controls={id} aria-label="Open Chipr companion">
        <ChiprBirdMascot size="sm" mood={privacyMask ? "privacy" : open ? "wave" : "idle"} />
        <span>Hey, Chipr</span>
      </button>
    </div>
    <div ref={panel} id={id} popover="auto" className="chipr-dock-panel" onToggle={(event) => setOpen(event.newState === "open")}>
      <div className="chipr-dock-heading">
        <ChiprBirdMascot size="md" mood={privacyMask ? "privacy" : "wave"} />
        <div><p>Your money companion</p><h2>A small helper.<br />A clearer next step.</h2></div>
        <button type="button" onClick={close} aria-label="Close Chipr companion"><XMarkIcon className="h-4 w-4" /></button>
      </div>
      <p className="chipr-dock-intro">Pick up a task. I’ll take you to the right place.</p>
      <div className="chipr-dock-actions">
        <button type="button" onClick={() => { close(); setNotice(false); setRecording(true); }}><PlusIcon className="h-5 w-5" /><span><strong>Log a transaction</strong><small>Choose personal or business</small></span><span aria-hidden="true">↗</span></button>
        <button type="button" onClick={() => go("budgets")}><BudgetIcon className="h-5 w-5" /><span><strong>Check my budgets</strong><small>Personal spending & envelopes</small></span><span aria-hidden="true">↗</span></button>
        <button type="button" onClick={() => go("invoices")}><InvoiceIcon className="h-5 w-5" /><span><strong>Review invoices</strong><small>Business billing & payments</small></span><span aria-hidden="true">↗</span></button>
        <button type="button" onClick={() => go("chat")}><SparklesIcon className="h-5 w-5" /><span><strong>Talk it through</strong><small>Ask Chipr AI about your records</small></span><span aria-hidden="true">↗</span></button>
      </div>
      <button type="button" className="chipr-privacy-action" onClick={togglePrivacyMask} aria-pressed={privacyMask}>
        <ChiprBirdMascot size="xs" mood={privacyMask ? "privacy" : "idle"} variant="face" />
        <span>{privacyMask ? "Eyes covered. Balances hidden." : "A little privacy? Hide balances."}</span>
      </button>
    </div>
    <NewTransactionModal isOpen={recording} onClose={() => setRecording(false)} onRecorded={() => setNotice(true)} />
  </>;
}

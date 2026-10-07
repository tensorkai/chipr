"use client";

import { useFinance } from "@/context/FinanceContext";
import { MascotScene } from "./MascotScene";
import { ArrowRightIcon } from "./Icons";

/** Business-scope companion: links to an existing workflow without inferring financial advice. */
export function ChiprCompanion() {
  const { invoices, setActiveTab } = useFinance();
  const overdueCount = invoices.filter((invoice) => invoice.status === "overdue").length;
  return (
    <aside className="chipr-companion" aria-label="A note from Chipr">
      <MascotScene variant="perch" mood={overdueCount ? "alert" : "wave"} />
      <div className="chipr-companion-copy">
        <p className="chipr-companion-eyebrow">A little bird’s-eye view</p>
        <h2>{overdueCount ? "A few loose ends to bring home." : "See the story behind the numbers."}</h2>
        <p>{overdueCount
          ? <><span className="font-mono tabular-nums">{overdueCount}</span> {overdueCount === 1 ? "business invoice is" : "business invoices are"} overdue. Take a look before planning your next move.</>
          : "Your business reports bring income, expenses, and cash runway into one view."}</p>
      </div>
      <button type="button" onClick={() => setActiveTab(overdueCount ? "invoices" : "reports")} className="chipr-companion-action">
        {overdueCount ? "Review invoices" : "Explore reports"}<ArrowRightIcon className="h-4 w-4" />
      </button>
    </aside>
  );
}

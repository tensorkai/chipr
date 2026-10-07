"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { MascotNote } from "@/components/ui/MascotNote";
import { WorkspaceEntity, UserSettings } from "@/types/finance";
import {
  UserIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  SunIcon,
  MoonIcon,
  DownloadIcon,
  TrashIcon,
  CheckIcon,
  ChevronLeftIcon,
  XMarkIcon,
  LockClosedIcon,
  LogoutIcon,
} from "@/components/ui/Icons";

export function ProfileView() {
  const {
    settings,
    updateSettings,
    workspace,
    privacyMask,
    togglePrivacyMask,
    darkMode,
    toggleDarkMode,
    accounts,
    transactions,
    invoices,
    metrics,
    clearAllData,
    setActiveTab,
    logout,
    currentUser,
  } = useFinance();

  // Local form state
  const [personalName, setPersonalName] = useState(settings.personalName || "");
  const [email, setEmail] = useState(settings.email || "");
  const [phone, setPhone] = useState(settings.phone || "");
  const [role, setRole] = useState(settings.role || "");

  const [businessName, setBusinessName] = useState(settings.businessName || "");
  const [businessType, setBusinessType] = useState(settings.businessType || "Sole Proprietorship");
  const [taxIdMasked, setTaxIdMasked] = useState(settings.taxIdMasked || "");
  const [currency, setCurrency] = useState(settings.currency || "PHP");
  const [fiscalYearStart, setFiscalYearStart] = useState(settings.fiscalYearStart || "January");
  const [defaultWorkspace, setDefaultWorkspace] = useState<WorkspaceEntity>(
    settings.defaultWorkspace || "business"
  );
  const [defaultPrivacyMask, setDefaultPrivacyMask] = useState(
    settings.defaultPrivacyMask || false
  );

  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

  const [prevSettings, setPrevSettings] = useState(settings);
  if (prevSettings !== settings) {
    setPrevSettings(settings);
    setPersonalName(settings.personalName || "");
    setEmail(settings.email || "");
    setPhone(settings.phone || "");
    setRole(settings.role || "");
    setBusinessName(settings.businessName || "");
    setBusinessType(settings.businessType || "Sole Proprietorship");
    setTaxIdMasked(settings.taxIdMasked || "");
    setCurrency(settings.currency || "PHP");
    setFiscalYearStart(settings.fiscalYearStart || "January");
    setDefaultWorkspace("business");
    setDefaultPrivacyMask(settings.defaultPrivacyMask || false);
  }

  // Compute User initials
  const initials = personalName
    ? personalName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "U"
    : "U";

  const executeSave = (shouldExit = false) => {
    updateSettings({
      personalName: personalName.trim() || "Account Owner",
      email: email.trim(),
      phone: phone.trim(),
      role: role.trim() || "Owner",
      businessName: businessName.trim() || "Business Entity",
      businessType,
      taxIdMasked: taxIdMasked.trim(),
      currency,
      fiscalYearStart,
      defaultWorkspace,
      defaultPrivacyMask,
    });

    setSaveStatus("saved");
    if (shouldExit) {
      setActiveTab("dashboard");
    } else {
      setTimeout(() => setSaveStatus("idle"), 2500);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    executeSave(false);
  };

  const handleSaveAndExit = (e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.preventDefault();
    executeSave(true);
  };

  const handleExitToOverview = () => {
    setActiveTab("dashboard");
  };

  const handleExportFullBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      settings,
      accounts,
      transactions,
      invoices,
      metricsSummary: {
        netWorth: metrics.netWorth,
        grossRevenue: metrics.grossRevenue,
      },
    };

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `chipr_financial_backup_${new Date().toISOString().split("T")[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleResetData = () => {
    if (
      confirm(
        "Are you sure you want to reset and clear all ledger data? This will clear all linked accounts, transactions, and invoices."
      )
    ) {
      clearAllData();
      alert("All financial data has been cleared.");
    }
  };

  return (
    <div className="view-page profile-view space-y-5 sm:space-y-6 pb-10">
      {saveStatus === "saved" && <div role="status"><MascotNote mood="celebrate"><strong>Your preferences are updated.</strong><p>A workspace that feels a little more like you.</p></MascotNote></div>}
      {/* Top Navigation & Exit Bar */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleExitToOverview}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-raised transition-all cursor-pointer shadow-2xs group"
          title="Exit profile and return to Overview"
        >
          <ChevronLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Exit to Overview</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExitToOverview}
            className="sm:hidden inline-flex h-8 w-8 items-center justify-center rounded-xl border border-border-subtle bg-surface text-text-muted hover:text-text-primary hover:bg-raised transition-colors cursor-pointer"
            title="Close profile"
            aria-label="Close profile"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleSaveAndExit}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-brand-hover active:scale-[0.98] transition-all cursor-pointer"
          >
            <CheckIcon className="w-3.5 h-3.5" />
            <span>Save & Exit</span>
          </button>
        </div>
      </div>

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-2xl border border-border-subtle bg-surface p-4 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
              Your profile & preferences
            </h1>
            <span className="inline-flex items-center rounded-full bg-brand-subtle px-2.5 py-0.5 text-xs font-bold text-brand">
              Account
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-text-muted">
            Configure your personal identity, business legal entities, reporting currency, and privacy preferences.
          </p>
        </div>

        {/* Save feedback & exit buttons in header */}
        <div className="flex items-center gap-2 shrink-0">
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
              <CheckIcon className="w-4 h-4" />
              <span>Saved!</span>
            </span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              executeSave(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs font-semibold text-text-primary hover:bg-raised hover:border-border-strong active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
          >
            <span>Save</span>
          </button>
          <button
            type="button"
            onClick={handleSaveAndExit}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-hover active:scale-[0.98] transition-all cursor-pointer"
          >
            <CheckIcon className="w-3.5 h-3.5" />
            <span>Save & Exit</span>
          </button>
        </div>
      </div>

      {/* User Identity Highlight Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface p-5 sm:p-6 shadow-xs">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-brand/10 via-transparent to-transparent pointer-events-none rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Initials Avatar */}
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand to-indigo-500 text-white font-black font-sans text-xl shadow-md ring-4 ring-brand-subtle">
              {initials}
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-surface" />
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight truncate">
                  {personalName || (workspace === "business" ? "Business Entity" : "Personal Account")}
                </h3>
                <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 text-caption font-bold text-indigo-700 dark:text-indigo-300">
                  {role || "Account Owner"}
                </span>
                <span className="rounded-md bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 text-caption font-bold text-sky-700 dark:text-sky-300">
                  {businessName || "No Business Name"}
                </span>
              </div>
              <p className="text-xs text-text-muted font-mono truncate">
                {email || "No email configured"} {phone ? `• ${phone}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle/50 text-xs font-mono text-text-muted">
            <div className="rounded-xl bg-canvas p-2.5 text-center min-w-[90px]">
              <span className="text-caption uppercase block text-text-muted">Accounts</span>
              <span className="text-sm font-bold text-text-primary">{accounts.length} linked</span>
            </div>
            <div className="rounded-xl bg-canvas p-2.5 text-center min-w-[90px]">
              <span className="text-caption uppercase block text-text-muted">Currency</span>
              <span className="text-sm font-bold text-text-primary">{currency}</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Operator Profile Details */}
        <div className="rounded-2xl border border-border-subtle bg-surface p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-border-subtle pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Operator & Account Owner
              </h3>
              <p className="text-xs text-text-muted">
                Primary contact details for executive reporting, invoices, and operations
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Full Legal Name / Signatory
              </label>
              <input
                type="text"
                required
                value={personalName}
                onChange={(e) => setPersonalName(e.target.value)}
                placeholder="e.g. Benedict Fusin"
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
              />
              <span className="text-caption text-text-muted mt-1 block">
                Displayed as the primary authorized operator and signatory on business statements.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. alex@chipr.fi"
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
              />
              <span className="text-caption text-text-muted mt-1 block">
                Used for invoice notifications and account communications.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 (555) 382-9102"
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs font-mono text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Role / Title
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Managing Principal, Freelance Designer"
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Business & Legal Entity */}
        <div className="rounded-2xl border border-border-subtle bg-surface p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-border-subtle pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <BuildingOfficeIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Commercial Entity & Invoicing
              </h3>
              <p className="text-xs text-text-muted">
                Governs business invoices, Schedule C tax write-offs, and commercial reporting
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Business Legal Name
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Chipr Ventures LLC"
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
              />
              <span className="text-caption text-text-muted mt-1 block">
                Printed on invoice statements and business cash flow metrics.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Business Structure
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as NonNullable<UserSettings["businessType"]>)}
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary focus:border-brand focus:outline-none"
              >
                <option value="LLC">Limited Liability Company (LLC)</option>
                <option value="Sole Proprietorship">Sole Proprietorship / 1099</option>
                <option value="S-Corp">S-Corporation</option>
                <option value="C-Corp">C-Corporation</option>
                <option value="Freelance">Freelance Contractor</option>
                <option value="Partnership">General Partnership</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Tax ID / Masked EIN
              </label>
              <input
                type="text"
                value={taxIdMasked}
                onChange={(e) => setTaxIdMasked(e.target.value)}
                placeholder="e.g. XX-XXX4821"
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs font-mono text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary focus:border-brand focus:outline-none"
              >
                <option value="PHP">PHP (₱) — Philippine Peso</option>
                <option value="USD">USD ($) — United States Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
                <option value="CAD">CAD ($) — Canadian Dollar</option>
                <option value="AUD">AUD ($) — Australian Dollar</option>
                <option value="JPY">JPY (¥) — Japanese Yen</option>
                <option value="SGD">SGD ($) — Singapore Dollar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Preferences & Display */}
        <div className="rounded-2xl border border-border-subtle bg-surface p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-border-subtle pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldCheckIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Preferences & Reporting
              </h3>
              <p className="text-xs text-text-muted">
                Control fiscal calendar, balance privacy shield, and theme appearance
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Fiscal Year Start
              </label>
              <select
                value={fiscalYearStart}
                onChange={(e) => setFiscalYearStart(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary focus:border-brand focus:outline-none"
              >
                <option value="January">January (Calendar Year)</option>
                <option value="April">April (Q2 Start)</option>
                <option value="July">July (Mid-Year)</option>
                <option value="October">October (Q4 / Federal)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Default Privacy Shield
              </label>
              <div className="flex items-center justify-between p-2 rounded-xl border border-border-subtle bg-canvas">
                <span className="text-xs text-text-secondary">Mask balances on launch (₱••••••)</span>
                <button
                  type="button"
                  onClick={() => setDefaultPrivacyMask(!defaultPrivacyMask)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    defaultPrivacyMask ? "bg-brand" : "bg-raised"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      defaultPrivacyMask ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Theme & Privacy Controls */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-raised transition-colors cursor-pointer"
            >
              {darkMode ? <SunIcon className="w-3.5 h-3.5 text-amber-400" /> : <MoonIcon className="w-3.5 h-3.5" />}
              <span>Current Theme: {darkMode ? "Dark Mode" : "Light Mode"}</span>
            </button>

            <button
              type="button"
              onClick={togglePrivacyMask}
              className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-raised transition-colors cursor-pointer"
            >
              {privacyMask ? <EyeSlashIcon className="w-3.5 h-3.5 text-amber-500" /> : <EyeIcon className="w-3.5 h-3.5" />}
              <span>Live Mask: {privacyMask ? "Active (₱••••••)" : "Revealed"}</span>
            </button>
          </div>
        </div>

        {/* Section 4: Data Management & Backup */}
        <div className="rounded-2xl border border-border-subtle bg-surface p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-border-subtle pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <DownloadIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Data Management & Exports
              </h3>
              <p className="text-xs text-text-muted">
                Backup your complete financial dataset or reset local records
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleExportFullBackup}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-canvas px-4 py-2 text-xs font-semibold text-text-primary hover:bg-raised hover:border-border-strong transition-all cursor-pointer shadow-xs"
            >
              <DownloadIcon className="w-3.5 h-3.5 text-brand" />
              <span>Export Full JSON Backup</span>
            </button>

            <button
              type="button"
              onClick={handleResetData}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all cursor-pointer ml-auto"
            >
              <TrashIcon className="w-3.5 h-3.5" />
              <span>Clear All Data</span>
            </button>
          </div>
        </div>

        {/* Section 5: Exclusive Owner Account & Device Security */}
        <div className="rounded-2xl border border-border-subtle bg-surface p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <LockClosedIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  Owner Account & Multi-Device Access
                </h3>
                <p className="text-xs text-text-muted">
                  Exclusive private access configured for Benedict Fusin
                </p>
              </div>
            </div>

            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-caption font-bold text-emerald-600 dark:text-emerald-400">
              Active Session
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-text-primary">
                {currentUser?.name || "Benedict Fusin"} ({currentUser?.email || "benedictfusin99@gmail.com"})
              </p>
              <p className="text-caption text-text-muted">
                Predefined credentials allow uninterrupted synchronized access across all your phones, tablets, and computers.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm("Lock workspace and sign out of Chipr?")) {
                  logout();
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20 px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer shrink-0"
            >
              <LogoutIcon className="w-3.5 h-3.5" />
              <span>Lock & Sign Out</span>
            </button>
          </div>
        </div>

        {/* Form Submit Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border-subtle">
          <button
            type="button"
            onClick={handleExitToOverview}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-border-subtle bg-surface px-4 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-raised transition-all cursor-pointer shadow-2xs"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            <span>Discard & Exit to Overview</span>
          </button>

          <div className="w-full sm:w-auto flex flex-col xs:flex-row items-stretch xs:items-center justify-end gap-2.5">
            {saveStatus === "saved" && (
              <span className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 py-1">
                <CheckIcon className="w-4 h-4" />
                <span>Saved successfully!</span>
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                executeSave(false);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border-subtle bg-canvas px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-raised hover:border-border-strong active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
            >
              <span>Save Profile</span>
            </button>
            <button
              type="button"
              onClick={handleSaveAndExit}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-hover active:scale-[0.98] transition-all cursor-pointer"
            >
              <CheckIcon className="w-4 h-4" />
              <span>Save & Exit</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

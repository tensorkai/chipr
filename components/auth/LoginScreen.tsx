"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { ChiprBirdMascot } from "@/components/ui/ChiprBirdMascot";
import {
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  SunIcon,
  MoonIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CheckIcon,
} from "@/components/ui/Icons";
import { AUTHORIZED_USER } from "@/lib/auth";

export function LoginScreen() {
  const { login, darkMode, toggleDarkMode } = useFinance();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successAnimation, setSuccessAnimation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await login(email, password, rememberMe);
      if (!result.success) {
        setErrorMessage(
          result.error ||
            "Access denied. Chipr is currently restricted to Benedict Fusin."
        );
        setIsLoading(false);
      } else {
        setSuccessAnimation(true);
      }
    } catch {
      setErrorMessage("Unable to connect to authentication service.");
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail(AUTHORIZED_USER.email);
    setPassword(AUTHORIZED_USER.password);
    setErrorMessage(null);
  };

  return (
    <div className="login-layout">
      {/* Top Controls: Theme Switcher */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          type="button"
          onClick={toggleDarkMode}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-surface text-text-secondary hover:text-text-primary hover:bg-raised transition-colors cursor-pointer shadow-2xs"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          {darkMode ? (
            <SunIcon className="w-4 h-4 text-amber-400" />
          ) : (
            <MoonIcon className="w-4 h-4" />
          )}
        </button>
      </div>

      <section className="login-story" aria-label="About Chipr">
        <div className="login-wordmark">chipr<span>.</span></div>
        <div className="login-story-content">
          <p className="eyebrow">PERSONAL CLARITY. BUSINESS CONFIDENCE.</p>
          <h2>A little clarity.<br />A bigger picture.</h2>
          <p>Your everyday spending and everything you’re building. One thoughtful place to see it all.</p>
          <div className="login-ledger" aria-hidden="true">
            <div><span>01</span><strong>Know where you stand</strong><span>↗</span></div>
            <div><span>02</span><strong>Make room for what’s next</strong><span>↗</span></div>
            <div><span>03</span><strong>Keep your worlds in balance</strong><span>↗</span></div>
          </div>
        </div>
        <p className="login-story-footer">Personal & business finance, thoughtfully connected.</p>
      </section>
      {/* Main Login Card */}
      <div className="login-form-panel w-full max-w-md">
        <div className="relative rounded-3xl border border-border-subtle bg-surface p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative">
              <ChiprBirdMascot size="lg" mood={successAnimation ? "celebrate" : password && !showPassword ? "privacy" : "wave"} withSparkles={false} />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/80 dark:bg-indigo-950/40 px-3 py-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 shadow-2xs">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Your private workspace</span>
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-text-primary">
                Chipr
              </h1>
              <p className="text-xs text-text-muted mt-1">
                Sign in to pick up where you left off.
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 p-3.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in zoom-in-95 duration-150">
              <p className="font-semibold">{errorMessage}</p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                Please check your credentials or tap &ldquo;Fill My Credentials&rdquo;.
              </p>
            </div>
          )}

          {/* Success Banner */}
          {successAnimation && (
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 p-3.5 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-150">
              <CheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">
                Welcome back. Opening your workspace...
              </span>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-text-secondary">
                Email Address
              </label>
              <input
                type="email"
                required
                autoFocus
                autoComplete="email"
                autoCapitalize="none"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2.5 text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all font-mono"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-text-secondary">
                  Password
                </label>
                <span className="text-[10px] text-text-muted">Case-sensitive</span>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer p-1"

                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border-subtle text-brand focus:ring-brand h-4 w-4 cursor-pointer"
                />
                <span className="text-xs text-text-secondary font-medium">
                  Remember this device
                </span>
              </label>

              <span className="text-[11px] font-mono text-text-muted">
                Multi-device sync
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || successAnimation || !email || !password}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-brand-hover active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <LockClosedIcon className="w-4 h-4" />
                  <span>Sign In to Chipr</span>
                </>
              )}
            </button>
          </form>

          {/* One-Click Exclusive Quick-Fill for Benedict */}
          <div className="pt-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={handleQuickFill}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border-subtle bg-canvas/60 py-2.5 px-3 text-xs font-semibold text-text-secondary hover:text-brand hover:border-brand/40 hover:bg-raised transition-all cursor-pointer"
            >
              <SparklesIcon className="w-3.5 h-3.5 text-brand" />
              <span>Fill My Credentials (Benedict Fusin)</span>
            </button>
            <p className="text-[10px] text-center text-text-muted mt-2">
              Exclusive single-tenant workspace for Benedict Fusin. Access is restricted to predefined credentials.
            </p>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-text-muted">
          <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500" />
          <span>Separate accounts. Clear records. • Connected workspace</span>
        </div>
      </div>
    </div>
  );
}

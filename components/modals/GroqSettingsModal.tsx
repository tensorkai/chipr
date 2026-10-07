"use client";

import React, { useState, useEffect } from "react";
import { AVAILABLE_GROQ_MODELS } from "@/lib/groq-models";
import {
  SparklesIcon,
  CheckIcon,
  ShieldCheckIcon,
  ZapIcon,
  LockClosedIcon,
} from "@/components/ui/Icons";

interface GroqSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export function GroqSettingsModal({
  isOpen,
  onClose,
  selectedModel,
  onSelectModel,
}: GroqSettingsModalProps) {
  const [testingStatus, setTestingStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [testErrorMessage, setTestErrorMessage] = useState("");
  const [saveConfirmation, setSaveConfirmation] = useState(false);
  const [isConfiguredOnServer, setIsConfiguredOnServer] = useState(true);

  // Fetch server status on modal open
  useEffect(() => {
    if (isOpen) {
      setTestingStatus("idle");
      setTestErrorMessage("");
      fetch("/api/chat/settings")
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setIsConfiguredOnServer(Boolean(data.isConfigured));
            if (data.model && data.model !== selectedModel) {
              onSelectModel(data.model);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Test server connection to Groq API
  const handleTestConnection = async () => {
    setTestingStatus("testing");
    setTestErrorMessage("");

    try {
      const res = await fetch("/api/chat/verify", {
        method: "POST",
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        setTestingStatus("success");
      } else {
        setTestingStatus("error");
        setTestErrorMessage(
          data.message || "Unable to authenticate with Groq API."
        );
      }
    } catch {
      setTestingStatus("error");
      setTestErrorMessage("Network error connecting to server verification.");
    }
  };

  // Save selected model globally to server SQLite database
  const handleSave = async () => {
    try {
      await fetch("/api/chat/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: selectedModel }),
      });

      setSaveConfirmation(true);
      setTimeout(() => {
        setSaveConfirmation(false);
        onClose();
      }, 600);
    } catch {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="groq-settings-title"
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-border-subtle bg-surface shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand to-indigo-600 text-white shadow-xs">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="groq-settings-title"
                className="text-base font-extrabold text-text-primary tracking-tight"
              >
                Groq AI Engine & Model Settings
              </h3>
              <p className="text-xs text-text-muted">
                Server-side inference automatically synchronized across all your devices
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-raised hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Server Status Banner */}
          {isConfiguredOnServer ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/80 dark:bg-emerald-950/40 p-3.5 text-xs text-emerald-800 dark:text-emerald-200 shadow-2xs">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Zero-Configuration Multi-Device Mode Active</p>
                <p className="text-caption text-emerald-700 dark:text-emerald-300 mt-0.5 leading-relaxed">
                  Groq AI inference runs directly through your server environment (<code className="font-mono font-semibold">GROQ_API_KEY</code>). You do not need to configure or input any API keys on any phone, tablet, or secondary device.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/80 dark:bg-amber-950/40 p-3.5 text-xs text-amber-800 dark:text-amber-200 shadow-2xs">
              <span className="text-amber-600 font-bold shrink-0 mt-0.5">⚠️</span>
              <div>
                <p className="font-bold">Server Environment Configuration Missing</p>
                <p className="text-caption text-amber-700 dark:text-amber-300 mt-0.5 leading-relaxed">
                  Please specify <code className="font-mono font-semibold">GROQ_API_KEY</code> and <code className="font-mono font-semibold">GROQ_MODEL</code> in your server&apos;s <code className="font-mono font-semibold">.env.local</code> file.
                </p>
              </div>
            </div>
          )}

          {/* Model Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-text-primary">
                Active Inference Model
              </label>
              <span className="text-caption text-text-muted font-medium">
                Groq Ultra-Fast LPU Platform
              </span>
            </div>

            <div className="space-y-2">
              {AVAILABLE_GROQ_MODELS.map((model) => {
                const isSelected = selectedModel === model.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => onSelectModel(model.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-brand bg-brand/5 dark:bg-brand/10 shadow-xs ring-1 ring-brand/30"
                        : "border-border-subtle bg-canvas hover:border-border-strong hover:bg-raised/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="groq-model"
                          checked={isSelected}
                          onChange={() => onSelectModel(model.id)}
                          className="text-brand focus:ring-brand cursor-pointer"
                        />
                        <span className="text-xs font-bold text-text-primary">
                          {model.name}
                        </span>
                        {model.recommended && (
                          <span className="rounded-md bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.2 text-caption font-bold text-emerald-700 dark:text-emerald-300">
                            Recommended
                          </span>
                        )}
                      </div>
                      <span className="text-caption font-mono text-text-muted">
                        {(model.contextWindow / 1000).toFixed(0)}k context
                      </span>
                    </div>
                    <p className="text-caption text-text-muted mt-1 pl-5">
                      {model.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Server Connection Test */}
          <div className="pt-2 border-t border-border-subtle">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingStatus === "testing"}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-canvas px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-raised transition-colors cursor-pointer disabled:opacity-50"
              >
                {testingStatus === "testing" ? (
                  <>
                    <div className="w-3 h-3 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                    <span>Testing Server Connection...</span>
                  </>
                ) : (
                  <>
                    <ZapIcon className="w-3.5 h-3.5 text-amber-500" />
                    <span>Test Server Groq Connection</span>
                  </>
                )}
              </button>

              {testingStatus === "success" && (
                <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in">
                  <CheckIcon className="w-4 h-4" />
                  <span>Connection Verified!</span>
                </div>
              )}

              {testingStatus === "error" && (
                <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {testErrorMessage}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <LockClosedIcon className="w-3.5 h-3.5 text-brand" />
            <span className="text-caption">Synchronized across all devices</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3.5 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-raised transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-hover active:scale-[0.98] transition-all cursor-pointer"
            >
              {saveConfirmation ? (
                <>
                  <CheckIcon className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Apply Selection</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

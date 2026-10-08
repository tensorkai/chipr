"use client";

import React, { useState, useRef, useEffect } from "react";
import { useFinance } from "@/context/FinanceContext";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { LogoMark, CreditPlusIcon } from "@/components/ui/Icons";

interface DebitCardMockupProps {
  className?: string;
  variant?: "full" | "compact";
}

export function DebitCardMockup({
  className = "",
  variant = "full",
}: DebitCardMockupProps) {
  const { settings, accounts, workspace, privacyMask, openAddCreditModal } = useFinance();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });

  // Dynamic calendar date (Month/Day: updates per day proportional to calendar)
  const [currentDateFormatted, setCurrentDateFormatted] = useState("09/20");

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      setCurrentDateFormatted(`${mm}/${dd}`);
    };
    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  const cardContainerRef = useRef<HTMLDivElement>(null);

  const businessName = (
    (workspace === "business" ? settings.businessName : settings.personalName) || "CHIPR"
  ).toUpperCase();
  const cardholderName = (
    settings.personalName || "BENEDICT FUSIN"
  ).toUpperCase();
  const cardBalance = accounts
    .filter(account => account.entity === workspace && account.currency === settings.currency && (account.type === "checking" || account.type === "savings"))
    .reduce((sum, account) => sum + Math.round(account.balance * 100), 0) / 100;
  const cardNumberFormatted = "2024-12024-MN-0";

  // Dynamic 3D interactive tilt & specular light calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardContainerRef.current) return;
    const rect = cardContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY, glareX, glareY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  };

  const handleCopyCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(cardNumberFormatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`w-full max-w-[430px] mx-auto space-y-4 ${className}`}>
      {/* 3D Perspective Card Viewport */}
      <div
        ref={cardContainerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsFlipped((prev) => !prev)}
        className="relative w-full aspect-[1.586/1] cursor-pointer select-none group"
        style={{ perspective: "1400px" }}
        title="Click to flip card"
      >
        {/* Dynamic Multi-Spectral Ambient Aura (Deep Sapphire & Electric Cyan Glow) */}
        <div
          className="absolute -inset-3 rounded-[32px] bg-gradient-to-tr from-blue-700/40 via-cyan-500/30 to-indigo-700/40 blur-2xl opacity-60 group-hover:opacity-100 transition-all duration-500 pointer-events-none"
          style={{
            transform: `translate(${tilt.y * 1.8}px, ${-tilt.x * 1.8}px)`,
          }}
        />

        {/* 3D Rotating Titanium Card Slab */}
        <div
          className={`relative w-full h-full rounded-[24px] transition-all duration-500 ease-out [transform-style:preserve-3d] shadow-[0_25px_60px_-15px_rgba(2,8,28,0.85),0_0_0_1px_rgba(56,189,248,0.25)] ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
          style={{
            transform: isFlipped
              ? "rotateY(180deg)"
              : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          }}
        >
          {/* ========================================================================= */}
          {/* FRONT OF CARD: Enterprise-Grade Sapphire Titanium Masterpiece            */}
          {/* ========================================================================= */}
          <div className="absolute inset-0 w-full h-full rounded-[24px] p-5 sm:p-6 flex flex-col justify-between overflow-hidden [backface-visibility:hidden] bg-[#050f26] text-white">
            {/* 1. Deep Multi-Layered Royal Sapphire Mesh Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#061a40] via-[#0b2b6b] to-[#030919] opacity-95" />

            {/* 2. Physical Brushed Metal Substrate Texture */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 4px)",
              }}
            />

            {/* 3. Swiss Banknote / Topographical Laser-Etched Guilloche Contours */}
            <svg
              className="absolute inset-0 w-full h-full opacity-20 pointer-events-none mix-blend-screen"
              viewBox="0 0 400 252"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M-50 200 C 50 120, 150 280, 250 160 C 350 40, 420 180, 480 110"
                stroke="url(#guilloche-cyan)"
                strokeWidth="1.2"
                fill="none"
              />
              <path
                d="M-50 220 C 50 140, 150 300, 250 180 C 350 60, 420 200, 480 130"
                stroke="url(#guilloche-cyan)"
                strokeWidth="1"
                fill="none"
                strokeOpacity="0.8"
              />
              <path
                d="M-50 180 C 50 100, 150 260, 250 140 C 350 20, 420 160, 480 90"
                stroke="url(#guilloche-cyan)"
                strokeWidth="0.8"
                fill="none"
                strokeOpacity="0.6"
              />
              <path
                d="M-50 240 C 50 160, 150 320, 250 200 C 350 80, 420 220, 480 150"
                stroke="url(#guilloche-cyan)"
                strokeWidth="0.6"
                fill="none"
                strokeOpacity="0.4"
              />
              {/* Concentric Geometric Radar Watermark */}
              <circle cx="340" cy="80" r="90" stroke="url(#guilloche-cyan)" strokeWidth="0.6" strokeDasharray="3 3" />
              <circle cx="340" cy="80" r="130" stroke="url(#guilloche-cyan)" strokeWidth="0.4" strokeDasharray="4 6" />
              <circle cx="340" cy="80" r="170" stroke="url(#guilloche-cyan)" strokeWidth="0.3" />
              <defs>
                <linearGradient id="guilloche-cyan" x1="0" y1="0" x2="400" y2="252" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#38bdf8" />
                  <stop offset="0.5" stopColor="#60a5fa" />
                  <stop offset="1" stopColor="#818cf8" />
                </linearGradient>
              </defs>
            </svg>

            {/* 4. Dynamic Anisotropic Specular Glare Spotlight */}
            <div
              className="absolute inset-0 opacity-50 group-hover:opacity-85 transition-opacity duration-300 pointer-events-none mix-blend-color-dodge"
              style={{
                background: `radial-gradient(ellipse 65% 55% at ${tilt.glareX}% ${tilt.glareY}%, rgba(125,211,252,0.45) 0%, rgba(59,130,246,0.2) 40%, transparent 80%)`,
              }}
            />

            {/* 5. Physical CNC Chamfered Edge Highlight */}
            <div className="absolute inset-0 rounded-[24px] border border-white/20 pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(0,0,0,0.8)]" />

            {/* ======================= TOP ROW ======================= */}
            <div className="relative z-10 flex items-center justify-between">
              {/* Enterprise Brand Identity Lockup */}
              <div className="flex items-center gap-3">
                {/* Precision Glassmorphic Logo Shield */}
                <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-white/25 via-white/10 to-white/15 p-0.5 shadow-[0_4px_16px_rgba(0,0,0,0.5)] border border-white/35 backdrop-blur-md">
                  <div className="h-full w-full bg-slate-950/50 rounded-[14px] flex items-center justify-center overflow-hidden p-0.5">
                    <LogoMark className="w-7 h-7 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black tracking-[0.25em] uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-sans">
                      CHIPR
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[8px] font-mono font-bold tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30 shadow-xs">
                      PRO
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[8.5px] font-mono tracking-wider text-cyan-200/80 uppercase font-semibold">
                    <span>SAPPHIRE RESERVE</span>
                    <span className="text-cyan-400/60">•</span>
                    <span className="text-cyan-300/70 font-sans tracking-normal text-[8px]">CARD PREVIEW</span>
                  </div>
                </div>
              </div>

              {/* NFC Contactless Wave Symbol in Polished Titanium */}
              <div className="flex items-center justify-center text-cyan-300/90 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20 shadow-inner">
                <svg
                  className="w-4 h-4 -rotate-90"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                >
                  <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                  <path d="M12 19a8.5 8.5 0 0 1 0-14" />
                  <path d="M15.5 21.5a12 12 0 0 1 0-19" />
                </svg>
              </div>
            </div>

            {/* ======================= MIDDLE SECTION ======================= */}
            <div className="relative z-10 flex items-center justify-between my-auto pt-2">
              {/* Industrial Cryptographic EMV Microchip (Palladium & Gold Contact Pads) */}
              <div className="relative w-13 h-10 rounded-xl bg-gradient-to-br from-slate-200 via-slate-300 to-amber-200/90 p-[1.5px] shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_4px_10px_rgba(0,0,0,0.5)] border border-white/50 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-gradient-to-br from-slate-100 via-amber-100/60 to-slate-200 rounded-[10px] p-0.5 overflow-hidden">
                  <svg
                    className="w-full h-full text-slate-800/80"
                    viewBox="0 0 44 32"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  >
                    <rect x="1" y="1" width="42" height="30" rx="3" strokeWidth="0.8" />
                    <path d="M1 10h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H1" stroke="rgba(23,37,84,0.75)" />
                    <path d="M43 10H29a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14" stroke="rgba(23,37,84,0.75)" />
                    <line x1="17" y1="1" x2="17" y2="31" stroke="rgba(23,37,84,0.75)" />
                    <line x1="27" y1="1" x2="27" y2="31" stroke="rgba(23,37,84,0.75)" />
                    <circle cx="22" cy="16" r="4" fill="rgba(14,165,233,0.3)" stroke="rgba(23,37,84,0.85)" />
                  </svg>
                </div>
              </div>

              {/* Integrated Workspace cash Display with Embedded Top-Up Action */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  openAddCreditModal();
                }}
                className="text-right group/credit cursor-pointer rounded-2xl px-3.5 py-2 transition-all bg-white/[0.08] hover:bg-white/[0.16] active:scale-95 border border-white/20 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                title="Commercial Treasury Balance: Click to Top-Up"
              >
                <div className="flex items-center justify-end gap-1.5 mb-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[8px] font-mono uppercase tracking-widest text-cyan-200/90 font-bold">
                    Workspace cash
                  </span>
                  <span className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.2 text-[8px] font-bold text-emerald-300 bg-emerald-500/30 border border-emerald-400/40 group-hover/credit:bg-emerald-500/50 transition-colors">
                    <CreditPlusIcon className="w-2.5 h-2.5" />
                    <span>Top-Up</span>
                  </span>
                </div>
                <div className="text-white font-extrabold font-mono tracking-tight text-sm sm:text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  <MoneyAmount
                    amount={cardBalance}
                    currency={settings.currency}
                    size="sm"
                    privacyMask={privacyMask}
                    className="text-white font-bold tracking-tight"
                  />
                </div>
              </div>
            </div>

            {/* ======================= BOTTOM ROW ======================= */}
            <div className="relative z-10 space-y-2.5">
              {/* Embossed Metallic Laser-Cut Card Number */}
              <div className="flex items-center justify-between group/num">
                <div className="font-mono text-xs sm:text-sm font-bold tracking-[0.20em] sm:tracking-[0.24em] text-white/95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] [text-shadow:_0_1px_2px_rgba(0,0,0,0.9),_0_-1px_0_rgba(255,255,255,0.25)]">
                  {privacyMask ? "••••-•••••-••-0" : cardNumberFormatted}
                </div>
                <button
                  type="button"
                  onClick={handleCopyCard}
                  className="opacity-0 group-hover:opacity-100 px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 text-white text-[9px] font-mono transition-all cursor-pointer shadow-xs"
                  title="Copy card number"
                >
                  {copied ? "COPIED!" : "COPY"}
                </button>
              </div>

              {/* Cardholder Signature Name (Top) & Entity (Sub-line) + Expiry & Hologram */}
              <div className="flex items-end justify-between text-[10px] pt-1.5 border-t border-white/15">
                <div className="min-w-0 pr-2">
                  <span className="text-[7.5px] uppercase tracking-widest text-cyan-200/60 block font-mono font-bold">
                    Account Owner / Signatory
                  </span>
                  <span className="font-black tracking-wider truncate block text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] text-xs sm:text-sm font-sans">
                    {cardholderName}
                  </span>
                  <span className="text-[9px] text-cyan-200/90 tracking-tight block truncate font-sans font-semibold mt-0.5">
                    {businessName}
                  </span>
                </div>

                <div className="flex items-center gap-3.5 shrink-0">
                  <div className="text-right font-mono">
                    <span className="text-[7.5px] uppercase tracking-wider text-cyan-200/60 block font-bold">
                      Expires
                    </span>
                    <span className="font-extrabold text-white tracking-wider text-xs drop-shadow-xs">
                      {currentDateFormatted}
                    </span>
                  </div>

                  {/* High-Security Iridescent Holographic Optical Variable Device (OVD) */}
                  <div className="relative flex items-center -space-x-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 opacity-90 shadow-[0_2px_8px_rgba(0,0,0,0.5)] border border-white/30" />
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 via-teal-300 to-sky-200 opacity-85 mix-blend-screen shadow-[0_2px_8px_rgba(0,0,0,0.5)] border border-white/30" />
                  </div>
                </div>
              </div>
            </div>

            {/* FROZEN / LOCKED CARD OVERLAY */}
            {isFrozen && (
              <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md rounded-[24px] flex flex-col items-center justify-center text-center p-4 animate-in fade-in duration-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 mb-2 shadow-[0_0_25px_rgba(6,182,212,0.4)] animate-pulse">
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <span className="text-xs font-black tracking-widest text-white uppercase drop-shadow-xs">
                  Card Frozen
                </span>
                <span className="text-[10px] text-cyan-200/80 mt-1 max-w-[220px]">
                  Commercial transactions and virtual card authorizations locked
                </span>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* BACK OF CARD: Ultra-Luxurious Obsidian Titanium Reverse Side              */}
          {/* ========================================================================= */}
          <div className="absolute inset-0 w-full h-full rounded-[24px] flex flex-col justify-between overflow-hidden [transform:rotateY(180deg)] [backface-visibility:hidden] bg-gradient-to-br from-[#030814] via-[#07132e] to-[#02050c] text-white">
            {/* High-Coercivity Magnetic Stripe with Hologram Security Thread */}
            <div className="w-full h-11 bg-gradient-to-r from-neutral-950 via-slate-950 to-neutral-950 mt-5 border-y border-white/10 shadow-inner flex items-center px-5">
              <div className="w-full h-2.5 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent rounded-full opacity-40" />
            </div>

            {/* Signature Panel & Security CVV */}
            <div className="px-6 space-y-1.5">
              <div className="flex items-center justify-between text-[8px] font-mono text-cyan-200/70 uppercase tracking-wider font-bold">
                <span>Authorized Signatory</span>
                <span>Security Token (CVV)</span>
              </div>
              <div className="flex items-center gap-3">
                {/* Security Guilloche Signature Strip */}
                <div
                  className="flex-1 h-9 bg-slate-100 rounded-lg text-slate-800 flex items-center px-3.5 font-mono text-[11px] italic shadow-inner border border-slate-300"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(45deg, #e2e8f0, #e2e8f0 6px, #f8fafc 6px, #f8fafc 12px)",
                  }}
                >
                  <span className="font-serif font-bold text-slate-800 select-none">
                    {cardholderName}
                  </span>
                </div>
                {/* 3-digit CVV box with privacy masking */}
                <div className="h-9 px-3.5 bg-white rounded-lg text-slate-950 font-mono font-black text-xs flex items-center justify-center tracking-widest shadow-md border border-white">
                  {privacyMask ? "•••" : "024"}
                </div>
              </div>
            </div>

            {/* Legal Fine Etching & Concierge Strip */}
            <div className="px-6 pb-5 space-y-1.5">
              <p className="text-[7.5px] leading-relaxed text-slate-400/90 font-mono">
                Chipr card design preview. This visual represents your workspace and is not an issued payment card.
              </p>
              <div className="flex items-center justify-between text-[8.5px] font-mono text-cyan-300/90 pt-1.5 border-t border-white/10">
                <span className="flex items-center gap-1.5 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  chipr.fi • 24/7 Enterprise Desk
                </span>
                <span className="text-white/60">Tap anywhere to flip</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Card Quick Action Bar */}
      <div className="flex items-center justify-between gap-2 px-1">
        {/* Top-Up / Add Credit */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openAddCreditModal();
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white transition-all cursor-pointer shadow-xs border border-emerald-500/80"
          title="Add credit or deposit funds"
        >
          <CreditPlusIcon className="w-3.5 h-3.5" />
          <span>Add Credit</span>
        </button>

        {/* Flip Card */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsFlipped((prev) => !prev);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-surface border border-border-subtle text-text-secondary hover:bg-raised hover:text-text-primary active:scale-[0.98] transition-all cursor-pointer shadow-xs"
          title="Flip card"
        >
          <svg
            className="w-3.5 h-3.5 transition-transform group-hover:rotate-180 duration-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.5 2v6h-6" />
            <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          <span>{isFlipped ? "Show Front" : "Card Details"}</span>
        </button>

        {/* Freeze / Lock Card */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsFrozen((prev) => !prev);
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs active:scale-[0.98] ${
            isFrozen
              ? "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800"
              : "bg-surface border-border-subtle text-text-secondary hover:bg-raised hover:text-text-primary"
          }`}
          title={isFrozen ? "Unlock card" : "Freeze card"}
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>{isFrozen ? "Unfreeze" : "Freeze"}</span>
        </button>
      </div>

      <p className="text-[10px] text-center text-text-muted font-mono tracking-tight opacity-75">
        Sapphire card preview
      </p>
    </div>
  );
}

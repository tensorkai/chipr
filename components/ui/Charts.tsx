"use client";

import React, { useState, useMemo } from "react";
import { Transaction } from "@/types/finance";
import { MoneyAmount } from "./MoneyAmount";

// -------------------------------------------------------------
// 1. Cash Flow Trend Line & Area Chart
// -------------------------------------------------------------
interface CashFlowTrendChartProps {
  transactions: Transaction[];
  privacyMask?: boolean;
  className?: string;
  currency?: string;
}

export function CashFlowTrendChart({
  transactions,
  privacyMask = false,
  currency = "PHP",
  className = "",
}: CashFlowTrendChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<"30d" | "90d" | "all">("30d");

  // Aggregate daily points
  const points = useMemo(() => {
    if (transactions.length === 0) return [];

    const sorted = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Group by date
    const map = new Map<string, { inflow: number; outflow: number; net: number }>();
    sorted.forEach((t) => {
      const entry = map.get(t.date) || { inflow: 0, outflow: 0, net: 0 };
      if (t.amount > 0) {
        entry.inflow += t.amount;
      } else {
        entry.outflow += Math.abs(t.amount);
      }
      entry.net += t.amount;
      map.set(t.date, entry);
    });

    const entries = Array.from(map.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));

    if (timeRange !== "all") {
      const cutoff = new Date();
      cutoff.setHours(0, 0, 0, 0);
      cutoff.setDate(cutoff.getDate() - (timeRange === "30d" ? 29 : 89));
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return entries.filter(entry => {
        const date = new Date(`${entry.date}T12:00:00`);
        return date >= cutoff && date <= today;
      });
    }
    return entries;
  }, [transactions, timeRange]);

  const width = 600;
  const height = 180;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };

  const { maxVal, inflowPath, outflowPath, areaPath } = useMemo(() => {
    if (points.length === 0) {
      return { maxVal: 100, minVal: 0, inflowPath: "", outflowPath: "", areaPath: "" };
    }

    const allValues = points.flatMap((p) => [p.inflow, p.outflow]);
    const max = Math.max(...allValues, 100) * 1.15;
    const min = 0;

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const getX = (idx: number) =>
      padding.left + (idx / Math.max(points.length - 1, 1)) * chartW;
    const getY = (val: number) =>
      height - padding.bottom - (val / (max || 1)) * chartH;

    // Generate SVG path commands with smooth bezier
    const buildPath = (key: "inflow" | "outflow") => {
      return points.reduce((acc, curr, idx) => {
        const x = getX(idx);
        const y = getY(curr[key]);
        if (idx === 0) return `M ${x} ${y}`;

        const prevX = getX(idx - 1);
        const prevY = getY(points[idx - 1][key]);
        const cpX1 = prevX + (x - prevX) / 2;
        const cpX2 = prevX + (x - prevX) / 2;
        return `${acc} C ${cpX1} ${prevY}, ${cpX2} ${y}, ${x} ${y}`;
      }, "");
    };

    const inPath = buildPath("inflow");
    const outPath = buildPath("outflow");

    // Area path for inflow
    const firstX = getX(0);
    const lastX = getX(points.length - 1);
    const bottomY = height - padding.bottom;
    const aPath = `${inPath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;

    return { maxVal: max, minVal: min, inflowPath: inPath, outflowPath: outPath, areaPath: aPath };
  }, [points, padding.top, padding.right, padding.bottom, padding.left]);

  const formatAmount = (amount: number) => privacyMask ? "\u2022\u2022\u2022\u2022\u2022\u2022" : new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

  return (
    <div className={`rounded-2xl border border-border-subtle bg-surface p-4 sm:p-6 shadow-xs ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-4">
        <div>
          <h3 className="text-base font-semibold text-text-primary">Cash flow</h3>
          <p className="text-xs text-text-muted">The rhythm of your money, day by day.</p>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3">
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-inflow">
              <span className="h-2 w-2 rounded-full bg-inflow" />
              Inflows
            </span>
            <span className="flex items-center gap-1.5 text-outflow">
              <span className="h-2 w-2 rounded-full bg-outflow" />
              Outflows
            </span>
          </div>

          <div className="flex items-center rounded-xl border border-border-subtle bg-canvas p-0.5 text-xs">
            <button
              type="button"
              aria-pressed={timeRange === "30d"}
              onClick={() => { setTimeRange("30d"); setHoverIndex(null); }}
              className={`rounded-lg px-2 py-1 font-medium transition-colors cursor-pointer ${
                timeRange === "30d" ? "bg-surface font-bold text-text-primary shadow-xs" : "text-text-muted"
              }`}
            >
              30D
            </button>
            <button
              type="button"
              aria-pressed={timeRange === "90d"}
              onClick={() => { setTimeRange("90d"); setHoverIndex(null); }}
              className={`rounded-lg px-2 py-1 font-medium transition-colors cursor-pointer ${
                timeRange === "90d" ? "bg-surface font-bold text-text-primary shadow-xs" : "text-text-muted"
              }`}
            >
              90D
            </button>
            <button
              type="button"
              aria-pressed={timeRange === "all"}
              onClick={() => { setTimeRange("all"); setHoverIndex(null); }}
              className={`rounded-lg px-2 py-1 font-medium transition-colors cursor-pointer ${
                timeRange === "all" ? "bg-surface font-bold text-text-primary shadow-xs" : "text-text-muted"
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {points.length > 1 ? (
        <div className="relative mt-4">
          {/* Active tooltip badge on hover / touch */}
          {activePoint && (
            <div className="absolute top-1 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 sm:gap-4 rounded-xl border border-border-subtle bg-surface/95 px-3 py-1.5 text-caption sm:text-xs shadow-lg backdrop-blur-xs font-mono animate-in fade-in duration-100">
              <span className="font-semibold text-text-primary">{activePoint.date}</span>
              <span className="text-inflow">{formatAmount(activePoint.inflow)}</span>
              <span className="text-outflow">{formatAmount(-activePoint.outflow)}</span>
              <span className="text-text-muted font-normal hidden sm:inline">
                Net: {formatAmount(activePoint.net)}
              </span>
            </div>
          )}

          <svg
            role="img"
            aria-label="Daily money in and money out. Use the date selector below to inspect values."
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-40 sm:h-44 overflow-visible touch-none"
            onMouseLeave={() => setHoverIndex(null)}
            onTouchEnd={() => setHoverIndex(null)}
            onTouchMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const touch = e.touches[0];
              if (!touch) return;
              const touchX = touch.clientX - rect.left;
              const chartW = rect.width - (padding.left + padding.right);
              const ratio = Math.max(0, Math.min(1, (touchX - padding.left) / (chartW || 1)));
              const idx = Math.round(ratio * (points.length - 1));
              setHoverIndex(idx);
            }}
            onTouchStart={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const touch = e.touches[0];
              if (!touch) return;
              const touchX = touch.clientX - rect.left;
              const chartW = rect.width - (padding.left + padding.right);
              const ratio = Math.max(0, Math.min(1, (touchX - padding.left) / (chartW || 1)));
              const idx = Math.round(ratio * (points.length - 1));
              setHoverIndex(idx);
            }}
          >
            <defs>
              <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--money-inflow)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--money-inflow)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={width - padding.right}
              y2={padding.top}
              stroke="currentColor"
              strokeOpacity="0.06"
              strokeDasharray="3 3"
            />
            <line
              x1={padding.left}
              y1={height / 2}
              x2={width - padding.right}
              y2={height / 2}
              stroke="currentColor"
              strokeOpacity="0.06"
              strokeDasharray="3 3"
            />
            <line
              x1={padding.left}
              y1={height - padding.bottom}
              x2={width - padding.right}
              y2={height - padding.bottom}
              stroke="currentColor"
              strokeOpacity="0.12"
            />

            {/* Inflow Area Gradient */}
            <path d={areaPath} fill="url(#inflowGrad)" />

            {/* Outflow Line */}
            <path
              d={outflowPath}
              fill="none"
              stroke="var(--money-outflow)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />

            {/* Inflow Line */}
            <path
              d={inflowPath}
              fill="none"
              stroke="var(--money-inflow)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />

            {/* Interactive hover hit boxes */}
            {points.map((p, idx) => {
              const x = padding.left + (idx / Math.max(points.length - 1, 1)) * (width - padding.left - padding.right);
              const isHovered = hoverIndex === idx;

              return (
                <g key={idx}>
                  <rect
                    x={x - 12}
                    y={0}
                    width={24}
                    height={height}
                    fill="transparent"
                    className="cursor-crosshair"
                    onMouseEnter={() => setHoverIndex(idx)}
                  />
                  {isHovered && (
                    <>
                      <line
                        x1={x}
                        y1={padding.top}
                        x2={x}
                        y2={height - padding.bottom}
                        stroke="currentColor"
                        strokeOpacity="0.3"
                        strokeDasharray="2 2"
                      />
                      <circle
                        cx={x}
                        cy={height - padding.bottom - (p.inflow / (maxVal || 1)) * (height - padding.top - padding.bottom)}
                        r={4.5}
                        fill="var(--money-inflow)"
                        stroke="var(--bg-surface)"
                        strokeWidth={2}
                      />
                      <circle
                        cx={x}
                        cy={height - padding.bottom - (p.outflow / (maxVal || 1)) * (height - padding.top - padding.bottom)}
                        r={4}
                        fill="var(--money-outflow)"
                        stroke="var(--bg-surface)"
                        strokeWidth={2}
                      />
                    </>
                  )}
                </g>
              );
            })}
          </svg>

          <label className="chart-inspector">Inspect a day
            <select value={hoverIndex ?? ""} onChange={event => setHoverIndex(event.target.value === "" ? null : Number(event.target.value))}>
              <option value="">Choose a date</option>
              {points.map((point, index) => <option key={point.date} value={index}>{point.date}</option>)}
            </select>
          </label>
          {/* X Axis Labels */}
          <div className="flex justify-between px-8 pt-1 text-caption font-mono text-text-muted">
            <span>{points[0]?.date}</span>
            <span>{points[Math.floor(points.length / 2)]?.date}</span>
            <span>{points[points.length - 1]?.date}</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center text-xs text-text-muted">
          <p>Your cash flow takes shape here. Add transactions on two or more dates to see your trend.</p>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 2. Interactive Donut Chart for Expense Categories
// -------------------------------------------------------------
interface AllocationDonutChartProps {
  transactions: Transaction[];
  privacyMask?: boolean;
  className?: string;
}

const PALETTE = [
  "#4f46e5", // indigo
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ec4899", // pink
  "#8b5cf6", // purple
  "#64748b", // slate
];

export function AllocationDonutChart({
  transactions,
  privacyMask = false,
  className = "",
}: AllocationDonutChartProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Group outflows by category
  const categories = useMemo(() => {
    const expenses = transactions.filter((t) => t.amount < 0 && !t.isOwnerDraw);
    const map = new Map<string, number>();

    expenses.forEach((t) => {
      const cat = t.category || "General";
      map.set(cat, (map.get(cat) || 0) + Math.abs(t.amount));
    });

    const total = Array.from(map.values()).reduce((sum, v) => sum + v, 0);

    return Array.from(map.entries())
      .map(([name, amount], index) => ({
        name,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        color: PALETTE[index % PALETTE.length],
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [transactions]);

  const totalExpense = useMemo(
    () => categories.reduce((sum, c) => sum + c.amount, 0),
    [categories]
  );

  // SVG Donut calculation
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;



  return (
    <div className={`rounded-2xl border border-border-subtle bg-surface p-5 sm:p-6 shadow-sm ${className}`}>
      <div className="border-b border-border-subtle pb-3">
        <h3 className="text-base font-semibold text-text-primary">Expense Distribution</h3>
        <p className="text-xs text-text-muted">Outflow allocation by category</p>
      </div>

      {categories.length > 0 ? (
        <div className="mt-5 flex flex-col sm:flex-row items-center gap-6">
          {/* Donut Graphic */}
          <div className="relative shrink-0 flex items-center justify-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.08"
                strokeWidth={strokeWidth}
              />
              {categories.map((cat, index) => {
                const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -categories.slice(0, index).reduce((sum, category) => sum + category.percentage / 100 * circumference, 0);

                const isHovered = hoveredCategory === cat.name;

                return (
                  <circle
                    key={cat.name}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={cat.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredCategory(cat.name)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                );
              })}
            </svg>

            {/* Center Readout */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-caption text-text-muted uppercase font-mono">
                {hoveredCategory || "Total"}
              </span>
              <span className="text-xs font-bold font-mono text-text-primary">
                {hoveredCategory ? (
                  `${categories.find((c) => c.name === hoveredCategory)?.percentage.toFixed(1)}%`
                ) : (
                  <MoneyAmount amount={totalExpense} size="xs" privacyMask={privacyMask} />
                )}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 w-full space-y-2 text-xs">
            {categories.map((cat) => (
              <div
                key={cat.name}
                onMouseEnter={() => setHoveredCategory(cat.name)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer ${
                  hoveredCategory === cat.name ? "bg-raised font-semibold" : "hover:bg-canvas"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: cat.color }} />
                  <span className="truncate text-text-primary">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono shrink-0 ml-2">
                  <span className="text-text-muted">{cat.percentage.toFixed(0)}%</span>
                  <MoneyAmount amount={cat.amount} size="xs" privacyMask={privacyMask} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-text-muted">
          No categorized expenses recorded yet.
        </div>
      )}
    </div>
  );
}

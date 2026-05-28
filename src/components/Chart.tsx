"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useStore } from "@/global/store";
import { getSimulationResults } from "@/lib/smith-maneuver";
import { parseForm } from "@/lib/parseForm";

function formatCompact(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function formatDollars(n: number) {
  return n.toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  });
}

const START_YEAR = new Date().getFullYear();
const START_MONTH = new Date().getMonth();

function formatTick(month: number) {
  const d = new Date(START_YEAR, START_MONTH + month);
  const mo = d.toLocaleString("en-CA", { month: "short" });
  return `${mo} '${String(d.getFullYear()).slice(2)}`;
}

function formatMonthLabel(month: number) {
  const d = new Date(START_YEAR, START_MONTH + month);
  return d.toLocaleDateString("en-CA", { month: "short", year: "numeric" });
}

export function Chart() {
  const { form, maxStep } = useStore();
  const showCashPile = !form.reinvestRefunds;
  const results = useMemo(() => {
    const parsed = parseForm(form);
    return parsed ? getSimulationResults(parsed) : null;
  }, [form]);

  const chartData = useMemo(() => {
    if (!results) return null;
    const balance = parseFloat(form.mortgageBalance);
    const rate = parseFloat(form.mortgageRate) / 100 / 12;
    const totalMonths = parseInt(form.amortizationYears, 10) * 12;
    const snapshots = results.snapshots.slice(0, 121);
    const payment =
      balance > 0 && rate > 0 && totalMonths > 0
        ? (balance * rate * Math.pow(1 + rate, totalMonths)) /
          (Math.pow(1 + rate, totalMonths) - 1)
        : 0;
    let bal = balance;
    return snapshots.map((snap) => {
      const mortgageBalance = Math.max(bal, 0);
      const interest = bal * rate;
      bal -= payment - interest;
      return { ...snap, mortgageBalance };
    });
  }, [
    form.mortgageBalance,
    form.mortgageRate,
    form.amortizationYears,
    results,
  ]);

  if (!chartData) return null;

  const yearTicks = [0, 24, 48, 72, 96, 120];
  const final = chartData[chartData.length - 1];

  return (
    <div className="relative w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 4, right: 4, left: 8, bottom: 8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#d4d4d8"
            strokeOpacity={0.5}
          />
          <XAxis
            domain={[0, 120]}
            dataKey="month"
            ticks={yearTicks}
            tickFormatter={formatTick}
            tick={{ fontSize: 11, fill: "#71717a" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatCompact}
            tick={{ fontSize: 11, fill: "#71717a" }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip
            formatter={(value) =>
              typeof value === "number" ? formatDollars(value) : String(value)
            }
            labelFormatter={(m) => formatMonthLabel(m as number)}
            labelStyle={{ color: "#18181b", fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          {maxStep >= 1 && (
            <Line
              type="monotone"
              dataKey="mortgageBalance"
              name="Mortgage balance"
              stroke="#64748b"
              strokeWidth={2}
              dot={false}
            />
          )}
          {form.reinvestRefunds && maxStep >= 4 && (
            <Line
              type="monotone"
              dataKey="rrspBalance"
              name="RRSP"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="4 3"
              dot={false}
            />
          )}
          {maxStep >= 3 && (
            <Line
              type="monotone"
              dataKey="nonRegisteredBalance"
              name="Non-registered"
              stroke="#17831e"
              strokeWidth={2}
              strokeDasharray="4 3"
              dot={false}
            />
          )}
          {maxStep >= 2 && (
            <Line
              type="monotone"
              dataKey="helocBalance"
              name="HELOC balance"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="4 3"
              dot={false}
            />
          )}
          {showCashPile && maxStep >= 4 && (
            <Line
              type="monotone"
              dataKey="cashPileBalance"
              name="Cash pile"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="4 3"
              dot={false}
            />
          )}
          {maxStep >= 99 && (
            <Line
              type="monotone"
              dataKey="netEquity"
              name="Net Gain"
              stroke="#16a34a"
              strokeWidth={2}
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      <div className="absolute top-3 left-18 flex flex-col gap-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm px-3 py-2 shadow-sm pointer-events-none">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          10-yr net gain
        </p>
        <p
          className={`text-xl font-bold tabular-nums leading-none ${final.netEquity >= 0 ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
        >
          {formatDollars(final.netEquity)}
        </p>
      </div>
    </div>
  );
}

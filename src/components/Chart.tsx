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
  const { form } = useStore();
  const results = useMemo(() => {
    const parsed = parseForm(form);
    return parsed ? getSimulationResults(parsed) : null;
  }, [form]);

  if (!results) return null;

  const snapshots = results.snapshots.slice(0, 10 * 12 + 1);
  const yearTicks = [0, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120];
  const final = snapshots[snapshots.length - 1];

  return (
    <div className="relative w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={snapshots}
          margin={{ top: 4, right: 4, left: 8, bottom: 8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#d4d4d8"
            strokeOpacity={0.5}
          />
          <XAxis
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
          <Line
            type="monotone"
            dataKey="rrspBalance"
            name="RRSP"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="4 3"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="nonRegisteredBalance"
            name="Non-registered"
            stroke="#a855f7"
            strokeWidth={2}
            strokeDasharray="4 3"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="helocBalance"
            name="HELOC balance"
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="4 3"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="netEquity"
            name="Net Gain"
            stroke="#16a34a"
            strokeWidth={2}
            dot={false}
          />
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

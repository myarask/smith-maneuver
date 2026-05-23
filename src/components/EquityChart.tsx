"use client";

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { CapitalizingYearlySnapshot } from "@/lib/smith-maneuver";

type Props = { snapshots: CapitalizingYearlySnapshot[] };

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function formatDollars(n: number): string {
  return n.toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  });
}

const START_YEAR = new Date().getFullYear();
const START_MONTH = new Date().getMonth();

const YEAR_TICKS = [0, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120];

function formatTick(month: number): string {
  return String(START_YEAR + month / 12);
}

function formatMonthLabel(month: number): string {
  const d = new Date(START_YEAR, START_MONTH + month);
  return d.toLocaleDateString("en-CA", { month: "short", year: "numeric" });
}

export default function EquityChart({ snapshots }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={snapshots} margin={{ top: 4, right: 4, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d8" strokeOpacity={0.5} />
        <XAxis
          dataKey="month"
          ticks={YEAR_TICKS}
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
        />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Area
          type="linear"
          dataKey="cashPile"
          stackId="equity"
          name="Cash refunds"
          fill="#86efac"
          stroke="#86efac"
          fillOpacity={0.75}
        />
        <Area
          type="monotone"
          dataKey="marginAccountValue"
          stackId="equity"
          name="Margin account"
          fill="#16a34a"
          stroke="#16a34a"
          fillOpacity={0.75}
        />
        <Line
          type="monotone"
          dataKey="helocBalance"
          name="HELOC balance"
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

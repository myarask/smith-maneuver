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

export default function EquityChart({ snapshots }: Props) {
  return (
    <ResponsiveContainer width="100%" height={340}>
      <ComposedChart data={snapshots} margin={{ top: 4, right: 4, left: 8, bottom: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d8" strokeOpacity={0.5} />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 11, fill: "#71717a" }}
          axisLine={false}
          tickLine={false}
          label={{ value: "Year", position: "insideBottom", offset: -8, fontSize: 11, fill: "#71717a" }}
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
          labelFormatter={(label) => `Year ${label}`}
        />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Area
          type="monotone"
          dataKey="marginAccountValue"
          stackId="equity"
          name="Margin account"
          fill="#16a34a"
          stroke="#16a34a"
          fillOpacity={0.75}
        />
        <Area
          type="monotone"
          dataKey="rrspValue"
          stackId="equity"
          name="RRSP"
          fill="#86efac"
          stroke="#86efac"
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

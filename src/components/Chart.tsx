"use client";

import { useMemo } from "react";
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

  const totalMonths = results.snapshots.length - 1;
  const yearTicks = Array.from(
    { length: Math.floor(totalMonths / 12) + 1 },
    (_, i) => i * 12,
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={results.snapshots}
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
          dataKey="marginBalance"
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

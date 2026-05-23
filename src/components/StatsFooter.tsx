import { CapitalizingSmithManeuverResult } from "@/lib/smith-maneuver";

type Props = {
  results: CapitalizingSmithManeuverResult | null;
};

function formatDollars(n: number): string {
  return n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
}

type StatCardProps = {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
  accent?: string;
};

function StatCard({ label, value, sub, valueColor, accent }: StatCardProps) {
  return (
    <div className={`flex flex-col gap-1 rounded-xl border bg-white dark:bg-zinc-900 p-3 ${accent ?? "border-zinc-200 dark:border-zinc-800"}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className={`text-xl font-bold ${valueColor ?? "text-zinc-900 dark:text-zinc-50"}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-500 dark:text-zinc-400">{sub}</p>}
    </div>
  );
}

export default function StatsFooter({ results }: Props) {
  const isPositive = results ? results.netEquity >= 0 : null;

  return (
    <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-3 w-full max-w-6xl">
      <div className={`flex flex-col gap-1 rounded-xl border p-3 bg-white dark:bg-zinc-900 ${results ? (isPositive ? "border-green-300 dark:border-green-800" : "border-red-300 dark:border-red-800") : "border-zinc-200 dark:border-zinc-800"}`}>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Net equity</p>
        <p className={`text-2xl font-bold ${results ? (isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400") : "text-zinc-300 dark:text-zinc-700"}`}>
          {results ? formatDollars(results.netEquity) : "—"}
        </p>
        {results && <p className="text-xs text-zinc-500 dark:text-zinc-400">margin + cash − HELOC</p>}
      </div>
      <StatCard
        label="HELOC balance"
        value={results ? formatDollars(results.helocBalance) : "—"}
        sub={results ? "outstanding liability" : undefined}
        accent={results ? "border-red-300 dark:border-red-800" : undefined}
        valueColor={results ? "text-red-600 dark:text-red-400" : undefined}
      />
      <StatCard
        label="Margin account"
        value={results ? formatDollars(results.marginAccountValue) : "—"}
        sub={results ? "gross investment portfolio" : undefined}
        accent={results ? "border-green-200 dark:border-green-900" : undefined}
        valueColor={results ? "text-green-700 dark:text-green-400" : undefined}
      />
      <StatCard
        label="Cash refunds"
        value={results ? formatDollars(results.cashPile) : "—"}
        sub={results ? "CRA refunds accumulated in cash" : undefined}
        accent={results ? "border-green-200 dark:border-green-900" : undefined}
        valueColor={results ? "text-green-700 dark:text-green-400" : undefined}
      />
      <StatCard
        label="HELOC refunds"
        value={results ? formatDollars(results.cumulativeHelocRefund) : "—"}
        sub={results ? "interest deduction refunds received" : undefined}
        accent={results ? "border-blue-200 dark:border-blue-900" : undefined}
        valueColor={results ? "text-blue-700 dark:text-blue-400" : undefined}
      />
    </div>
  );
}

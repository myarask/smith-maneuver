import { CapitalizingSmithManeuverResult } from "@/lib/smith-maneuver";
import EquityChart from "./EquityChart";

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
};

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{value}</p>
      {sub && <p className="text-xs text-zinc-500 dark:text-zinc-400">{sub}</p>}
    </div>
  );
}

export default function ResultsSummary({ results }: Props) {
  if (!results) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Results</h2>
        <div className="flex items-center justify-center h-70 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">Enter valid values to see chart</p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <StatCard label="HELOC balance" value="—" />
          <StatCard label="Margin account" value="—" />
          <StatCard label="RRSP value" value="—" />
          <StatCard label="Net equity" value="—" />
        </div>
      </div>
    );
  }

  const { helocBalance, marginAccountValue, rrspValue, netEquity } = results;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Results</h2>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pt-4 pr-2">
        <EquityChart snapshots={results.yearlySnapshots} />
      </div>
      <div className="grid grid-cols-1 gap-3">
        <StatCard
          label="HELOC balance"
          value={formatDollars(helocBalance)}
          sub="outstanding liability"
        />
        <StatCard
          label="Margin account"
          value={formatDollars(marginAccountValue)}
          sub="gross investment portfolio"
        />
        <StatCard
          label="RRSP value"
          value={formatDollars(rrspValue)}
          sub="tax refunds compounded"
        />
        <StatCard
          label="Net equity"
          value={formatDollars(netEquity)}
          sub="margin + RRSP − HELOC"
        />
      </div>
    </div>
  );
}

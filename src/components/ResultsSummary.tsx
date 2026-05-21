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

export default function ResultsSummary({ results }: Props) {
  if (!results) {
    return (
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Simulation</h2>
          <div className="flex items-center justify-center h-70 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <p className="text-sm text-zinc-400 dark:text-zinc-500">Enter valid values to see chart</p>
          </div>
        </section>
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Stats</h2>
          <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Net equity</p>
            <p className="text-3xl font-bold text-zinc-300 dark:text-zinc-700">—</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="HELOC balance" value="—" />
            <StatCard label="Margin account" value="—" />
            <StatCard label="RRSP value" value="—" />
            <StatCard label="HELOC refunds" value="—" />
            <StatCard label="RRSP refunds" value="—" />
          </div>
        </section>
      </div>
    );
  }

  const { helocBalance, marginAccountValue, rrspValue, netEquity, cumulativeHelocRefund, cumulativeRrspRefund } = results;
  const isPositive = netEquity >= 0;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Simulation</h2>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pt-4 pr-2">
          <EquityChart snapshots={results.yearlySnapshots} />
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Stats</h2>
        <div className={`flex flex-col gap-1 rounded-xl border p-4 bg-white dark:bg-zinc-900 ${isPositive ? "border-green-300 dark:border-green-800" : "border-red-300 dark:border-red-800"}`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Net equity</p>
          <p className={`text-3xl font-bold ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {formatDollars(netEquity)}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">margin + RRSP − HELOC</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="HELOC balance"
            value={formatDollars(helocBalance)}
            sub="outstanding liability"
            accent="border-red-300 dark:border-red-800"
            valueColor="text-red-600 dark:text-red-400"
          />
          <StatCard
            label="Margin account"
            value={formatDollars(marginAccountValue)}
            sub="gross investment portfolio"
            accent="border-green-200 dark:border-green-900"
            valueColor="text-green-700 dark:text-green-400"
          />
          <StatCard
            label="RRSP value"
            value={formatDollars(rrspValue)}
            sub="both refund streams compounded"
            accent="border-green-200 dark:border-green-900"
            valueColor="text-green-700 dark:text-green-400"
          />
          <StatCard
            label="HELOC refunds"
            value={formatDollars(cumulativeHelocRefund)}
            sub="interest deduction refunds contributed"
            accent="border-blue-200 dark:border-blue-900"
            valueColor="text-blue-700 dark:text-blue-400"
          />
          <StatCard
            label="RRSP refunds"
            value={formatDollars(cumulativeRrspRefund)}
            sub="RRSP deduction refunds reinvested"
            accent="border-blue-200 dark:border-blue-900"
            valueColor="text-blue-700 dark:text-blue-400"
          />
        </div>
      </section>
    </div>
  );
}

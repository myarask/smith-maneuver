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
    <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{value}</p>
      {sub && <p className="text-xs text-zinc-500 dark:text-zinc-400">{sub}</p>}
    </div>
  );
}

const SIMULATION_DESCRIPTION =
  "Each year you draw new HELOC room — created by mortgage paydown and home appreciation — up to the Canadian readvanceable limit (the lesser of 65% of home value or 80% LTV combined). HELOC interest capitalizes onto the balance, and any remaining new room is invested in a margin account. The interest expense generates a tax refund that flows into your RRSP; that contribution itself produces a further refund, also reinvested — converging to a total annual RRSP contribution equal to the interest refund divided by (1 − your marginal tax rate).";

export default function ResultsSummary({ results }: Props) {
  if (!results) {
    return (
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Simulation</h2>
          <div className="flex items-center justify-center h-70 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <p className="text-sm text-zinc-400 dark:text-zinc-500">Enter valid values to see chart</p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{SIMULATION_DESCRIPTION}</p>
          </div>
        </section>
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Stats</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="HELOC balance" value="—" />
            <StatCard label="Margin account" value="—" />
            <StatCard label="RRSP value" value="—" />
            <StatCard label="HELOC refunds" value="—" />
            <StatCard label="RRSP refunds" value="—" />
            <StatCard label="Net equity" value="—" />
          </div>
        </section>
      </div>
    );
  }

  const { helocBalance, marginAccountValue, rrspValue, netEquity, cumulativeHelocRefund, cumulativeRrspRefund } = results;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Simulation</h2>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pt-4 pr-2">
          <EquityChart snapshots={results.yearlySnapshots} />
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{SIMULATION_DESCRIPTION}</p>
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Stats</h2>
        <div className="grid grid-cols-2 gap-3">
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
            sub="both refund streams compounded"
          />
          <StatCard
            label="HELOC refunds"
            value={formatDollars(cumulativeHelocRefund)}
            sub="interest deduction refunds contributed"
          />
          <StatCard
            label="RRSP refunds"
            value={formatDollars(cumulativeRrspRefund)}
            sub="RRSP deduction refunds reinvested"
          />
          <StatCard
            label="Net equity"
            value={formatDollars(netEquity)}
            sub="margin + RRSP − HELOC"
          />
        </div>
      </section>
    </div>
  );
}

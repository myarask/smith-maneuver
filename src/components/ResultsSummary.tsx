import { SmithManeuverResult } from "@/lib/smith-maneuver";

type Props = {
  results: SmithManeuverResult;
};

function formatDollars(n: number): string {
  return n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
}

function formatMonths(months: number): string {
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years} yr`;
  return `${years} yr ${rem} mo`;
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
  const { portfolioValue, totalTaxSavings, monthsToPayoff, baselineMonthsToPayoff } = results;
  const monthsSaved = Math.max(baselineMonthsToPayoff - monthsToPayoff, 0);

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Results</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Final portfolio"
          value={formatDollars(portfolioValue)}
          sub={`at payoff (${formatMonths(monthsToPayoff)})`}
        />
        <StatCard
          label="Total tax refunds"
          value={formatDollars(totalTaxSavings)}
          sub="applied to mortgage"
        />
        <StatCard
          label="Time saved"
          value={formatMonths(monthsSaved)}
          sub={`vs. ${formatMonths(baselineMonthsToPayoff)} baseline`}
        />
      </div>
    </div>
  );
}

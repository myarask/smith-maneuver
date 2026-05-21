import { CapitalizingSmithManeuverResult } from "@/lib/smith-maneuver";
import EquityChart from "./EquityChart";

type Props = {
  results: CapitalizingSmithManeuverResult | null;
};

export default function ResultsSummary({ results }: Props) {
  if (!results) {
    return (
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Simulation</h2>
        <div className="flex items-center justify-center h-70 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">Enter valid values to see chart</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Simulation</h2>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pt-4 pr-2">
        <EquityChart snapshots={results.yearlySnapshots} />
      </div>
    </section>
  );
}

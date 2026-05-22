import { CapitalizingSmithManeuverResult } from "@/lib/smith-maneuver";
import EquityChart from "./EquityChart";

type Props = {
  results: CapitalizingSmithManeuverResult | null;
};

export default function ResultsSummary({ results }: Props) {
  if (!results) {
    return <div className="h-full w-full" />;
  }

  return (
    <div className="h-full w-full">
      <EquityChart snapshots={results.yearlySnapshots} />
    </div>
  );
}

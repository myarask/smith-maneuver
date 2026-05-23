"use client";

import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import { getSimulationResults } from "@/lib/smith-maneuver";
import { parseForm } from "@/lib/parseForm";
import EquityChart from "./EquityChart";

export default function ResultsSummary() {
  const { form } = useStore();
  const results = useMemo(() => {
    const parsed = parseForm(form);
    return parsed ? getSimulationResults(parsed) : null;
  }, [form]);

  if (!results) return <div className="h-full w-full" />;

  return (
    <div className="h-full w-full">
      <EquityChart snapshots={results.snapshots} />
    </div>
  );
}

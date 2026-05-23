"use client";

import { useMemo, useEffect } from "react";
import { useStore } from "@/store/useStore";
import CalculatorForm from "@/components/CalculatorForm";
import ResultsSummary from "@/components/ResultsSummary";
import { getSimulationResults } from "@/lib/smith-maneuver";
import { parseForm } from "@/lib/parseForm";

export default function Home() {
  const { form, setField } = useStore();

  useEffect(() => {
    fetch(
      "https://www.bankofcanada.ca/valet/observations/V122667806/json?recent=1",
    )
      .then((r) => r.json())
      .then((data) => {
        const obs = data?.observations?.[0];
        const rate = parseFloat(obs?.V122667806?.v);
        if (!isNaN(rate)) {
          setField("interestRate", (rate + 1).toFixed(1));
        }
      })
      .catch(() => {});
  }, [setField]);

  const results = useMemo(() => {
    const parsed = parseForm(form);
    return parsed ? getSimulationResults(parsed) : null;
  }, [form]);

  return (
    <main className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="w-96 flex-none flex flex-col justify-center border-r border-zinc-200 dark:border-zinc-800 p-4 overflow-y-auto">
        <CalculatorForm />
      </div>
      <div className="flex-1 min-w-0 h-full">
        <ResultsSummary results={results} />
      </div>
    </main>
  );
}

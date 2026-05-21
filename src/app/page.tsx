"use client";

import { useState } from "react";
import CalculatorForm from "@/components/CalculatorForm";
import ResultsSummary from "@/components/ResultsSummary";
import { SmithManeuverResult } from "@/lib/smith-maneuver";

export default function Home() {
  const [results, setResults] = useState<SmithManeuverResult | null>(null);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-zinc-50 dark:bg-zinc-950 px-4 py-16 gap-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Smith Maneuver
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Estimate the lifetime value of converting your mortgage into a tax-deductible investment loan.
        </p>
      </div>
      <CalculatorForm onResults={setResults} />
      {results && <ResultsSummary results={results} />}
    </main>
  );
}

"use client";

import { useState, useMemo } from "react";
import CalculatorForm from "@/components/CalculatorForm";
import ResultsSummary from "@/components/ResultsSummary";
import {
  calculateSmithManeuver,
  SmithManeuverInputs,
} from "@/lib/smith-maneuver";

export type FormState = {
  homeValue: string;
  mortgageBalance: string;
  mortgageRate: string;
  amortizationYears: string;
  helocRate: string;
  investmentReturn: string;
  marginalTaxRate: string;
};

const DEFAULTS: FormState = {
  homeValue: "700000",
  mortgageBalance: "500000",
  mortgageRate: "5.5",
  amortizationYears: "25",
  helocRate: "7.2",
  investmentReturn: "10.0",
  marginalTaxRate: "43.0",
};

function parseForm(form: FormState): SmithManeuverInputs | null {
  const mortgageBalance = parseFloat(form.mortgageBalance);
  const mortgageRate = parseFloat(form.mortgageRate) / 100;
  const amortizationYears = parseFloat(form.amortizationYears);
  const helocRate = parseFloat(form.helocRate) / 100;
  const investmentReturn = parseFloat(form.investmentReturn) / 100;
  const marginalTaxRate = parseFloat(form.marginalTaxRate) / 100;

  if (
    isNaN(mortgageBalance) ||
    mortgageBalance <= 0 ||
    isNaN(mortgageRate) ||
    mortgageRate <= 0 ||
    mortgageRate >= 1 ||
    isNaN(amortizationYears) ||
    amortizationYears < 1 ||
    amortizationYears > 30 ||
    isNaN(helocRate) ||
    helocRate <= 0 ||
    helocRate >= 1 ||
    isNaN(investmentReturn) ||
    investmentReturn <= 0 ||
    investmentReturn >= 1 ||
    isNaN(marginalTaxRate) ||
    marginalTaxRate <= 0 ||
    marginalTaxRate >= 1
  ) {
    return null;
  }

  return {
    mortgageBalance,
    mortgageRate,
    amortizationYears,
    helocRate,
    investmentReturn,
    marginalTaxRate,
  };
}

export default function Home() {
  const [form, setForm] = useState<FormState>(DEFAULTS);

  const results = useMemo(() => {
    const parsed = parseForm(form);
    return parsed ? calculateSmithManeuver(parsed) : null;
  }, [form]);

  function handleChange(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-50 dark:bg-zinc-950 px-4 py-16 gap-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Smith Maneuver
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Estimate the lifetime value of converting your mortgage into a
          tax-deductible investment loan.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-8 w-full max-w-4xl items-start">
        <CalculatorForm form={form} onChange={handleChange} />
        <div className="sticky top-8">
          <ResultsSummary results={results} />
        </div>
      </div>
    </main>
  );
}

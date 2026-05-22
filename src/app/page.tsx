"use client";

import { useState, useMemo } from "react";
import CalculatorForm from "@/components/CalculatorForm";
import ResultsSummary from "@/components/ResultsSummary";
import StatsFooter from "@/components/StatsFooter";
import {
  calculateCapitalizingSmithManeuver,
  CapitalizingSmithManeuverInputs,
} from "@/lib/smith-maneuver";

export type FormState = {
  homeValue: string;
  appreciationRate: string;
  mortgageBalance: string;
  mortgageRate: string;
  amortizationYears: string;
  helocRate: string;
  investmentReturn: string;
  marginalTaxRate: string;
};

const DEFAULTS: FormState = {
  homeValue: "700000",
  appreciationRate: "3.0",
  mortgageBalance: "500000",
  mortgageRate: "5.5",
  amortizationYears: "25",
  helocRate: "7.2",
  investmentReturn: "8.0",
  marginalTaxRate: "43.0",
};

function parseForm(form: FormState): CapitalizingSmithManeuverInputs | null {
  const homeValue = parseFloat(form.homeValue);
  const appreciationRate = parseFloat(form.appreciationRate) / 100;
  const mortgageBalance = parseFloat(form.mortgageBalance);
  const mortgageRate = parseFloat(form.mortgageRate) / 100;
  const amortizationYears = parseFloat(form.amortizationYears);
  const helocRate = parseFloat(form.helocRate) / 100;
  const investmentReturn = parseFloat(form.investmentReturn) / 100;
  const marginalTaxRate = parseFloat(form.marginalTaxRate) / 100;
  if (
    isNaN(homeValue) ||
    homeValue <= 0 ||
    isNaN(appreciationRate) ||
    appreciationRate < 0 ||
    appreciationRate > 0.2 ||
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
    homeValue,
    appreciationRate,
    mortgageBalance,
    mortgageRate,
    amortizationYears,
    helocRate,
    investmentReturn,
    marginalTaxRate,
    years: 10,
  };
}

export default function Home() {
  const [form, setForm] = useState<FormState>(DEFAULTS);

  const results = useMemo(() => {
    const parsed = parseForm(form);
    return parsed ? calculateCapitalizingSmithManeuver(parsed) : null;
  }, [form]);

  function handleChange(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <main className="flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-950">
          <ResultsSummary results={results} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            <CalculatorForm form={form} onChange={handleChange} />
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center px-4 pb-16">
        <StatsFooter results={results} />
      </div>
    </main>
  );
}

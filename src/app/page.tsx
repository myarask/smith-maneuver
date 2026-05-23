"use client";

import { useState, useMemo, useEffect } from "react";
import CalculatorForm from "@/components/CalculatorForm";
import ResultsSummary from "@/components/ResultsSummary";
import { getSimulationResults, SimulationInputs } from "@/lib/smith-maneuver";

export type FormState = {
  homeValue: string;
  mortgageBalance: string;
  interestRate: string;
  investmentReturn: string;
  marginalTaxRate: string;
};

export const DEFAULTS: FormState = {
  homeValue: "700000",
  mortgageBalance: "500000",
  interestRate: "5.0",
  investmentReturn: "8.0",
  marginalTaxRate: "43.0",
};

function parseForm(form: FormState): SimulationInputs | null {
  const homeValue = parseFloat(form.homeValue);
  const mortgageBalance = parseFloat(form.mortgageBalance);
  const interestRate = parseFloat(form.interestRate) / 100;
  const investmentReturn = parseFloat(form.investmentReturn) / 100;
  const marginalTaxRate = parseFloat(form.marginalTaxRate) / 100;
  if (
    isNaN(homeValue) ||
    homeValue <= 0 ||
    isNaN(mortgageBalance) ||
    mortgageBalance <= 0 ||
    isNaN(interestRate) ||
    interestRate <= 0 ||
    interestRate >= 1 ||
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
    mortgageBalance,
    interestRate,
    investmentReturn,
    marginalTaxRate,
    years: 10,
  };
}

export default function Home() {
  const [form, setForm] = useState<FormState>(DEFAULTS);

  useEffect(() => {
    fetch(
      "https://www.bankofcanada.ca/valet/observations/V122667806/json?recent=1",
    )
      .then((r) => r.json())
      .then((data) => {
        const obs = data?.observations?.[0];
        let rate = parseFloat(obs?.V122667806?.v);
        if (!isNaN(rate)) {
          rate += 1;
          setForm((f) => ({ ...f, interestRate: rate.toFixed(1) }));
        }
      })
      .catch(() => {});
  }, []);

  const results = useMemo(() => {
    const parsed = parseForm(form);
    return parsed ? getSimulationResults(parsed) : null;
  }, [form]);

  function handleChange(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <main className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="w-96 flex-none flex flex-col justify-center border-r border-zinc-200 dark:border-zinc-800 p-4 overflow-y-auto">
        <CalculatorForm form={form} onChange={handleChange} />
      </div>
      <div className="flex-1 min-w-0 h-full">
        <ResultsSummary results={results} />
      </div>
    </main>
  );
}

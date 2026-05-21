"use client";

import { useState } from "react";
import { calculateSmithManeuver, SmithManeuverResult } from "@/lib/smith-maneuver";

type Props = {
  onResults: (results: SmithManeuverResult) => void;
};

type FormState = {
  mortgageBalance: string;
  mortgageRate: string;
  amortizationYears: string;
  helocRate: string;
  investmentReturn: string;
  marginalTaxRate: string;
};

const initialForm: FormState = {
  mortgageBalance: "",
  mortgageRate: "",
  amortizationYears: "",
  helocRate: "",
  investmentReturn: "",
  marginalTaxRate: "",
};

export default function CalculatorForm({ onResults }: Props) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  function validate(): boolean {
    const next: Partial<FormState> = {};
    const { mortgageBalance, mortgageRate, amortizationYears, helocRate, investmentReturn, marginalTaxRate } = form;

    if (!mortgageBalance || Number(mortgageBalance) <= 0) next.mortgageBalance = "Enter a positive amount";
    if (!mortgageRate || Number(mortgageRate) <= 0 || Number(mortgageRate) >= 100) next.mortgageRate = "Enter a rate between 0 and 100";
    if (!amortizationYears || Number(amortizationYears) < 1 || Number(amortizationYears) > 30) next.amortizationYears = "Enter 1–30 years";
    if (!helocRate || Number(helocRate) <= 0 || Number(helocRate) >= 100) next.helocRate = "Enter a rate between 0 and 100";
    if (!investmentReturn || Number(investmentReturn) <= 0 || Number(investmentReturn) >= 100) next.investmentReturn = "Enter a rate between 0 and 100";
    if (!marginalTaxRate || Number(marginalTaxRate) <= 0 || Number(marginalTaxRate) >= 100) next.marginalTaxRate = "Enter a rate between 0 and 100";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const results = calculateSmithManeuver({
      mortgageBalance: Number(form.mortgageBalance),
      mortgageRate: Number(form.mortgageRate) / 100,
      amortizationYears: Number(form.amortizationYears),
      helocRate: Number(form.helocRate) / 100,
      investmentReturn: Number(form.investmentReturn) / 100,
      marginalTaxRate: Number(form.marginalTaxRate) / 100,
    });

    onResults(results);
  }

  function field(
    key: keyof FormState,
    label: string,
    prefix?: string,
    suffix?: string,
    placeholder?: string,
    step = "0.01"
  ) {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
        <div className="flex items-center rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-zinc-500">
          {prefix && <span className="px-3 text-zinc-500 text-sm select-none">{prefix}</span>}
          <input
            type="number"
            step={step}
            min="0"
            placeholder={placeholder}
            value={form[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className="flex-1 py-2 px-3 bg-transparent text-zinc-900 dark:text-zinc-50 outline-none text-sm"
          />
          {suffix && <span className="px-3 text-zinc-500 text-sm select-none">{suffix}</span>}
        </div>
        {errors[key] && <p className="text-xs text-red-500">{errors[key]}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full max-w-md">
      {field("mortgageBalance", "Mortgage balance", "$", undefined, "400000", "1")}
      {field("mortgageRate", "Mortgage interest rate", undefined, "%", "5.5")}
      {field("amortizationYears", "Amortization remaining", undefined, "years", "25", "1")}
      {field("helocRate", "HELOC interest rate", undefined, "%", "7.2")}
      {field("investmentReturn", "Expected annual return", undefined, "%", "7.0")}
      {field("marginalTaxRate", "Marginal tax rate", undefined, "%", "40")}
      <button
        type="submit"
        className="mt-2 rounded-md bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 py-2.5 text-sm font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
      >
        Calculate
      </button>
    </form>
  );
}

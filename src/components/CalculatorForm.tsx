"use client";

import { FormState } from "@/app/page";

type Props = {
  form: FormState;
  onChange: (key: keyof FormState, value: string) => void;
};

export default function CalculatorForm({ form, onChange }: Props) {
  function field(
    key: keyof FormState,
    label: string,
    prefix?: string,
    suffix?: string,
    placeholder?: string,
    step = "0.01",
  ) {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
        <div className="flex items-center rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-zinc-500">
          {prefix && (
            <span className="px-3 text-zinc-500 text-sm select-none">
              {prefix}
            </span>
          )}
          <input
            type="number"
            step={step}
            min="0"
            placeholder={placeholder}
            value={form[key]}
            onChange={(e) => onChange(key, e.target.value)}
            className="flex-1 py-2 px-3 bg-transparent text-zinc-900 dark:text-zinc-50 outline-none text-sm"
          />
          {suffix && (
            <span className="px-3 text-zinc-500 text-sm select-none">
              {suffix}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {field("homeValue", "Home appraised value", "$", undefined, "700000", "1")}
      {field("appreciationRate", "Home appreciation rate", undefined, "%", "3.0", "0.1")}
      {field("mortgageBalance", "Mortgage balance", "$", undefined, "500000", "1")}
      {field("mortgageRate", "Mortgage interest rate", undefined, "%", "5.5")}
      {field("amortizationYears", "Amortization remaining", undefined, "years", "25", "1")}
      {field("helocRate", "HELOC interest rate", undefined, "%", "7.2")}
      {field("investmentReturn", "Expected annual return", undefined, "%", "10.0")}
      {field("marginalTaxRate", "Marginal tax rate", undefined, "%", "43.0")}
      {field("timeHorizon", "Time horizon", undefined, "years", "25", "1")}
    </div>
  );
}

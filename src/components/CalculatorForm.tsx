"use client";

import { useState, Fragment } from "react";
import { FormState } from "@/app/page";

type Props = {
  form: FormState;
  onChange: (key: keyof FormState, value: string) => void;
};

const STEPS = [
  { title: "Property", subtitle: "Tell us about your home" },
  { title: "Mortgage", subtitle: "Your current mortgage details" },
  { title: "Investment & Tax", subtitle: "Expected returns and your tax rate" },
];

export default function CalculatorForm({ form, onChange }: Props) {
  const [step, setStep] = useState(0);

  function field(
    key: keyof FormState,
    label: string,
    prefix?: string,
    suffix?: string,
    placeholder?: string,
    fieldStep = "0.01",
    hint?: string,
  ) {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
        <div className="flex items-center rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-zinc-500">
          {prefix && <span className="px-3 text-zinc-500 text-sm select-none">{prefix}</span>}
          <input
            type="number"
            step={fieldStep}
            min="0"
            placeholder={placeholder}
            value={form[key]}
            onChange={(e) => onChange(key, e.target.value)}
            className="flex-1 py-2 px-3 bg-transparent text-zinc-900 dark:text-zinc-50 outline-none text-sm"
          />
          {suffix && <span className="px-3 text-zinc-500 text-sm select-none">{suffix}</span>}
        </div>
        {hint && <p className="text-xs text-zinc-400 dark:text-zinc-500">{hint}</p>}
      </div>
    );
  }

  function stepFields() {
    if (step === 0) return (
      <>
        {field("homeValue", "Home appraised value", "$", undefined, "700000", "1")}
        {field("appreciationRate", "Home appreciation rate", undefined, "%", "3.0", "0.1", "Typical: 2–5% annually")}
      </>
    );
    if (step === 1) return (
      <>
        {field("mortgageBalance", "Mortgage balance", "$", undefined, "500000", "1")}
        {field("mortgageRate", "Mortgage interest rate", undefined, "%", "5.5")}
        {field("amortizationYears", "Amortization remaining", undefined, "years", "25", "1")}
      </>
    );
    return (
      <>
        {field("helocRate", "HELOC interest rate", undefined, "%", "7.2", "0.01", "Usually prime + 0.5–1.5%")}
        {field("investmentReturn", "Expected annual return", undefined, "%", "10.0", "0.01", "Conservative: 6–8%, optimistic: 10–12%")}
        {field("marginalTaxRate", "Marginal tax rate", undefined, "%", "43.0", "0.01", "Your combined federal + provincial rate")}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
      <div className="flex items-center">
        {STEPS.map((_s, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <div className={`flex-1 h-px ${i <= step ? "bg-zinc-400 dark:bg-zinc-600" : "bg-zinc-200 dark:bg-zinc-800"}`} />
            )}
            <button
              onClick={() => setStep(i)}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                i === step
                  ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900"
                  : i < step
                  ? "bg-zinc-400 dark:bg-zinc-500 text-white dark:text-zinc-900"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500"
              }`}
            >
              {i + 1}
            </button>
          </Fragment>
        ))}
      </div>

      <div className="flex flex-col gap-0.5">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">Step {step + 1} of {STEPS.length}</p>
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{STEPS[step].title}</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{STEPS[step].subtitle}</p>
      </div>

      <div className="flex flex-col gap-4">{stepFields()}</div>

      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="text-sm font-medium text-zinc-500 dark:text-zinc-400 disabled:opacity-0 transition-opacity"
        >
          ← Back
        </button>
        {step < STEPS.length - 1 && (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="text-sm font-medium bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-4 py-1.5 rounded-md"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}

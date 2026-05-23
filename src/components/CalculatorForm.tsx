"use client";

import { Fragment } from "react";
import { useStore } from "@/store/useStore";
import { DEFAULTS } from "@/global/constants";
import { FormState } from "@/global/types";

const STEPS = [
  { title: "The Smith Maneuver" },
  { title: "Investment Returns" },
  { title: "Borrowing Costs" },
  { title: "Sizing" },
];

const SCENARIOS = [
  {
    label: "Outperform",
    description: "Beating a broad market index",
    return: "12.0",
  },
  {
    label: "Average",
    description: "Typical diversified portfolio",
    return: "8.0",
  },
  {
    label: "Underperform",
    description: "Below-market or weak conditions",
    return: "5.0",
  },
];

function BackButton() {
  const { step, handleBack } = useStore();

  return (
    <button
      onClick={handleBack}
      disabled={step === 0}
      className="text-sm font-medium text-zinc-500 dark:text-zinc-400 disabled:opacity-0 transition-opacity"
    >
      ← Back
    </button>
  );
}

function NextButton() {
  const { step, handleNext } = useStore();
  if (step >= STEPS.length - 1) return null;

  return (
    <button
      onClick={handleNext}
      className="text-sm font-medium bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-4 py-1.5 rounded-md"
    >
      {step === 0 ? "Show me" : "Next →"}
    </button>
  );
}

export default function CalculatorForm() {
  const { form, step, setField, handleChange, handleJump } = useStore();

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
            name={key}
            step={fieldStep}
            min="0"
            placeholder={placeholder}
            value={form[key]}
            onChange={handleChange}
            className="flex-1 py-2 px-3 bg-transparent text-zinc-900 dark:text-zinc-50 outline-none text-sm"
          />
          {suffix && (
            <span className="px-3 text-zinc-500 text-sm select-none">
              {suffix}
            </span>
          )}
        </div>
        {hint && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">{hint}</p>
        )}
      </div>
    );
  }

  function stepFields() {
    if (step === 0)
      return (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Canadians with unused home equity can boost their savings by using a
            combination of tax refunds and leverage. This is known as the Smith
            Maneuver.
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            In Canada, the interest on a loan used to invest in income-producing
            assets, like dividend stocks and ETFs, is tax-deductible.
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            By borrowing to invest, you can benefit from compounding returns of
            both your investments and tax refunds, creating wealth at no
            additional cost.
          </p>
        </>
      );
    if (step === 1)
      return (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            The viability of the Smith Maneuver depends on the difference
            between your expected investment return and your borrowing cost. To
            begin, estimate your average annual return.
          </p>
          <div className="flex flex-col gap-2">
            {SCENARIOS.map((scenario) => {
              const selected = form.investmentReturn === scenario.return;
              return (
                <button
                  key={scenario.label}
                  type="button"
                  onClick={() => setField("investmentReturn", scenario.return)}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    selected
                      ? "border-zinc-900 dark:border-zinc-50 bg-zinc-50 dark:bg-zinc-800"
                      : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-500"
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {scenario.label}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {scenario.description}
                    </span>
                  </div>
                  <span className="text-sm font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                    {scenario.return}%
                  </span>
                </button>
              );
            })}
            {(() => {
              const isCustom = !SCENARIOS.some(
                (s) => s.return === form.investmentReturn,
              );
              return (
                <div
                  className={`flex items-center justify-between rounded-lg border px-3 py-2.5 transition-colors ${
                    isCustom
                      ? "border-zinc-900 dark:border-zinc-50 bg-zinc-50 dark:bg-zinc-800"
                      : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      Custom
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Enter your own expected return
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      name="investmentReturn"
                      step="0.1"
                      min="0"
                      placeholder="—"
                      value={isCustom ? form.investmentReturn : ""}
                      onChange={handleChange}
                      className="w-14 py-1 px-2 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm font-mono text-right outline-none focus:ring-1 focus:ring-zinc-500 text-zinc-900 dark:text-zinc-50"
                    />
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      %
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        </>
      );
    if (step === 2)
      return (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Estimate your cost to borrow. Your marginal tax rate determines how
            much of the interest will be refunded to you annually.
          </p>
          {field(
            "interestRate",
            "Interest rate",
            undefined,
            "%",
            DEFAULTS.interestRate,
            "0.01",
            `Market HELOC variable interest rate: ${form.interestRate}%`,
          )}
          {field(
            "marginalTaxRate",
            "Marginal tax rate",
            undefined,
            "%",
            DEFAULTS.marginalTaxRate,
            "0.01",
            "Your combined federal + provincial rate",
          )}
          {(() => {
            const rate = parseFloat(form.interestRate);
            const tax = parseFloat(form.marginalTaxRate);
            if (isNaN(rate) || isNaN(tax)) return null;
            const effective = (rate * (1 - tax / 100)).toFixed(2);
            return (
              <div className="flex flex-col gap-1">
                <hr className="border-t border-zinc-200 dark:border-zinc-700 my-3" />
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Effective interest rate
                </label>
                <div className="flex items-center justify-between rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2">
                  <span className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                    {effective}
                  </span>
                  <span className="text-sm text-zinc-400 dark:text-zinc-500 select-none">
                    %
                  </span>
                </div>

                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  This is your true cost to borrow after tax refunds.
                </p>
              </div>
            );
          })()}
        </>
      );
    if (step === 3)
      return (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            The amount that you can borrow in a HELOC is limited by your home
            equity. Borrowing an amount below the maximum allows interest to be
            charged directly to the HELOC.
          </p>
          {field(
            "homeValue",
            "Home value",
            "$",
            undefined,
            DEFAULTS.homeValue,
            "1",
          )}
          {field(
            "mortgageBalance",
            "Mortgage balance",
            "$",
            undefined,
            DEFAULTS.mortgageBalance,
            "1",
          )}
          {(() => {
            const hv = parseFloat(form.homeValue);
            const mb = parseFloat(form.mortgageBalance);
            const ir = parseFloat(form.interestRate) / 100;
            if (isNaN(hv) || isNaN(mb) || isNaN(ir)) return null;
            const helocCap = Math.max(Math.min(0.8 * hv - mb, 0.65 * hv), 0);
            const initialDraw = helocCap / Math.pow(1 + ir / 12, 10 * 12);
            const fmt = (n: number) =>
              "$" + Math.round(n).toLocaleString("en-CA");
            return (
              <>
                <hr className="border-t border-zinc-200 dark:border-zinc-700 my-3" />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    HELOC limit
                  </label>
                  <div className="flex items-center justify-between rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2">
                    <span className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                      {fmt(helocCap)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    The most you can borrow.
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Initial investment
                  </label>
                  <div className="flex items-center justify-between rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2">
                    <span className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                      {fmt(initialDraw)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    Leave room in the HELOC for 10 years of interest.
                  </p>
                </div>
              </>
            );
          })()}
        </>
      );
  }

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xl">
      <div className="flex items-center">
        {STEPS.map((_s, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <div
                className={`flex-1 h-px ${i <= step ? "bg-zinc-400 dark:bg-zinc-600" : "bg-zinc-200 dark:bg-zinc-800"}`}
              />
            )}
            <button
              onClick={() => handleJump(i)}
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
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {STEPS[step].title}
        </h3>
      </div>

      <div className="flex flex-col gap-4">{stepFields()}</div>

      <div className="flex items-center justify-between pt-1">
        <BackButton />
        <NextButton />
      </div>
    </div>
  );
}

"use client";

import {
  useStore,
  setField,
  handleChange,
  handleBack,
  handleNext,
  setReadvancable,
} from "@/global/store";
import { DEFAULTS } from "@/global/constants";
import { Field } from "./Field";

const STEPS = [
  { title: "The Smith Maneuver" },
  { title: "Investment Returns" },
  { title: "Borrowing Costs" },
  { title: "Sizing" },
  { title: "Readvancable Mortgage" },
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


export function Form() {
  const { form, step } = useStore();

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
            By borrowing to invest in dividend-paying assets in a non-registered
            account, you can benefit from compounding returns of both your
            investments and tax refunds, creating wealth at no additional cost.
          </p>
        </>
      );
    if (step === 1)
      return (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            To begin, estimate your average annual return.
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
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            In this simulation, tax refunds are sent to your RRSP, compounding
            refunds and returns until retirement.
          </p>
        </>
      );
    if (step === 2)
      return (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Estimate your cost to borrow. Your marginal tax rate determines how
            much of the interest will be refunded to you annually.
          </p>
          <Field
            name="interestRate"
            label="Interest rate"
            value={form.interestRate}
            suffix="%"
            placeholder={DEFAULTS.interestRate}
            hint={`Market HELOC variable interest rate: ${form.interestRate}%`}
          />
          <Field
            name="marginalTaxRate"
            label="Marginal tax rate"
            value={form.marginalTaxRate}
            suffix="%"
            placeholder={DEFAULTS.marginalTaxRate}
            hint="Your combined federal + provincial rate"
          />
          {(() => {
            const rate = parseFloat(form.interestRate);
            const tax = parseFloat(form.marginalTaxRate);
            if (isNaN(rate) || isNaN(tax)) return null;
            const effective = (rate * (1 - tax / 100)).toFixed(2);
            return (
              <>
                <hr className="border-t border-zinc-200 dark:border-zinc-700" />
                <div className="flex flex-col gap-1">
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
              </>
            );
          })()}
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Tax refunds will stream from your HELOC interest payments. Over
            time, RRSP contributions will also generate refunds.
          </p>
        </>
      );
    if (step === 3)
      return (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            The amount that you can borrow in a HELOC is limited by your home
            equity. Interest on interest is tax-deductable, so we allow interest
            to compound in the HELOC.
          </p>
          <Field
            name="homeValue"
            label="Home value"
            value={form.homeValue}
            prefix="$"
            placeholder={DEFAULTS.homeValue}
            step="1"
          />
          <Field
            name="mortgageBalance"
            label="Mortgage balance"
            value={form.mortgageBalance}
            prefix="$"
            placeholder={DEFAULTS.mortgageBalance}
            step="1"
          />
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
                <hr className="border-t border-zinc-200 dark:border-zinc-700" />
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
                    The maximum you could borrow.
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
    if (step === 4)
      return (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            A readvancable mortgage combines your mortgage and HELOC in one
            product. Each time you make a mortgage payment, the principal
            portion immediately reopens as available HELOC credit.
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            With a readvancable mortgage you can invest the full HELOC cap from
            day one, instead of leaving room for 10 years of compounding
            interest.
          </p>
          <button
            type="button"
            onClick={() => setReadvancable(!form.readvancable)}
            className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors ${
              form.readvancable
                ? "border-zinc-900 dark:border-zinc-50 bg-zinc-50 dark:bg-zinc-800"
                : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-500"
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Use a readvancable mortgage
              </span>
            </div>
            <input
              type="checkbox"
              checked={form.readvancable}
              onChange={(e) => setReadvancable(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 accent-zinc-900 dark:accent-zinc-50"
            />
          </button>
          {(() => {
            const hv = parseFloat(form.homeValue);
            const mb = parseFloat(form.mortgageBalance);
            const ir = parseFloat(form.interestRate) / 100;
            if (isNaN(hv) || isNaN(mb) || isNaN(ir)) return null;
            const helocCap = Math.max(Math.min(0.8 * hv - mb, 0.65 * hv), 0);
            const standardDraw = helocCap / Math.pow(1 + ir / 12, 10 * 12);
            const readvancableDraw = helocCap;
            const fmt = (n: number) =>
              "$" + Math.round(n).toLocaleString("en-CA");
            return (
              <>
                <hr className="border-t border-zinc-200 dark:border-zinc-700" />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Initial investment
                  </label>
                  <div className="flex items-center justify-between rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2">
                    <span className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                      {fmt(form.readvancable ? readvancableDraw : standardDraw)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {form.readvancable
                      ? "Invest the full HELOC limit from day one."
                      : "Leave room in the HELOC for 10 years of interest."}
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
      <div className="flex items-center gap-2">
        <button
          onClick={handleBack}
          className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors ${step === 0 ? "invisible" : ""}`}
        >
          ←
        </button>
        <h3 className="flex-1 text-center text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {STEPS[step].title}
        </h3>
        <button
          onClick={handleNext}
          className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors ${step >= STEPS.length - 1 ? "invisible" : ""}`}
        >
          →
        </button>
      </div>

      <div className="flex flex-col gap-4">{stepFields()}</div>
    </div>
  );
}

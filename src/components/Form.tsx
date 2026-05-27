"use client";

import {
  useStore,
  handleChange,
  handleBack,
  handleNext,
  setReadvancable,
  setMonthlyContributions,
  setAdoptBitcoin,
} from "@/global/store";
import { DEFAULTS } from "@/global/constants";
import { Field } from "./Field";

const STEPS = [
  { title: "The Smith Maneuver" },
  { title: "Your Mortgage" },
  { title: "Borrowing to Invest" },
  { title: "Investment Returns" },
  { title: "Deploying Tax Refunds" },
  { title: "Readvancable Mortgage" },
  { title: "Congratulations!" },
  { title: "Fundamentals" },
];

export function Form() {
  const { form, step, primeRate } = useStore();

  function stepFields() {
    if (step === 0)
      return (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Canadians with unused home equity can put that equity to work by
            converting non-deductible mortgage debt into a tax-deductible
            investment loan. This is known as the Smith Maneuver.
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            In Canada, the interest on a loan used to invest in income-producing
            assets, like dividend stocks and ETFs, is tax-deductible.
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Each year, the interest you pay on the investment loan generates a
            tax refund. Those refunds compound alongside your investments,
            turning idle equity into growing wealth.
          </p>
        </>
      );
    if (step === 1)
      return (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Enter your mortgage details. These determine how much principal you
            repay each month and how much HELOC room opens up.
          </p>
          <Field
            name="mortgageBalance"
            label="Balance"
            value={form.mortgageBalance}
            prefix="$"
            placeholder={DEFAULTS.mortgageBalance}
            step="1"
            hint="How much you still owe on your mortgage"
          />
          <Field
            name="mortgageRate"
            label="Interest rate"
            value={form.mortgageRate}
            suffix="%"
            placeholder={DEFAULTS.mortgageRate}
            hint={
              primeRate
                ? `Prime is ${primeRate}%. Variable rates are usually Prime − 0.5%.`
                : "Your current mortgage rate"
            }
          />
          <Field
            name="amortizationYears"
            label="Amortization"
            value={form.amortizationYears}
            suffix="years"
            step="1"
            placeholder={DEFAULTS.amortizationYears}
            hint="Years remaining on your mortgage"
          />
        </>
      );
    if (step === 2)
      return (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            The amount that you can borrow in a HELOC is limited by your home
            equity. Allowing interest to compound means you don&rsquo;t need to
            make cash interest payments, keeping the strategy cash-flow neutral.
          </p>
          <Field
            name="interestRate"
            label="HELOC interest rate"
            value={form.interestRate}
            suffix="%"
            placeholder={DEFAULTS.interestRate}
          />
          <Field
            name="homeValue"
            label="Home value"
            value={form.homeValue}
            prefix="$"
            placeholder={DEFAULTS.homeValue}
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
    if (step === 3) {
      const returnVal = parseFloat(form.investmentReturn) || 9;
      const hint =
        returnVal <= 7
          ? "Below-market or weak conditions"
          : returnVal <= 11
            ? "Typical diversified portfolio"
            : "Beating a broad market index";
      return (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Estimate your expected annual return on the invested capital.
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Annual return
              </label>
              <span className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
                {returnVal % 1 === 0 ? returnVal.toFixed(1) : returnVal}%
              </span>
            </div>
            <input
              type="range"
              name="investmentReturn"
              min="1"
              max="20"
              step="0.5"
              value={returnVal}
              onChange={handleChange}
              className="w-full cursor-pointer accent-zinc-900 dark:accent-zinc-50"
            />
            <div className="flex justify-between">
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                1%
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                20%
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            In this simulation, tax refunds are deposited into your RRSP each
            year, where they compound alongside your returns until retirement.
          </p>
        </>
      );
    }
    if (step === 4)
      return (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Estimate your cost to borrow. Your marginal tax rate determines how
            much of the interest will be refunded to you annually.
          </p>
          <Field
            name="marginalTaxRate"
            label="Marginal tax rate"
            value={form.marginalTaxRate}
            suffix="%"
            placeholder={DEFAULTS.marginalTaxRate}
            hint="Your combined federal + provincial tax rate"
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
            Each year, your HELOC interest payments generate a tax refund. As
            your RRSP grows from reinvested refunds, those contributions
            generate refunds of their own.
          </p>
        </>
      );
    if (step === 5)
      return (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            A readvancable mortgage combines your mortgage and HELOC in one
            product. Each time you make a mortgage payment, the principal
            portion immediately reopens as available HELOC credit.
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            With a readvancable mortgage, you can invest the full HELOC cap from
            day one, with the option of topping up after every mortgage payment.
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
            <div
              className={`h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${form.readvancable ? "bg-zinc-900 border-zinc-900 dark:bg-zinc-50 dark:border-zinc-50" : "border-zinc-400 dark:border-zinc-500 bg-white dark:bg-zinc-900"}`}
            >
              {form.readvancable && (
                <svg
                  className="h-2.5 w-2.5 text-white dark:text-zinc-900"
                  viewBox="0 0 10 8"
                  fill="none"
                >
                  <path
                    d="M1 4l3 3 5-6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              if (form.readvancable)
                setMonthlyContributions(!form.monthlyContributions);
            }}
            className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors ${
              !form.readvancable
                ? "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 opacity-50 cursor-not-allowed"
                : form.monthlyContributions
                  ? "border-zinc-900 dark:border-zinc-50 bg-zinc-50 dark:bg-zinc-800 cursor-pointer"
                  : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-500 cursor-pointer"
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Monthly contributions
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {!form.readvancable
                  ? "Requires a readvancable mortgage."
                  : "Re-borrow each month's mortgage principal and invest it in your non-registered account."}
              </span>
            </div>
            <div
              className={`h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${form.monthlyContributions ? "bg-zinc-900 border-zinc-900 dark:bg-zinc-50 dark:border-zinc-50" : "border-zinc-400 dark:border-zinc-500 bg-white dark:bg-zinc-900"}`}
            >
              {form.monthlyContributions && (
                <svg
                  className="h-2.5 w-2.5 text-white dark:text-zinc-900"
                  viewBox="0 0 10 8"
                  fill="none"
                >
                  <path
                    d="M1 4l3 3 5-6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </button>
          {(() => {
            const hv = parseFloat(form.homeValue);
            const mb = parseFloat(form.mortgageBalance);
            const ir = parseFloat(form.interestRate) / 100;
            if (isNaN(hv) || isNaN(mb) || isNaN(ir)) return null;
            const helocCap = Math.max(Math.min(0.8 * hv - mb, 0.65 * hv), 0);
            const standardDraw = helocCap / Math.pow(1 + ir / 12, 10 * 12);
            const readvancableDraw = helocCap;
            const bufferedDraw = helocCap / Math.pow(1 + ir / 12, 2);
            const showBuffered = form.readvancable && form.monthlyContributions;
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
                      {fmt(
                        showBuffered
                          ? bufferedDraw
                          : form.readvancable
                            ? readvancableDraw
                            : standardDraw,
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {showBuffered
                      ? "Leave room in the HELOC for two months of interest."
                      : form.readvancable
                        ? "Invest the full HELOC limit from day one."
                        : "Leave room in the HELOC for 10 years of interest."}
                  </p>
                </div>
              </>
            );
          })()}
        </>
      );
    if (step === 6)
      return (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            You have put your equity to work. The strategy costs nothing extra
            in monthly cash flow — your returns and tax refunds do the lifting.
            The Smith Maneuver continues compounding until your HELOC limit is
            reached.
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Before hitting the limit, you may sell your home tax-free and pay
            off the HELOC. Consider buying a more expensive property with
            proceeds from the non-registered account and run the Smith Maneuver
            again.
          </p>
        </>
      );
    if (step === 7)
      return (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Fundamentally, the Smith Maneuver and other &ldquo;Buy, Borrow,
            Die&rdquo; strategies take advantage of the Cantillon Effect and
            Fractional Reserve Banking.
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <b>Cantillon Effect</b>: New money benefits those who receive it
            first &mdash; before it raises prices for everyone else.
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <b>Fractional Reserve Banking</b>: New money is loaned into
            existence.
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            A reliable way to protect yourself from inflation is to cause it.
            Another solution is to adopt inflation-proof money. Currently, it is
            possible to do both.
          </p>
          <button
            type="button"
            onClick={() => setAdoptBitcoin(!form.adoptBitcoin)}
            className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors ${
              form.adoptBitcoin
                ? "border-zinc-900 dark:border-zinc-50 bg-zinc-50 dark:bg-zinc-800"
                : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-500"
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Adopt Bitcoin
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                BTCY is a Bitcoin covered-call ETF that generates yield from
                options premiums. Models a 20% annual return.
              </span>
            </div>
            <div
              className={`h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${form.adoptBitcoin ? "bg-zinc-900 border-zinc-900 dark:bg-zinc-50 dark:border-zinc-50" : "border-zinc-400 dark:border-zinc-500 bg-white dark:bg-zinc-900"}`}
            >
              {form.adoptBitcoin && (
                <svg
                  className="h-2.5 w-2.5 text-white dark:text-zinc-900"
                  viewBox="0 0 10 8"
                  fill="none"
                >
                  <path
                    d="M1 4l3 3 5-6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </button>
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

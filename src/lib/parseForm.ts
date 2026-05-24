import { SimulationInputs } from "./smith-maneuver";
import { FormState } from "@/global/types";

export function parseForm(form: FormState): SimulationInputs | null {
  const homeValue = parseFloat(form.homeValue);
  const mortgageBalance = parseFloat(form.mortgageBalance);
  const interestRate = parseFloat(form.interestRate) / 100;
  const investmentReturn = parseFloat(form.investmentReturn) / 100;
  const marginalTaxRate = parseFloat(form.marginalTaxRate) / 100;
  const amortizationYears = parseInt(form.amortizationYears, 10);
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
    marginalTaxRate >= 1 ||
    isNaN(amortizationYears) ||
    amortizationYears < 1
  ) {
    return null;
  }

  return {
    homeValue,
    mortgageBalance,
    interestRate,
    investmentReturn,
    marginalTaxRate,
    years: amortizationYears,
    readvancable: form.readvancable,
    useRrsp: form.useRrsp,
  };
}

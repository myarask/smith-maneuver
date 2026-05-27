import type { FormState } from "./types";

export const MONTHS_UNTIL_MAY = (new Date().getMonth() - 4 + 12) % 12 || 12;

const DEFAULT_HELOC_RATE = 5.0;

export const DEFAULTS: FormState = {
  homeValue: "600000",
  mortgageBalance: "300000",
  interestRate: String(DEFAULT_HELOC_RATE),
  investmentReturn: "9.0",
  marginalTaxRate: "40.0",
  readvancable: false,
  monthlyContributions: false,
  amortizationYears: "25",
  mortgageRate: String(DEFAULT_HELOC_RATE - 1.5),
};

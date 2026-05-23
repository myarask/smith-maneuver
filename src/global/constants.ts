import type { FormState } from "./types";

export const MONTHS_UNTIL_MAY = 12 - new Date().getMonth() + 4;

export const DEFAULTS: FormState = {
  homeValue: "700000",
  mortgageBalance: "500000",
  interestRate: "5.0",
  investmentReturn: "8.0",
  marginalTaxRate: "43.0",
  readvancable: false,
};

export type SimulationInputs = {
  homeValue: number;
  mortgageBalance: number;
  interestRate: number;
  investmentReturn: number;
  marginalTaxRate: number;
  years: number;
  readvancable: boolean;
  monthlyContributions: boolean;
  amortizationYears: number;
  mortgageRate: number;
};

export type Snapshot = {
  month: number;
  homeValue: number;
  mortgageBalance: number;
  helocBalance: number;
  nonRegisteredBalance: number;
  rrspBalance: number;
  netEquity: number;
  cumulativeHelocRefund: number;
};

export type SimulationResults = {
  snapshots: Snapshot[];
};

import { MONTHS_UNTIL_MAY } from "@/global/constants";

export function getSimulationResults({
  homeValue,
  mortgageBalance,
  interestRate,
  investmentReturn,
  marginalTaxRate,
  years,
  readvancable,
  monthlyContributions,
  amortizationYears,
  mortgageRate,
}: SimulationInputs): SimulationResults {
  const helocCap = Math.max(
    Math.min(0.8 * homeValue - mortgageBalance, 0.65 * homeValue),
    0,
  );

  const monthlyRate = interestRate / 12;
  const monthlyReturn = investmentReturn / 12;
  const totalMonths = years * 12;

  // Reserve 1 month of HELOC interest as permanent available buffer
  const bufferedCap = helocCap / Math.pow(1 + monthlyRate, 2);

  const initialDraw = readvancable
    ? (monthlyContributions ? bufferedCap : helocCap)
    : helocCap / Math.pow(1 + monthlyRate, totalMonths);

  let helocBalance = initialDraw;
  let nonRegisteredBalance = initialDraw;
  let rrspBalance = 0;
  let yearlyRefundAccum = 0;
  let yearlyPrincipalAccum = 0;
  let cumulativeHelocRefund = 0;

  const monthlyMortgageRate = mortgageRate / 12;
  const amortMonths = amortizationYears * 12;
  const monthlyMortgagePayment =
    monthlyContributions && mortgageBalance > 0 && monthlyMortgageRate > 0
      ? (mortgageBalance * monthlyMortgageRate * Math.pow(1 + monthlyMortgageRate, amortMonths)) /
        (Math.pow(1 + monthlyMortgageRate, amortMonths) - 1)
      : 0;
  let mortgageBal = mortgageBalance;

  const snapshots: Snapshot[] = [
    {
      month: 0,
      homeValue,
      mortgageBalance,
      helocBalance,
      nonRegisteredBalance,
      rrspBalance,
      netEquity: 0,
      cumulativeHelocRefund,
    },
  ];

  for (let m = 1; m <= totalMonths; m++) {
    if (monthlyContributions && mortgageBal > 0) {
      const mortgageInterest = mortgageBal * monthlyMortgageRate;
      const principalPaid = Math.min(monthlyMortgagePayment - mortgageInterest, mortgageBal);
      mortgageBal = Math.max(mortgageBal - principalPaid, 0);
      const reborrow = principalPaid;
      helocBalance += reborrow;
      yearlyPrincipalAccum += reborrow;
    }

    const helocInterest = helocBalance * monthlyRate;
    helocBalance += helocInterest;

    nonRegisteredBalance = nonRegisteredBalance * (1 + monthlyReturn);
    rrspBalance = rrspBalance * (1 + monthlyReturn);

    const helocInterestRefund = helocInterest * marginalTaxRate;
    yearlyRefundAccum += helocInterestRefund;
    cumulativeHelocRefund += helocInterestRefund;

    // Tax refund received in May: cascade both HELOC interest refund and monthly principal contributions
    if ((m + MONTHS_UNTIL_MAY) % 12 === 0) {
      rrspBalance += yearlyRefundAccum / (1 - marginalTaxRate);
      rrspBalance += yearlyPrincipalAccum / (1 - marginalTaxRate);
      yearlyRefundAccum = 0;
      yearlyPrincipalAccum = 0;
    }

    snapshots.push({
      month: m,
      homeValue,
      mortgageBalance,
      helocBalance,
      nonRegisteredBalance,
      rrspBalance,
      netEquity: nonRegisteredBalance + rrspBalance - helocBalance,
      cumulativeHelocRefund,
    });
  }

  return { snapshots };
}

export type SimulationInputs = {
  homeValue: number;
  mortgageBalance: number;
  interestRate: number;
  investmentReturn: number;
  marginalTaxRate: number;
  years: number;
  readvancable: boolean;
};

export type Snapshot = {
  month: number;
  homeValue: number;
  mortgageBalance: number;
  helocBalance: number;
  marginBalance: number;
  cashPile: number;
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
}: SimulationInputs): SimulationResults {
  const helocCap = Math.max(
    Math.min(0.8 * homeValue - mortgageBalance, 0.65 * homeValue),
    0,
  );

  const monthlyRate = interestRate / 12;
  const monthlyReturn = investmentReturn / 12;

  const initialDraw = readvancable
    ? helocCap
    : helocCap / Math.pow(1 + monthlyRate, years * 12);

  let helocBalance = initialDraw;
  let marginBalance = initialDraw;
  let cashPile = 0;
  let yearlyRefundAccum = 0;
  let cumulativeHelocRefund = 0;

  const snapshots: Snapshot[] = [
    {
      month: 0,
      homeValue,
      mortgageBalance,
      helocBalance,
      marginBalance,
      cashPile,
      netEquity: 0,
      cumulativeHelocRefund,
    },
  ];

  for (let m = 1; m <= years * 12; m++) {
    const helocInterest = helocBalance * monthlyRate;
    helocBalance += helocInterest;

    marginBalance = marginBalance * (1 + monthlyReturn);

    const helocInterestRefund = helocInterest * marginalTaxRate;
    yearlyRefundAccum += helocInterestRefund;
    cumulativeHelocRefund += helocInterestRefund;

    // Assume the tax refund is received in May
    if ((m + MONTHS_UNTIL_MAY) % 12 === 0) {
      cashPile += yearlyRefundAccum;
      yearlyRefundAccum = 0;
    }

    snapshots.push({
      month: m,
      homeValue,
      mortgageBalance,
      helocBalance,
      marginBalance: marginBalance,
      cashPile,
      netEquity: marginBalance + cashPile - helocBalance,
      cumulativeHelocRefund,
    });
  }

  return { snapshots };
}

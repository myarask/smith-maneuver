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
}: SimulationInputs): SimulationResults {
  const helocCap = Math.max(
    Math.min(0.8 * homeValue - mortgageBalance, 0.65 * homeValue),
    0,
  );

  const monthlyRate = interestRate / 12;
  const monthlyReturn = investmentReturn / 12;
  const totalMonths = years * 12;

  const initialDraw = readvancable
    ? helocCap
    : helocCap / Math.pow(1 + monthlyRate, totalMonths);

  let helocBalance = initialDraw;
  let marginBalance = initialDraw;
  let rrspBalance = 0;
  let yearlyRefundAccum = 0;
  let cumulativeHelocRefund = 0;

  const snapshots: Snapshot[] = [
    {
      month: 0,
      homeValue,
      mortgageBalance,
      helocBalance,
      marginBalance,
      rrspBalance,
      netEquity: 0,
      cumulativeHelocRefund,
    },
  ];

  for (let m = 1; m <= totalMonths; m++) {
    const helocInterest = helocBalance * monthlyRate;
    helocBalance += helocInterest;

    marginBalance = marginBalance * (1 + monthlyReturn);
    rrspBalance = rrspBalance * (1 + monthlyReturn);

    const helocInterestRefund = helocInterest * marginalTaxRate;
    yearlyRefundAccum += helocInterestRefund;
    cumulativeHelocRefund += helocInterestRefund;

    // Tax refund received in May: full cascade of RRSP contributions (geometric series)
    if ((m + MONTHS_UNTIL_MAY) % 12 === 0) {
      rrspBalance += yearlyRefundAccum / (1 - marginalTaxRate);
      yearlyRefundAccum = 0;
    }

    snapshots.push({
      month: m,
      homeValue,
      mortgageBalance,
      helocBalance,
      marginBalance,
      rrspBalance,
      netEquity: marginBalance + rrspBalance - helocBalance,
      cumulativeHelocRefund,
    });
  }

  return { snapshots };
}

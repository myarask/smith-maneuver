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
  const totalMonths = years * 12;

  const initialDraw = readvancable
    ? helocCap
    : helocCap / Math.pow(1 + monthlyRate, totalMonths);

  let helocBalance = initialDraw;
  let marginBalance = initialDraw;
  let mortgageBal = mortgageBalance;
  let cashPile = 0;
  let yearlyRefundAccum = 0;
  let cumulativeHelocRefund = 0;

  // Monthly payment for Rempel Maximum (standard amortization formula)
  const monthlyMortgagePayment =
    readvancable && helocCap > 0 && mortgageBalance > 0
      ? (mortgageBalance * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : 0;

  const snapshots: Snapshot[] = [
    {
      month: 0,
      homeValue,
      mortgageBalance: mortgageBal,
      helocBalance,
      marginBalance,
      cashPile,
      netEquity: 0,
      cumulativeHelocRefund,
    },
  ];

  for (let m = 1; m <= totalMonths; m++) {
    if (readvancable && mortgageBal > 0) {
      // Rempel Maximum: re-borrow each month's principal payment and invest it
      const mortgageInterest = mortgageBal * monthlyRate;
      const principalPaid = Math.min(
        monthlyMortgagePayment - mortgageInterest,
        mortgageBal,
      );
      mortgageBal = Math.max(mortgageBal - principalPaid, 0);
      helocBalance += principalPaid;
      marginBalance += principalPaid;
    }

    const helocInterest = helocBalance * monthlyRate;
    helocBalance += helocInterest;

    marginBalance = marginBalance * (1 + monthlyReturn);

    const helocInterestRefund = helocInterest * marginalTaxRate;
    yearlyRefundAccum += helocInterestRefund;
    cumulativeHelocRefund += helocInterestRefund;

    // Assume the tax refund is received in May
    if ((m + MONTHS_UNTIL_MAY) % 12 === 0) {
      if (readvancable && mortgageBal > 0) {
        // Rempel Maximum: recycle refund into mortgage, re-borrow and invest
        const lumpToMortgage = Math.min(yearlyRefundAccum, mortgageBal);
        mortgageBal = Math.max(mortgageBal - lumpToMortgage, 0);
        helocBalance += lumpToMortgage;
        marginBalance += lumpToMortgage;
        cashPile += yearlyRefundAccum - lumpToMortgage;
      } else {
        cashPile += yearlyRefundAccum;
      }
      yearlyRefundAccum = 0;
    }

    snapshots.push({
      month: m,
      homeValue,
      mortgageBalance: readvancable ? mortgageBal : mortgageBalance,
      helocBalance,
      marginBalance,
      cashPile,
      netEquity: marginBalance + cashPile - helocBalance,
      cumulativeHelocRefund,
    });
  }

  return { snapshots };
}

export type SmithManeuverInputs = {
  mortgageBalance: number;
  mortgageRate: number;
  amortizationYears: number;
  interestRate: number;
  investmentReturn: number;
  marginalTaxRate: number;
};

export type YearlySnapshot = {
  year: number;
  portfolioValue: number;
  mortgageBalance: number;
  helocBalance: number;
  cumulativeTaxSavings: number;
};

export type SmithManeuverResult = {
  portfolioValue: number;
  totalTaxSavings: number;
  monthsToPayoff: number;
  baselineMonthsToPayoff: number;
  yearlySnapshots: YearlySnapshot[];
};

export type CapitalizingSmithManeuverInputs = {
  homeValue: number;
  mortgageBalance: number;
  interestRate: number;
  investmentReturn: number;
  marginalTaxRate: number;
  years: number;
};

export type CapitalizingYearlySnapshot = {
  month: number;
  homeValue: number;
  mortgageBalance: number;
  helocBalance: number;
  marginAccountValue: number;
  cashPile: number;
  netEquity: number;
  cumulativeHelocRefund: number;
};

export type CapitalizingSmithManeuverResult = {
  snapshots: CapitalizingYearlySnapshot[];
};

export function calculateCapitalizingSmithManeuver(
  inputs: CapitalizingSmithManeuverInputs,
): CapitalizingSmithManeuverResult {
  const {
    homeValue,
    mortgageBalance,
    interestRate,
    investmentReturn,
    marginalTaxRate,
    years,
  } = inputs;

  const helocCap = Math.max(
    Math.min(0.8 * homeValue - mortgageBalance, 0.65 * homeValue),
    0,
  );

  const monthlyRate = interestRate / 12;
  const monthlyReturn = investmentReturn / 12;

  // Size the initial draw so monthly-compounding over years*12 months hits helocCap exactly
  const initialDraw = helocCap / Math.pow(1 + monthlyRate, years * 12);

  let helocBalance = initialDraw;
  let marginAccount = initialDraw;
  let cashPile = 0;
  let yearlyRefundAccum = 0;
  let cumulativeHelocRefund = 0;

  const snapshots: CapitalizingYearlySnapshot[] = [
    {
      month: 0,
      homeValue,
      mortgageBalance,
      helocBalance: initialDraw,
      marginAccountValue: initialDraw,
      cashPile: 0,
      netEquity: 0,
      cumulativeHelocRefund: 0,
    },
  ];

  for (let m = 1; m <= years * 12; m++) {
    const helocInterest = helocBalance * monthlyRate;
    helocBalance += helocInterest;

    marginAccount = marginAccount * (1 + monthlyReturn);

    const helocInterestRefund = helocInterest * marginalTaxRate;
    yearlyRefundAccum += helocInterestRefund;
    cumulativeHelocRefund += helocInterestRefund;

    if (m % 12 === 0) {
      cashPile += yearlyRefundAccum;
      yearlyRefundAccum = 0;
    }

    snapshots.push({
      month: m,
      homeValue,
      mortgageBalance,
      helocBalance,
      marginAccountValue: marginAccount,
      cashPile,
      netEquity: marginAccount + cashPile - helocBalance,
      cumulativeHelocRefund,
    });
  }

  return { snapshots };
}

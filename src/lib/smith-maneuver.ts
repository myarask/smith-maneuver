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
  year: number;
  homeValue: number;
  mortgageBalance: number;
  helocBalance: number;
  marginAccountValue: number;
  cashPile: number;
  netEquity: number;
  cumulativeHelocRefund: number;
};

export type CapitalizingSmithManeuverResult = {
  helocBalance: number;
  marginAccountValue: number;
  cashPile: number;
  netEquity: number;
  cumulativeHelocRefund: number;
  yearlySnapshots: CapitalizingYearlySnapshot[];
};

function fixedMonthlyPayment(
  principal: number,
  annualRate: number,
  months: number,
): number {
  const r = annualRate / 12;
  if (r === 0) return principal / months;
  return (
    (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
  );
}

function baselineMonths(
  principal: number,
  annualRate: number,
  amortizationYears: number,
): number {
  const r = annualRate / 12;
  const payment = fixedMonthlyPayment(
    principal,
    annualRate,
    amortizationYears * 12,
  );
  let balance = principal;
  let months = 0;
  const maxMonths = amortizationYears * 12 + 12;
  while (balance > 0.01 && months < maxMonths) {
    balance = Math.max(balance * (1 + r) - payment, 0);
    months++;
  }
  return months;
}

export function calculateSmithManeuver(
  inputs: SmithManeuverInputs,
): SmithManeuverResult {
  const {
    mortgageBalance,
    mortgageRate,
    amortizationYears,
    interestRate,
    investmentReturn,
    marginalTaxRate,
  } = inputs;

  const r = mortgageRate / 12;
  const ri = investmentReturn / 12;
  const payment = fixedMonthlyPayment(
    mortgageBalance,
    mortgageRate,
    amortizationYears * 12,
  );

  let mortgage = mortgageBalance;
  let heloc = 0;
  let portfolio = 0;
  let totalTaxSavings = 0;
  let helocInterestAccrued = 0;
  let month = 0;

  const yearlySnapshots: YearlySnapshot[] = [];
  const maxMonths = amortizationYears * 12 + 12;

  while (mortgage > 0.01 && month < maxMonths) {
    const mortgageInterest = mortgage * r;
    const principalPaid = Math.min(payment - mortgageInterest, mortgage);
    mortgage = Math.max(mortgage - principalPaid, 0);

    heloc += principalPaid;
    portfolio = (portfolio + principalPaid) * (1 + ri);

    helocInterestAccrued += heloc * (interestRate / 12);

    month++;

    if (month % 12 === 0 && mortgage > 0.01) {
      const refund = helocInterestAccrued * marginalTaxRate;
      totalTaxSavings += refund;
      mortgage = Math.max(mortgage - refund, 0);
      helocInterestAccrued = 0;

      yearlySnapshots.push({
        year: month / 12,
        portfolioValue: portfolio,
        mortgageBalance: mortgage,
        helocBalance: heloc,
        cumulativeTaxSavings: totalTaxSavings,
      });
    }
  }

  return {
    portfolioValue: portfolio,
    totalTaxSavings,
    monthsToPayoff: month,
    baselineMonthsToPayoff: baselineMonths(
      mortgageBalance,
      mortgageRate,
      amortizationYears,
    ),
    yearlySnapshots,
  };
}

export function calculateCapitalizingSmithManeuver(
  inputs: CapitalizingSmithManeuverInputs,
): CapitalizingSmithManeuverResult {
  const { homeValue, mortgageBalance, interestRate, investmentReturn, marginalTaxRate, years } = inputs;

  const helocCap = Math.max(
    Math.min(0.8 * homeValue - mortgageBalance, 0.65 * homeValue),
    0,
  );

  // Size the initial draw so compounding interest never exceeds helocCap:
  // helocBalance at year n = initialDraw × (1 + r)^n, set equal to helocCap at n = years
  const initialDraw = helocCap / Math.pow(1 + interestRate, years);

  let helocBalance = initialDraw;
  let marginAccount = initialDraw;
  let cashPile = 0;
  let cumulativeHelocRefund = 0;

  const yearlySnapshots: CapitalizingYearlySnapshot[] = [
    {
      year: 0,
      homeValue,
      mortgageBalance,
      helocBalance: initialDraw,
      marginAccountValue: initialDraw,
      cashPile: 0,
      netEquity: 0,
      cumulativeHelocRefund: 0,
    },
  ];

  for (let year = 1; year <= years; year++) {
    const helocInterest = helocBalance * interestRate;
    helocBalance += helocInterest;

    marginAccount = marginAccount * (1 + investmentReturn);

    const helocInterestRefund = helocInterest * marginalTaxRate;
    cashPile += helocInterestRefund;
    cumulativeHelocRefund += helocInterestRefund;

    yearlySnapshots.push({
      year,
      homeValue,
      mortgageBalance,
      helocBalance,
      marginAccountValue: marginAccount,
      cashPile,
      netEquity: marginAccount + cashPile - helocBalance,
      cumulativeHelocRefund,
    });
  }

  return {
    helocBalance,
    marginAccountValue: marginAccount,
    cashPile,
    netEquity: marginAccount + cashPile - helocBalance,
    cumulativeHelocRefund,
    yearlySnapshots,
  };
}

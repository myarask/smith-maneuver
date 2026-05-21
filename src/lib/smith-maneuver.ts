export type SmithManeuverInputs = {
  mortgageBalance: number;
  mortgageRate: number;
  amortizationYears: number;
  helocRate: number;
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
  appreciationRate: number;
  mortgageBalance: number;
  mortgageRate: number;
  amortizationYears: number;
  helocRate: number;
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
  rrspValue: number;
  netEquity: number;
};

export type CapitalizingSmithManeuverResult = {
  helocBalance: number;
  marginAccountValue: number;
  rrspValue: number;
  netEquity: number;
  yearlySnapshots: CapitalizingYearlySnapshot[];
};

function fixedMonthlyPayment(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 12;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function baselineMonths(principal: number, annualRate: number, amortizationYears: number): number {
  const r = annualRate / 12;
  const payment = fixedMonthlyPayment(principal, annualRate, amortizationYears * 12);
  let balance = principal;
  let months = 0;
  const maxMonths = amortizationYears * 12 + 12;
  while (balance > 0.01 && months < maxMonths) {
    balance = Math.max(balance * (1 + r) - payment, 0);
    months++;
  }
  return months;
}

export function calculateSmithManeuver(inputs: SmithManeuverInputs): SmithManeuverResult {
  const { mortgageBalance, mortgageRate, amortizationYears, helocRate, investmentReturn, marginalTaxRate } = inputs;

  const r = mortgageRate / 12;
  const ri = investmentReturn / 12;
  const payment = fixedMonthlyPayment(mortgageBalance, mortgageRate, amortizationYears * 12);

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

    helocInterestAccrued += heloc * (helocRate / 12);

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
    baselineMonthsToPayoff: baselineMonths(mortgageBalance, mortgageRate, amortizationYears),
    yearlySnapshots,
  };
}

export function calculateCapitalizingSmithManeuver(
  inputs: CapitalizingSmithManeuverInputs
): CapitalizingSmithManeuverResult {
  const {
    homeValue: initialHomeValue,
    appreciationRate,
    mortgageBalance: initialMortgageBalance,
    mortgageRate,
    amortizationYears,
    helocRate,
    investmentReturn,
    marginalTaxRate,
    years,
  } = inputs;

  const r = mortgageRate / 12;
  const payment = fixedMonthlyPayment(initialMortgageBalance, mortgageRate, amortizationYears * 12);

  const initialHelocCap = Math.max(
    Math.min(0.8 * initialHomeValue - initialMortgageBalance, 0.65 * initialHomeValue),
    0
  );

  let mortgage = initialMortgageBalance;
  let helocBalance = initialHelocCap;
  let marginAccount = initialHelocCap;
  let rrsp = 0;
  const yearlySnapshots: CapitalizingYearlySnapshot[] = [
    {
      year: 0,
      homeValue: initialHomeValue,
      mortgageBalance: initialMortgageBalance,
      helocBalance: initialHelocCap,
      marginAccountValue: initialHelocCap,
      rrspValue: 0,
      netEquity: 0,
    },
  ];

  for (let year = 1; year <= years; year++) {
    // Amortize mortgage for 12 months
    for (let m = 0; m < 12; m++) {
      if (mortgage > 0.01) {
        const interest = mortgage * r;
        const principal = Math.min(payment - interest, mortgage);
        mortgage = Math.max(mortgage - principal, 0);
      }
    }

    const homeValue = initialHomeValue * Math.pow(1 + appreciationRate, year);
    const helocCap = Math.max(Math.min(0.8 * homeValue - mortgage, 0.65 * homeValue), 0);

    // Capitalize HELOC interest (capped at HELOC limit)
    const helocInterest = helocBalance * helocRate;
    helocBalance = Math.min(helocBalance + helocInterest, helocCap);

    // Draw remaining new room and invest
    const newRoom = Math.max(helocCap - helocBalance, 0);
    marginAccount += newRoom;
    helocBalance = helocCap;

    marginAccount = marginAccount * (1 + investmentReturn);

    const taxRefund = helocInterest * marginalTaxRate;
    rrsp = rrsp * (1 + investmentReturn) + taxRefund;

    yearlySnapshots.push({
      year,
      homeValue,
      mortgageBalance: mortgage,
      helocBalance,
      marginAccountValue: marginAccount,
      rrspValue: rrsp,
      netEquity: marginAccount + rrsp - helocBalance,
    });
  }

  return {
    helocBalance,
    marginAccountValue: marginAccount,
    rrspValue: rrsp,
    netEquity: marginAccount + rrsp - helocBalance,
    yearlySnapshots,
  };
}

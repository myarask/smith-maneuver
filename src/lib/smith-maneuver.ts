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
    // Split mortgage payment into interest and principal
    const mortgageInterest = mortgage * r;
    const principalPaid = Math.min(payment - mortgageInterest, mortgage);
    mortgage = Math.max(mortgage - principalPaid, 0);

    // Reborrow principal as HELOC and invest it immediately (beginning-of-month contribution)
    heloc += principalPaid;
    portfolio = (portfolio + principalPaid) * (1 + ri);

    // Accrue HELOC interest for annual refund calculation
    helocInterestAccrued += heloc * (helocRate / 12);

    month++;

    // Each year: receive tax refund on HELOC interest, apply as mortgage prepayment
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

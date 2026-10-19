import {
  LATTE_FACTOR_PROJECTION_YEARS,
  MONTHS_PER_YEAR,
} from "@/constants/finance";
import type {
  CompoundInterestInput,
  CompoundInterestResult,
  LatteFactorInput,
  LatteFactorProjection,
  LatteFactorResult,
  SavingsProjectionPoint,
} from "@/types/living-cost.types";

export type ContributionTiming = "beginning" | "end";

function assertFiniteNonNegative(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${field} phải là số hữu hạn và không âm`);
  }
}

export function calculateFutureValue(
  monthlyContribution: number,
  annualInterestRate: number,
  months: number,
  timing: ContributionTiming = "beginning",
): number {
  assertFiniteNonNegative(monthlyContribution, "monthlyContribution");
  assertFiniteNonNegative(annualInterestRate, "annualInterestRate");
  assertFiniteNonNegative(months, "months");

  if (months === 0) return 0;

  const monthlyRate = annualInterestRate / 100 / MONTHS_PER_YEAR;
  if (monthlyRate === 0) {
    return monthlyContribution * months;
  }

  const annuityFactor =
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (timing === "beginning" ? 1 + monthlyRate : 1);

  return monthlyContribution * annuityFactor;
}

export function calculateLatteFactor(
  input: LatteFactorInput,
): LatteFactorResult {
  assertFiniteNonNegative(input.monthlySaving, "monthlySaving");
  assertFiniteNonNegative(input.annualInterestRate, "annualInterestRate");

  const years =
    input.projectionYears.length > 0
      ? Array.from(new Set(input.projectionYears))
          .filter((year) => year > 0)
          .sort((a, b) => a - b)
      : [...LATTE_FACTOR_PROJECTION_YEARS];

  const normalizedYears = years.length > 0 ? years : [...LATTE_FACTOR_PROJECTION_YEARS];
  const monthlyRate = input.annualInterestRate / MONTHS_PER_YEAR;

  const projections: LatteFactorProjection[] = normalizedYears.map((year) => {
    const months = Math.round(year * MONTHS_PER_YEAR);
    const futureValue = calculateFutureValue(
      input.monthlySaving,
      input.annualInterestRate,
      months,
    );
    const totalContributed = input.monthlySaving * months;

    return {
      year,
      months,
      monthlyRate,
      totalContributed,
      futureValue,
      interestEarned: futureValue - totalContributed,
    };
  });

  const projectionValue = (year: number): number =>
    projections.find((projection) => projection.year === year)?.futureValue ??
    calculateFutureValue(
      input.monthlySaving,
      input.annualInterestRate,
      Math.round(year * MONTHS_PER_YEAR),
    );

  return {
    input: {
      ...input,
      projectionYears: normalizedYears,
    },
    projections,
    oneYear: projectionValue(1),
    fiveYears: projectionValue(5),
    tenYears: projectionValue(10),
  };
}

export function calculateCompoundInterest(
  input: CompoundInterestInput,
): CompoundInterestResult {
  assertFiniteNonNegative(input.monthlyContribution, "monthlyContribution");
  assertFiniteNonNegative(input.annualInterestRate, "annualInterestRate");
  assertFiniteNonNegative(input.initialAmount, "initialAmount");
  assertFiniteNonNegative(input.years, "years");

  const years = Math.max(0, Math.round(input.years));
  const monthlyRate = input.annualInterestRate / 100 / MONTHS_PER_YEAR;

  const balanceAtMonth = (months: number): number => {
    const initialGrowth = input.initialAmount * Math.pow(1 + monthlyRate, months);
    const contributionGrowth = calculateFutureValue(
      input.monthlyContribution,
      input.annualInterestRate,
      months,
    );
    return initialGrowth + contributionGrowth;
  };

  const projection: SavingsProjectionPoint[] = [
    {
      year: 0,
      contributed: input.initialAmount,
      interest: 0,
      balance: input.initialAmount,
    },
  ];

  for (let year = 1; year <= years; year += 1) {
    const months = year * MONTHS_PER_YEAR;
    const contributed = input.initialAmount + input.monthlyContribution * months;
    const balance = balanceAtMonth(months);
    projection.push({
      year,
      contributed,
      interest: balance - contributed,
      balance,
    });
  }

  const finalMonths = years * MONTHS_PER_YEAR;
  const finalBalance = balanceAtMonth(finalMonths);
  const totalContributed =
    input.initialAmount + input.monthlyContribution * finalMonths;

  return {
    input: {
      ...input,
      years,
    },
    projection,
    finalBalance,
    totalContributed,
    totalInterest: finalBalance - totalContributed,
  };
}

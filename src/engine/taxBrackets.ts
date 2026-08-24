export type FilingStatus = 'MFJ' | 'Single';

// 2026 Standard Deductions
export const STANDARD_DEDUCTION = {
  MFJ: 32200,
  Single: 16100, // Implied, normally half of MFJ
};

export const AGE_MODIFIER = {
  amount: 1650, // Per spouse over 65
};

export const OBBBA_BONUS = {
  amount: 6000, // Per qualifying individual (total 12000 for MFJ)
  phaseOutThresholdMFJ: 150000,
  phaseOutThresholdSingle: 75000,
  phaseOutRate: 0.06, // 6% for every dollar above threshold
};

interface TaxBracket {
  rate: number;
  ceiling: number; // The maximum income for this bracket
}

// 2026 Marginal Brackets
export const BRACKETS_2026: Record<FilingStatus, TaxBracket[]> = {
  MFJ: [
    { rate: 0.10, ceiling: 24800 },
    { rate: 0.12, ceiling: 100800 },
    { rate: 0.22, ceiling: 211400 },
    { rate: 0.24, ceiling: 403550 },
    { rate: 0.32, ceiling: 512450 },
    { rate: 0.35, ceiling: 768700 },
    { rate: 0.37, ceiling: Infinity },
  ],
  Single: [
    { rate: 0.10, ceiling: 12400 },
    { rate: 0.12, ceiling: 50400 },
    { rate: 0.22, ceiling: 105700 },
    { rate: 0.24, ceiling: 201775 },
    { rate: 0.32, ceiling: 256225 },
    { rate: 0.35, ceiling: 640600 },
    { rate: 0.37, ceiling: Infinity },
  ],
};

// 2026 Long Term Capital Gains Brackets (MFJ)
export const CAPITAL_GAINS_2026_MFJ = [
  { rate: 0.00, ceiling: 98900 },
  { rate: 0.15, ceiling: 613700 },
  { rate: 0.20, ceiling: Infinity },
];

export const NIIT = {
  thresholdMFJ: 250000,
  thresholdSingle: 200000, // Standard threshold for single
  rate: 0.038,
};

/**
 * Calculates the standard deduction including OBBBA and age modifiers.
 */
export function calculateStandardDeduction(
  status: FilingStatus,
  magi: number,
  spousesOver65: number // 0, 1, or 2
): number {
  let deduction = status === 'MFJ' ? STANDARD_DEDUCTION.MFJ : STANDARD_DEDUCTION.Single;
  deduction += spousesOver65 * AGE_MODIFIER.amount;

  // OBBBA Bonus Phase-out
  let obbba = spousesOver65 * OBBBA_BONUS.amount;
  const threshold = status === 'MFJ' ? OBBBA_BONUS.phaseOutThresholdMFJ : OBBBA_BONUS.phaseOutThresholdSingle;
  
  if (magi > threshold) {
    const phaseOut = (magi - threshold) * OBBBA_BONUS.phaseOutRate;
    obbba = Math.max(0, obbba - phaseOut);
  }

  return deduction + obbba;
}

/**
 * Calculates federal tax on ordinary income.
 */
export function calculateOrdinaryTax(status: FilingStatus, taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  
  let tax = 0;
  let previousCeiling = 0;
  const brackets = BRACKETS_2026[status];

  for (const bracket of brackets) {
    if (taxableIncome > previousCeiling) {
      const taxableInThisBracket = Math.min(taxableIncome, bracket.ceiling) - previousCeiling;
      tax += taxableInThisBracket * bracket.rate;
    } else {
      break;
    }
    previousCeiling = bracket.ceiling;
  }

  return tax;
}

/**
 * Calculates remaining capacity in a specific tax bracket.
 */
export function getBracketCapacity(status: FilingStatus, taxableIncome: number, targetRate: number): number {
  const brackets = BRACKETS_2026[status];
  // Find the highest bracket that is less than or equal to the target rate
  const targetBracket = [...brackets].reverse().find(b => b.rate <= targetRate + 0.001);
  if (!targetBracket || targetRate === 0) return 0;
  
  return Math.max(0, targetBracket.ceiling - taxableIncome);
}

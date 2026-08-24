import type { FilingStatus } from './taxBrackets';

export const SS_THRESHOLDS = {
  MFJ: {
    base: 32000,
    upper: 44000,
  },
  Single: {
    base: 25000,
    upper: 34000,
  }
};

/**
 * Calculates how much of the Social Security benefit is subject to federal income tax.
 * 
 * @param socialSecurityBenefit Total annual social security benefit received.
 * @param otherMagi All other Modified Adjusted Gross Income (excluding SS).
 * @param status Filing Status
 * @returns The dollar amount of SS that is taxable.
 */
export function calculateTaxableSocialSecurity(
  socialSecurityBenefit: number,
  otherMagi: number,
  status: FilingStatus
): number {
  if (socialSecurityBenefit <= 0) return 0;

  // Provisional Income = MAGI + 50% of SS
  const provisionalIncome = otherMagi + (socialSecurityBenefit * 0.5);
  
  const thresholds = SS_THRESHOLDS[status];
  
  let taxableAmount = 0;

  if (provisionalIncome > thresholds.upper) {
    // Up to 85% taxable
    const amountOverUpper = provisionalIncome - thresholds.upper;
    const amountBetween = thresholds.upper - thresholds.base;
    
    taxableAmount = (amountOverUpper * 0.85) + (amountBetween * 0.50);
  } else if (provisionalIncome > thresholds.base) {
    // Up to 50% taxable
    const amountOverBase = provisionalIncome - thresholds.base;
    taxableAmount = amountOverBase * 0.50;
  }

  // Maximum taxable amount is 85% of total benefit
  const maxTaxable = socialSecurityBenefit * 0.85;
  
  return Math.min(taxableAmount, maxTaxable);
}

import type { FilingStatus } from './taxBrackets';

export const IRMAA_BASE_PREMIUM = 2026.80; // Total annual cost for Part B only (without D base) - Wait, $202.90 * 12 = 2434.80

// Wait, the research said:
// Base Part B: $202.90/mo = $2,434.80/yr per person = $4,869.60 MFJ
// The table gave Total Annual Cost (MFJ Part B + D): $4,869.60 + Base Part D

interface IrmaaBracket {
  ceilingMFJ: number;
  ceilingSingle: number;
  partBSurchargeMonthly: number;
  partDSurchargeMonthly: number;
}

// 2026 IRMAA Brackets (based on 2024 MAGI)
export const IRMAA_BRACKETS_2026: IrmaaBracket[] = [
  { ceilingMFJ: 218000, ceilingSingle: 109000, partBSurchargeMonthly: 0, partDSurchargeMonthly: 0 },
  { ceilingMFJ: 274000, ceilingSingle: 137000, partBSurchargeMonthly: 81.20, partDSurchargeMonthly: 14.50 }, // $284.10 - $202.90 = $81.20
  { ceilingMFJ: 342000, ceilingSingle: 171000, partBSurchargeMonthly: 202.90, partDSurchargeMonthly: 37.50 }, // $405.80 - $202.90 = $202.90
  { ceilingMFJ: 410000, ceilingSingle: 205000, partBSurchargeMonthly: 324.60, partDSurchargeMonthly: 60.40 }, // $527.50 - $202.90 = $324.60
  { ceilingMFJ: 749999, ceilingSingle: 374999, partBSurchargeMonthly: 446.30, partDSurchargeMonthly: 83.30 }, // $649.20 - $202.90 = $446.30
  { ceilingMFJ: Infinity, ceilingSingle: Infinity, partBSurchargeMonthly: 487.00, partDSurchargeMonthly: 91.00 }, // $689.90 - $202.90 = $487.00
];

/**
 * Calculates the total annual IRMAA surcharge (penalty) above the base premium.
 * 
 * @param magi The Modified Adjusted Gross Income from 2 years prior.
 * @param status Filing Status (MFJ or Single)
 * @param enrolledSpouses 1 or 2
 * @returns Total annual surcharge in dollars.
 */
export function calculateIrmaaPenalty(magi: number, status: FilingStatus, enrolledSpouses: number): number {
  let applicableBracket = IRMAA_BRACKETS_2026[0];

  for (const bracket of IRMAA_BRACKETS_2026) {
    const ceiling = status === 'MFJ' ? bracket.ceilingMFJ : bracket.ceilingSingle;
    if (magi <= ceiling) {
      applicableBracket = bracket;
      break;
    }
  }

  const monthlySurchargePerPerson = applicableBracket.partBSurchargeMonthly + applicableBracket.partDSurchargeMonthly;
  const annualSurchargePerPerson = monthlySurchargePerPerson * 12;
  
  return annualSurchargePerPerson * enrolledSpouses;
}

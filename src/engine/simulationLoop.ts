import type { FilingStatus } from './taxBrackets';
import { calculateStandardDeduction, calculateOrdinaryTax, getBracketCapacity } from './taxBrackets';
import { getRmdAge, calculateRmd } from './rmdCalculator';
import { calculateIrmaaPenalty } from './irmaa';
import { calculateTaxableSocialSecurity } from './socialSecurity';

export interface SimulationParams {
  startYear: number;
  assumedGrowthRate: number; // e.g., 0.10
  inflationRate: number; // e.g., 0.03
  
  status: FilingStatus;
  
  spouseA: {
    birthYear: number;
    lifeExpectancy: number;
    retirementYear: number;
    socialSecurityStartYear: number;
    socialSecurityAnnualBenefit: number;
  };
  spouseB?: {
    birthYear: number;
    lifeExpectancy: number;
    retirementYear: number;
    socialSecurityStartYear: number;
    socialSecurityAnnualBenefit: number;
  };

  accounts: {
    taxDeferred: number;
    taxFree: number;
    taxable: number;
  };
  
  annualExpenses: number; // Baseline expenses (today's dollars)
  earnedIncome: number; // Total household earned income before retirement
  
  // Roth Conversion Strategy
  targetConversionBracketRate?: number; // e.g., 0.24 (24% bracket)
  avoidIrmaaCliffs: boolean;
  payConversionTaxFromConversion: boolean;
}

export interface SimulationYearResult {
  year: number;
  ageA: number;
  ageB?: number;
  
  startingBalances: { taxDeferred: number; taxFree: number; taxable: number };
  endingBalances: { taxDeferred: number; taxFree: number; taxable: number };
  
  cashFlowNeeded: number;
  rmdAmount: number;
  rothConversionAmount: number;
  
  taxableIncome: number;
  federalTaxPaid: number;
  irmaaPenalty: number;
  
  withdrawals: {
    fromTaxable: number;
    fromTaxDeferred: number; // Excludes RMD which is mandatory
    fromTaxFree: number;
  };
}

export function runSimulation(params: SimulationParams): SimulationYearResult[] {
  const results: SimulationYearResult[] = [];
  
  let currentBalances = { ...params.accounts };
  let currentExpenses = params.annualExpenses;
  
  // To track 2-year lookback for IRMAA, we'll store MAGI history. For simplicity, assume starting MAGI is $100k
  const magiHistory: number[] = [100000, 100000];
  const yearsA = Math.max(0, params.spouseA.lifeExpectancy - (params.startYear - params.spouseA.birthYear));
  const yearsB = params.spouseB ? Math.max(0, params.spouseB.lifeExpectancy - (params.startYear - params.spouseB.birthYear)) : 0;
  const yearsToProject = Math.max(yearsA, yearsB);

  for (let i = 0; i <= yearsToProject; i++) {
    const year = params.startYear + i;
    const ageA = year - params.spouseA.birthYear;
    const ageB = params.spouseB ? year - params.spouseB.birthYear : undefined;
    
    // 1. Determine Income & Cash Flow Need
    const isARetired = year >= params.spouseA.retirementYear;
    const isBRetired = params.spouseB ? year >= (params.spouseB?.retirementYear ?? 0) : true;
    
    let earnedIncome = 0;
    if (!isARetired && !isBRetired) earnedIncome = params.earnedIncome;
    else if (!isARetired || !isBRetired) earnedIncome = params.earnedIncome / 2; // Rough approximation if one retires
    
    let ssIncome = 0;
    if (year >= params.spouseA.socialSecurityStartYear) ssIncome += params.spouseA.socialSecurityAnnualBenefit;
    if (params.spouseB && year >= params.spouseB.socialSecurityStartYear) ssIncome += params.spouseB.socialSecurityAnnualBenefit;
    
    let cashFlowDeficit = currentExpenses - earnedIncome - ssIncome;
    if (cashFlowDeficit < 0) cashFlowDeficit = 0;

    // 2. Calculate RMDs
    let rmdAmount = 0;
    if (ageA >= getRmdAge(params.spouseA.birthYear)) {
      rmdAmount += calculateRmd(ageA, currentBalances.taxDeferred / (params.spouseB ? 2 : 1)); // Assuming split balances
    }
    if (ageB && params.spouseB && ageB >= getRmdAge(params.spouseB.birthYear)) {
      rmdAmount += calculateRmd(ageB, currentBalances.taxDeferred / 2);
    }
    
    // RMDs satisfy cash flow needs first
    let remainingDeficit = Math.max(0, cashFlowDeficit - rmdAmount);
    
    // 3. Taxable Income Baseline (Before Conversions or extra Tax-Deferred withdrawals)
    let nonSsMagi = earnedIncome + rmdAmount; // Simplified MAGI
    let taxableSs = calculateTaxableSocialSecurity(ssIncome, nonSsMagi, params.status);
    
    let grossIncome = nonSsMagi + taxableSs;
    let spousesOver65 = (ageA >= 65 ? 1 : 0) + ((ageB && ageB >= 65) ? 1 : 0);
    let standardDeduction = calculateStandardDeduction(params.status, grossIncome, spousesOver65);
    
    let taxableIncome = Math.max(0, grossIncome - standardDeduction);
    
    // 4. Roth Conversion Optimization
    let rothConversionAmount = 0;
    if (params.targetConversionBracketRate && currentBalances.taxDeferred > rmdAmount) {
      // Find remaining space in target bracket
      let bracketCapacity = getBracketCapacity(params.status, taxableIncome, params.targetConversionBracketRate);
      
      let maxConvertible = currentBalances.taxDeferred - rmdAmount;
      rothConversionAmount = Math.min(bracketCapacity, maxConvertible);
      
      // IRMAA Avoidance logic would constrain rothConversionAmount further here
      // For V1, we just do a simplistic conversion up to the bracket ceiling
      if (params.avoidIrmaaCliffs) {
          // Simplistic limit: keep MAGI under $218k for MFJ
          const irmaaSafeCeiling = params.status === 'MFJ' ? 218000 : 109000;
          const currentMagiEstimate = nonSsMagi + taxableSs; // Doesn't perfectly account for SS torpedo feedback loop
          if (currentMagiEstimate + rothConversionAmount > irmaaSafeCeiling) {
              rothConversionAmount = Math.max(0, irmaaSafeCeiling - currentMagiEstimate);
          }
      }
    }
    
    // 5. Calculate Final Taxes
    const baselineMagi = nonSsMagi;
    const baselineTaxableSs = calculateTaxableSocialSecurity(ssIncome, baselineMagi, params.status);
    const baselineGross = baselineMagi + baselineTaxableSs;
    const baselineTaxable = Math.max(0, baselineGross - calculateStandardDeduction(params.status, baselineGross, spousesOver65));
    const baselineFederalTax = calculateOrdinaryTax(params.status, baselineTaxable);

    nonSsMagi += rothConversionAmount;
    taxableSs = calculateTaxableSocialSecurity(ssIncome, nonSsMagi, params.status);
    grossIncome = nonSsMagi + taxableSs;
    magiHistory.push(grossIncome); // Simplified MAGI
    
    standardDeduction = calculateStandardDeduction(params.status, grossIncome, spousesOver65);
    taxableIncome = Math.max(0, grossIncome - standardDeduction);
    
    const federalTaxPaid = calculateOrdinaryTax(params.status, taxableIncome);
    const conversionTax = Math.max(0, federalTaxPaid - baselineFederalTax);
    
    // IRMAA Penalty (Based on 2 years prior)
    const irmaaMagi = magiHistory[magiHistory.length - 3];
    const enrolledSpouses = spousesOver65; // Simplify: enrolled if >= 65
    const irmaaPenalty = enrolledSpouses > 0 ? calculateIrmaaPenalty(irmaaMagi, params.status, enrolledSpouses) : 0;
    
    let totalTaxAndPenalty = federalTaxPaid + irmaaPenalty;
    let actualRothDeposit = rothConversionAmount;

    if (params.payConversionTaxFromConversion && rothConversionAmount > 0) {
      actualRothDeposit = Math.max(0, rothConversionAmount - conversionTax);
      totalTaxAndPenalty -= conversionTax; // The tax was already paid out of the gross conversion
    }
    
    // 6. Sequence of Returns / Withdrawals
    // We need to fund: remainingDeficit + totalTaxAndPenalty
    let totalCashNeeded = remainingDeficit + totalTaxAndPenalty;
    
    let fromTaxable = 0;
    let fromTaxDeferred = 0;
    let fromTaxFree = 0;
    
    // Tax-Efficient Dynamic Sequencing: Taxable -> Tax-Deferred -> Tax-Free
    if (totalCashNeeded > 0) {
      fromTaxable = Math.min(totalCashNeeded, currentBalances.taxable);
      totalCashNeeded -= fromTaxable;
    }
    
    if (totalCashNeeded > 0) {
      // Pulling extra from Tax-Deferred increases taxes, skipping iterative tax recalculation for V1 simplicity
      const maxAvailableTaxDeferred = currentBalances.taxDeferred - rmdAmount - rothConversionAmount;
      fromTaxDeferred = Math.min(totalCashNeeded, maxAvailableTaxDeferred);
      totalCashNeeded -= fromTaxDeferred;
    }
    
    if (totalCashNeeded > 0) {
      fromTaxFree = Math.min(totalCashNeeded, currentBalances.taxFree);
      totalCashNeeded -= fromTaxFree;
    }
    
    // 7. Persist & Advance
    const endingBalances = {
      taxDeferred: currentBalances.taxDeferred - rmdAmount - rothConversionAmount - fromTaxDeferred,
      taxFree: currentBalances.taxFree + actualRothDeposit - fromTaxFree,
      taxable: currentBalances.taxable - fromTaxable + Math.max(0, rmdAmount - cashFlowDeficit) // Reinvest unused RMD
    };
    
    // Apply Growth (Deterministic)
    endingBalances.taxDeferred *= (1 + params.assumedGrowthRate);
    endingBalances.taxFree *= (1 + params.assumedGrowthRate);
    endingBalances.taxable *= (1 + params.assumedGrowthRate);
    
    // Apply Inflation to Expenses
    currentExpenses *= (1 + params.inflationRate);
    
    results.push({
      year,
      ageA,
      ageB,
      startingBalances: { ...currentBalances },
      endingBalances: { ...endingBalances },
      cashFlowNeeded: cashFlowDeficit,
      rmdAmount,
      rothConversionAmount,
      taxableIncome,
      federalTaxPaid,
      irmaaPenalty,
      withdrawals: { fromTaxable, fromTaxDeferred, fromTaxFree }
    });
    
    currentBalances = endingBalances;
  }
  
  return results;
}

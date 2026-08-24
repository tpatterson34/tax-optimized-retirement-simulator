import { useState, useMemo } from 'react';
import type { SimulationParams, SimulationYearResult } from '../engine/simulationLoop';
import { runSimulation } from '../engine/simulationLoop';

export function useSimulatorStore() {
  const [params, setParams] = useState<SimulationParams>({
    startYear: new Date().getFullYear(), // 2026
    yearsToProject: 30,
    assumedGrowthRate: 0.10, // Deterministic 10%
    inflationRate: 0.03, // 3% inflation
    status: 'MFJ',
    spouseA: {
      birthYear: 1960, // Empty/default
      retirementYear: 2026,
      socialSecurityStartYear: 2027,
      socialSecurityAnnualBenefit: 0,
    },
    spouseB: {
      birthYear: 1960,
      retirementYear: 2026,
      socialSecurityStartYear: 2027,
      socialSecurityAnnualBenefit: 0,
    },
    accounts: {
      taxDeferred: 0,
      taxFree: 0,
      taxable: 0,
    },
    annualExpenses: 0,
    earnedIncome: 0,
    targetConversionBracketRate: 0.24, // Target 24% bracket by default
    avoidIrmaaCliffs: true,
  });

  const results: SimulationYearResult[] = useMemo(() => {
    return runSimulation(params);
  }, [params]);

  return {
    params,
    setParams,
    results,
  };
}

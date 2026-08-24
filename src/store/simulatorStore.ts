import { useState, useMemo, useEffect } from 'react';
import type { SimulationParams, SimulationYearResult } from '../engine/simulationLoop';
import { runSimulation } from '../engine/simulationLoop';

const STORAGE_KEY = 'retirementSimulatorParams';

const DEFAULT_PARAMS: SimulationParams = {
  startYear: new Date().getFullYear(),
  yearsToProject: 30,
  assumedGrowthRate: 0.10,
  inflationRate: 0.03,
  status: 'MFJ',
  spouseA: { birthYear: 1960, retirementYear: 2026, socialSecurityStartYear: 2027, socialSecurityAnnualBenefit: 0 },
  spouseB: { birthYear: 1960, retirementYear: 2026, socialSecurityStartYear: 2027, socialSecurityAnnualBenefit: 0 },
  accounts: { taxDeferred: 0, taxFree: 0, taxable: 0 },
  annualExpenses: 0,
  earnedIncome: 0,
  targetConversionBracketRate: 0.24,
  avoidIrmaaCliffs: true,
};

export function useSimulatorStore() {
  const [params, setParams] = useState<SimulationParams>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved params", e);
      }
    }
    return DEFAULT_PARAMS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  }, [params]);

  const results: SimulationYearResult[] = useMemo(() => {
    return runSimulation(params);
  }, [params]);

  return {
    params,
    setParams,
    results,
  };
}

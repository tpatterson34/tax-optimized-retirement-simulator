import { runSimulation } from './src/engine/simulationLoop';
import type { SimulationParams } from './src/engine/simulationLoop';

const params: SimulationParams = {
  startYear: 2026,
  assumedGrowthRate: 0.10,
  inflationRate: 0.03,
  status: 'MFJ',
  spouseA: { birthYear: 1960, lifeExpectancy: 95, retirementYear: 2026, socialSecurityStartYear: 2027, socialSecurityAnnualBenefit: 0 },
  spouseB: { birthYear: 1960, lifeExpectancy: 95, retirementYear: 2026, socialSecurityStartYear: 2027, socialSecurityAnnualBenefit: 0 },
  accounts: { taxDeferred: 1000000, taxFree: 0, taxable: 0 },
  annualExpenses: 50000,
  earnedIncome: 0,
  targetConversionBracketRate: 0.24,
  avoidIrmaaCliffs: true,
};

const results = runSimulation(params);
console.log("Length:", results.length);
console.log("Last result:", results[results.length - 1]);

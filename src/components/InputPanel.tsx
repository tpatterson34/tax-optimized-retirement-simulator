import React from 'react';
import type { SimulationParams } from '../engine/simulationLoop';

interface InputPanelProps {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
}

function PercentageInput({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
  const [localVal, setLocalVal] = React.useState((value * 100).toString());
  
  // Sync if external state changes, but allow free typing otherwise
  React.useEffect(() => {
    if (parseFloat(localVal) / 100 !== value) {
      setLocalVal((value * 100).toString());
    }
  }, [value]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalVal(e.target.value);
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed)) {
      onChange(parsed / 100);
    }
  };

  return (
    <div>
      <label className="block text-slate-600 mb-1">{label}</label>
      <input 
        type="text" 
        value={localVal} 
        onChange={handleInput}
        className="w-full border rounded p-1.5 focus:ring-2 focus:ring-blue-500" 
      />
    </div>
  );
}

export default function InputPanel({ params, setParams }: InputPanelProps) {
  const handleChange = (field: string, value: any) => {
    setParams(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (category: 'spouseA' | 'spouseB' | 'accounts', field: string, value: any) => {
    setParams(prev => ({
      ...prev,
      [category]: {
        ...(prev[category as keyof SimulationParams] as any),
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6 text-sm">
      {/* Global Assumptions */}
      <div>
        <h3 className="font-semibold text-blue-800 border-b pb-1 mb-3">Global Assumptions</h3>
        <div className="grid grid-cols-2 gap-4">
          <PercentageInput 
            label="Growth Rate (%)" 
            value={params.assumedGrowthRate} 
            onChange={v => handleChange('assumedGrowthRate', v)} 
          />
          <PercentageInput 
            label="Inflation Rate (%)" 
            value={params.inflationRate} 
            onChange={v => handleChange('inflationRate', v)} 
          />
        </div>
      </div>

      {/* Account Balances */}
      <div>
        <h3 className="font-semibold text-blue-800 border-b pb-1 mb-3">Account Balances ($)</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-slate-600 mb-1">Tax-Deferred (Pre-tax IRA/401k)</label>
            <input 
              type="number" 
              value={params.accounts.taxDeferred || ''} 
              onChange={e => handleNestedChange('accounts', 'taxDeferred', parseFloat(e.target.value) || 0)}
              className="w-full border rounded p-1.5 focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1">Tax-Free (Roth IRA)</label>
            <input 
              type="number" 
              value={params.accounts.taxFree || ''} 
              onChange={e => handleNestedChange('accounts', 'taxFree', parseFloat(e.target.value) || 0)}
              className="w-full border rounded p-1.5 focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1">Taxable (Brokerage)</label>
            <input 
              type="number" 
              value={params.accounts.taxable || ''} 
              onChange={e => handleNestedChange('accounts', 'taxable', parseFloat(e.target.value) || 0)}
              className="w-full border rounded p-1.5 focus:ring-2 focus:ring-blue-500" 
            />
          </div>
        </div>
      </div>

      {/* Income & Expenses */}
      <div>
        <h3 className="font-semibold text-blue-800 border-b pb-1 mb-3">Income & Expenses ($/yr)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-600 mb-1">Base Expenses</label>
            <input 
              type="number" 
              value={params.annualExpenses || ''} 
              onChange={e => handleChange('annualExpenses', parseFloat(e.target.value) || 0)}
              className="w-full border rounded p-1.5 focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1">Earned Income</label>
            <input 
              type="number" 
              value={params.earnedIncome || ''} 
              onChange={e => handleChange('earnedIncome', parseFloat(e.target.value) || 0)}
              className="w-full border rounded p-1.5 focus:ring-2 focus:ring-blue-500" 
            />
          </div>
        </div>
      </div>

      {/* Spouse Details */}
      <div>
        <h3 className="font-semibold text-blue-800 border-b pb-1 mb-3">Spouse A Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-600 mb-1">Birth Year</label>
            <input 
              type="number" 
              value={params.spouseA.birthYear || ''} 
              onChange={e => handleNestedChange('spouseA', 'birthYear', parseFloat(e.target.value) || 0)}
              className="w-full border rounded p-1.5 focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1">Retirement Year</label>
            <input 
              type="number" 
              value={params.spouseA.retirementYear || ''} 
              onChange={e => handleNestedChange('spouseA', 'retirementYear', parseFloat(e.target.value) || 0)}
              className="w-full border rounded p-1.5 focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1">SS Start Year</label>
            <input 
              type="number" 
              value={params.spouseA.socialSecurityStartYear || ''} 
              onChange={e => handleNestedChange('spouseA', 'socialSecurityStartYear', parseFloat(e.target.value) || 0)}
              className="w-full border rounded p-1.5 focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1">SS Benefit/yr</label>
            <input 
              type="number" 
              value={params.spouseA.socialSecurityAnnualBenefit || ''} 
              onChange={e => handleNestedChange('spouseA', 'socialSecurityAnnualBenefit', parseFloat(e.target.value) || 0)}
              className="w-full border rounded p-1.5 focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1">Life Expectancy (Age)</label>
            <input 
              type="number" 
              value={params.spouseA.lifeExpectancy || ''} 
              onChange={e => handleNestedChange('spouseA', 'lifeExpectancy', parseFloat(e.target.value) || 95)}
              className="w-full border rounded p-1.5 focus:ring-2 focus:ring-blue-500" 
            />
          </div>
        </div>
      </div>
      
      {params.status === 'MFJ' && params.spouseB && (
        <div>
          <h3 className="font-semibold text-blue-800 border-b pb-1 mb-3">Spouse B Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 mb-1">Birth Year</label>
              <input 
                type="number" 
                value={params.spouseB.birthYear || ''} 
                onChange={e => handleNestedChange('spouseB', 'birthYear', parseFloat(e.target.value) || 0)}
                className="w-full border rounded p-1.5 focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Retirement Year</label>
              <input 
                type="number" 
                value={params.spouseB.retirementYear || ''} 
                onChange={e => handleNestedChange('spouseB', 'retirementYear', parseFloat(e.target.value) || 0)}
                className="w-full border rounded p-1.5 focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">SS Start Year</label>
              <input 
                type="number" 
                value={params.spouseB.socialSecurityStartYear || ''} 
                onChange={e => handleNestedChange('spouseB', 'socialSecurityStartYear', parseFloat(e.target.value) || 0)}
                className="w-full border rounded p-1.5 focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">SS Benefit/yr</label>
              <input 
                type="number" 
                value={params.spouseB.socialSecurityAnnualBenefit || ''} 
                onChange={e => handleNestedChange('spouseB', 'socialSecurityAnnualBenefit', parseFloat(e.target.value) || 0)}
                className="w-full border rounded p-1.5 focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Life Expectancy (Age)</label>
              <input 
                type="number" 
                value={params.spouseB.lifeExpectancy || ''} 
                onChange={e => handleNestedChange('spouseB', 'lifeExpectancy', parseFloat(e.target.value) || 95)}
                className="w-full border rounded p-1.5 focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>
        </div>
      )}

      {/* Roth Strategy Slider */}
      <div>
        <h3 className="font-semibold text-blue-800 border-b pb-1 mb-3">Optimization Targets</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-slate-600 mb-1 flex justify-between">
              <span>Target Conversion Bracket Ceiling</span>
              <span className="font-semibold text-blue-700">{(params.targetConversionBracketRate || 0) * 100}%</span>
            </label>
            <select
              value={params.targetConversionBracketRate || 0}
              onChange={e => handleChange('targetConversionBracketRate', parseFloat(e.target.value))}
              className="w-full border rounded p-1.5 focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>0% (No Conversions)</option>
              <option value={0.10}>10% Bracket</option>
              <option value={0.12}>12% Bracket</option>
              <option value={0.22}>22% Bracket</option>
              <option value={0.24}>24% Bracket</option>
              <option value={0.32}>32% Bracket</option>
              <option value={0.35}>35% Bracket</option>
              <option value={0.37}>37% Bracket</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">Simulates Roth conversions up to the top of this bracket.</p>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <input 
              type="checkbox" 
              checked={params.avoidIrmaaCliffs}
              onChange={e => handleChange('avoidIrmaaCliffs', e.target.checked)}
              className="rounded text-blue-600"
            />
            <label className="text-slate-600">Strictly Avoid IRMAA Cliffs during Conversions</label>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <input 
              type="checkbox" 
              checked={params.payConversionTaxFromConversion}
              onChange={e => handleChange('payConversionTaxFromConversion', e.target.checked)}
              className="rounded text-blue-600"
            />
            <label className="text-slate-600">Withhold Taxes from Converted Amount</label>
          </div>
        </div>
      </div>
    </div>
  );
}

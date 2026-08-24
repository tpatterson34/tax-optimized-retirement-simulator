
import type { SimulationYearResult } from '../engine/simulationLoop';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, ComposedChart, Line
} from 'recharts';

import type { SimulationParams } from '../engine/simulationLoop';

interface DashboardProps {
  results: SimulationYearResult[];
  params: SimulationParams;
}

export default function Dashboard({ results, params }: DashboardProps) {
  if (!results || results.length === 0) return <div>No simulation results available. Check inputs.</div>;

  const data = results.map(r => ({
    year: r.year,
    ageA: r.ageA,
    taxDeferred: r.endingBalances.taxDeferred,
    taxFree: r.endingBalances.taxFree,
    taxable: r.endingBalances.taxable,
    totalBalance: r.endingBalances.taxDeferred + r.endingBalances.taxFree + r.endingBalances.taxable,
    taxableIncome: r.taxableIncome,
    federalTax: r.federalTaxPaid,
    irmaaPenalty: r.irmaaPenalty,
    rmd: r.rmdAmount,
    rothConversion: r.rothConversionAmount
  }));

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });

  const terminalYear = data[data.length - 1].year;
  const terminalNominal = data[data.length - 1].totalBalance;
  const terminalReal = terminalNominal / Math.pow(1 + params.inflationRate, terminalYear - params.startYear);

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg">
          <p className="text-slate-500 text-sm mb-1">Terminal Value (Nominal)</p>
          <p className="text-2xl font-bold text-slate-800">
            {formatter.format(terminalNominal)}
          </p>
        </div>
        <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg">
          <p className="text-slate-500 text-sm mb-1">Terminal Value (Today's $)</p>
          <p className="text-2xl font-bold text-green-700">
            {formatter.format(terminalReal)}
          </p>
        </div>
        <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg">
          <p className="text-slate-500 text-sm mb-1">Total Federal Taxes Paid</p>
          <p className="text-2xl font-bold text-red-600">
            {formatter.format(data.reduce((sum, r) => sum + r.federalTax, 0))}
          </p>
        </div>
        <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg">
          <p className="text-slate-500 text-sm mb-1">Total IRMAA Penalties</p>
          <p className="text-2xl font-bold text-orange-600">
            {formatter.format(data.reduce((sum, r) => sum + r.irmaaPenalty, 0))}
          </p>
        </div>
      </div>

      {/* Portfolio Value Chart */}
      <div className="h-80">
        <h3 className="font-semibold text-slate-700 mb-2">Portfolio Value Projection</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="ageA" label={{ value: 'Age (Spouse A)', position: 'insideBottomRight', offset: -5 }} />
            <YAxis tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
            <Tooltip formatter={(val: any) => formatter.format(val)} labelFormatter={(label) => `Age: ${label}`} />
            <Legend />
            <Area type="monotone" dataKey="taxable" stackId="1" stroke="#94a3b8" fill="#cbd5e1" name="Taxable" />
            <Area type="monotone" dataKey="taxDeferred" stackId="1" stroke="#eab308" fill="#fde047" name="Tax-Deferred" />
            <Area type="monotone" dataKey="taxFree" stackId="1" stroke="#22c55e" fill="#86efac" name="Tax-Free (Roth)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Tax Burden Chart */}
      <div className="h-80">
        <h3 className="font-semibold text-slate-700 mb-2">Taxable Income & Taxes Paid</h3>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="ageA" />
            <YAxis tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
            <Tooltip formatter={(val: any) => formatter.format(val)} />
            <Legend />
            <Bar dataKey="taxableIncome" fill="#bfdbfe" name="Taxable Income" />
            <Line type="monotone" dataKey="federalTax" stroke="#ef4444" strokeWidth={2} name="Federal Tax" />
            <Line type="monotone" dataKey="irmaaPenalty" stroke="#f97316" strokeWidth={2} name="IRMAA Penalty" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Conversion & RMDs */}
      <div className="h-80">
        <h3 className="font-semibold text-slate-700 mb-2">RMDs and Roth Conversions</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="ageA" />
            <YAxis tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
            <Tooltip formatter={(val: any) => formatter.format(val)} />
            <Legend />
            <Bar dataKey="rmd" fill="#facc15" name="Required Minimum Distribution (RMD)" />
            <Bar dataKey="rothConversion" fill="#4ade80" name="Roth Conversion Amount" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

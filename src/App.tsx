
import { useSimulatorStore } from './store/simulatorStore';
import InputPanel from './components/InputPanel';
import Dashboard from './components/Dashboard';
import { Briefcase, LineChart } from 'lucide-react';

function App() {
  const { params, setParams, results } = useSimulatorStore();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-blue-900 text-white p-4 shadow-md flex items-center space-x-3">
        <Briefcase className="w-6 h-6" />
        <h1 className="text-xl font-bold tracking-tight">Tax-Optimized Retirement Decumulation Simulator</h1>
      </header>

      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs */}
        <section className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit">
          <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
            <h2 className="font-semibold text-slate-700 flex items-center space-x-2">
              <span>Financial Profile</span>
            </h2>
          </div>
          <div className="p-4">
            <InputPanel params={params} setParams={setParams} />
          </div>
        </section>

        {/* Right Column: Dashboard/Charts */}
        <section className="lg:col-span-8 flex flex-col space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h2 className="font-semibold text-slate-700 flex items-center space-x-2 mb-4">
              <LineChart className="w-5 h-5 text-blue-600" />
              <span>Simulation Dashboard</span>
            </h2>
            <Dashboard results={results} params={params} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

# Retirement Simulator Walkthrough

I have successfully built the **Tax-Optimized Retirement Decumulation Simulator**. 

## Changes Made
1. **Scaffolded Project**: Initialized a Vite + React + TypeScript project at `C:\Users\tpatt\.gemini\antigravity\scratch\retirement_simulator`.
2. **Engine Implementation**: 
   - `taxBrackets.ts`: Contains the 2026 MFJ and Single marginal tax brackets, along with standard deductions and the OBBBA age-based modifiers.
   - `rmdCalculator.ts`: Implements the IRS Uniform Lifetime Table (Table III) and SECURE 2.0 RMD age rules.
   - `irmaa.ts`: Implements the rigid IRMAA penalty cliffs based on 2026 Medicare numbers.
   - `socialSecurity.ts`: Calculates the "Tax Torpedo" where up to 85% of Social Security becomes taxable.
   - `simulationLoop.ts`: The central algorithm that projects balances year-by-year, handles dynamic withdrawals (taxable -> tax-deferred -> tax-free), and simulates algorithmic Roth Conversions up to a target bracket capacity.
3. **User Interface**: 
   - A single-page layout with a comprehensive `InputPanel` on the left and a reactive `Dashboard` on the right.
   - Integrated `recharts` to render a stacked area chart for portfolio projections over time, and a bar/line chart visualizing the tax burden and conversion amounts.
4. **GitHub Pages Readiness**: Set the Vite base configuration (`base: './'`) to allow you to easily deploy the `dist/` directory to GitHub Pages. All state is maintained locally in the browser's memory, ensuring privacy.

## How to Run Locally

You can launch the local development server by running the following command in a terminal (like PowerShell):

```bash
cd C:\Users\tpatt\.gemini\antigravity\scratch\retirement_simulator
npm run dev
```

Then, open your browser to `http://localhost:5173`. 

The application initializes with empty balances and ages, but populates global assumptions (10% growth rate, 24% target conversion ceiling) so you can immediately begin inputting your financial profile.

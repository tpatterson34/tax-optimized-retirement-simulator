# Tax-Optimized Retirement Simulator

A deterministic retirement portfolio simulator built to model and optimize the highly complex tax interactions during retirement—specifically focusing on tax-efficient withdrawal sequencing, Roth IRA conversions, Social Security taxation, and Medicare IRMAA cliffs.

**[Live Demo](https://tpatterson34.github.io/tax-optimized-retirement-simulator/)**

Because this simulator is built as a single-page React application (SPA) with no backend database, all financial data is stored purely in your browser's `localStorage` and never leaves your machine. 

## 🚀 Core Features

- **Tax-Efficient Withdrawal Sequencing**: Automatically pulls cash flow deficits dynamically from Taxable -> Tax-Deferred -> Tax-Free (Roth) accounts to minimize tax drag.
- **Dynamic Roth Conversions**: Simulates annual Roth conversions from your Pre-Tax IRA up to a specific tax bracket ceiling (e.g., filling up the 24% bracket).
- **Tax Withholding Strategy**: Option to pay the conversion tax bill directly from the conversion amount, or to pay it out of a taxable brokerage account to maximize tax-free growth.
- **Social Security "Tax Torpedo"**: Accurately calculates the sliding scale of Social Security taxation based on Modified Adjusted Gross Income (MAGI).
- **Medicare IRMAA Cliffs**: Models Medicare Part B & D surcharge penalties based on the strict 2-year lag MAGI cliffs, with an optional constraint to dynamically throttle Roth conversions if they would trigger a cliff.
- **IRS RMDs (Table III)**: Enforces Required Minimum Distributions starting at age 75.

## 🧮 How the Mathematical Engine Works

The core simulation loop runs sequentially for each year of your retirement up to your projected life expectancy. The algorithm calculates the following steps for each year:

1. **Calculate Required Minimum Distributions (RMDs)**: Based on the Uniform Lifetime Table (Table III) for your age, pulling mandatory amounts out of the Pre-Tax bucket.
2. **Determine Cash Flow Deficit**: Looks at annual living expenses (adjusted for inflation) and subtracts guaranteed income (Social Security, Earned Income) and RMDs.
3. **Optimize Roth Conversions**: If there is room left in your targeted tax bracket, it converts funds from the Pre-Tax bucket to the Roth bucket. If the "Avoid IRMAA Cliffs" flag is checked, it caps the conversion to prevent spiking into the next surcharge tier.
4. **Determine Final Taxation**: Computes the exact federal tax burden and Medicare surcharges for the year, factoring in the cascading effect of the conversion pushing more Social Security into taxable status.
5. **Fund the Deficit**: Liquidates assets to pay for both living expenses and the tax bill using the optimal tax-efficient sequence.
6. **Apply Growth & Tax Drag**: Applies a deterministic, compounded growth rate to the portfolio. *Note: Taxable brokerage accounts suffer an automatic 15% tax drag on growth to simulate ongoing capital gains and dividend taxes, while Roth and Pre-Tax accounts grow tax-free.*

## 🛠️ Development & Forking

This project is open-source. If you are a developer or financial planner who wants to fork this repository and tweak the tax laws, add state income taxes, or swap the deterministic growth engine for a Monte Carlo simulator, here is how to run it locally:

### Prerequisites
- Node.js (v18+)
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/tpatterson34/tax-optimized-retirement-simulator.git

# Navigate to the directory
cd tax-optimized-retirement-simulator

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Key Files to Modify
- `src/engine/simulationLoop.ts`: The absolute core of the financial engine. All sequencing, tax calculation steps, and growth compounding happens in this single file.
- `src/engine/taxBrackets.ts`: Contains the hardcoded 2026 IRS tax brackets, standard deductions, and IRMAA cliffs. Update this file annually as tax laws change.
- `src/engine/socialSecurity.ts`: The formula for calculating taxable Social Security benefits.
- `src/components/Dashboard.tsx`: The Recharts visualization layer.

## 🚢 Deployment

This project uses Vite. To build for production and deploy to GitHub Pages:

```bash
npm run build
npm run deploy
```

## ⚠️ Disclaimer

**This is an educational tool, not financial advice.** The calculations are based on programmed estimations of the 2026 U.S. Federal Tax Code and do not include State Taxes, Alternative Minimum Tax (AMT), or changing future legislation. Always consult a Certified Financial Planner (CFP) or CPA before making real-world Roth conversions or retirement decisions.

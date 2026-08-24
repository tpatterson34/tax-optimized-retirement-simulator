# Tax-Optimized Retirement Decumulation Simulator

This document outlines the implementation plan for a deterministic retirement withdrawal simulator, optimized for minimizing taxes and maximizing terminal portfolio value, tailored to a Washington State resident.

## User Review Required

> [!IMPORTANT]
> The simulator will be built as a single-page React application (using Vite, TypeScript, and Tailwind CSS). It will run completely locally in your browser, saving data to LocalStorage to ensure privacy. Please review this tech stack and confirm if it aligns with your expectations.
> I will create this project in a new workspace directory at `C:\Users\tpatt\.gemini\antigravity\scratch\retirement_simulator`.

## Open Questions

> [!WARNING]
> 1. **Data Initialization:** Do you want to pre-load the simulator with sample dummy data, or start with empty inputs for you to fill out?
> 2. **Monte Carlo vs Deterministic:** The research mentions starting with a deterministic 10% growth rate but aspiring to Monte Carlo simulation. We will start with a deterministic fixed rate for V1. Is this acceptable?
> 3. **UI Complexity:** Given the large number of inputs (birthdates, balances, expense epochs), would you prefer a multi-step wizard to initialize the profile, or a single dashboard with expandable sections?

## Proposed Changes

We will scaffold a new React application using Vite and implement the following architecture:

---

### Application Shell & State Management

State will be managed using React Context or a lightweight library like Zustand to handle the complex, deeply nested financial profile, persisting it to `localStorage`.

#### [NEW] `src/store/simulatorStore.ts`
Manages the central state:
- **User Profile:** Birthdates, retirement dates, life expectancy.
- **Accounts:** Tax-deferred (Traditional IRA/401k), Tax-free (Roth), Taxable (Brokerage).
- **Income & Expenses:** Earned income (pre-retirement), Social Security, Pensions, dynamic expense epochs.
- **Assumptions:** Annual growth rate (default 10%), inflation.

#### [NEW] `src/App.tsx`
Main application layout, dividing the screen into an Input Panel (left/top) and a Results/Charts Dashboard (right/bottom).

---

### Core Calculation Engine

This will be the mathematical heart of the application, running the iterative annual loop to project balances forward.

#### [NEW] `src/engine/simulationLoop.ts`
Executes the discrete annual loop for every projected year of retirement:
1.  **Determine Cash Flow:** Expenses - Earned Income - Fixed Income.
2.  **Calculate RMDs:** Based on statutory ages and prior-year tax-deferred balances.
3.  **Baseline Taxable Income:** Ordinary + taxable RMDs + taxable Social Security.
4.  **Bracket Capacity:** Determine remaining space in the target tax bracket (e.g., 22%, 24%).
5.  **Roth Conversions (Arbitrage):** Automatically convert up to the top of the target bracket, stopping at IRMAA cliffs.
6.  **Withdrawals:** Fund remaining cash flow needs following Tax-Efficient Dynamic Sequencing (Taxable -> Tax-Deferred -> Tax-Free).
7.  **Persist & Advance:** Deduct taxes and withdrawals, apply the 10% growth rate, and push the year's state to an array.

---

### Tax & Statutory Modules

Dedicated modules to encapsulate the complex rules of the Internal Revenue Code and Medicare.

#### [NEW] `src/engine/taxBrackets.ts`
- 2026 Federal Income Tax Brackets (Single & Married Filing Jointly).
- Standard deductions with age-based modifiers and OBBBA phase-outs.
- Capital Gains Brackets & Net Investment Income Tax (NIIT).
- *Note: Washington State tax is hardcoded to 0% as per requirements.*

#### [NEW] `src/engine/rmdCalculator.ts`
- IRS Uniform Lifetime Table (Table III).
- Logic to determine RMD start age (72, 73, or 75) based on birth year (SECURE 2.0 Act).

#### [NEW] `src/engine/irmaa.ts`
- 2026 IRMAA Brackets and Medicare Part B/D surcharges.
- Enforces the two-year lookback mechanism (using MAGI from Year - 2).

#### [NEW] `src/engine/socialSecurity.ts`
- Calculates the "Tax Torpedo" (up to 85% of benefits becoming taxable based on Provisional Income).

---

### User Interface Components

#### [NEW] `src/components/InputPanel.tsx`
Forms for users to enter spouse details, account balances, and dynamic expense intervals (e.g., higher expenses early in retirement, lower later).

#### [NEW] `src/components/Dashboard.tsx`
Displays the simulation results over time.

#### [NEW] `src/components/Charts.tsx`
Utilizes `recharts` to render:
- **Portfolio Value Over Time:** Stacked area chart showing Tax-Deferred, Tax-Free, and Taxable balances.
- **Tax Burden:** Bar chart comparing taxes paid under the Status Quo vs. Roth Conversion strategies.
- **Income Sources:** Breakdown of where cash flow is sourced each year.

## Verification Plan

### Automated Tests
- We will write unit tests for the core tax logic in `taxBrackets.ts`, `rmdCalculator.ts`, and `irmaa.ts` using Vitest to ensure the boundary conditions (e.g., IRMAA cliffs, tax bracket transitions) are mathematically accurate against the provided research data.

### Manual Verification
- You will be able to run the local web server, input a sample financial profile, and visually verify if the projected taxes, RMDs, and terminal portfolio value match expectations based on the Roth conversion strategies.

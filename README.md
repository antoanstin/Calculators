# Mortgage & Finance Calculator Suite

A modular Next.js application featuring a suite of 8 financial calculators for mortgage planning, debt management, and financial analysis.

## Calculators Included

1. **Income Calculator**: Calculate total monthly and annual qualifying income from multiple sources (Base, Bonus, Overtime, Commission, Rental).
2. **Amortization Schedule**: Generate full amortization tables, visualize payments, and compare two loan scenarios side-by-side.
3. **Blended Rate**: Calculate the weighted average interest rate of multiple loans (e.g., Mortgage + HELOC).
4. **Debt Consolidation**: Analyze potential savings by consolidating multiple debts into a single loan.
5. **Early Payoff**: Visualize time and interest saved by making extra principal payments.
6. **Prepayment Savings**: Compare refinancing vs. making extra payments to see which saves more interest.
7. **Refinance Breakeven**: Determine how long it takes for a refinance to pay for itself through monthly savings.
8. **Credit Card Payoff**: Calculate time to payoff based on fixed payment, or payment needed for fixed time.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Design**: Clean, responsive UI with modular components.
- **Testing**: Jest for calculation logic.

## Usage

### Prerequisites
- Node.js (v18+ recommend)
- npm

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the app.

### Running Tests

```bash
npm run test  # Runs jest unit tests
```

## Calculation Logic & Assumptions

- **Amortization**: Uses standard standard amortization formula: `P = L[c(1 + c)^n]/[(1 + c)^n - 1]`. Bi-weekly payments are approximated (26 payments/year).
- **Income**: Rental income defaults to 75% occupancy factor but can be adjusted.
- **Credit Card**: Assumes interest is calculated on average daily balance method approximated by monthly periodic rate.
- **Breakeven**: Simple payback period = Closing Costs / Monthly Savings.

## Project Structure

- `/app`: Next.js App Router pages and layout.
- `/components/calculators`: Individual calculator components (Logic + UI).
- `/components/ui`: Shared reusable UI components (Input, Select, ResultCard).
- `/lib/calculations`: Pure helper functions for financial math (Testable).
- `/data/calculatorsRegistry.ts`: Configuration for all calculators.

## License

MIT
# Calculators

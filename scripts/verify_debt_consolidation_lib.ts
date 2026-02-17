
// Verification script importing the actual library function
import { calculateDebtConsolidation, ConsolidationInputs } from '../lib/calculations/debtConsolidation';

const debts = [
    { id: "1", name: 'Credit card 1', balance: 10000, interestRate: 17.99, minPayment: 260 },
    { id: "2", name: 'Credit card 2', balance: 7500, interestRate: 19.99, minPayment: 190 },
    { id: "3", name: 'High interest debt', balance: 6500, interestRate: 18.99, minPayment: 180 },
];

const inputs: ConsolidationInputs = {
    debts: debts,
    newLoanRate: 10.99,
    newLoanTermMonths: 60,
    closingCosts: 5,
    feeType: "%",
    desiredLoanAmount: 25000
};

const result = calculateDebtConsolidation(inputs);

console.log("\n--- Verification Results ---");
console.log(`Existing APR: ${result.existingBlendedRate.toFixed(2)}% (Target 18.92%)`);
console.log(`Existing Monthly Pay: ${result.existingTotalMonthlyPayment.toFixed(2)} (Target 630.00)`);
console.log(`Existing Time to Payoff: ${result.existingTimeToPayoffMonths} months (Target 59)`);
console.log(`Existing Total Payments: ${result.existingTotalPayments.toFixed(2)} (Target 36963.17)`);
console.log(`Existing Total Interest: ${result.existingTotalInterest.toFixed(2)} (Target 12963.22)`);

console.log("\n--- New Loan ---");
console.log(`New Monthly Pay: ${result.newMonthlyPayment.toFixed(2)} (Target 543.44)`);
console.log(`New APR: ${result.newAPR.toFixed(2)}% (Target 13.25%)`);


// Reproduction script for Debt Consolidation existing debts logic
export { };
// Trying to match:
// Total Payments: $36,963.17
// Total Interest: $12,963.22
// APR: 18.92%

interface Debt {
    name: string;
    balance: number;
    rate: number;
    minPayment: number;
}

const debts: Debt[] = [
    { name: 'Credit card 1', balance: 10000, rate: 17.99, minPayment: 260 },
    { name: 'Credit card 2', balance: 7500, rate: 19.99, minPayment: 190 },
    { name: 'High interest debt', balance: 6500, rate: 18.99, minPayment: 180 },
];

function calculatePayoff(debt: Debt) {
    let balance = debt.balance;
    let months = 0;
    let totalInterest = 0;
    let totalPayments = 0;
    const monthlyRate = debt.rate / 100 / 12;

    while (balance > 0.01) {
        const interest = balance * monthlyRate;
        let payment = debt.minPayment;
        if (balance + interest < payment) {
            payment = balance + interest;
        }

        const principal = payment - interest;
        balance -= principal;
        totalInterest += interest;
        totalPayments += payment;
        months++;

        if (months > 1000) break; // Infinite check
    }
    return { months, totalInterest, totalPayments };
}

console.log("--- Individual Payoffs ---");
let grandTotalPayments = 0;
let grandTotalInterest = 0;
let maxMonths = 0;

debts.forEach(d => {
    const p = calculatePayoff(d);
    console.log(`${d.name}: Months=${p.months}, TotalPay=${p.totalPayments.toFixed(2)}, TotalInt=${p.totalInterest.toFixed(2)}`);
    grandTotalPayments += p.totalPayments;
    grandTotalInterest += p.totalInterest;
    if (p.months > maxMonths) maxMonths = p.months;
});

console.log("--- Aggregate ---");
console.log(`Total Payments: ${grandTotalPayments.toFixed(2)} (Target: 36,963.17)`);
console.log(`Total Interest: ${grandTotalInterest.toFixed(2)} (Target: 12,963.22)`);
console.log(`Max Months: ${maxMonths} (Target: 59)`);

// APR Calculation (IRR of aggregate cash flows)
// We need the stream of payments
function getAggregateCashFlows(debts: Debt[]) {
    const monthPayments: number[] = [];
    const maxM = 1000;

    // Track balances for each debt
    const balances = debts.map(d => d.balance);

    for (let m = 0; m < maxM; m++) {
        let totalPayment = 0;
        let allPaid = true;

        for (let i = 0; i < debts.length; i++) {
            if (balances[i] > 0.001) {
                allPaid = false;
                const monthlyRate = debts[i].rate / 100 / 12;
                const interest = balances[i] * monthlyRate;
                let payment = debts[i].minPayment;

                if (balances[i] + interest < payment) {
                    payment = balances[i] + interest;
                }

                const principal = payment - interest;
                balances[i] -= principal;
                totalPayment += payment;
            }
        }

        if (allPaid) break;
        monthPayments.push(totalPayment);
    }
    return monthPayments;
}

const cashFlows = getAggregateCashFlows(debts);
const initialInvestment = debts.reduce((sum, d) => sum + d.balance, 0);

// Simple IRR approximation
function calculateIRR(cashFlow0: number, payments: number[]): number {
    let low = 0;
    let high = 1;
    let guess = 0.05;

    for (let i = 0; i < 50; i++) {
        guess = (low + high) / 2;
        let npv = -cashFlow0;
        for (let j = 0; j < payments.length; j++) {
            npv += payments[j] / Math.pow(1 + guess, j + 1);
        }

        if (Math.abs(npv) < 0.0001) return guess;
        if (npv > 0) low = guess;
        else high = guess;
    }
    return guess;
}

const monthlyIRR = calculateIRR(initialInvestment, cashFlows);
const apr = monthlyIRR * 12 * 100;
console.log(`APR: ${apr.toFixed(2)}% (Target: 18.92%)`);

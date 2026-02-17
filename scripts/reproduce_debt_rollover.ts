
// Reproduction script for Debt Consolidation existing debts logic with Constant Monthly Payment (Rollover)
// Trying to match:
// Total Payments: $36,963.17
// Total Interest: $12,963.22
// APR: 18.92%
// Time: 59 months

interface Debt {
    name: string;
    balance: number;
    rate: number;
    minPayment: number;
    id: number;
}

const initialDebts: Debt[] = [
    { id: 1, name: 'Credit card 1', balance: 10000, rate: 17.99, minPayment: 260 },
    { id: 2, name: 'Credit card 2', balance: 7500, rate: 19.99, minPayment: 190 },
    { id: 3, name: 'High interest debt', balance: 6500, rate: 18.99, minPayment: 180 },
];

const TOTAL_MONTHLY_PAYMENT = initialDebts.reduce((sum, d) => sum + d.minPayment, 0); // 630
console.log(`Total Monthly Payment: ${TOTAL_MONTHLY_PAYMENT}`);

// Strategy: Highest Interest First (Avalanche) or Lowest Balance First (Snowball)?
// Let's try Avalanche first (Priority: 2, 3, 1)
// Priority array of IDs
const priorityOrder = [2, 3, 1]; // 19.99%, 18.99%, 17.99%

function simulateRollover(debts: Debt[], priorityIds: number[]) {
    // Clone debts
    const currentDebts = debts.map(d => ({ ...d }));
    let month = 0;
    let totalPaid = 0;
    let totalInterest = 0;

    // For APR Calc
    const aggregateCashFlows: number[] = [];

    while (month < 1000) {
        // Check if all paid
        const totalBalance = currentDebts.reduce((sum, d) => sum + d.balance, 0);
        if (totalBalance <= 0.01) break;

        month++;
        let availablePayment = TOTAL_MONTHLY_PAYMENT;
        let monthlyTotalPaid = 0;

        // 1. Calculate Interest for all
        currentDebts.forEach(d => {
            if (d.balance > 0) {
                const interest = d.balance * (d.rate / 100 / 12);
                d.balance += interest; // Add interest first
                totalInterest += interest;
            }
        });

        // 2. Pay Minimums first
        currentDebts.forEach(d => {
            if (d.balance > 0) {
                let payment = d.minPayment;
                // Cap payment to balance
                if (payment > d.balance) payment = d.balance;

                // Deduct from available
                if (availablePayment >= payment) {
                    availablePayment -= payment;
                } else {
                    // Should not happen if TOTAL >= Sum(Mins)
                    payment = availablePayment;
                    availablePayment = 0;
                }

                d.balance -= payment;
                monthlyTotalPaid += payment;
            }
        });

        // 3. Apply Extra (Rollover) to Priority Debt
        if (availablePayment > 0) {
            for (const id of priorityIds) {
                const debt = currentDebts.find(d => d.id === id);
                if (debt && debt.balance > 0) {
                    let payment = availablePayment;
                    if (payment > debt.balance) {
                        payment = debt.balance;
                    }
                    debt.balance -= payment;
                    availablePayment -= payment;
                    monthlyTotalPaid += payment;

                    if (availablePayment <= 0.001) break;
                }
            }
        }

        totalPaid += monthlyTotalPaid;
        aggregateCashFlows.push(monthlyTotalPaid);
    }

    return { month, totalPaid, totalInterest, aggregateCashFlows };
}

console.log("\n--- Avalanche Strategy (High Rate First) ---");
const resAvalanche = simulateRollover(initialDebts, [2, 3, 1]);
console.log(`Months: ${resAvalanche.month} (Target 59)`);
console.log(`Total Paid: ${resAvalanche.totalPaid.toFixed(2)} (Target 36963.17)`);
console.log(`Total Interest: ${resAvalanche.totalInterest.toFixed(2)} (Target 12963.22)`);

console.log("\n--- Snowball Strategy (Low Balance First) ---");
// Balances: 6500 (3), 7500 (2), 10000 (1). Order: 3, 2, 1
const resSnowball = simulateRollover(initialDebts, [3, 2, 1]);
console.log(`Months: ${resSnowball.month}`);
console.log(`Total Paid: ${resSnowball.totalPaid.toFixed(2)}`);
console.log(`Total Interest: ${resSnowball.totalInterest.toFixed(2)}`);

console.log("\n--- No Prioritization (Highest Rate implicitly?) ---");
// Just verify order

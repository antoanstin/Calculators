
export interface DebtItem {
    id: string;
    name: string;
    balance: number;
    interestRate: number; // annual %
    minPayment: number;
}

export interface ConsolidationInputs {
    debts: DebtItem[];
    newLoanRate: number; // annual %
    newLoanTermMonths: number;
    closingCosts: number;
    feeType?: "$" | "%";
    desiredLoanAmount?: number; // Override
}

export interface ConsolidationResult {
    // Existing Debts Totals
    existingTotalMonthlyPayment: number;
    existingTotalBalance: number;
    existingBlendedRate: number;
    existingTimeToPayoffMonths: number;
    existingTotalInterest: number;
    existingTotalPayments: number;

    // New Loan Totals
    newMonthlyPayment: number;
    newLoanAmount: number; // This is the Gross Amount
    newTotalInterest: number;
    newTotalPayments: number;
    newTimeToPayoffMonths: number;
    newAPR: number; // NEW: APR including fees

    // Comparison
    monthlySavings: number;
    closingCosts: number;
    netProceeds: number; // NEW: Loan Amount - Fees
    cashFlowDifference: number; // NEW: Net Proceeds - Existing Debt
}

// IRR Calculation for APR
function calculateIRR(cashFlow0: number, payments: number[]): number {
    let low = 0;
    let high = 1;
    let guess = 0.05;

    for (let i = 0; i < 50; i++) {
        guess = (low + high) / 2;
        let npv = cashFlow0;
        for (let j = 0; j < payments.length; j++) {
            npv -= payments[j] / Math.pow(1 + guess, j + 1);
        }

        if (Math.abs(npv) < 0.0001) return guess;
        if (npv > 0) high = guess; // Rate too low (NPV > 0 means PV(flows) < InitialInvetment, wait:
        // NPV = Inv - PV(flows). If NPV > 0, Inv > PV. 
        // Need higher rate to lower PV? No.
        // PV = sum(C / (1+r)^t). Higher r -> Lower PV.
        // If NPV = 100 - 90 = 10. We need PV to be 100. So lower r.
        // Wait. NPV = -Inv + PV(flows). (Standard Def)
        // Here: npv = cashFlow0 (positive) - sum(payments discounted).
        // If npv > 0, cashFlow0 > PV. To make PV equal cashFlow0, we need LOWER rate?
        // No, PV is sum(P / (1+r)^t). Lower r -> Higher PV.
        // Yes, if PV < Inv, we need to RAISE PV, so LOWER r.
        else low = guess;
    }
    return guess;
}

// Detailed Rollover Simulation (Avalanche Strategy: Highest Rate First)
function simulateDebtRollover(debts: DebtItem[], totalMonthlyPayment: number) {
    // Clone debts to simulate payoff without mutating original
    const currentDebts = debts.map(d => ({ ...d }));

    // Sort buy Highest Rate Descending (Avalanche)
    const sortedIndices = currentDebts
        .map((d, index) => ({ index, rate: d.interestRate }))
        .sort((a, b) => b.rate - a.rate)
        .map(item => item.index);

    let month = 0;
    let totalPaid = 0;
    let totalInterest = 0;
    const monthlyPayments: number[] = [];

    // Safety break at 100 years
    while (month < 1200) {
        // Check if all paid
        const totalBalance = currentDebts.reduce((sum, d) => sum + d.balance, 0);
        if (totalBalance <= 0.01) break;

        month++;
        let availablePayment = totalMonthlyPayment;
        let monthlyTotalPaid = 0;

        // 1. Accrue Interest
        currentDebts.forEach(d => {
            if (d.balance > 0) {
                const interest = d.balance * (d.interestRate / 100 / 12);
                d.balance += interest;
                totalInterest += interest;
            }
        });

        // 2. Pay Minimums
        currentDebts.forEach(d => {
            if (d.balance > 0) {
                let payment = d.minPayment;
                if (payment > d.balance) payment = d.balance;

                // Deduct from pool if possible, else just pay (which shouldn't happen if pool >= sum(mins))
                if (availablePayment >= payment) {
                    availablePayment -= payment;
                } else {
                    payment = availablePayment;
                    availablePayment = 0;
                }

                d.balance -= payment;
                monthlyTotalPaid += payment;
            }
        });

        // 3. Rollover Extra to Highest Rate Debt
        if (availablePayment > 0) {
            for (const idx of sortedIndices) {
                const debt = currentDebts[idx];
                if (debt.balance > 0) {
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
        monthlyPayments.push(monthlyTotalPaid);
    }

    return { month, totalPaid, totalInterest, monthlyPayments };
}

// Calculate APR Helper for the New Loan (SIMPLE PV/PMT based)
function calculateLoanAPR(nper: number, pmt: number, pv: number): number {
    if (pv <= 0 || pmt <= 0) return 0;
    let low = 0;
    let high = 1;
    let guess = 0.05;

    for (let i = 0; i < 50; i++) {
        guess = (low + high) / 2;
        const calculatedPV = (pmt * (1 - Math.pow(1 + guess, -nper))) / guess;
        if (calculatedPV > pv) low = guess; // Rate too low
        else high = guess; // Rate too high
    }
    return guess * 12 * 100;
}

export function calculateDebtConsolidation(inputs: ConsolidationInputs): ConsolidationResult {
    const { debts, newLoanRate, newLoanTermMonths, closingCosts, feeType, desiredLoanAmount } = inputs;

    const existingTotalMonthlyPayment = debts.reduce((sum, d) => sum + d.minPayment, 0);
    const existingTotalBalance = debts.reduce((sum, d) => sum + d.balance, 0);

    // Run Rollover Simulation for Existing Debts
    const simulation = simulateDebtRollover(debts, existingTotalMonthlyPayment);

    // Existing effective APR (IRR of cash flows)
    const existingMonthlyIRR = calculateIRR(existingTotalBalance, simulation.monthlyPayments);
    const existingBlendedRate = existingMonthlyIRR * 12 * 100;

    // Matches strictly user request:
    const existingTimeToPayoffMonths = simulation.month;
    const existingTotalInterest = simulation.totalInterest;
    const existingTotalPayments = simulation.totalPaid;


    // New Loan Calc
    const principalBase = (desiredLoanAmount !== undefined && desiredLoanAmount > 0)
        ? desiredLoanAmount
        : existingTotalBalance;

    // FEES
    let actualClosingCosts = 0;
    if (feeType === "%") {
        actualClosingCosts = principalBase * (closingCosts / 100);
    } else {
        actualClosingCosts = closingCosts;
    }

    const newLoanAmount = principalBase;
    const netProceeds = newLoanAmount - actualClosingCosts;
    const cashFlowDifference = netProceeds - existingTotalBalance;

    const rNew = newLoanRate / 100 / 12;
    const nNew = newLoanTermMonths;

    let newMonthlyPayment = 0;
    if (newLoanRate === 0) {
        newMonthlyPayment = newLoanAmount / nNew; // Principal only
    } else {
        newMonthlyPayment = (newLoanAmount * rNew * Math.pow(1 + rNew, nNew)) / (Math.pow(1 + rNew, nNew) - 1);
    }

    const newTotalPayments = (newMonthlyPayment * nNew);
    const newTotalInterest = newTotalPayments - newLoanAmount;

    // APR Calculation for New Loan
    const newAPR = calculateLoanAPR(nNew, newMonthlyPayment, netProceeds);

    const monthlySavings = existingTotalMonthlyPayment - newMonthlyPayment;

    return {
        existingTotalMonthlyPayment,
        existingTotalBalance,
        existingBlendedRate, // Now Effective APR
        existingTimeToPayoffMonths,
        existingTotalInterest,
        existingTotalPayments,

        newMonthlyPayment,
        newLoanAmount,
        newTotalInterest,
        newTotalPayments,
        newTimeToPayoffMonths: nNew,
        newAPR,

        monthlySavings,
        closingCosts: actualClosingCosts,
        netProceeds,
        cashFlowDifference
    };
}

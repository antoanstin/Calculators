export interface PrepaymentInputs {
    currentBalance: number;
    currentRate: number; // %
    remainingTermMonths: number;

    scenarioType: "refinance" | "extra-payment";

    // Refinance Scenario
    newRate?: number;
    newTermMonths?: number;
    closingCosts?: number; // Optional context, but mainly interest savings here.

    // Extra Payment Scenario
    extraMonthly?: number;
    lumpSum?: number;
}

export interface PrepaymentResult {
    currentTotalInterest: number;
    scenarioTotalInterest: number;
    interestSaved: number;
    scenarioMonthlyPayment: number; // New payment or same + extra
    scenarioPayoffMonths: number;
}

function calculateAmortizationInterest(balance: number, rate: number, months: number, extraMonthly: number = 0, lumpSum: number = 0): { totalInterest: number, monthlyPayment: number, payoffMonths: number } {
    if (balance <= 0) return { totalInterest: 0, monthlyPayment: 0, payoffMonths: 0 };

    // Apply lump sum immediately
    let principal = balance - lumpSum;
    if (principal <= 0) return { totalInterest: 0, monthlyPayment: 0, payoffMonths: 0 };

    const r = rate / 100 / 12;
    const n = months;

    let monthlyPayment = 0;
    if (rate === 0) {
        monthlyPayment = principal / n;
    } else {
        monthlyPayment = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    // Iterate for actual interest paid including extra payments
    let currentBalance = principal;
    let totalInterest = 0;
    let actualMonths = 0;
    const actualPayment = monthlyPayment + extraMonthly;

    while (currentBalance > 0.01 && actualMonths < 1200) {
        const interest = currentBalance * r;
        let p = actualPayment - interest;

        if (currentBalance + interest < actualPayment) {
            p = currentBalance;
        }

        currentBalance -= p;
        totalInterest += interest;
        actualMonths++;
    }

    return { totalInterest, monthlyPayment, payoffMonths: actualMonths };
}

export function calculatePrepaymentSavings(inputs: PrepaymentInputs): PrepaymentResult {
    const { currentBalance, currentRate, remainingTermMonths } = inputs;

    // Current Scenario (Standard amortization)
    const current = calculateAmortizationInterest(currentBalance, currentRate, remainingTermMonths);

    // New Scenario
    let scenario;
    if (inputs.scenarioType === "refinance") {
        const newRate = inputs.newRate ?? currentRate;
        const newTerm = inputs.newTermMonths ?? remainingTermMonths;
        // Refinance means new loan at new terms. Usually balance is same (ignoring closing costs rolled in for simplicity unless specified).
        // Spec: "Interest Remaining (Current) MINUS Interest Remaining (New Loan)"
        scenario = calculateAmortizationInterest(currentBalance, newRate, newTerm);
    } else {
        // Extra Payment
        // Same loan terms, just extra payment
        scenario = calculateAmortizationInterest(
            currentBalance,
            currentRate,
            remainingTermMonths,
            inputs.extraMonthly ?? 0,
            inputs.lumpSum ?? 0
        );
    }

    return {
        currentTotalInterest: current.totalInterest,
        scenarioTotalInterest: scenario.totalInterest,
        interestSaved: current.totalInterest - scenario.totalInterest,
        scenarioMonthlyPayment: scenario.monthlyPayment + (inputs.scenarioType === "extra-payment" ? (inputs.extraMonthly ?? 0) : 0),
        scenarioPayoffMonths: scenario.payoffMonths
    };
}

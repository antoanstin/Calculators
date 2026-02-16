
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

function calculateNPER(rate: number, payment: number, pv: number): number {
    // rate is per period
    if (rate === 0) return pv / payment;

    // If interest covers payment, never pays off
    if (pv * rate >= payment) return Infinity;

    // NPER = -LN(1 - (PV * r) / PMT) / LN(1 + r)
    const numerator = Math.log(1 - (pv * rate) / payment);
    const denominator = Math.log(1 + rate);
    return -numerator / denominator;
}

// Helper to calculate APR using binary search for rate
function calculateAPR(nper: number, pmt: number, pv: number): number {
    // APR is the rate r such that PV = PMT * (1 - (1+r)^-n) / r
    // We search for r (monthly), then * 12 * 100 for APR%

    if (pv <= 0 || pmt <= 0) return 0;

    let low = 0;
    let high = 1; // 100% monthly is unreasonably high, good upper bound
    let guess = 0.05; // 5% monthly

    for (let i = 0; i < 40; i++) { // Increased iterations for precision
        guess = (low + high) / 2;
        if (guess === 0) {
            if (pmt * nper > pv) low = guess;
            else high = guess;
            continue;
        }

        const calculatedPV = (pmt * (1 - Math.pow(1 + guess, -nper))) / guess;

        if (calculatedPV > pv) {
            // Rate is too low (PV calculation yields higher value means discount rate is too low)
            low = guess;
        } else {
            high = guess;
        }
    }

    return guess * 12 * 100;
}

export function calculateDebtConsolidation(inputs: ConsolidationInputs): ConsolidationResult {
    const { debts, newLoanRate, newLoanTermMonths, closingCosts, feeType, desiredLoanAmount } = inputs;

    const existingTotalMonthlyPayment = debts.reduce((sum, d) => sum + d.minPayment, 0);
    const existingTotalBalance = debts.reduce((sum, d) => sum + d.balance, 0);

    // Existing Blended Rate
    const weightedRateSum = debts.reduce((sum, d) => sum + (d.balance * d.interestRate), 0);
    const existingBlendedRate = existingTotalBalance > 0 ? weightedRateSum / existingTotalBalance : 0;

    // Calculate Existing Metrics using Pooled Approach (as per user requirement)
    // "The calculation of the existing debts assume you pay $X per month until payoff."
    const rExisting = existingBlendedRate / 100 / 12;
    const existingNPER = calculateNPER(rExisting, existingTotalMonthlyPayment, existingTotalBalance);

    // Handle infinite payoff (if payment < interest)
    let existingTotalPayments = 0;
    let existingTotalInterest = 0;

    if (existingNPER === Infinity) {
        existingTotalPayments = 0; // Or Infinity, but 0 signals issue
        existingTotalInterest = 0;
    } else {
        existingTotalPayments = existingNPER * existingTotalMonthlyPayment;
        existingTotalInterest = existingTotalPayments - existingTotalBalance;
    }

    const existingTimeToPayoffMonths = existingNPER === Infinity ? Infinity : existingNPER;

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

    // GROSS Loan Amount is just the principalBase (User Input).
    // Fees are deducted from proceeds, NOT added to loan amount (based on user example).
    // User Example: Loan $25k, Fee $1250. Payment based on $25k. Net cash $23750.
    const newLoanAmount = principalBase;
    const netProceeds = newLoanAmount - actualClosingCosts;

    // Check if net proceeds cover the debt
    // "Upfront cash flow" = NetProceeds - ExistingDebts
    const cashFlowDifference = netProceeds - existingTotalBalance;

    const rNew = newLoanRate / 100 / 12;
    const nNew = newLoanTermMonths;

    let newMonthlyPayment = 0;
    if (newLoanRate === 0) {
        newMonthlyPayment = newLoanAmount / nNew;
    } else {
        newMonthlyPayment = (newLoanAmount * rNew * Math.pow(1 + rNew, nNew)) / (Math.pow(1 + rNew, nNew) - 1);
    }

    const newTotalPayments = (newMonthlyPayment * nNew);
    // Total Interest is simply Total Payments - Principal Borrowed
    const newTotalInterest = newTotalPayments - newLoanAmount;

    // APR Calculation
    // Cost of borrowing: You receive `netProceeds` but pay `newMonthlyPayment` for `nNew` months.
    // What is the rate?
    const newAPR = calculateAPR(nNew, newMonthlyPayment, netProceeds);

    const monthlySavings = existingTotalMonthlyPayment - newMonthlyPayment;

    return {
        existingTotalMonthlyPayment,
        existingTotalBalance,
        existingBlendedRate,
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


export interface APRInputs {
    loanAmount: number;
    nominalInterestRate: number; // %
    termYears: number;
    termMonths: number;
    // For General APR:
    loanedFees: number;  // Financed
    upfrontFees: number; // Cash
    compoundingFrequency?: Frequency;
    payBackFrequency?: Frequency;
}

export type Frequency = 'daily' | 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly' | 'quarterly' | 'semi-annually' | 'annually';

const FREQUENCY_PERIODS: Record<Frequency, number> = {
    'daily': 365,
    'weekly': 52,
    'bi-weekly': 26,
    'semi-monthly': 24,
    'monthly': 12,
    'quarterly': 4,
    'semi-annually': 2,
    'annually': 1,
};

export interface APRResult {
    loanAmount: number;
    monthlyPayment: number;
    effectiveAPR: number;
    totalInterest: number;
    totalFinanceCharge: number;
    totalPaid: number;
    amountFinanced: number;
    payBackFrequency: Frequency;
}

export interface MortgageAPRInputs {
    houseValue: number;
    downPaymentPercent: number;
    termYears: number;
    interestRate: number;
    loanFees: number;
    points: number;
    pmiPerYear: number;
}

export interface MortgageAPRResult {
    loanAmount: number;
    downPaymentAmount: number;
    monthlyPayment: number; // P&I + PMI (if any)
    effectiveAPR: number;
    totalPayments: number;
    totalInterest: number;
    allPaymentsAndFees: number;
}

export function calculateAPR(inputs: APRInputs): APRResult {
    const {
        loanAmount,
        nominalInterestRate,
        termYears,
        termMonths,
        loanedFees,
        upfrontFees,
        compoundingFrequency = 'monthly',
        payBackFrequency = 'monthly',
    } = inputs;

    const totalMonths = termYears * 12 + termMonths;
    if (loanAmount <= 0 || totalMonths <= 0) {
        return {
            monthlyPayment: 0,
            effectiveAPR: 0,
            totalInterest: 0,
            totalFinanceCharge: 0,
            totalPaid: 0,
            amountFinanced: 0,
            payBackFrequency,
            loanAmount: 0,
        };
    }

    // Amount Financed = Loan Amount + Loaned Fees
    const grossLoanAmount = loanAmount + loanedFees;

    // Frequency Handling
    const compPeriods = FREQUENCY_PERIODS[compoundingFrequency];
    const payPeriods = FREQUENCY_PERIODS[payBackFrequency];

    // Effective Annual Rate based on Compounding
    const r_nominal = nominalInterestRate / 100;
    const ear = Math.pow(1 + r_nominal / compPeriods, compPeriods) - 1;

    // Periodic Rate for Payback Frequency
    const r_per_period = Math.pow(1 + ear, 1 / payPeriods) - 1;

    // Total Number of Payments
    const totalYears = totalMonths / 12;
    const n = Math.ceil(totalYears * payPeriods);

    let periodicPayment = 0;
    if (r_per_period === 0) {
        periodicPayment = grossLoanAmount / n;
    } else {
        periodicPayment = (grossLoanAmount * r_per_period * Math.pow(1 + r_per_period, n)) / (Math.pow(1 + r_per_period, n) - 1);
    }

    const cashFlow0 = loanAmount - upfrontFees;

    if (cashFlow0 <= 0) {
        return {
            loanAmount,
            monthlyPayment: periodicPayment,
            effectiveAPR: 0,
            totalInterest: 0,
            totalFinanceCharge: 0,
            totalPaid: 0,
            amountFinanced: cashFlow0,
            payBackFrequency,
        };
    }

    const irrRate = calculateIRR(cashFlow0, periodicPayment, n);

    // Calculate Effective Annual Rate (EAR) from the periodic IRR
    const ear_actual = Math.pow(1 + irrRate, payPeriods) - 1;

    // Convert EAR to Nominal APR compounded Monthly to match Reference "Real APR" (6.575%)
    // Reference: Weekly Payback, Semi-Monthly Compounding -> 6.575% Real APR.
    // Script verified this matches Nominal Monthly APR derived from Weekly IRR.
    const effectiveAPR = 12 * (Math.pow(1 + ear_actual, 1 / 12) - 1) * 100;

    const totalPaid = periodicPayment * n;
    const totalFinanceCharge = totalPaid - cashFlow0;

    return {
        loanAmount,
        monthlyPayment: periodicPayment,
        effectiveAPR,
        totalInterest: totalPaid - loanAmount,
        totalFinanceCharge,
        totalPaid,
        amountFinanced: grossLoanAmount,
        payBackFrequency,
    };
}

export function calculateMortgageAPR(inputs: MortgageAPRInputs): MortgageAPRResult {
    const {
        houseValue,
        downPaymentPercent,
        termYears,
        interestRate,
        loanFees,
        points,
        pmiPerYear
    } = inputs;

    const downPaymentAmount = houseValue * (downPaymentPercent / 100);
    const loanAmount = houseValue - downPaymentAmount;
    const totalMonths = termYears * 12;

    if (loanAmount <= 0 || totalMonths <= 0) {
        return {
            loanAmount: 0,
            downPaymentAmount,
            monthlyPayment: 0,
            effectiveAPR: 0,
            totalPayments: 0,
            totalInterest: 0,
            allPaymentsAndFees: 0
        };
    }

    const r = interestRate / 100 / 12;
    const n = totalMonths;
    let monthlyPI = 0;
    if (r === 0) {
        monthlyPI = loanAmount / n;
    } else {
        monthlyPI = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const monthlyPMI = pmiPerYear / 12;
    const totalMonthlyPayment = monthlyPI + monthlyPMI;

    const pointsCost = loanAmount * (points / 100);
    const netProceeds = loanAmount - loanFees - pointsCost;

    const irrRate = calculateIRR(netProceeds, totalMonthlyPayment, n);
    const effectiveAPR = irrRate * 12 * 100;

    const totalPayments = totalMonthlyPayment * n;
    const totalInterest = (monthlyPI * n) - loanAmount;

    // Match Reference: "All Payments and Fees" = TotalPayments + LoanFees (Points excluded)
    // Also add Points here? Reference Total of Payments + Loan Fees = 617368 + 3500 = 620868.
    // So yes, Points are EXCLUDED from this sum.
    const allPaymentsAndFees = totalPayments + loanFees;

    return {
        loanAmount,
        downPaymentAmount,
        monthlyPayment: monthlyPI,
        effectiveAPR,
        totalPayments,
        totalInterest,
        allPaymentsAndFees
    };
}

function calculateIRR(cashFlow0: number, monthlyPayment: number, n: number): number {
    let low = 0;
    let high = 1;
    let r_eff = 0;

    for (let i = 0; i < 100; i++) {
        const mid = (low + high) / 2;
        let npv = 0;
        if (mid === 0) {
            npv = cashFlow0 - (monthlyPayment * n);
        } else {
            const pvPayments = monthlyPayment * (1 - Math.pow(1 + mid, -n)) / mid;
            npv = cashFlow0 - pvPayments;
        }

        if (Math.abs(npv) < 0.000001) {
            r_eff = mid;
            break;
        }

        if (npv > 0) {
            high = mid;
        } else {
            low = mid;
        }
        r_eff = mid;
    }
    return r_eff;
}

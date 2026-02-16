
// Self-contained verification script to avoid ts-node module resolution issues

type Frequency = 'daily' | 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly' | 'quarterly' | 'semi-annually' | 'annually';

interface APRInputs {
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

interface APRResult {
    monthlyPayment: number;
    effectiveAPR: number;
    totalFinanceCharge: number;
    totalPaid: number;
    amountFinanced: number;
}

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

function calculateAPR(inputs: APRInputs): APRResult {
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
            totalFinanceCharge: 0,
            totalPaid: 0,
            amountFinanced: 0,
        };
    }

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
            monthlyPayment: periodicPayment,
            effectiveAPR: 0,
            totalFinanceCharge: 0,
            totalPaid: 0,
            amountFinanced: cashFlow0,
        };
    }

    const irrRate = calculateIRR(cashFlow0, periodicPayment, n);
    // Nominal APR based on Payback Frequency for the "Real APR"
    const effectiveAPR = irrRate * payPeriods * 100;

    const totalPaid = periodicPayment * n;
    const totalFinanceCharge = totalPaid - cashFlow0;

    return {
        monthlyPayment: periodicPayment,
        effectiveAPR,
        totalFinanceCharge,
        totalPaid,
        amountFinanced: grossLoanAmount,
    };
}

console.log("---------------------------------------------------");
console.log("FREQUENCY VERIFICATION (Self-Contained)");
console.log("---------------------------------------------------");

// Scenario 1: Reference Default (Monthly/Monthly)
const baseline: APRInputs = {
    loanAmount: 100000,
    nominalInterestRate: 6,
    termYears: 10,
    termMonths: 0,
    loanedFees: 4,
    upfrontFees: 2500,
    compoundingFrequency: "monthly",
    payBackFrequency: "monthly"
};
const resBase = calculateAPR(baseline);

console.log(`Baseline (Monthly/Monthly): APR ${resBase.effectiveAPR.toFixed(3)}%, Pmt ${resBase.monthlyPayment.toFixed(2)}`);

// Scenario 2: Semi-Monthly Compounding, Weekly Payment
const scen1: APRInputs = {
    ...baseline,
    compoundingFrequency: "semi-monthly", // Ref image shows this but logic was Monthly. Let's see impact.
    payBackFrequency: "weekly" // Ref image shows this.
};

const resFreq = calculateAPR(scen1);
console.log(`Scenario 1 (Semi-Monthly Comp, Weekly Pay):`);
console.log(`APR: ${resFreq.effectiveAPR.toFixed(3)}%`);
console.log(`Payment: ${resFreq.monthlyPayment.toFixed(2)}`);
console.log(`Total Paid: ${resFreq.totalPaid.toFixed(2)}`);
console.log(`Total Periods: ${10 * 52}`); // 520

console.log("---------------------------------------------------");

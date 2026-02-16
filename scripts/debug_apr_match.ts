
// Self-contained debug script to match Reference APR

function calculateIRR(cashFlow0: number, periodicPayment: number, n: number): number {
    let low = 0;
    let high = 1;
    let r_eff = 0;

    for (let i = 0; i < 100; i++) {
        const mid = (low + high) / 2;
        let npv = 0;
        if (mid === 0) {
            npv = cashFlow0 - (periodicPayment * n);
        } else {
            const pvPayments = periodicPayment * (1 - Math.pow(1 + mid, -n)) / mid;
            npv = cashFlow0 - pvPayments;
        }

        if (Math.abs(npv) < 0.00000001) {
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

// Reference Data
const loanAmount = 100000;
const loanedFees = 4;
const upfrontFees = 2500;
const rate = 6.0;
const termYears = 10;
const compFreq = 'semi-monthly';
const payFreq = 'weekly';

// Derived Values
const grossLoan = loanAmount + loanedFees; // 100,004 (Confirmed match)
const netProceeds = loanAmount - upfrontFees; // 97,500 (Confirmed logic for General APR)
const payment = 255.81; // (Confirmed match)
const n = 520; // 10 * 52

// 1. Calculate precise IRR (Weekly Rate)
const r_weekly = calculateIRR(netProceeds, payment, n);
console.log(`Weekly IRR: ${(r_weekly * 100).toFixed(6)}%`);

// 2. Test APR Candidates
const apr_nominal_weekly = r_weekly * 52 * 100;
console.log(`1. Nominal Weekly (Current Logic): ${apr_nominal_weekly.toFixed(4)}%`);

const ear = Math.pow(1 + r_weekly, 52) - 1;
console.log(`2. EAR: ${(ear * 100).toFixed(4)}%`);

// Convert EAR to Nominal Monthly
const apr_nominal_monthly = 12 * (Math.pow(1 + ear, 1 / 12) - 1) * 100;
console.log(`3. Nominal Monthly: ${apr_nominal_monthly.toFixed(4)}%`);

// Convert EAR to Nominal Semi-Monthly
const apr_nominal_semimonthly = 24 * (Math.pow(1 + ear, 1 / 24) - 1) * 100;
console.log(`4. Nominal Semi-Monthly: ${apr_nominal_semimonthly.toFixed(4)}%`);

// Convert EAR to Nominal Daily
const apr_nominal_daily = 365 * (Math.pow(1 + ear, 1 / 365) - 1) * 100;
console.log(`5. Nominal Daily: ${apr_nominal_daily.toFixed(4)}%`);

const target = 6.575;
console.log(`\nTARGET: ${target}%`);

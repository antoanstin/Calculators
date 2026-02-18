
// Reproduction Script for Case 4 ($80k, $2000 Closing, 10.428% Target)
// Logic: Annual Fee INCLUDED in monthly cash flows.
// Net Proceeds: Loan - Closing Costs (NO Prepaid Interest Deduction).

import { calculateHELOC, HELOCInputs } from '../lib/calculations/heloc';

// 1. Current Logic Output (Just to see)
const inputs = {
    loanAmount: 80000,
    interestRate: 10,
    drawPeriodYears: 10,
    repaymentPeriodYears: 20,
    closingCostsValue: 2000,
    closingCostsType: 'amount' as const,
    includeFees: true,
    annualFee: 50,
    closingCostsPaid: 'upfront' as const
};

const resCurrent = calculateHELOC(inputs);
console.log(`Current Logic Result: ${resCurrent.effectiveAPR.toFixed(3)}% (Target 10.428%)`);

// 2. Implement User's Specific Logic
function calculateCase4Logic() {
    const loanAmount = 80000;
    const closingCosts = 2000;
    const annualFee = 50;
    const monthlyFee = annualFee / 12;
    const rate = 10 / 100 / 12;

    // Net Proceeds (User: "80,000 - 2,000 = 78,000")
    // Assuming NO Prepaid Interest deduction.
    const netProceeds = loanAmount - closingCosts;

    // Cash Flows
    // Draw Period (120 months)
    const interestOnlyPayment = loanAmount * rate;
    const drawPayment = interestOnlyPayment + monthlyFee;

    // Repayment Period (240 months)
    const repaymentMonths = 240;
    // Amortization of Loan Amount (80k) over 240 months
    const amortizedPayment = (loanAmount * rate * Math.pow(1 + rate, repaymentMonths)) / (Math.pow(1 + rate, repaymentMonths) - 1);
    const repayPayment = amortizedPayment + monthlyFee;

    console.log(`Manual Calc:`);
    console.log(`Net Proceeds: ${netProceeds}`);
    console.log(`Draw Payment: ${drawPayment.toFixed(2)} (Interest ${interestOnlyPayment.toFixed(2)} + Fee ${monthlyFee.toFixed(2)})`);
    console.log(`Repay Payment: ${repayPayment.toFixed(2)} (Amort ${amortizedPayment.toFixed(2)} + Fee ${monthlyFee.toFixed(2)})`);

    const irr = calculateIRRRef(netProceeds, drawPayment, 120, repayPayment, repaymentMonths);
    const apr = irr * 12 * 100;

    // Solve for Prepaid Deduction to hit 10.428%
    console.log("\nSolving for Prepaid Deduction...");
    let low = 0;
    let high = 2000;
    let target = 10.428;

    for (let i = 0; i < 30; i++) {
        const guess = (low + high) / 2;
        const net = netProceeds - guess;
        const irr = calculateIRRRef(net, drawPayment, 120, repayPayment, 240);
        const apr = irr * 12 * 100;

        if (Math.abs(apr - target) < 0.001) {
            console.log(`Found Required Deduction: $${guess.toFixed(2)} -> APR ${apr.toFixed(3)}%`);
            // Check if it matches 1 Month Interest?
            const oneMonthInterest = loanAmount * rate;
            console.log(`1 Month Interest: $${oneMonthInterest.toFixed(2)}`);
            break;
        }

        if (apr > target) high = guess;
        else low = guess;
    }
}

// Minimal IRR helper
function calculateIRRRef(netProceeds: number, pmtDraw: number, monthsDraw: number, pmtRepay: number, monthsRepay: number): number {
    let low = 0;
    let high = 1;

    for (let i = 0; i < 50; i++) {
        const r = (low + high) / 2;
        if (r === 0) continue;

        // PV of Draw Annuity
        const pvDraw = pmtDraw * (1 - Math.pow(1 + r, -monthsDraw)) / r;

        // PV of Repay Annuity
        const pvRepay = (pmtRepay * (1 - Math.pow(1 + r, -monthsRepay)) / r) * Math.pow(1 + r, -monthsDraw);

        const pvStream = pvDraw + pvRepay;
        const npv = netProceeds - pvStream;

        if (Math.abs(npv) < 0.00001) return r;

        if (npv > 0) {
            // Proceeds > PV -> Need Higher PV -> Lower Rate
            high = r;
        } else {
            low = r;
        }
    }
    return (low + high) / 2;
}

calculateCase4Logic();

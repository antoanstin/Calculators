export interface HELOCInputs {
    loanAmount: number; // Was creditLine
    interestRate: number; // APR %
    drawPeriodYears: number;
    repaymentPeriodYears: number;
    // utilization removed, assume 100% of loanAmount
    closingCostsType: "amount" | "percent";
    closingCostsValue: number;
    closingCostsPaid: "upfront" | "financed"; // "deducted" in UI, effectively upfront logic for schedule usually
    annualFee: number;
    includeFees: boolean; // For UI toggle
}


export interface MonthlyScheduleItem {
    month: number;
    year: number;
    interest: number;
    principal: number;
    totalPayment: number;
    balance: number;
}

export interface YearlyScheduleItem {
    year: number;
    interest: number;
    principal: number;
    totalPayment: number;
    balance: number;
}

export interface HELOCResult {
    drawMonthlyPayment: number;
    repaymentMonthlyPayment: number;
    totalDrawPayment: number;
    totalRepaymentPayment: number;
    totalPayments: number;
    totalInterest: number;
    totalFees: number;
    // New fields for "Include Fees" view
    totalAnnualFees: number;
    totalClosingCosts: number;
    totalOverallCost: number; // Interest + All Fees
    effectiveAPR: number;
    includeFees: boolean;
    cashReceived: number;
    closingCostsPaid: "upfront" | "financed";
    monthlySchedule: MonthlyScheduleItem[];
    yearlySchedule: YearlyScheduleItem[];
}

export function calculateHELOC(inputs: HELOCInputs): HELOCResult {
    const {
        loanAmount,
        interestRate,
        drawPeriodYears,
        repaymentPeriodYears,
        closingCostsType,
        closingCostsValue,
        closingCostsPaid,
        annualFee,
    } = inputs;

    if (loanAmount <= 0) {
        return {
            drawMonthlyPayment: 0,
            repaymentMonthlyPayment: 0,
            totalDrawPayment: 0,
            totalRepaymentPayment: 0,
            totalPayments: 0,
            totalInterest: 0,
            totalFees: 0,
            totalAnnualFees: 0,
            totalClosingCosts: 0,
            totalOverallCost: 0,
            effectiveAPR: 0,
            includeFees: inputs.includeFees,
            cashReceived: 0,
            closingCostsPaid: inputs.closingCostsPaid,
            monthlySchedule: [],
            yearlySchedule: []
        };
    }

    // 1. Calculate Fees
    const closingCostsAmount = closingCostsType === "amount"
        ? closingCostsValue
        : loanAmount * (closingCostsValue / 100);

    // Total Annual Fees = Annual Fee * Draw Period Years (Reference: $500 for $50/yr @ 10yr draw)
    const totalAnnualFees = annualFee * drawPeriodYears;

    const totalFees = totalAnnualFees + closingCostsAmount;

    // 2. Draw Period (Interest Only on full Loan Amount)
    const r = interestRate / 100 / 12;
    const drawMonths = drawPeriodYears * 12;

    const drawMonthlyPayment = loanAmount * r;
    const totalDrawPayment = drawMonthlyPayment * drawMonths;


    // 3. Repayment Period (Amortized)
    const repaymentMonths = repaymentPeriodYears * 12;
    let repaymentMonthlyPayment = 0;
    if (r === 0) {
        repaymentMonthlyPayment = loanAmount / repaymentMonths;
    } else {
        repaymentMonthlyPayment = (loanAmount * r * Math.pow(1 + r, repaymentMonths)) / (Math.pow(1 + r, repaymentMonths) - 1);
    }

    const totalRepaymentPayment = repaymentMonthlyPayment * repaymentMonths;

    // 4. Totals
    const totalPayments = totalDrawPayment + totalRepaymentPayment;
    const totalInterest = totalPayments - loanAmount;
    const totalOverallCost = totalInterest + totalFees;

    // 5. Effective APR Calculation (IRR)
    const netProceeds = loanAmount - closingCostsAmount;
    const monthlyAnnualFee = annualFee / 12;
    const paymentDraw = drawMonthlyPayment + monthlyAnnualFee;
    const paymentRepayment = repaymentMonthlyPayment;

    // Use binary search for IRR since n is large
    const irr = calculateHELOCIRR(netProceeds, paymentDraw, drawMonths, paymentRepayment, repaymentMonths);
    const effectiveAPR = irr * 12 * 100;

    let cashReceived = loanAmount;
    if (inputs.includeFees && closingCostsPaid === "financed") {
        cashReceived = loanAmount - closingCostsAmount;
    }

    // 6. Generate Schedule
    const { monthlySchedule, yearlySchedule } = generateHELOCSchedule(
        loanAmount,
        r,
        drawMonths,
        repaymentMonths,
        drawMonthlyPayment,
        repaymentMonthlyPayment
    );

    return {
        drawMonthlyPayment,
        repaymentMonthlyPayment,
        totalDrawPayment,
        totalRepaymentPayment,
        totalPayments,
        totalInterest,
        totalFees,
        totalAnnualFees,
        totalClosingCosts: closingCostsAmount,
        totalOverallCost,
        effectiveAPR,
        includeFees: inputs.includeFees,
        cashReceived,
        closingCostsPaid: inputs.closingCostsPaid,
        monthlySchedule,
        yearlySchedule
    };
}

function generateHELOCSchedule(
    loanAmount: number,
    monthlyRate: number,
    drawMonths: number,
    repaymentMonths: number,
    drawPayment: number,
    repaymentPayment: number
): { monthlySchedule: MonthlyScheduleItem[], yearlySchedule: YearlyScheduleItem[] } {
    const monthlySchedule: MonthlyScheduleItem[] = [];
    const yearlySchedule: YearlyScheduleItem[] = [];

    let balance = loanAmount;
    let accumulatedInterest = 0;
    let accumulatedPrincipal = 0;
    let accumulatedPayment = 0;

    const totalMonths = drawMonths + repaymentMonths;

    for (let m = 1; m <= totalMonths; m++) {
        let interest = balance * monthlyRate;
        let principal = 0;
        let payment = 0;

        if (m <= drawMonths) {
            // Draw period: Interest only
            payment = interest; // Using actual interest calc to ensure balance stays flat
            // Or use drawPayment if fixed? Usually floating but here rate is fixed input.
            // drawPayment = loanAmount * r which is exactly interest.
            principal = 0;
        } else {
            // Repayment period
            payment = repaymentPayment;
            principal = payment - interest;

            // Handle last payment adjustments
            if (balance - principal < 0.01) {
                principal = balance;
                payment = principal + interest;
            }
        }

        balance -= principal;
        if (balance < 0) balance = 0;

        monthlySchedule.push({
            month: m,
            year: Math.ceil(m / 12),
            interest,
            principal,
            totalPayment: payment,
            balance
        });

        // Yearly accumulation
        accumulatedInterest += interest;
        accumulatedPrincipal += principal;
        accumulatedPayment += payment;

        if (m % 12 === 0 || m === totalMonths) {
            yearlySchedule.push({
                year: Math.ceil(m / 12),
                interest: accumulatedInterest,
                principal: accumulatedPrincipal,
                totalPayment: accumulatedPayment,
                balance
            });
            // Reset yearly accumulators
            accumulatedInterest = 0;
            accumulatedPrincipal = 0;
            accumulatedPayment = 0;
        }
    }

    return { monthlySchedule, yearlySchedule };
}

function calculateHELOCIRR(
    netProceeds: number,
    pmt1: number, n1: number,
    pmt2: number, n2: number
): number {
    let low = 0;
    let high = 1; // 100% monthly check
    let guess = 0;

    for (let i = 0; i < 50; i++) {
        guess = (low + high) / 2;
        if (guess === 0) guess = 0.00001;

        // NPV = -NetProceeds + sum(pmt1) + sum(pmt2 discounted)
        // PV of Annuity 1: pmt1 * (1 - (1+r)^-n1) / r
        let pv1 = pmt1 * (1 - Math.pow(1 + guess, -n1)) / guess;

        // PV of Annuity 2: pmt2 * (1 - (1+r)^-n2) / r
        // This annuity starts at T=n1. So discount it back n1 periods.
        let pv2_future = pmt2 * (1 - Math.pow(1 + guess, -n2)) / guess;
        let pv2 = pv2_future * Math.pow(1 + guess, -n1);

        let npv = pv1 + pv2 - netProceeds;

        if (Math.abs(npv) < 0.01) break;

        if (npv > 0) {
            low = guess; // Rate is too low (NPV positive means flows are worth more than proceeds)
        } else {
            high = guess;
        }
    }
    return guess;
}


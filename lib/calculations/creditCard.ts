export interface CreditCardInputs {
    balance: number;
    interestRate: number; // APR %
    mode: "payment-fixed" | "time-fixed";
    monthlyPayment?: number; // for payment-fixed
    monthsToPayoff?: number; // for time-fixed
}

export interface CreditCardResult {
    monthsToPayoff: number;
    totalInterest: number;
    totalPaid: number;
    requiredMonthlyPayment?: number; // for time-fixed
    isPaymentTooLow?: boolean;
}

export function calculateCreditCardPayoff(inputs: CreditCardInputs): CreditCardResult {
    const { balance, interestRate, mode, monthlyPayment, monthsToPayoff } = inputs;

    if (balance <= 0) {
        return { monthsToPayoff: 0, totalInterest: 0, totalPaid: 0 };
    }

    const r = interestRate / 100 / 12;

    if (mode === "time-fixed") {
        // Calculate required payment
        const n = monthsToPayoff || 12;
        let payment = 0;
        if (r === 0) {
            payment = balance / n;
        } else {
            payment = (balance * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        }

        const totalPaid = payment * n;
        const totalInterest = totalPaid - balance;

        return {
            monthsToPayoff: n,
            totalInterest,
            totalPaid,
            requiredMonthlyPayment: payment
        };
    } else {
        // Fixed Payment Mode
        const payment = monthlyPayment || 0;
        const minInterest = balance * r;

        if (payment <= minInterest) {
            return {
                monthsToPayoff: 0,
                totalInterest: 0,
                totalPaid: 0,
                isPaymentTooLow: true
            };
        }

        // N = -log(1 - r*P/A) / log(1+r) ? No, use standard formula for N
        // n = - (LN(1 - (B * r) / p)) / LN(1 + r)

        let n = 0;
        if (r === 0) {
            n = balance / payment;
        } else {
            // Check if valid
            const inner = 1 - (balance * r) / payment;
            if (inner <= 0) {
                // Should be caught by minInterest check but just in case
                return { monthsToPayoff: 999, totalInterest: 0, totalPaid: 0, isPaymentTooLow: true };
            }
            n = -Math.log(inner) / Math.log(1 + r);
        }

        const months = Math.ceil(n);
        // Recalculate exact totals by iterating or approx
        // Simple approx:
        const totalPaid = payment * months; // Slightly overestimates last payment
        // Let's do better: find exact total paid via loop or complex math for last partial payment.
        // Loop is safer for exactness.

        let cur = balance;
        let totalI = 0;
        let countedMonths = 0;
        while (cur > 0.01 && countedMonths < months) {
            const interest = cur * r;
            let p = payment - interest;
            if (cur + interest < payment) {
                p = cur;
            }
            cur -= p;
            totalI += interest;
            countedMonths++;
        }

        return {
            monthsToPayoff: countedMonths,
            totalInterest: totalI,
            totalPaid: balance + totalI,
            isPaymentTooLow: false
        };
    }
}

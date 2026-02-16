import { differenceInMonths, parseISO } from "date-fns";

export interface UFMIPRefundInputs {
    refiType: "fha-to-fha" | "fha-to-conventional" | "fha-to-va" | "other";
    baseLoanAmount: number;
    originalUfmipRate: number; // % default 1.75
    closingDate: string; // YYYY-MM-DD
    caseAssignmentDate: string; // YYYY-MM-DD
}

export interface UFMIPRefundResult {
    refundAmount: number;
    refundPercentage: number;
    monthsSinceClosing: number;
    isEligible: boolean;
    message: string;
}


// FHA UFMIP Refund Schedule (Months 1-36 per HUD 4000.1)
// Month 1 = 80%, decreases by 2% each month, until Month 36 = 10%.
// After Month 36, refund is 0%.
const REFUND_SCHEDULE: Record<number, number> = {
    1: 80, 2: 78, 3: 76, 4: 74, 5: 72, 6: 70,
    7: 68, 8: 66, 9: 64, 10: 62, 11: 60, 12: 58,
    13: 56, 14: 54, 15: 52, 16: 50, 17: 48, 18: 46,
    19: 44, 20: 42, 21: 40, 22: 38, 23: 36, 24: 34,
    25: 32, 26: 30, 27: 28, 28: 26, 29: 24, 30: 22,
    31: 20, 32: 18, 33: 16, 34: 14, 35: 12, 36: 10
};

export function calculateUFMIPRefund(inputs: UFMIPRefundInputs): UFMIPRefundResult {
    const { refiType, baseLoanAmount, originalUfmipRate, closingDate, caseAssignmentDate } = inputs;

    if (refiType !== "fha-to-fha") {
        return {
            refundAmount: 0,
            refundPercentage: 0,
            monthsSinceClosing: 0,
            isEligible: false,
            message: "Not eligible (must be FHA-to-FHA refinance).",
        };
    }

    const start = parseISO(closingDate);
    const end = parseISO(caseAssignmentDate);

    if (getTime(end) < getTime(start)) {
        return {
            refundAmount: 0,
            refundPercentage: 0,
            monthsSinceClosing: 0,
            isEligible: false,
            message: "New case date cannot be before closing date.",
        };
    }

    // Calculate months elapsed using FHA formula:
    // (New Case Date - Old Closing Date) / 30.4375
    // Round DOWN to whole month.

    // Use differenceInMonths for reliable month diff
    // HUD formula is usually (Case Assignment - Closing) / 30.4375 then floor.
    // However, differenceInMonths from date-fns handles month boundaries well.
    // Let's stick to simple day diff / 30.4375 logic but CORRECTLY implemented.

    // Correct day diff:
    let months = differenceInMonths(end, start);

    // If it's less than 1 month (e.g. 0.5 months), logic usually implies Month 1 if > 0?
    // User requirement: "If months < 1 -> Use Month 1"
    if (months < 1) months = 1;

    if (months > 36) {
        return {
            refundAmount: 0,
            refundPercentage: 0,
            monthsSinceClosing: months,
            isEligible: false,
            message: "Not eligible (More than 36 months elapsed).",
        };
    }

    const refundPct = REFUND_SCHEDULE[months] || 0;

    // Original UFMIP Paid = Base Loan Amount * UFMIP Rate
    const originalUfmipAmount = baseLoanAmount * (originalUfmipRate / 100);

    // Refund Amount = Original UFMIP * Refund %
    const refundAmount = originalUfmipAmount * (refundPct / 100);

    return {
        refundAmount,
        refundPercentage: refundPct,
        monthsSinceClosing: months,
        isEligible: true,
        message: "Eligible for refund.",
    };
}

function getTime(d: Date) {
    return d.getTime();
}


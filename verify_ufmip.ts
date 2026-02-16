
import { calculateUFMIPRefund, UFMIPRefundInputs } from "./lib/calculations/ufmipRefund";

const baseInputs: UFMIPRefundInputs = {
    refiType: "fha-to-fha",
    baseLoanAmount: 400000,
    originalUfmipRate: 1.75, // $7,000 UFMIP
    closingDate: "2024-01-01",
    caseAssignmentDate: "2024-02-01", // ~1 month
};

// Helper to test
function test(months: number, expectedPct: number, desc: string) {
    // Construct date approx 'months' later
    const closing = new Date("2024-01-01");
    const caseAssignment = new Date(closing);
    caseAssignment.setMonth(closing.getMonth() + months);

    // Add extra days to ensure full month passed for "months elapsed" logic
    // Logic is: (End - Start) / 30.4375
    // If we want exactly X months, we should ensure days match formula.
    // X * 30.4375 days.
    // const days = Math.ceil(months * 30.4375);
    // REMOVED: caseAssignment.setDate(closing.getDate() + days);  <-- This was adding days ON TOP of months!

    // Just use setMonth to be clear about month boundaries
    // caseAssignment.setMonth(closing.getMonth() + months); <-- This is already done above.

    const inputs = { ...baseInputs, caseAssignmentDate: caseAssignment.toISOString().split('T')[0] };
    console.log(`Debug Date: Start=${inputs.closingDate}, End=${inputs.caseAssignmentDate}, AddedMonths=${months}`);
    const res = calculateUFMIPRefund(inputs);

    console.log(`Test: ${desc} (Target Months: ${months})`);
    console.log(`  - Months Elapsed: ${res.monthsSinceClosing}`);
    console.log(`  - Refund Pct: ${res.refundPercentage}% (Expected ${expectedPct}%)`);
    console.log(`  - Refund Amount: $${res.refundAmount}`);

    if (res.refundPercentage === expectedPct) {
        console.log("  PASS");
    } else {
        console.error(`  FAIL: Expected ${expectedPct}%, got ${res.refundPercentage}%`);
    }
    console.log("---");
}

console.log("Starting Verification...");

// Month 1 should be 80%
test(1, 80, "Month 1 Refund");

// Month 12 should be 58%
test(12, 58, "Month 12 Refund");

// Month 36 should be 10%
test(36, 10, "Month 36 Refund (Last Eligible)");

// Month 37 should be 0%
test(37, 0, "Month 37 (Expired)");

// Edge case: Same month (less than 1 month) -> Should count as Month 1?
const sameMonthInputs = { ...baseInputs, caseAssignmentDate: "2024-01-15" };
const resSame = calculateUFMIPRefund(sameMonthInputs);
console.log("Test: Less than 1 month");
console.log(`  - Months Elapsed: ${resSame.monthsSinceClosing}`);
console.log(`  - Refund Pct: ${resSame.refundPercentage}% (Expected 80%)`);
if (resSame.refundPercentage === 80) console.log("  PASS");
else console.error("  FAIL");

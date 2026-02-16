import { calculateAPR } from "@/lib/calculations/apr";
import { calculateUFMIPRefund } from "@/lib/calculations/ufmipRefund";
import { calculateHELOC } from "@/lib/calculations/heloc";
import { calculateTaxSavings } from "@/lib/calculations/taxSavings";
// Loan limits is data-only calculation, but we can check import
import { LOAN_LIMITS_2025 } from "@/data/loanLimits";

describe("New Calculators", () => {

    describe("APR Calculator", () => {
        it("should calculate higher APR than nominal rate with closing costs", () => {
            const result = calculateAPR({
                loanAmount: 200000,
                nominalInterestRate: 6.0,
                termYears: 30,
                termMonths: 0,
                closingCosts: 5000,
                points: 0,
                costsPaid: "upfront",
            });
            expect(result.effectiveAPR).toBeGreaterThan(6.0);
            expect(result.monthlyPayment).toBeGreaterThan(0);
        });
    });

    describe("UFMIP Refund Calculator", () => {
        it("should return correct refund percentage for month 10", () => {
            // Month 10 refund is 62%
            // 200k loan * 1.75% = 3500 UFMIP
            // Refund = 3500 * 0.62 = 2170
            const result = calculateUFMIPRefund({
                refiType: "fha-to-fha",
                baseLoanAmount: 200000,
                originalUfmipRate: 1.75,
                closingDate: "2023-01-01",
                caseAssignmentDate: "2023-11-01", // 10 months later
            });
            expect(result.isEligible).toBe(true);
            expect(result.refundPercentage).toBe(62);
            expect(result.refundAmount).toBeCloseTo(2170);
        });

        it("should be ineligible if not FHA-to-FHA", () => {
            const result = calculateUFMIPRefund({
                refiType: "fha-to-conventional",
                baseLoanAmount: 200000,
                originalUfmipRate: 1.75,
                closingDate: "2023-01-01",
                caseAssignmentDate: "2023-02-01",
            });
            expect(result.isEligible).toBe(false);
            expect(result.refundAmount).toBe(0);
        });
    });

    describe("HELOC Calculator", () => {
        it("should calculate draw interest correctly", () => {
            // 100k line, 50% util = 50k balance
            // 6% rate = 0.5% mo
            // Interest = 50,000 * 0.005 = 250
            const result = calculateHELOC({
                creditLine: 100000,
                interestRate: 6.0,
                drawPeriodYears: 10,
                repaymentPeriodYears: 20,
                utilization: 50,
                closingCostsType: "amount",
                closingCostsValue: 0,
                closingCostsPaid: "upfront",
                annualFee: 0,
            });

            expect(result.drawMonthlyPayment).toBeCloseTo(250);
        });
    });

    describe("Loan Limits", () => {
        it("should have correct data for CA", () => {
            const limits = LOAN_LIMITS_2025.fannie.CA;
            expect(limits.oneUnit).toBeGreaterThan(1000000); // High cost
        });
        it("should have correct data for AL", () => {
            const limits = LOAN_LIMITS_2025.fannie.AL;
            expect(limits.oneUnit).toBe(806500); // Baseline 2025
        });
    });

    describe("Tax Savings", () => {
        it("should calculate deduction value", () => {
            const result = calculateTaxSavings({
                annualInterest: 10000,
                taxBracket: 24,
            });
            expect(result.estimatedSavings).toBe(2400);
        });
    });
});

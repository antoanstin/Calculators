import { calculateAmortization } from "@/lib/calculations/amortization";
import { calculateBlendedRate } from "@/lib/calculations/blendedRate";
import { calculateRefinanceBreakeven } from "@/lib/calculations/refinance";
import { calculateCreditCardPayoff } from "@/lib/calculations/creditCard";

describe("Mortgage & Finance Calculators", () => {

    describe("Amortization Calculator", () => {
        it("should calculate correct monthly payment for standard loan", () => {
            const result = calculateAmortization({
                loanAmount: 100000,
                interestRate: 6,
                termYears: 30,
                termMonths: 0,
                startDate: "2023-01-01",
                paymentFrequency: "monthly",
            });
            // Payment = 100,000 * 0.005 / (1 - 1.005^-360) = 599.55
            expect(result.monthlyPayment).toBeCloseTo(599.55, 2);
            expect(result.schedule.length).toBe(360);
            expect(result.totalPaid).toBeCloseTo(result.monthlyPayment * 360, 0);
        });

        it("should handle 0 interest rate", () => {
            const result = calculateAmortization({
                loanAmount: 12000,
                interestRate: 0,
                termYears: 1,
                termMonths: 0,
                startDate: "2023-01-01",
                paymentFrequency: "monthly",
            });
            expect(result.monthlyPayment).toBe(1000);
        });
    });

    describe("Blended Rate Calculator", () => {
        it("should calculate correct weighted average rate", () => {
            /*
            A: 200,000 @ 3%
            B: 50,000 @ 8%
            Total: 250,000
            Weight A: 0.8, Weight B: 0.2
            Rate = 0.8*3 + 0.2*8 = 2.4 + 1.6 = 4.0%
            */
            const result = calculateBlendedRate({
                balanceA: 200000,
                rateA: 3,
                balanceB: 50000,
                rateB: 8,
            });
            expect(result.blendedRate).toBeCloseTo(4.0, 2);
            expect(result.totalBalance).toBe(250000);
        });
    });

    describe("Refinance Breakeven Calculator", () => {
        it("should calculate correct breakeven point", () => {
            // Savings = 2000 - 1800 = 200/mo
            // Costs = 4000
            // Months = 4000 / 200 = 20
            const result = calculateRefinanceBreakeven({
                currentMonthlyPayment: 2000,
                newMonthlyPayment: 1800,
                closingCosts: 4000,
                startDate: "2023-01-01",
            });
            expect(result.monthlySavings).toBe(200);
            expect(result.breakevenMonths).toBe(20);
        });

        it("should handle no savings scenario", () => {
            const result = calculateRefinanceBreakeven({
                currentMonthlyPayment: 2000,
                newMonthlyPayment: 2100,
                closingCosts: 4000,
                startDate: "2023-01-01",
            });
            expect(result.breakevenMonths).toBe(0);
        });
    });

    describe("Credit Card Payoff Calculator", () => {
        it("should calculate payoff time for fixed payment", () => {
            // Balance 1000, Rate 12% (1%/mo), Payment 100
            // Month 1: I=10, P=90, B=910
            // ... slightly complex, but let's just check it returns reasonable months.
            // Rough: 1000/90 approx 11 months.
            const result = calculateCreditCardPayoff({
                balance: 1000,
                interestRate: 12,
                mode: "payment-fixed",
                monthlyPayment: 100,
            });
            expect(result.monthsToPayoff).toBeGreaterThan(10);
            expect(result.monthsToPayoff).toBeLessThan(12); // Should be 11
            expect(result.isPaymentTooLow).toBe(false);
        });

        it("should detect low payment", () => {
            // Interest on 1000 @ 12% is 10. Payment 5.
            const result = calculateCreditCardPayoff({
                balance: 1000,
                interestRate: 12,
                mode: "payment-fixed",
                monthlyPayment: 5,
            });
            expect(result.isPaymentTooLow).toBe(true);
        });
    });
});

import { addMonths, format } from "date-fns";

export interface EarlyPayoffInputs {
    loanAmount: number;
    interestRate: number; // annual %
    termYears: number;
    termMonths: number;
    startDate: string; // YYYY-MM-DD
    extraPayment: number; // monthly
}

export interface EarlyPayoffResult {
    originalMonthlyPayment: number;
    originalTotalInterest: number;
    originalPayoffDate: string;
    newPayoffDate: string;
    newTotalInterest: number;
    interestSaved: number;
    timeSavedMonths: number;
}

export function calculateEarlyPayoff(inputs: EarlyPayoffInputs): EarlyPayoffResult {
    const { loanAmount, interestRate, termYears, termMonths, startDate, extraPayment } = inputs;

    const totalMonths = termYears * 12 + termMonths;
    if (loanAmount <= 0) {
        return {
            originalMonthlyPayment: 0,
            originalTotalInterest: 0,
            originalPayoffDate: "",
            newPayoffDate: "",
            newTotalInterest: 0,
            interestSaved: 0,
            timeSavedMonths: 0,
        };
    }

    const start = new Date(startDate || new Date().toISOString().split('T')[0]);
    const r = interestRate / 100 / 12;
    const n = totalMonths;

    let originalPayment = 0;
    if (interestRate === 0) {
        originalPayment = loanAmount / n;
    } else {
        originalPayment = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const originalTotalInterest = (originalPayment * n) - loanAmount;
    const originalPayoffDate = format(addMonths(start, n), "MMM yyyy");

    // New Scenerio
    let balance = loanAmount;
    let newTotalInterest = 0;
    let months = 0;
    const newMonthlyPaymentTotal = originalPayment + extraPayment;

    // Interest only check
    const interestOnly = balance * r;
    if (newMonthlyPaymentTotal <= interestOnly && balance > 0) {
        return {
            originalMonthlyPayment: originalPayment,
            originalTotalInterest,
            originalPayoffDate: "Never",
            newPayoffDate: "Never",
            newTotalInterest: 0,
            interestSaved: 0,
            timeSavedMonths: 0,
        };
    }

    while (balance > 0.01 && months < 1200) {
        const interest = balance * r;
        let principal = newMonthlyPaymentTotal - interest;

        if (balance + interest < newMonthlyPaymentTotal) {
            principal = balance;
        }

        balance -= principal;
        newTotalInterest += interest;
        months++;
    }

    const timeSavedMonths = n - months;
    const interestSaved = originalTotalInterest - newTotalInterest;
    const newPayoffDate = format(addMonths(start, months), "MMM yyyy");

    return {
        originalMonthlyPayment: originalPayment,
        originalTotalInterest,
        originalPayoffDate,
        newPayoffDate,
        newTotalInterest,
        interestSaved: Math.max(0, interestSaved),
        timeSavedMonths: Math.max(0, timeSavedMonths),
    };
}

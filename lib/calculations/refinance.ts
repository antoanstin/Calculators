import { addMonths, format } from "date-fns";

export interface RefinanceInputs {
    currentMonthlyPayment: number;
    newMonthlyPayment: number;
    closingCosts: number;
    startDate: string; // YYYY-MM-DD
}

export interface RefinanceResult {
    monthlySavings: number;
    breakevenMonths: number;
    breakevenDate: string | null;
}

export function calculateRefinanceBreakeven(inputs: RefinanceInputs): RefinanceResult {
    const { currentMonthlyPayment, newMonthlyPayment, closingCosts, startDate } = inputs;

    const monthlySavings = currentMonthlyPayment - newMonthlyPayment;

    if (monthlySavings <= 0) {
        return {
            monthlySavings,
            breakevenMonths: 0,
            breakevenDate: null,
        };
    }

    const breakevenMonths = Math.ceil(closingCosts / monthlySavings);

    const start = new Date(startDate || new Date().toISOString().split('T')[0]);
    // Use date-fns to format the date nicely
    const breakevenDate = format(addMonths(start, breakevenMonths), "MMMM yyyy");

    return {
        monthlySavings,
        breakevenMonths,
        breakevenDate,
    };
}

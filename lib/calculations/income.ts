export interface IncomeInputs {
    baseIncome: number;
    baseIncomeFrequency: "monthly" | "annually";
    bonus: number; // annual
    overtime: number; // annual
    commission: number; // annual
    other: number; // annual
    rentalIncome: number; // annual
    rentalFactor: number; // percentage, e.g. 75
}

export interface IncomeBreakdown {
    baseMonthly: number;
    bonusMonthly: number;
    overtimeMonthly: number;
    commissionMonthly: number;
    otherMonthly: number;
    rentalMonthly: number;
}

export interface IncomeResult {
    totalMonthlyIncome: number;
    totalAnnualIncome: number;
    breakdown: IncomeBreakdown;
}

export function calculateIncome(inputs: IncomeInputs): IncomeResult {
    const baseMonthly =
        inputs.baseIncomeFrequency === "monthly"
            ? inputs.baseIncome
            : inputs.baseIncome / 12;

    const bonusMonthly = inputs.bonus / 12;
    const overtimeMonthly = inputs.overtime / 12;
    const commissionMonthly = inputs.commission / 12;
    const otherMonthly = inputs.other / 12;

    // Rental income is usually qualified at a certain percentage (e.g., 75%)
    const rentalMonthly = (inputs.rentalIncome * (inputs.rentalFactor / 100)) / 12;

    const totalMonthlyIncome =
        baseMonthly +
        bonusMonthly +
        overtimeMonthly +
        commissionMonthly +
        otherMonthly +
        rentalMonthly;

    const totalAnnualIncome = totalMonthlyIncome * 12;

    return {
        totalMonthlyIncome,
        totalAnnualIncome,
        breakdown: {
            baseMonthly,
            bonusMonthly,
            overtimeMonthly,
            commissionMonthly,
            otherMonthly,
            rentalMonthly,
        },
    };
}

export interface TaxSavingsInputs {
    annualInterest: number;
    taxBracket: number; // %
}

export interface TaxSavingsResult {
    estimatedSavings: number;
    message: string;
}

export function calculateTaxSavings(inputs: TaxSavingsInputs): TaxSavingsResult {
    const { annualInterest, taxBracket } = inputs;

    const estimatedSavings = annualInterest * (taxBracket / 100);

    return {
        estimatedSavings,
        message: "Estimate only. Consult a tax professional.",
    };
}


export interface LoanInput {
    balance: number;
    rate: number; // annual %
}

export interface BlendedRateInputs {
    loans: LoanInput[];
}

export interface LoanResult {
    balance: number;
    rate: number;
    interest: number;
    weight: number;
}

export interface BlendedRateResult {
    totalBalance: number;
    blendedRate: number;
    totalInterest: number;
    loanResults: LoanResult[];
}

export function calculateBlendedRate(inputs: BlendedRateInputs): BlendedRateResult {
    const { loans } = inputs;

    const totalBalance = loans.reduce((sum, loan) => sum + loan.balance, 0);

    if (totalBalance <= 0) {
        return {
            totalBalance: 0,
            blendedRate: 0,
            totalInterest: 0,
            loanResults: loans.map(l => ({
                balance: l.balance,
                rate: l.rate,
                interest: 0,
                weight: 0
            }))
        };
    }

    // Weighted Average Calculation
    // Sum(Balance * Rate) / Sum(Balance)
    const weightedRateSum = loans.reduce((sum, loan) => sum + (loan.balance * loan.rate), 0);
    const blendedRate = weightedRateSum / totalBalance;

    // Total Annual Interest (Approximate)
    const totalInterest = loans.reduce((sum, loan) => sum + (loan.balance * (loan.rate / 100)), 0);

    const loanResults: LoanResult[] = loans.map(loan => ({
        balance: loan.balance,
        rate: loan.rate,
        interest: loan.balance * (loan.rate / 100),
        weight: (loan.balance / totalBalance) * 100
    }));

    return {
        totalBalance,
        blendedRate,
        totalInterest,
        loanResults,
    };
}

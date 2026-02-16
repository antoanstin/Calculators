

export interface OneTimePayment {
    amount: number;
    date: string; // YYYY-MM
}

export interface AmortizationInputs {
    loanAmount: number;
    interestRate: number; // annual %
    termYears: number;
    termMonths: number;
    startDate: string; // YYYY-MM-DD
    paymentFrequency: "monthly" | "biweekly";
    extraMonthly?: number;
    extraMonthlyStartDate?: string; // YYYY-MM
    extraYearly?: number;
    extraYearlyStartDate?: string; // YYYY-MM
    oneTimePayments?: OneTimePayment[];
}

export interface AmortizationRow {
    paymentNumber: number;
    date: string;
    payment: number;
    principal: number;
    interest: number;
    remainingBalance: number;
    totalInterestPaid: number;
    extraPayment?: number;
}

export interface AmortizationResult {
    monthlyPayment: number;
    totalInterest: number;
    totalPaid: number;
    totalExtraPayments?: number;
    payoffDate: string;
    schedule: AmortizationRow[];
    totalMonths: number;
}

export function calculateAmortization(inputs: AmortizationInputs): AmortizationResult {
    const {
        loanAmount,
        interestRate,
        termYears,
        termMonths,
        startDate,
        paymentFrequency,
        extraMonthly = 0,
        extraMonthlyStartDate,
        extraYearly = 0,
        extraYearlyStartDate,
        oneTimePayments = []
    } = inputs;

    const totalMonths = termYears * 12 + termMonths;
    // Handle 0 inputs
    if (loanAmount <= 0 || totalMonths <= 0) {
        return {
            monthlyPayment: 0,
            totalInterest: 0,
            totalPaid: 0,
            payoffDate: "",
            schedule: [],
            totalMonths: 0
        };
    }

    // Monthly Interest Rate
    const r = interestRate / 100 / 12;

    let n = totalMonths;
    let ratePerPeriod = r;

    if (paymentFrequency === "biweekly") {
        n = Math.ceil(totalMonths / 12 * 26);
        ratePerPeriod = interestRate / 100 / 26;
    }

    let payment = 0;
    if (interestRate === 0) {
        payment = loanAmount / n;
    } else {
        payment = (loanAmount * ratePerPeriod) * Math.pow(1 + ratePerPeriod, n) / (Math.pow(1 + ratePerPeriod, n) - 1);
    }
    const baseMonthlyPayment = payment;

    const schedule: AmortizationRow[] = [];
    let balance = loanAmount;
    let totalInterest = 0;
    const currentDate = new Date(startDate || new Date().toISOString().split('T')[0]);

    for (let i = 1; i <= n; i++) {

        const interest = balance * ratePerPeriod;

        let principal = payment - interest;

        // Extra Payments
        let extra = 0;
        const currentYearMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM
        const currentMonth = currentDate.getMonth();

        // Extra Monthly
        if (extraMonthly > 0) {
            if (!extraMonthlyStartDate || currentYearMonth >= extraMonthlyStartDate) {
                // If biweekly, do we apply "Monthly" extra once every 2 payments? Or every payment?
                // Usually "Extra Monthly" means "Extra per month".
                // If biweekly, let's assume we split it? Or just apply it if it's the first payment of the month?
                // Simplification for biweekly: Apply 1/2 of extra monthly per period?
                // Or: Apply completely on the first payment of the month.

                if (paymentFrequency === "monthly") {
                    extra += extraMonthly;
                } else {
                    // Biweekly behavior for "Extra Monthly":
                    // Apply 12 * Extra / 26 per payment? Or user means "Extra per payment"?
                    // Label says "Extra monthly pay". 
                    // Let's assume proportional for smooth algo: Extra * 12 / 26
                    extra += (extraMonthly * 12) / 26;
                }
            }
        }

        // Extra Yearly
        if (extraYearly > 0) {
            if (!extraYearlyStartDate || currentYearMonth >= extraYearlyStartDate) {
                // Apply once a year. Which month? Usually the start month or Dec?
                // Let's apply in the same month as extraYearlyStartDate (or start date's month)
                const targetMonth = extraYearlyStartDate ? parseInt(extraYearlyStartDate.split('-')[1]) - 1 : new Date(startDate).getMonth();
                if (currentMonth === targetMonth) {
                    // For biweekly, we ensure we only apply ONCE per month.
                    // Check if this is the first payment of that month.
                    // A bit tricky with bi-weekly falling twice.
                    // Simple check: have we already applied it this year?
                    // Let's use string check on the accumulated schedule? Too slow.

                    // Easier: Apply if monthly. 
                    if (paymentFrequency === "monthly") {
                        extra += extraYearly;
                    } else {
                        // For biweekly: Check if day <= 14 (first half) to apply once?
                        if (currentDate.getDate() <= 15) {
                            extra += extraYearly;
                        }
                    }
                }
            }
        }

        // One Time Payments
        oneTimePayments.forEach(otp => {
            if (otp.date === currentYearMonth) {
                // Apply once.
                if (paymentFrequency === "monthly") {
                    extra += otp.amount;
                } else {
                    if (currentDate.getDate() <= 15) {
                        extra += otp.amount;
                    }
                }
            }
        });

        // Cap principal + extra to balance
        if (principal + extra > balance) {
            // adjusting to payoff
            // const needed = balance - principal; // ensure principal+needed = balance (ignoring interest part covered by payment)
            // Actually: Total Pay = interest + principal + extra.
            // We pay 'payment' (covers interest + principal) + 'extra'.
            // Rem Balance = Balance - Principal - Extra.

            if (balance <= principal + extra) {
                extra = balance - principal;
                if (extra < 0) { // Payment itself is enough to cover balance
                    principal = balance;
                    extra = 0;
                    payment = principal + interest;
                }
            }
        }


        // Handle last payment normal logic (if balance < payment)
        if (balance + interest < payment) {
            principal = balance;
            payment = principal + interest;
            extra = 0; // No extra needed
        }

        // If balance is tiny, finish
        if (balance <= 0) break;

        balance -= (principal + extra);
        totalInterest += interest;

        // Date increment
        let displayDate = "";
        try {
            displayDate = currentDate.toISOString().split('T')[0];
        } catch { displayDate = "Invalid Date" }

        schedule.push({
            paymentNumber: i,
            date: displayDate,
            payment: payment + extra, // Show total paid this period
            principal: principal + extra,
            interest: interest,
            remainingBalance: Math.max(0, balance),
            totalInterestPaid: totalInterest,
            extraPayment: extra
        });

        if (paymentFrequency === "monthly") {
            currentDate.setMonth(currentDate.getMonth() + 1);
        } else {
            currentDate.setDate(currentDate.getDate() + 14);
        }

        if (balance < 0.01) break;
    }

    const totalPaid = schedule.reduce((sum, row) => sum + row.payment, 0);
    const totalExtraPayments = schedule.reduce((sum, row) => sum + (row.extraPayment || 0), 0);
    const payoffDate = schedule.length > 0 ? schedule[schedule.length - 1].date : "";

    // Calculate total months actually taken
    let monthsElapsed = 0;
    if (schedule.length > 0) {
        // Calculate months between start and last payment
        const start = new Date(startDate || new Date().toISOString().split('T')[0]);
        const end = new Date(schedule[schedule.length - 1].date);
        monthsElapsed = ((end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())) + 1;
        // Adjust if end day > start day implies partial month? 
        // For simplicity, just count difference in months roughly.
        // Actually (end - start) in months is good enough for display like "10 years 5 months".
    } else {
        monthsElapsed = 0;
    }

    return {
        monthlyPayment: baseMonthlyPayment,
        totalInterest,
        totalPaid,
        totalExtraPayments,
        payoffDate,
        schedule,
        totalMonths: monthsElapsed > 0 ? monthsElapsed : schedule.length,
    };
}

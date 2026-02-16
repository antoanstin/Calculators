import React from "react";
import IncomeCalculator from "../components/calculators/IncomeCalculator";
import AmortizationCalculator from "../components/calculators/AmortizationCalculator";
import BlendedRateCalculator from "../components/calculators/BlendedRateCalculator";
import DebtConsolidationCalculator from "../components/calculators/DebtConsolidationCalculator";
import EarlyPayoffCalculator from "../components/calculators/EarlyPayoffCalculator";
import PrepaymentCalculator from "../components/calculators/PrepaymentCalculator";
import RefinanceCalculator from "../components/calculators/RefinanceCalculator";
import CreditCardPayoffCalculator from "../components/calculators/CreditCardCalculator";
import APRCalculator from "../components/calculators/APRCalculator";
import UFMIPRefundCalculator from "../components/calculators/UFMIPRefundCalculator";
import HELOCCalculator from "../components/calculators/HELOCCalculator";
import LoanLimitMap from "../components/calculators/LoanLimitMap";
import TaxSavingsCalculator from "../components/calculators/TaxSavingsCalculator";

export interface Calculator {
    id: string;
    name: string;
    description: string;
    component: React.ComponentType;
}

export const calculators: Calculator[] = [
    {
        id: "income",
        name: "Income Calculator",
        description: "Calculate annual and monthly qualifying income from various sources.",
        component: IncomeCalculator,
    },
    {
        id: "amortization",
        name: "Amortization & Comparison",
        description: "Generate amortization schedules and compare loan scenarios.",
        component: AmortizationCalculator,
    },
    {
        id: "blended-rate",
        name: "Blended Rate Calculator",
        description: "Calculate the weighted average interest rate of two loans.",
        component: BlendedRateCalculator,
    },
    {
        id: "debt-consolidation",
        name: "Debt Consolidation",
        description: "See how much you can save by consolidating multiple debts.",
        component: DebtConsolidationCalculator,
    },
    {
        id: "early-payoff",
        name: "Early Payoff Calculator",
        description: "Calculate time and interest saved by making extra principal payments.",
        component: EarlyPayoffCalculator,
    },
    {
        id: "prepayment",
        name: "Prepayment Savings",
        description: "Compare interest savings from refinancing vs making extra payments.",
        component: PrepaymentCalculator,
    },
    {
        id: "refinance-breakeven",
        name: "Refinance Breakeven",
        description: "Find out how long it takes for a refinance to pay for itself.",
        component: RefinanceCalculator,
    },
    {
        id: "credit-card-payoff",
        name: "Credit Card Payoff",
        description: "Calculate how long it will take to pay off your credit cards.",
        component: CreditCardPayoffCalculator,
    },
    {
        id: "apr",
        name: "APR Calculator",
        description: "Calculate the real Annual Percentage Rate including closing costs.",
        component: APRCalculator,
    },
    {
        id: "ufmip-refund",
        name: "UFMIP Refund",
        description: "Check eligibility for FHA UFMIP refund percentages.",
        component: UFMIPRefundCalculator,
    },
    {
        id: "heloc",
        name: "HELOC Calculator",
        description: "Estimate payments for Home Equity Lines of Credit.",
        component: HELOCCalculator,
    },
    {
        id: "loan-limits",
        name: "Loan Limit Map",
        description: "View Conforming and FHA loan limits by state.",
        component: LoanLimitMap,
    },
    {
        id: "tax-savings",
        name: "Tax Savings Estimate",
        description: "Estimate potential tax deduction value from mortgage interest.",
        component: TaxSavingsCalculator,
    },
];

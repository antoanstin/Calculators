"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { MoneyInput } from "../ui/MoneyInput";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { ResultCard } from "../ui/ResultCard";
import {
    calculateCreditCardPayoff,
    CreditCardInputs,
    CreditCardResult,
} from "@/lib/calculations/creditCard";
import { formatCurrency } from "@/lib/format";

const CreditCardPayoffCalculator = () => {
    const [values, setValues] = useState<CreditCardInputs>({
        balance: 5000,
        interestRate: 18.99,
        mode: "payment-fixed",
        monthlyPayment: 200,
        monthsToPayoff: 12,
    });

    const [result, setResult] = useState<CreditCardResult | null>(null);

    const handleChange = (field: keyof CreditCardInputs, value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        setResult(null); // Clear result on change
    };

    const handleCalculate = () => {
        const res = calculateCreditCardPayoff(values);
        setResult(res);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 rounded-lg border border-gray-200 bg-white">
                    <h3 className="font-semibold text-lg text-gray-700">Card Details</h3>
                    <MoneyInput
                        label="Credit Card Balance"
                        value={values.balance}
                        onChange={(e) => handleChange("balance", Number(e.target.value))}
                    />
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (APR)</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.1"
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                                value={values.interestRate}
                                onChange={(e) => handleChange("interestRate", Number(e.target.value))}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">%</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 p-4 rounded-lg border border-purple-200 bg-purple-50">
                    <h3 className="font-semibold text-lg text-purple-900">Goal</h3>
                    <Select
                        label="I want to..."
                        options={[
                            { value: "payment-fixed", label: "Pay a specific amount monthly" },
                            { value: "time-fixed", label: "Pay off in a specific time" },
                        ]}
                        value={values.mode}
                        onChange={(e) => handleChange("mode", e.target.value)}
                    />

                    {values.mode === "payment-fixed" ? (
                        <MoneyInput
                            label="Monthly Payment"
                            value={values.monthlyPayment || 0}
                            onChange={(e) => handleChange("monthlyPayment", Number(e.target.value))}
                        />
                    ) : (
                        <Input
                            label="Months to Payoff"
                            type="number"
                            value={values.monthsToPayoff || 12}
                            onChange={(e) => handleChange("monthsToPayoff", Number(e.target.value))}
                        />
                    )}
                </div>
            </div>

            <div className="flex justify-center">
                <Button onClick={handleCalculate} size="lg" className="px-8">
                    Calculate Payoff
                </Button>
            </div>

            {result && (
                <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {result.isPaymentTooLow ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                            <strong>Payment Too Low:</strong> Your payment amount is less than the monthly interest. You will never pay off the debt at this rate. Please increase your payment.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ResultCard
                                title={values.mode === "payment-fixed" ? "Time to Payoff" : "Monthly Payment"}
                                value={
                                    values.mode === "payment-fixed"
                                        ? `${Math.floor(result.monthsToPayoff / 12)}y ${result.monthsToPayoff % 12}m`
                                        : formatCurrency(result.requiredMonthlyPayment || 0)
                                }
                                variant="highlight"
                            />
                            <ResultCard
                                title="Total Interest"
                                value={formatCurrency(result.totalInterest)}
                                variant="default"
                            />
                            <ResultCard
                                title="Total Cost"
                                value={formatCurrency(result.totalPaid)}
                                variant="default"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CreditCardPayoffCalculator;

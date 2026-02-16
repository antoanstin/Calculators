"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { MoneyInput } from "../ui/MoneyInput";
import { Input } from "../ui/Input";
import { ResultCard } from "../ui/ResultCard";
import {
    calculateEarlyPayoff,
    EarlyPayoffInputs,
    EarlyPayoffResult,
} from "@/lib/calculations/earlyPayoff";
import { formatCurrency } from "@/lib/format";

const EarlyPayoffCalculator = () => {
    const [values, setValues] = useState<EarlyPayoffInputs>({
        loanAmount: 250000,
        interestRate: 6.0,
        termYears: 30,
        termMonths: 0,
        startDate: new Date().toISOString().split("T")[0],
        extraPayment: 100,
    });

    const [result, setResult] = useState<EarlyPayoffResult | null>(null);

    const handleChange = (field: keyof EarlyPayoffInputs, value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleCalculate = () => {
        const res = calculateEarlyPayoff(values);
        setResult(res);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 rounded-lg border border-gray-200 bg-white">
                    <h3 className="font-semibold text-lg text-gray-700">Loan Details</h3>
                    <MoneyInput
                        label="Loan Amount"
                        value={values.loanAmount}
                        onChange={(e) => handleChange("loanAmount", Number(e.target.value))}
                    />
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.125"
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                                value={values.interestRate}
                                onChange={(e) => handleChange("interestRate", Number(e.target.value))}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">%</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Term (Years)"
                            type="number"
                            value={values.termYears}
                            onChange={(e) => handleChange("termYears", Number(e.target.value))}
                        />
                        <Input
                            label="Term (Months)"
                            type="number"
                            value={values.termMonths}
                            onChange={(e) => handleChange("termMonths", Number(e.target.value))}
                        />
                    </div>
                    <Input
                        label="Start Date"
                        type="date"
                        value={values.startDate}
                        onChange={(e) => handleChange("startDate", e.target.value)}
                    />
                </div>

                <div className="space-y-4 p-4 rounded-lg border border-green-200 bg-green-50">
                    <h3 className="font-semibold text-lg text-green-800">Extra Payment Strategy</h3>
                    <MoneyInput
                        label="Extra Principal Per Month"
                        value={values.extraPayment}
                        onChange={(e) => handleChange("extraPayment", Number(e.target.value))}
                    />
                    <p className="text-sm text-green-700 pt-2">
                        Adding just a small amount to your principal every month can save thousands in interest and chop years off your mortgage.
                    </p>
                </div>
            </div>

            <div className="flex justify-center">
                <Button onClick={handleCalculate} size="lg" className="px-8">
                    Calculate Benefit
                </Button>
            </div>

            {result && (
                <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-lg font-semibold text-gray-900">Savings Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <ResultCard
                            title="Time Saved"
                            value={`${Math.floor(result.timeSavedMonths / 12)}y ${result.timeSavedMonths % 12}m`}
                            variant="highlight"
                            subtitle={`New Payoff: ${result.newPayoffDate}`}
                        />
                        <ResultCard
                            title="Interest Saved"
                            value={formatCurrency(result.interestSaved)}
                            variant="success"
                        />
                        <ResultCard
                            title="New Payoff Date"
                            value={result.newPayoffDate}
                            subtitle={`Original: ${result.originalPayoffDate}`}
                        />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                        <div className="flex justify-between items-center text-sm">
                            <div className="text-gray-700">Original Total Interest</div>
                            <div className="font-medium text-gray-900">{formatCurrency(result.originalTotalInterest)}</div>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-2">
                            <div className="text-gray-700">New Total Interest</div>
                            <div className="font-medium text-green-600">{formatCurrency(result.newTotalInterest)}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EarlyPayoffCalculator;

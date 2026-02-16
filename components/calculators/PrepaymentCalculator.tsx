"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { MoneyInput } from "../ui/MoneyInput";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { ResultCard } from "../ui/ResultCard";
import {
    calculatePrepaymentSavings,
    PrepaymentInputs,
    PrepaymentResult,
} from "@/lib/calculations/prepayment";
import { formatCurrency } from "@/lib/format";

const PrepaymentCalculator = () => {
    const [values, setValues] = useState<PrepaymentInputs>({
        currentBalance: 200000,
        currentRate: 4.5,
        remainingTermMonths: 300,
        scenarioType: "extra-payment",
        extraMonthly: 200,
        lumpSum: 0,
        newRate: 3.5,
        newTermMonths: 180,
    });

    const [result, setResult] = useState<PrepaymentResult | null>(null);

    const handleChange = (field: keyof PrepaymentInputs, value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleCalculate = () => {
        const res = calculatePrepaymentSavings(values);
        setResult(res);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 rounded-lg border border-gray-200 bg-white">
                    <h3 className="font-semibold text-lg text-gray-700">Current Loan</h3>
                    <MoneyInput
                        label="Remaining Balance"
                        value={values.currentBalance}
                        onChange={(e) => handleChange("currentBalance", Number(e.target.value))}
                    />
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Rate</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.125"
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                                value={values.currentRate}
                                onChange={(e) => handleChange("currentRate", Number(e.target.value))}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">%</div>
                        </div>
                    </div>
                    <Input
                        label="Remaining Term (Months)"
                        type="number"
                        value={values.remainingTermMonths}
                        onChange={(e) => handleChange("remainingTermMonths", Number(e.target.value))}
                    />
                </div>

                <div className="space-y-4 p-4 rounded-lg border border-blue-200 bg-blue-50">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-lg text-blue-900">Savings Scenario</h3>
                        <Select
                            className="w-32 h-8 text-xs bg-white"
                            options={[
                                { value: "extra-payment", label: "Extra Payment" },
                                { value: "refinance", label: "Refinance" },
                            ]}
                            value={values.scenarioType}
                            onChange={(e) => handleChange("scenarioType", e.target.value)}
                        />
                    </div>

                    {values.scenarioType === "extra-payment" ? (
                        <>
                            <MoneyInput
                                label="Extra Monthly Payment"
                                value={values.extraMonthly || 0}
                                onChange={(e) => handleChange("extraMonthly", Number(e.target.value))}
                            />
                            <MoneyInput
                                label="Lump Sum Payment (One-time)"
                                value={values.lumpSum || 0}
                                onChange={(e) => handleChange("lumpSum", Number(e.target.value))}
                            />
                        </>
                    ) : (
                        <>
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Rate</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.125"
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                                        value={values.newRate || 0}
                                        onChange={(e) => handleChange("newRate", Number(e.target.value))}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">%</div>
                                </div>
                            </div>
                            <Input
                                label="New Term (Months)"
                                type="number"
                                value={values.newTermMonths || 0}
                                onChange={(e) => handleChange("newTermMonths", Number(e.target.value))}
                            />
                        </>
                    )}
                </div>
            </div>

            <div className="flex justify-center">
                <Button onClick={handleCalculate} size="lg" className="px-8">
                    Calculate Savings
                </Button>
            </div>

            {result && (
                <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ResultCard
                            title="Interest Saved"
                            value={formatCurrency(result.interestSaved)}
                            variant="success"
                            subtitle={result.interestSaved >= 0 ? "You save!" : "You pay more"}
                        />
                        <ResultCard
                            title="New Payoff Time"
                            value={`${Math.floor(result.scenarioPayoffMonths / 12)}y ${result.scenarioPayoffMonths % 12}m`}
                            subtitle={`vs ${Math.floor(values.remainingTermMonths / 12)}y ${values.remainingTermMonths % 12}m`}
                        />
                        <ResultCard
                            title="Total Scenario Interest"
                            value={formatCurrency(result.scenarioTotalInterest)}
                            subtitle={`Current: ${formatCurrency(result.currentTotalInterest)}`}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrepaymentCalculator;

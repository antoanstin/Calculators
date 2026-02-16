"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { MoneyInput } from "../ui/MoneyInput";
import { Input } from "../ui/Input";
import { ResultCard } from "../ui/ResultCard";
import {
    calculateRefinanceBreakeven,
    RefinanceInputs,
    RefinanceResult,
} from "@/lib/calculations/refinance";
import { formatCurrency } from "@/lib/format";

const RefinanceCalculator = () => {
    const [values, setValues] = useState<RefinanceInputs>({
        currentMonthlyPayment: 2000,
        newMonthlyPayment: 1850,
        closingCosts: 4500,
        startDate: new Date().toISOString().split("T")[0],
    });

    const [result, setResult] = useState<RefinanceResult | null>(null);

    const handleChange = (field: keyof RefinanceInputs, value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleCalculate = () => {
        const res = calculateRefinanceBreakeven(values);
        setResult(res);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 rounded-lg border border-gray-200 bg-white">
                    <h3 className="font-semibold text-lg text-gray-700">Payments</h3>
                    <MoneyInput
                        label="Current Monthly Payment"
                        value={values.currentMonthlyPayment}
                        onChange={(e) => handleChange("currentMonthlyPayment", Number(e.target.value))}
                    />
                    <MoneyInput
                        label="New Monthly Payment"
                        value={values.newMonthlyPayment}
                        onChange={(e) => handleChange("newMonthlyPayment", Number(e.target.value))}
                    />
                </div>

                <div className="space-y-4 p-4 rounded-lg border border-gray-200 bg-white">
                    <h3 className="font-semibold text-lg text-gray-700">Costs</h3>
                    <MoneyInput
                        label="Total Closing Costs"
                        value={values.closingCosts}
                        onChange={(e) => handleChange("closingCosts", Number(e.target.value))}
                    />
                    <Input
                        label="Start Date"
                        type="date"
                        value={values.startDate}
                        onChange={(e) => handleChange("startDate", e.target.value)}
                    />
                </div>
            </div>

            <div className="flex justify-center">
                <Button onClick={handleCalculate} size="lg" className="px-8">
                    Calculate Breakeven
                </Button>
            </div>

            {result && (
                <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ResultCard
                            title="Breakeven Date"
                            value={result.breakevenDate || "No Breakeven"}
                            variant={result.breakevenDate ? "highlight" : "default"}
                            subtitle={result.breakevenMonths > 0 ? `${result.breakevenMonths} months to recoup costs` : "Costs not recouped"}
                        />
                        <ResultCard
                            title="Monthly Savings"
                            value={formatCurrency(result.monthlySavings)}
                            variant={result.monthlySavings > 0 ? "success" : "default"}
                        />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        {result.breakevenDate ? (
                            <p className="text-gray-700">
                                If you plan to stay in your home past <strong>{result.breakevenDate}</strong>,
                                this refinance likely makes financial sense.
                            </p>
                        ) : (
                            <p className="text-gray-700">
                                With <strong>no monthly savings</strong>, this refinance may not make financial sense
                                unless you are achieving other goals (e.g., cash out, term reduction).
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RefinanceCalculator;

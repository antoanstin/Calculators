"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { MoneyInput } from "../ui/MoneyInput";
import { Select } from "../ui/Select";
import { ResultCard } from "../ui/ResultCard";
import { calculateTaxSavings, TaxSavingsInputs, TaxSavingsResult } from "@/lib/calculations/taxSavings";
import { formatCurrency } from "@/lib/format";

const TaxSavingsCalculator = () => {
    const [values, setValues] = useState<TaxSavingsInputs & { customBracket: number; bracketMode: string }>({
        annualInterest: 15000,
        taxBracket: 24,
        customBracket: 0,
        bracketMode: "24",
    });

    const [result, setResult] = useState<TaxSavingsResult | null>(null);

    const handleChange = (field: string, value: any) => {
        if (field === "bracketMode") {
            const numVal = Number(value);
            if (!isNaN(numVal)) {
                setValues((prev) => ({ ...prev, bracketMode: value, taxBracket: numVal }));
            } else {
                setValues((prev) => ({ ...prev, bracketMode: "custom" }));
            }
        } else if (field === "customBracket") {
            setValues((prev) => ({ ...prev, customBracket: value, taxBracket: value }));
        } else {
            setValues((prev) => ({ ...prev, [field]: value }));
        }
    };

    const handleCalculate = () => {
        const res = calculateTaxSavings({
            annualInterest: values.annualInterest,
            taxBracket: values.bracketMode === "custom" ? values.customBracket : values.taxBracket
        });
        setResult(res);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 rounded-lg border border-gray-200 bg-white">
                    <h3 className="font-semibold text-lg text-gray-700">Deduction Details</h3>
                    <MoneyInput
                        label="Annual Mortgage Interest"
                        value={values.annualInterest}
                        onChange={(e) => handleChange("annualInterest", Number(e.target.value))}
                    />
                    <div className="w-full">
                        <Select
                            label="Marginal Tax Bracket"
                            options={[
                                { value: "10", label: "10%" },
                                { value: "12", label: "12%" },
                                { value: "22", label: "22%" },
                                { value: "24", label: "24%" },
                                { value: "32", label: "32%" },
                                { value: "35", label: "35%" },
                                { value: "37", label: "37%" },
                                { value: "custom", label: "Custom %" },
                            ]}
                            value={values.bracketMode}
                            onChange={(e) => handleChange("bracketMode", e.target.value)}
                        />
                    </div>

                    {values.bracketMode === "custom" && (
                        <div className="w-full animate-in fade-in zoom-in duration-200">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Custom Tax Rate
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                                    value={values.customBracket}
                                    onChange={(e) => handleChange("customBracket", Number(e.target.value))}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                                    %
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4 p-4 rounded-lg border border-green-200 bg-green-50 flex flex-col justify-center items-center text-center">
                    <h3 className="font-semibold text-lg text-green-900 mb-2">Why Limit Deductions?</h3>
                    <p className="text-sm text-green-800">
                        Mortgage interest is tax deductible up to certain loan limits ($750k for new loans).
                        This calculator assumes all interest entered is eligible.
                    </p>
                </div>
            </div>

            <div className="flex justify-center">
                <Button onClick={handleCalculate} size="lg" className="px-8">
                    Estimate Savings
                </Button>
            </div>

            {result && (
                <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="max-w-md mx-auto">
                        <ResultCard
                            title="Estimated Tax Value"
                            value={formatCurrency(result.estimatedSavings)}
                            variant="success"
                            subtitle={`based on ${values.bracketMode === 'custom' ? values.customBracket : values.taxBracket}% bracket`}
                        />
                    </div>
                    <p className="text-center text-sm text-gray-500 italic">
                        {result.message}
                    </p>
                </div>
            )}
        </div>
    );
};

export default TaxSavingsCalculator;

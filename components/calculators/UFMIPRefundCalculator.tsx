
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { MoneyInput } from "../ui/MoneyInput";
import { Input } from "../ui/Input";
import { ResultCard } from "../ui/ResultCard";
import {
    calculateUFMIPRefund,
    UFMIPRefundInputs,
    UFMIPRefundResult
} from "@/lib/calculations/ufmipRefund";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const UFMIPRefundCalculator = () => {
    // Default values
    const [inputs, setInputs] = useState<UFMIPRefundInputs>({
        refiType: "fha-to-fha", // Fixed for this calc purpose mostly
        baseLoanAmount: 400000,
        originalUfmipRate: 1.75,
        closingDate: "2024-06-15",
        caseAssignmentDate: new Date().toISOString().split("T")[0], // Today
    });

    const [result, setResult] = useState<UFMIPRefundResult | null>(null);

    const handleCalculate = () => {
        const res = calculateUFMIPRefund(inputs);
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
                <div className="space-y-4 p-4 rounded-lg border bg-white border-gray-200">
                    <h3 className="font-semibold text-lg text-gray-900">Loan Details</h3>

                    <MoneyInput
                        label="Original FHA Loan Amount"
                        value={inputs.baseLoanAmount}
                        onChange={(e) => setInputs({ ...inputs, baseLoanAmount: Number(e.target.value) })}
                    />

                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Original UFMIP %</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                                value={inputs.originalUfmipRate}
                                onChange={(e) => setInputs({ ...inputs, originalUfmipRate: Number(e.target.value) })}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">%</div>
                        </div>
                    </div>

                    <Input
                        label="Original Closing Date"
                        type="date"
                        value={inputs.closingDate}
                        onChange={(e) => setInputs({ ...inputs, closingDate: e.target.value })}
                    />

                    <Input
                        label="New Case Assignment Date (or Today)"
                        type="date"
                        value={inputs.caseAssignmentDate}
                        onChange={(e) => setInputs({ ...inputs, caseAssignmentDate: e.target.value })}
                    />
                </div>

                <div className="flex flex-col justify-center space-y-6">
                    <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-md border border-blue-100">
                        <h4 className="font-semibold text-blue-900 mb-2">About FHA UFMIP Refund</h4>
                        <p>
                            Refinancing an FHA loan to another FHA loan within 3 years may qualify for a partial refund of the original Upfront Mortgage Insurance Premium (UFMIP).
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Must be FHA-to-FHA refinance</li>
                            <li>Refund decreases monthly</li>
                            <li>Expires after 36 months</li>
                        </ul>
                    </div>

                    <Button onClick={handleCalculate} size="lg" className="w-full">
                        Calculate Refund
                    </Button>
                </div>
            </div>

            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="font-semibold text-lg text-gray-900">Refund Results</h3>

                    {/* Eligibility Banner */}
                    <div className={cn(
                        "p-4 rounded-md flex flex-col md:flex-row justify-between items-center shadow-sm",
                        result.isEligible ? "bg-green-100 text-green-900 border border-green-200" : "bg-red-50 text-red-900 border border-red-200"
                    )}>
                        <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold">
                                {result.isEligible ? "Eligible for Refund" : "Not Eligible"}
                            </span>
                        </div>
                        {result.isEligible && (
                            <div className="text-right mt-2 md:mt-0">
                                <span className="block text-sm opacity-80">Estimated Refund Credit</span>
                                <span className="text-3xl font-bold text-green-700">{formatCurrency(result.refundAmount)}</span>
                            </div>
                        )}
                    </div>

                    {!result.isEligible && (
                        <p className="text-red-600 font-medium">{result.message}</p>
                    )}

                    {result.isEligible && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <ResultCard
                                title="Refund Percentage"
                                value={`${result.refundPercentage}%`}
                                subtitle="Based on months since closing"
                            />
                            <ResultCard
                                title="Months Since Closing"
                                value={result.monthsSinceClosing.toString()}
                                subtitle="Calculated duration"
                            />
                            <ResultCard
                                title="Original UFMIP Paid"
                                value={formatCurrency(inputs.baseLoanAmount * (inputs.originalUfmipRate / 100))}
                                subtitle={`${inputs.originalUfmipRate}% of ${formatCurrency(inputs.baseLoanAmount)}`}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UFMIPRefundCalculator;

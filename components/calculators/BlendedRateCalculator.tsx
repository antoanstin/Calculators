"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { MoneyInput } from "../ui/MoneyInput";
import { ResultCard } from "../ui/ResultCard";
import {
    calculateBlendedRate,
    BlendedRateResult,
    LoanInput,
} from "@/lib/calculations/blendedRate";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { Plus, Trash2 } from "lucide-react"; // Assuming lucide-react is available, or use text

const BlendedRateCalculator = () => {
    const [loans, setLoans] = useState<LoanInput[]>([
        { balance: 200000, rate: 3.5 },
        { balance: 50000, rate: 7.5 },
    ]);

    const [result, setResult] = useState<BlendedRateResult | null>(null);

    const handleLoanChange = (index: number, field: keyof LoanInput, value: number) => {
        const newLoans = [...loans];
        newLoans[index] = { ...newLoans[index], [field]: value };
        setLoans(newLoans);
    };

    const addLoan = () => {
        setLoans([...loans, { balance: 0, rate: 0 }]);
    };

    const removeLoan = (index: number) => {
        if (loans.length <= 1) return;
        const newLoans = loans.filter((_, i) => i !== index);
        setLoans(newLoans);
    };

    const handleCalculate = () => {
        const res = calculateBlendedRate({ loans });
        setResult(res);
    };

    const handleReset = () => {
        setLoans([
            { balance: 0, rate: 0 },
            { balance: 0, rate: 0 },
        ]);
        setResult(null);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {loans.map((loan, index) => (
                    <div key={index} className="p-4 rounded-lg border border-gray-200 bg-gray-50 relative group">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg text-gray-700">Loan {index + 1}</h3>
                            {loans.length > 1 && (
                                <button
                                    onClick={() => removeLoan(index)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    aria-label="Remove loan"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <MoneyInput
                                label="Balance"
                                value={loan.balance || ""}
                                onChange={(e) => handleLoanChange(index, "balance", Number(e.target.value))}
                            />
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.125"
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                                        value={loan.rate || ""}
                                        onChange={(e) => handleLoanChange(index, "rate", Number(e.target.value))}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <Button
                    variant="outline"
                    onClick={addLoan}
                    className="w-full md:w-auto border-dashed border-2 py-6 flex items-center justify-center gap-2 hover:bg-gray-50"
                >
                    <Plus className="w-4 h-4" />
                    Add Another Loan
                </Button>
            </div>

            <div className="flex space-x-4 pt-4">
                <Button onClick={handleCalculate} className="w-full md:w-auto px-8">
                    Calculate Blended Rate
                </Button>
                <Button variant="outline" onClick={handleReset} className="w-full md:w-auto">
                    Reset
                </Button>
            </div>

            {result && (
                <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Results</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ResultCard
                            title="Blended Interest Rate"
                            value={formatPercentage(result.blendedRate)}
                            variant="highlight"
                        />
                        <ResultCard
                            title="Total Balance"
                            value={formatCurrency(result.totalBalance)}
                        />
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="font-semibold text-gray-900 mb-4 text-lg">Loan Breakdown</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-100 text-gray-900">
                                    <tr>
                                        <th className="px-4 py-3 text-left rounded-tl-lg font-semibold">Loan</th>
                                        <th className="px-4 py-3 text-right font-semibold">Balance</th>
                                        <th className="px-4 py-3 text-right font-semibold">Rate</th>
                                        <th className="px-4 py-3 text-right font-semibold">Weight</th>
                                        <th className="px-4 py-3 text-right rounded-tr-lg font-semibold">Annual Interest (est)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {(result.loanResults || []).map((loanResult, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 text-gray-900">
                                            <td className="px-4 py-3 font-medium">Loan {idx + 1}</td>
                                            <td className="px-4 py-3 text-right">{formatCurrency(loanResult.balance)}</td>
                                            <td className="px-4 py-3 text-right">{formatPercentage(loanResult.rate)}</td>
                                            <td className="px-4 py-3 text-right font-semibold text-indigo-700">
                                                {formatPercentage(result.totalBalance > 0 ? (loanResult.balance / result.totalBalance) * 100 : 0)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-700">
                                                {formatCurrency(loanResult.balance * (loanResult.rate / 100))}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-100 font-bold text-gray-900 border-t-2 border-gray-300">
                                        <td className="px-4 py-3">Total</td>
                                        <td className="px-4 py-3 text-right">{formatCurrency(result.totalBalance)}</td>
                                        <td className="px-4 py-3 text-right">{formatPercentage(result.blendedRate)}</td>
                                        <td className="px-4 py-3 text-right">100%</td>
                                        <td className="px-4 py-3 text-right">{formatCurrency(result.totalInterest)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlendedRateCalculator;

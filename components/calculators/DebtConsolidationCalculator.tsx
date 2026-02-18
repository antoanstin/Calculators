"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { MoneyInput } from "../ui/MoneyInput";
import { Input } from "../ui/Input";
import {
    calculateDebtConsolidation,
    ConsolidationResult,
    DebtItem,
} from "../../lib/calculations/debtConsolidation";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { Plus, Trash2, ChevronDown } from "lucide-react";

const DebtConsolidationCalculator = () => {
    const [debts, setDebts] = useState<DebtItem[]>([
        { id: "1", name: "Credit card 1", balance: 10000, interestRate: 17.99, minPayment: 260 },
        { id: "2", name: "Credit card 2", balance: 7500, interestRate: 19.99, minPayment: 190 },
        { id: "3", name: "High interest debt", balance: 6500, interestRate: 18.99, minPayment: 180 },
    ]);

    const [newLoan, setNewLoan] = useState<{
        rate: number;
        termMonths: number;
        closingCosts: number;
        feeType: "$" | "%";
        loanAmount: number;
    }>({
        rate: 10.99,
        termMonths: 60,
        closingCosts: 5,
        feeType: "%",
        loanAmount: 25000,
    });

    const [result, setResult] = useState<ConsolidationResult | null>(null);



    const addDebt = () => {
        const id = Math.random().toString(36).substr(2, 9);
        setDebts([
            ...debts,
            { id, name: `Debt ${debts.length + 1}`, balance: 0, interestRate: 0, minPayment: 0 },
        ]);
    };

    const removeDebt = (id: string) => {
        setDebts(debts.filter((d) => d.id !== id));
    };

    const updateDebt = (id: string, field: keyof DebtItem, value: string | number) => {
        setDebts(
            debts.map((d) => (d.id === id ? { ...d, [field]: value } as DebtItem : d))
        );
    };

    const handleCalculate = () => {
        const res = calculateDebtConsolidation({
            debts,
            newLoanRate: newLoan.rate,
            newLoanTermMonths: newLoan.termMonths,
            closingCosts: newLoan.closingCosts,
            feeType: newLoan.feeType,
            desiredLoanAmount: newLoan.loanAmount > 0 ? newLoan.loanAmount : undefined,
        });
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Current Debts</h3>
                    <Button onClick={addDebt} size="sm" variant="secondary">
                        <Plus className="w-4 h-4 mr-1" /> Add Debt
                    </Button>
                </div>

                <div className="space-y-3">
                    {debts.map((debt) => (
                        <div key={debt.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 items-end relative group">
                            <Input
                                label="Name"
                                value={debt.name}
                                onChange={(e) => updateDebt(debt.id, "name", e.target.value)}
                            />
                            <MoneyInput
                                label="Balance"
                                value={debt.balance}
                                onChange={(e) => updateDebt(debt.id, "balance", Number(e.target.value))}
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rate (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                                        value={debt.interestRate}
                                        onChange={(e) => updateDebt(debt.id, "interestRate", Number(e.target.value))}
                                    />
                                </div>
                            </div>
                            <MoneyInput
                                label="Min Payment"
                                value={debt.minPayment}
                                onChange={(e) => updateDebt(debt.id, "minPayment", Number(e.target.value))}
                            />
                            <button
                                onClick={() => removeDebt(debt.id)}
                                className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold text-blue-900">New Consolidation Loan</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MoneyInput
                            label="Loan Amount (Leave 0 for total debts)"
                            value={newLoan.loanAmount || 0}
                            onChange={(e) => setNewLoan({ ...newLoan, loanAmount: Number(e.target.value) })}
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.125"
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                                    value={newLoan.rate}
                                    onChange={(e) => setNewLoan({ ...newLoan, rate: Number(e.target.value) })}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">%</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Loan Term</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12"
                                        value={Math.floor(newLoan.termMonths / 12)}
                                        onChange={(e) => {
                                            const years = Number(e.target.value);
                                            const months = newLoan.termMonths % 12;
                                            setNewLoan({ ...newLoan, termMonths: years * 12 + months });
                                        }}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 text-sm">years</div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-14"
                                        value={newLoan.termMonths % 12}
                                        onChange={(e) => {
                                            const months = Number(e.target.value);
                                            const years = Math.floor(newLoan.termMonths / 12);
                                            setNewLoan({ ...newLoan, termMonths: years * 12 + months });
                                        }}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 text-sm">months</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loan fee/points</label>
                            <div className="relative rounded-md shadow-sm">
                                <input
                                    type="number"
                                    className="block w-full rounded-md border-gray-300 bg-white pl-3 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 text-gray-900 placeholder:text-gray-400"
                                    placeholder="0"
                                    value={newLoan.closingCosts}
                                    onChange={(e) => setNewLoan({ ...newLoan, closingCosts: Number(e.target.value) })}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setNewLoan(prev => ({
                                            ...prev,
                                            feeType: prev.feeType === "$" ? "%" : "$",
                                            closingCosts: 0 // Reset to avoid confusion (2000% vs $2000)
                                        }))}
                                        className="h-full rounded-md border-0 bg-transparent py-0 pl-2 pr-2 text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm font-medium hover:text-gray-700 flex items-center gap-1"
                                    >
                                        {newLoan.feeType}
                                        <ChevronDown className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <Button onClick={handleCalculate} size="lg" className="px-8">
                    Calculate Savings
                </Button>
            </div>

            {result && (
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-900">
                        <p className="mb-2">
                            The APR of your current debts are <strong>{formatPercentage(result.existingBlendedRate, 2)}</strong>.
                            The APR of your consolidation loan, with fee considered, is <strong>{formatPercentage(result.newAPR, 2)}</strong>.
                            So the financial cost of the consolidation loan is lower.
                        </p>
                        <p>
                            <span className="font-semibold text-green-700">This consolidation loan will save you money.</span>{' '}
                            After loan fee of <strong>{formatCurrency(result.closingCosts)}</strong>, you can get <strong>{formatCurrency(result.netProceeds)}</strong> to be used to payoff your remaining debt balance of <strong>{formatCurrency(result.existingTotalBalance)}</strong>.
                            So, you will need additional <strong>{formatCurrency(Math.abs(result.cashFlowDifference))}</strong> for consolidation.
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-sky-700 text-white font-semibold">
                                <tr>
                                    <th className="px-6 py-4"></th>
                                    <th className="px-6 py-4">Existing debts</th>
                                    <th className="px-6 py-4">Consolidation loan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-3 font-bold text-gray-900">APR</td>
                                    <td className="px-6 py-3 text-gray-700">{formatPercentage(result.existingBlendedRate, 2)}</td>
                                    <td className="px-6 py-3 text-gray-700">{formatPercentage(result.newAPR, 2)}</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-3 font-bold text-gray-900">Monthly pay</td>
                                    <td className="px-6 py-3 text-gray-700">{formatCurrency(result.existingTotalMonthlyPayment)}</td>
                                    <td className="px-6 py-3 text-gray-700">{formatCurrency(result.newMonthlyPayment)}</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-3 font-bold text-gray-900">Time to payoff</td>
                                    <td className="px-6 py-3 text-gray-700">{Math.round(result.existingTimeToPayoffMonths)} months ({Math.floor(result.existingTimeToPayoffMonths / 12)} years and {Math.round(result.existingTimeToPayoffMonths % 12)} months)</td>
                                    <td className="px-6 py-3 text-gray-700">{result.newTimeToPayoffMonths} months ({Math.floor(result.newTimeToPayoffMonths / 12)} years and {result.newTimeToPayoffMonths % 12} months)</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-3 font-bold text-gray-900">Loan fee/points</td>
                                    <td className="px-6 py-3 text-gray-700">$0</td>
                                    <td className="px-6 py-3 text-gray-700">{formatCurrency(result.closingCosts)}</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-3 font-bold text-gray-900">Upfront cash flow for consolidation</td>
                                    <td className="px-6 py-3 text-gray-700">$0</td>
                                    <td className="px-6 py-3 text-gray-700">{formatCurrency(result.cashFlowDifference)}</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-3 font-bold text-gray-900">Total payments</td>
                                    <td className="px-6 py-3 text-gray-700">{formatCurrency(result.existingTotalPayments)}</td>
                                    <td className="px-6 py-3 text-gray-700">{formatCurrency(result.newTotalPayments)}</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-3 font-bold text-gray-900">Total interests</td>
                                    <td className="px-6 py-3 text-gray-700">{formatCurrency(result.existingTotalInterest)}</td>
                                    <td className="px-6 py-3 text-gray-700">{formatCurrency(result.newTotalInterest)}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="bg-gray-50 p-3 text-xs text-gray-500 border-t border-gray-200">
                            *The calculation of the existing debts assume you pay {formatCurrency(result.existingTotalMonthlyPayment)} per month until payoff.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DebtConsolidationCalculator;

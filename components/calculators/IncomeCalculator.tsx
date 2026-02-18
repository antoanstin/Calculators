
"use client";

import React, { useState, useEffect } from "react";
import { MoneyInput } from "../ui/MoneyInput";
import { Select } from "../ui/Select";
import { NumberInput } from "../ui/NumberInput";
import { calculateIncome, IncomeInputs, IncomeResult } from "@/lib/calculations/income";
import { formatCurrency } from "@/lib/format";
import {
    DollarSign,
    Calendar,
    TrendingUp,
    Calculator,
    Briefcase,
    Building2,
    PieChart
} from "lucide-react";

const IncomeCalculator = () => {
    // Prefilled realistic defaults
    const defaultValues: IncomeInputs = {
        baseIncome: 95000,
        baseIncomeFrequency: "annually",
        bonus: 5000,
        overtime: 1200,
        commission: 0,
        other: 0,
        rentalIncome: 24000,
        rentalFactor: 75,
    };

    const [values, setValues] = useState<IncomeInputs>(defaultValues);
    const [result, setResult] = useState<IncomeResult | null>(null);

    // Auto-calculate on mount and when values change
    useEffect(() => {
        const res = calculateIncome(values);
        setResult(res);
    }, [values]);

    const handleChange = (field: keyof IncomeInputs, value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-12">
            {/* Inputs Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 align-start">
                {/* Employment Income Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
                    <div className="border-b border-gray-100 bg-gray-50/50 p-4 flex items-center space-x-2">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <Briefcase size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-900">Employment Income</h3>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-4">
                                <MoneyInput
                                    label="Base Income"
                                    value={values.baseIncome}
                                    onChange={(e) => handleChange("baseIncome", Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-4">
                                <Select
                                    label="Pay Frequency"
                                    options={[
                                        { value: "annually", label: "Annually (Yearly)" },
                                        { value: "monthly", label: "Monthly" },
                                        { value: "biweekly", label: "Bi-Weekly (Every 2 weeks)" },
                                        { value: "weekly", label: "Weekly" },
                                        { value: "hourly", label: "Hourly" },
                                    ]}
                                    value={values.baseIncomeFrequency}
                                    onChange={(e) => handleChange("baseIncomeFrequency", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <MoneyInput
                                label="Annual Bonus"
                                value={values.bonus}
                                onChange={(e) => handleChange("bonus", Number(e.target.value))}
                            />
                            <MoneyInput
                                label="Annual Overtime"
                                value={values.overtime}
                                onChange={(e) => handleChange("overtime", Number(e.target.value))}
                            />
                            <MoneyInput
                                label="Annual Commission"
                                value={values.commission}
                                onChange={(e) => handleChange("commission", Number(e.target.value))}
                            />
                            <MoneyInput
                                label="Other Annual Income"
                                value={values.other}
                                onChange={(e) => handleChange("other", Number(e.target.value))}
                            />
                        </div>
                    </div>
                </div>

                {/* Rental Income Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-fit">
                    <div className="border-b border-gray-100 bg-gray-50/50 p-4 flex items-center space-x-2">
                        <div className="bg-green-100 p-2 rounded-lg text-green-600">
                            <Building2 size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-900">Rental Income</h3>
                    </div>

                    <div className="p-6 grid grid-cols-1 gap-6">
                        <MoneyInput
                            label="Gross Annual Rental Income"
                            value={values.rentalIncome}
                            onChange={(e) => handleChange("rentalIncome", Number(e.target.value))}
                        />
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Occupancy Factor (%)
                            </label>
                            <div className="relative">
                                <NumberInput
                                    min="0"
                                    max="100"
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors pr-8"
                                    value={values.rentalFactor}
                                    onChange={(e) => handleChange("rentalFactor", Number(e.target.value))}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                                    %
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Default 75% for vacancies/maintenance.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            {result && (
                <div className="space-y-8 pt-8 border-t border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-bold text-gray-900">Results</h2>

                    {/* Top Result Dashboard Cards (Now Below Inputs) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <DollarSign size={100} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-indigo-100 font-medium text-sm uppercase tracking-wider mb-1">Qualifying Monthly Income</h3>
                                <p className="text-4xl font-bold tracking-tight">
                                    {formatCurrency(result.totalMonthlyIncome)}
                                </p>
                                <div className="mt-4 flex items-center text-indigo-200 text-sm">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    <span>Calculated monthly basis</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-colors">
                            <div className="absolute top-0 right-0 p-4 opacity-5 text-gray-400 group-hover:scale-110 transition-transform">
                                <TrendingUp size={100} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider mb-1">Total Annual Income</h3>
                                <p className="text-4xl font-bold text-gray-900 tracking-tight">
                                    {formatCurrency(result.totalAnnualIncome)}
                                </p>
                                <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
                                    <PieChart className="w-4 h-4 mr-1" />
                                    <span>Gross yearly total</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Breakdown Panel */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="border-b border-gray-100 bg-gray-50/50 p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                                    <Calculator size={20} />
                                </div>
                                <h3 className="font-semibold text-gray-900">Monthly Breakdown</h3>
                            </div>
                        </div>
                        <div className="p-0">
                            <div className="divide-y divide-gray-100">
                                <div className="p-4 flex justify-between items-center hover:bg-gray-50/50">
                                    <span className="text-gray-600 text-sm">Base Income</span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(result.breakdown.baseMonthly)}</span>
                                </div>
                                {result.breakdown.bonusMonthly > 0 && (
                                    <div className="p-4 flex justify-between items-center hover:bg-gray-50/50">
                                        <span className="text-gray-600 text-sm">Bonus</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(result.breakdown.bonusMonthly)}</span>
                                    </div>
                                )}
                                {result.breakdown.overtimeMonthly > 0 && (
                                    <div className="p-4 flex justify-between items-center hover:bg-gray-50/50">
                                        <span className="text-gray-600 text-sm">Overtime</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(result.breakdown.overtimeMonthly)}</span>
                                    </div>
                                )}
                                {result.breakdown.commissionMonthly > 0 && (
                                    <div className="p-4 flex justify-between items-center hover:bg-gray-50/50">
                                        <span className="text-gray-600 text-sm">Commission</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(result.breakdown.commissionMonthly)}</span>
                                    </div>
                                )}
                                {result.breakdown.otherMonthly > 0 && (
                                    <div className="p-4 flex justify-between items-center hover:bg-gray-50/50">
                                        <span className="text-gray-600 text-sm">Other</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(result.breakdown.otherMonthly)}</span>
                                    </div>
                                )}
                                {result.breakdown.rentalMonthly > 0 && (
                                    <div className="p-4 flex justify-between items-center hover:bg-gray-50/50">
                                        <span className="text-gray-600 text-sm">Net Rental</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(result.breakdown.rentalMonthly)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IncomeCalculator;

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { MoneyInput } from "../ui/MoneyInput";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import {
    calculateAPR, APRInputs, APRResult, Frequency,
    calculateMortgageAPR, MortgageAPRInputs, MortgageAPRResult
} from "@/lib/calculations/apr";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const CustomTooltip = ({ active, payload, total }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        const percent = total > 0 ? ((data.value / total) * 100).toFixed(0) : 0;
        return (
            <div className="p-2 rounded-lg shadow-lg border border-white/20" style={{ backgroundColor: data.payload.color }}>
                <p className="font-bold text-white text-base mb-1">{data.name}</p>
                <p className="text-white text-sm">
                    {formatCurrency(data.value)} ({percent}%)
                </p>
            </div>
        );
    }
    return null;
};


const APRCalculator = () => {
    // --- GENERAL APR STATE ---
    const [aprValues, setAprValues] = useState<APRInputs>({
        loanAmount: 100000,
        nominalInterestRate: 6,
        termYears: 10,
        termMonths: 0,
        loanedFees: 0,
        upfrontFees: 2500,
        compoundingFrequency: "monthly",
        payBackFrequency: "monthly"
    });
    const [aprResult, setAprResult] = useState<APRResult | null>(null);

    // --- MORTGAGE APR STATE ---
    const [mortgageValues, setMortgageValues] = useState<MortgageAPRInputs>({
        houseValue: 350000,
        downPaymentPercent: 20,
        termYears: 30,
        interestRate: 6.2,
        loanFees: 3500,
        points: 0.5,
        pmiPerYear: 0
    });
    const [mortgageResult, setMortgageResult] = useState<MortgageAPRResult | null>(null);

    // Initial Calculation
    useEffect(() => {
        handleCalculateAPR();
        handleCalculateMortgage();
    }, []);

    // --- HANDLERS ---
    const handleChangeAPR = (field: keyof APRInputs, value: any) => {
        setAprValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleCalculateAPR = () => {
        const res = calculateAPR(aprValues);
        setAprResult(res);
    };

    const handleChangeMortgage = (field: keyof MortgageAPRInputs, value: any) => {
        setMortgageValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleCalculateMortgage = () => {
        const res = calculateMortgageAPR(mortgageValues);
        setMortgageResult(res);
    };

    // --- CHARTS ---
    const aprChartData = aprResult ? [
        { name: "Principal", value: aprResult.loanAmount, color: "#3b82f6" },
        { name: "Interest", value: aprResult.totalInterest, color: "#84cc16" },
        { name: "Fees", value: aprResult.totalFinanceCharge - aprResult.totalInterest, color: "#b91c1c" },
    ] : [];

    const mortgageChartData = mortgageResult ? [
        { name: "Principal", value: mortgageResult.loanAmount, color: "#3b82f6" },
        { name: "Interest", value: mortgageResult.totalInterest, color: "#84cc16" },
        { name: "Fees", value: mortgageResult.allPaymentsAndFees - mortgageResult.totalPayments, color: "#b91c1c" },
    ] : [];

    return (
        <div className="space-y-12 mb-12">

            {/* --- SECTION 1: GENERAL APR CALCULATOR --- */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">General APR Calculator</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* INPUTS */}
                    <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                        <MoneyInput
                            label="Loan Amount"
                            value={aprValues.loanAmount}
                            onChange={(e) => handleChangeAPR("loanAmount", Number(e.target.value))}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Term (Years)"
                                type="number"
                                value={aprValues.termYears}
                                onChange={(e) => handleChangeAPR("termYears", Number(e.target.value))}
                            />
                            <Input
                                label="Term (Months)"
                                type="number"
                                value={aprValues.termMonths}
                                onChange={(e) => handleChangeAPR("termMonths", Number(e.target.value))}
                            />
                        </div>
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.125"
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                                    value={aprValues.nominalInterestRate}
                                    onChange={(e) => handleChangeAPR("nominalInterestRate", Number(e.target.value))}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">%</div>
                            </div>

                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                label="Compound"
                                value={aprValues.compoundingFrequency}
                                onChange={(e) => handleChangeAPR("compoundingFrequency", e.target.value)}
                                options={[
                                    { label: "Daily", value: "daily" },
                                    { label: "Weekly", value: "weekly" },
                                    { label: "Bi-Weekly", value: "bi-weekly" },
                                    { label: "Semi-Monthly", value: "semi-monthly" },
                                    { label: "Monthly", value: "monthly" },
                                    { label: "Quarterly", value: "quarterly" },
                                    { label: "Semi-Annually", value: "semi-annually" },
                                    { label: "Annually", value: "annually" },
                                ]}
                            />
                            <Select
                                label="Pay Back"
                                value={aprValues.payBackFrequency}
                                onChange={(e) => handleChangeAPR("payBackFrequency", e.target.value)}
                                options={[
                                    { label: "Every Day", value: "daily" },
                                    { label: "Every Week", value: "weekly" },
                                    { label: "Every 2 Weeks", value: "bi-weekly" },
                                    { label: "Twice a Month", value: "semi-monthly" },
                                    { label: "Every Month", value: "monthly" },
                                    { label: "Every Quarter", value: "quarterly" },
                                    { label: "Every 6 Months", value: "semi-annually" },
                                    { label: "Every Year", value: "annually" },
                                ]}
                            />
                        </div>

                        <MoneyInput
                            label="Loaned Fees"
                            value={aprValues.loanedFees}
                            onChange={(e) => handleChangeAPR("loanedFees", Number(e.target.value))}
                        />

                        <MoneyInput
                            label="Upfront Fees"
                            value={aprValues.upfrontFees}
                            onChange={(e) => handleChangeAPR("upfrontFees", Number(e.target.value))}
                        />

                        <div className="flex gap-4 pt-4">
                            <Button onClick={handleCalculateAPR} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3">
                                Calculate
                            </Button>
                            <Button variant="outline" onClick={() => setAprValues({ ...aprValues, loanAmount: 0 })}>
                                Clear
                            </Button>
                        </div>
                    </div>

                    {/* RESULTS */}
                    <div className="space-y-6">
                        {aprResult && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-indigo-50 text-indigo-900 p-4 rounded-t-lg flex justify-between items-center shadow-sm border-b border-indigo-100">
                                    <h3 className="text-2xl font-bold">Real APR: {formatPercentage(aprResult.effectiveAPR, 3)}</h3>
                                </div>
                                <div className="bg-white border-x border-b border-gray-200 rounded-b-lg p-6 shadow-sm space-y-3 text-sm md:text-base">
                                    <div className="flex justify-between"><span className="text-gray-600 font-medium">Amount Financed</span><span className="font-bold text-gray-900">{formatCurrency(aprResult.amountFinanced)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600 font-medium">Upfront Out-of-Pocket Fees</span><span className="font-bold text-gray-900">{formatCurrency(aprValues.upfrontFees)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600 font-medium">Payment Every {aprResult.payBackFrequency === 'monthly' ? 'Month' : aprResult.payBackFrequency?.replace('-', ' ')}</span><span className="font-bold text-gray-900">{formatCurrency(aprResult.monthlyPayment)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600 font-medium">Total of {aprValues.termYears * 12 + aprValues.termMonths} Payments</span><span className="font-bold text-gray-900">{formatCurrency(aprResult.totalPaid)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600 font-medium">Total Interest</span><span className="font-bold text-gray-900">{formatCurrency(aprResult.totalInterest)}</span></div>
                                    <div className="flex justify-between font-bold pt-2 border-t border-gray-100"><span className="text-gray-900">All Payments and Fees</span><span className="font-bold text-gray-900">{formatCurrency(aprResult.totalPaid + aprValues.upfrontFees)}</span></div>
                                </div>

                                <div className="mt-6 flex flex-col items-center">
                                    <div className="h-56 w-56 relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={aprChartData} cx="50%" cy="50%" innerRadius={35} outerRadius={70} paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270}>
                                                    {aprChartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip total={aprResult.totalPaid + aprValues.upfrontFees} />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex gap-4 mt-2 text-xs font-medium text-gray-900">
                                        <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>Principal</div>
                                        <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-lime-500 mr-1"></span>Interest</div>
                                        <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-600 mr-1"></span>Fees</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- SECTION 2: MORTGAGE APR CALCULATOR --- */}
            <div className="space-y-6 pt-12 border-t border-gray-300">
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Mortgage APR Calculator</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* INPUTS */}
                    <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                        <MoneyInput
                            label="House Value"
                            value={mortgageValues.houseValue}
                            onChange={(e) => handleChangeMortgage("houseValue", Number(e.target.value))}
                        />
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Down Payment (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="1"
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                                    value={mortgageValues.downPaymentPercent}
                                    onChange={(e) => handleChangeMortgage("downPaymentPercent", Number(e.target.value))}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">%</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Loan Term"
                                type="number"
                                value={mortgageValues.termYears}
                                onChange={(e) => handleChangeMortgage("termYears", Number(e.target.value))}
                                rightIcon={<span className="text-gray-500 text-sm">years</span>}
                            />
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.125"
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                                        value={mortgageValues.interestRate}
                                        onChange={(e) => handleChangeMortgage("interestRate", Number(e.target.value))}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">%</div>
                                </div>
                            </div>
                        </div>

                        <MoneyInput
                            label="Loan Fees"
                            value={mortgageValues.loanFees}
                            onChange={(e) => handleChangeMortgage("loanFees", Number(e.target.value))}
                        />
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Points (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.125"
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                                    value={mortgageValues.points}
                                    onChange={(e) => handleChangeMortgage("points", Number(e.target.value))}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">%</div>
                            </div>
                        </div>

                        <MoneyInput
                            label="PMI Insurance ($/year)"
                            value={mortgageValues.pmiPerYear}
                            onChange={(e) => handleChangeMortgage("pmiPerYear", Number(e.target.value))}
                        />

                        <div className="flex gap-4 pt-4">
                            <Button onClick={handleCalculateMortgage} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3">
                                Calculate
                            </Button>
                            <Button variant="outline" onClick={() => setMortgageValues({ ...mortgageValues, houseValue: 0 })}>
                                Clear
                            </Button>
                        </div>
                    </div>

                    {/* RESULTS */}
                    <div className="space-y-6">
                        {mortgageResult && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-indigo-50 text-indigo-900 p-4 rounded-t-lg flex justify-between items-center shadow-sm border-b border-indigo-100">
                                    <h3 className="text-2xl font-bold">Real APR: {formatPercentage(mortgageResult.effectiveAPR, 3)}</h3>
                                </div>
                                <div className="bg-white border-x border-b border-gray-200 rounded-b-lg p-6 shadow-sm space-y-3 text-sm md:text-base">
                                    <div className="flex justify-between"><span className="text-gray-600 font-medium">Loan Amount</span><span className="font-bold text-gray-900">{formatCurrency(mortgageResult.loanAmount)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600 font-medium">Down Payment</span><span className="font-bold text-gray-900">{formatCurrency(mortgageResult.downPaymentAmount)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600 font-medium">Monthly Pay</span><span className="font-bold text-gray-900">{formatCurrency(mortgageResult.monthlyPayment)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600 font-medium">Total of {mortgageValues.termYears * 12} Payments</span><span className="font-bold text-gray-900">{formatCurrency(mortgageResult.totalPayments)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600 font-medium">Total Interest</span><span className="font-bold text-gray-900">{formatCurrency(mortgageResult.totalInterest)}</span></div>
                                    <div className="flex justify-between font-bold pt-2 border-t border-gray-100"><span className="text-gray-900">All Payments and Fees</span><span className="font-bold text-gray-900">{formatCurrency(mortgageResult.allPaymentsAndFees)}</span></div>
                                </div>

                                <div className="mt-6 flex flex-col items-center">
                                    <div className="h-56 w-56 relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={mortgageChartData} cx="50%" cy="50%" innerRadius={35} outerRadius={70} paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270}>
                                                    {mortgageChartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip total={mortgageResult.allPaymentsAndFees} />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex gap-4 mt-2 text-xs font-medium text-gray-900">
                                        <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>Principal</div>
                                        <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-lime-500 mr-1"></span>Interest</div>
                                        <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-600 mr-1"></span>Fees</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div >
    );
};

export default APRCalculator;

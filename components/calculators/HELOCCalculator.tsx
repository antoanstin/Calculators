"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { MoneyInput } from "../ui/MoneyInput";
import { Input } from "../ui/Input";
import { NumberInput } from "../ui/NumberInput";
import { Select } from "../ui/Select";
import { ResultCard } from "../ui/ResultCard";
import { calculateHELOC, HELOCInputs, HELOCResult } from "@/lib/calculations/heloc";
import { formatCurrency } from "@/lib/format";
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

const HELOCCalculator = () => {
    const [values, setValues] = useState<HELOCInputs>({
        loanAmount: 50000,
        interestRate: 10,
        drawPeriodYears: 10,
        repaymentPeriodYears: 20,
        closingCostsType: "percent",
        closingCostsValue: 4,
        closingCostsPaid: "upfront",
        annualFee: 50,
        includeFees: false,
    });

    const [result, setResult] = useState<HELOCResult | null>(null);
    const [scheduleView, setScheduleView] = useState<"monthly" | "yearly">("yearly");

    const handleChange = (field: keyof HELOCInputs, value: any) => {
        let newValue = value;

        if (field === "closingCostsValue" && values.closingCostsType === "percent") {
            if (Number(newValue) > 100) newValue = 100;
        }

        if (field === "closingCostsType" && newValue === "percent") {
            if (values.closingCostsValue > 100) {
                setValues((prev) => ({ ...prev, [field]: newValue, closingCostsValue: 100 }));
                return;
            }
        }

        setValues((prev) => ({ ...prev, [field]: newValue }));
    };

    const handleCalculate = () => {
        const res = calculateHELOC(values);
        setResult(res);
    };

    // Initial Calculation
    React.useEffect(() => {
        handleCalculate();
    }, []);

    const chartData = result ? (
        result.includeFees ? [
            { name: "Loan amount", value: values.loanAmount, color: "#3b82f6" }, // Blue
            { name: "Closing costs", value: result.totalClosingCosts, color: "#84cc16" }, // Original Green
            { name: "Annual fee", value: result.totalAnnualFees, color: "#991b1b" }, // Dark Red
            { name: "Interest", value: result.totalInterest, color: "#06b6d4" }, // Cyan
        ] : [
            { name: "Loan amount", value: values.loanAmount, color: "#3b82f6" }, // Blue
            { name: "Interest", value: result.totalInterest, color: "#84cc16" }, // Green
        ]
    ) : [];

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Home Equity Line of Credit (HELOC) Calculator</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* --- LEFT: INPUTS --- */}
                <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                    <MoneyInput
                        label="Loan amount"
                        value={values.loanAmount}
                        onChange={(e) => handleChange("loanAmount", Number(e.target.value))}
                    />

                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Interest rate</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.125"
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                                value={values.interestRate}
                                onChange={(e) => handleChange("interestRate", Number(e.target.value))}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">%</div>
                        </div>
                    </div>

                    <Input
                        label="Draw period"
                        type="number"
                        value={values.drawPeriodYears}
                        onChange={(e) => handleChange("drawPeriodYears", Number(e.target.value))}
                        rightIcon={<span className="text-gray-500 text-sm">years</span>}
                    />

                    <Input
                        label="Repayment period"
                        type="number"
                        value={values.repaymentPeriodYears}
                        onChange={(e) => handleChange("repaymentPeriodYears", Number(e.target.value))}
                        rightIcon={<span className="text-gray-500 text-sm">years</span>}
                    />

                    <div className="pt-4 border-t border-gray-200">
                        <label className="flex items-center space-x-2 cursor-pointer mb-4">
                            <input
                                type="checkbox"
                                checked={values.includeFees}
                                onChange={(e) => handleChange("includeFees", e.target.checked)}
                                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-bold text-gray-900">Include closing costs and fees below</span>
                        </label>

                        {values.includeFees && (
                            <div className="space-y-4 pl-6 border-l-2 border-gray-200 ml-1">
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Closing costs</label>
                                        <NumberInput
                                            className="focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={values.closingCostsValue}
                                            onChange={(e) => handleChange("closingCostsValue", Number(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                                        <Select
                                            options={[
                                                { value: "amount", label: "$" },
                                                { value: "percent", label: "%" },
                                            ]}
                                            value={values.closingCostsType}
                                            onChange={(e) => handleChange("closingCostsType", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 mt-2">
                                    <div className="flex items-center">
                                        <span className="text-sm text-gray-700 w-12 text-right mr-3">to be</span>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                className="form-radio text-indigo-600 w-4 h-4"
                                                name="closingCostsPaid"
                                                value="upfront"
                                                checked={values.closingCostsPaid === "upfront"}
                                                onChange={() => handleChange("closingCostsPaid", "upfront")}
                                            />
                                            <span className="ml-2 text-sm text-gray-700">paid upfront</span>
                                        </label>
                                    </div>
                                    <div className="flex items-center pl-[60px]">
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                className="form-radio text-indigo-600 w-4 h-4"
                                                name="closingCostsPaid"
                                                value="financed"
                                                checked={values.closingCostsPaid === "financed"}
                                                onChange={() => handleChange("closingCostsPaid", "financed")}
                                            />
                                            <span className="ml-2 text-sm text-gray-700">deducted from loan</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Annual fee</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">$</div>
                                        <input
                                            type="number"
                                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white pl-7 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12"
                                            value={values.annualFee}
                                            onChange={(e) => handleChange("annualFee", Number(e.target.value))}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">/year</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center pt-4">
                        <Button onClick={handleCalculate} size="lg" className="px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                            Calculate
                        </Button>
                        <Button variant="outline" className="ml-4" onClick={() => setValues({ ...values, loanAmount: 0 })}>
                            Clear
                        </Button>
                    </div>
                </div>

                {/* --- RIGHT: RESULTS --- */}
                <div className="space-y-6">
                    {result && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Header */}
                            <div className="bg-indigo-50 text-indigo-900 p-3 rounded-t-lg flex justify-between items-center shadow-sm border-b border-indigo-100">
                                <h3 className="text-xl font-bold">Results</h3>
                            </div>

                            {/* Metrics List */}
                            <div className="bg-white border-x border-b border-gray-200 rounded-b-lg p-6 shadow-sm space-y-3">
                                {result.includeFees && result.closingCostsPaid === "financed" && (
                                    <div className="flex justify-between items-center bg-green-50 p-2 rounded-md -mx-2 mb-2">
                                        <span className="font-bold text-green-900">Cash received</span>
                                        <span className="font-bold text-green-900 text-lg">{formatCurrency(result.cashReceived)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-900">Draw period monthly pay</span>
                                    <span className="font-bold text-gray-900 text-lg">{formatCurrency(result.drawMonthlyPayment)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-900">Repayment period monthly pay</span>
                                    <span className="font-bold text-gray-900 text-lg">{formatCurrency(result.repaymentMonthlyPayment)}</span>
                                </div>
                                <div className="border-t border-gray-100 my-2"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-800">Total of {((values.drawPeriodYears + values.repaymentPeriodYears) * 12)} payments</span>
                                    <span className="text-gray-900">{formatCurrency(result.totalPayments)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-800">Total interest</span>
                                    <span className="text-gray-900">{formatCurrency(result.totalInterest)}</span>
                                </div>
                                {result.includeFees && (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-800">Total annual fees</span>
                                            <span className="text-gray-900">{formatCurrency(result.totalAnnualFees)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-800">Cost of loan</span>
                                            <span className="text-gray-900">{formatCurrency(result.totalOverallCost)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-800">APR</span>
                                            <span className="text-gray-900 font-bold">{(result.effectiveAPR || 0).toFixed(3)}%</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Chart */}
                            <div className="mt-8 flex flex-row items-center justify-center gap-8">
                                <div className="h-48 w-48 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={30}
                                                outerRadius={60}
                                                paddingAngle={0}
                                                dataKey="value"
                                                startAngle={90}
                                                endAngle={-270}
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip total={result.totalPayments} />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-sm bg-blue-500"></span>
                                        <span>Loan amount</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: result.includeFees ? "#06b6d4" : "#84cc16" }}></span>
                                        <span>Interest</span>
                                    </div>
                                    {result.includeFees && (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#84cc16" }}></span>
                                                <span>Closing costs</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#991b1b" }}></span>
                                                <span>Annual fee</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* --- BOTTOM: AMORTIZATION SCHEDULE --- */}
            {result && (
                <div className="mt-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <h3 className="text-xl font-bold text-gray-800">Amortization Schedule</h3>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setScheduleView("yearly")}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${scheduleView === "yearly" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                Yearly
                            </button>
                            <button
                                onClick={() => setScheduleView("monthly")}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${scheduleView === "monthly" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                Monthly
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">{scheduleView === "monthly" ? "Month" : "Year"}</th>
                                    <th className="px-4 py-3 font-semibold text-right">Interest</th>
                                    <th className="px-4 py-3 font-semibold text-right">Principal</th>
                                    <th className="px-4 py-3 font-semibold text-right">Total Payment</th>
                                    <th className="px-4 py-3 font-semibold text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {scheduleView === "monthly" ? (
                                    result.monthlySchedule.map((item) => (
                                        <tr key={item.month} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-900">{item.month}</td>
                                            <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item.interest)}</td>
                                            <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item.principal)}</td>
                                            <td className="px-4 py-3 text-right text-indigo-600 font-medium">{formatCurrency(item.totalPayment)}</td>
                                            <td className="px-4 py-3 text-right text-gray-900 font-bold">{formatCurrency(item.balance)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    result.yearlySchedule.map((item) => (
                                        <tr key={item.year} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-900">{item.year}</td>
                                            <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item.interest)}</td>
                                            <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item.principal)}</td>
                                            <td className="px-4 py-3 text-right text-indigo-600 font-medium">{formatCurrency(item.totalPayment)}</td>
                                            <td className="px-4 py-3 text-right text-gray-900 font-bold">{formatCurrency(item.balance)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HELOCCalculator;

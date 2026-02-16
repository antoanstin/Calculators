"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { MoneyInput } from "../ui/MoneyInput";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { ResultCard } from "../ui/ResultCard";
import {
    calculateAmortization,
    AmortizationInputs,
    AmortizationResult,
    AmortizationRow,
    OneTimePayment,
} from "@/lib/calculations/amortization";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const groupScheduleByYear = (schedule: AmortizationRow[], frequency: "monthly" | "biweekly") => {
    if (!schedule.length) return [];

    const paymentsPerYear = frequency === "biweekly" ? 26 : 12;
    const yearly: AmortizationRow[] = [];

    // Process in chunks
    for (let i = 0; i < schedule.length; i += paymentsPerYear) {
        const chunk = schedule.slice(i, i + paymentsPerYear);
        const firstPayment = chunk[0];
        const lastPayment = chunk[chunk.length - 1];

        const formatDateStr = (dateStr: string) => {
            const [y, m] = dateStr.split('-');
            return `${parseInt(m)}/${y}`;
        };

        const rangeLabel = `${formatDateStr(firstPayment.date)}-${formatDateStr(lastPayment.date)}`;

        // Sum up payments, principal, interest for the chunk
        // Use the remaining balance of the *last* payment in chunk as the year-end balance
        const yearSummary = chunk.reduce(
            (acc, curr) => ({
                ...acc,
                payment: acc.payment + curr.payment,
                principal: acc.principal + curr.principal,
                interest: acc.interest + curr.interest,
                extraPayment: (acc.extraPayment || 0) + (curr.extraPayment || 0),
            }),
            {
                paymentNumber: yearly.length + 1, // Year 1, 2, 3...
                date: rangeLabel,
                payment: 0,
                principal: 0,
                interest: 0,
                remainingBalance: lastPayment.remainingBalance,
                totalInterestPaid: lastPayment.totalInterestPaid,
                extraPayment: 0,
            } as AmortizationRow
        );

        yearly.push(yearSummary);
    }

    return yearly;
};

const DateSelector = ({
    value,
    onChange
}: {
    value: string | undefined, // YYYY-MM
    onChange: (val: string) => void
}) => {
    // Default to current date if undefined
    const dateVal = value || new Date().toISOString().slice(0, 7);
    const [y, m] = dateVal.split('-');
    const months = [
        { val: "01", label: "Jan" }, { val: "02", label: "Feb" }, { val: "03", label: "Mar" },
        { val: "04", label: "Apr" }, { val: "05", label: "May" }, { val: "06", label: "Jun" },
        { val: "07", label: "Jul" }, { val: "08", label: "Aug" }, { val: "09", label: "Sep" },
        { val: "10", label: "Oct" }, { val: "11", label: "Nov" }, { val: "12", label: "Dec" }
    ];

    return (
        <div className="flex space-x-2">
            <select
                value={m}
                onChange={(e) => onChange(`${y}-${e.target.value}`)}
                className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                {months.map(mo => <option key={mo.val} value={mo.val}>{mo.label}</option>)}
            </select>
            <input
                type="number"
                value={y}
                onChange={(e) => onChange(`${e.target.value}-${m}`)}
                className="h-10 w-24 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>
    );
};

interface InputSectionProps {
    title: string;
    values: AmortizationInputs;
    onChange: (field: keyof AmortizationInputs, val: string | number | boolean | OneTimePayment[]) => void;
    colorClass?: string;
    showExtraPayments?: boolean;
    setShowExtraPayments?: (show: boolean) => void;
    onOneTimePaymentChange?: (index: number, field: keyof OneTimePayment, val: string | number) => void;
    onAddOneTimePayment?: () => void;
    onRemoveOneTimePayment?: (index: number) => void;
}

const InputSection = ({
    title,
    values,
    onChange,
    colorClass,
    showExtraPayments,
    setShowExtraPayments,
    onOneTimePaymentChange,
    onAddOneTimePayment,
    onRemoveOneTimePayment
}: InputSectionProps) => (
    <div className={cn("space-y-4 p-4 rounded-lg border", colorClass)}>
        <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
        <MoneyInput
            label="Loan Amount"
            value={values.loanAmount}
            onChange={(e) => onChange("loanAmount", Number(e.target.value))}
        />
        <div className="grid grid-cols-2 gap-4">
            <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate</label>
                <div className="relative">
                    <input
                        type="number"
                        step="0.01"
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                        value={values.interestRate}
                        onChange={(e) => onChange("interestRate", Number(e.target.value))}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">%</div>
                </div>
            </div>
            <Select
                label="Payment Frequency"
                options={[
                    { value: "monthly", label: "Monthly" },
                    { value: "biweekly", label: "Bi-Weekly" },
                ]}
                value={values.paymentFrequency}
                onChange={(e) => onChange("paymentFrequency", e.target.value)}
            />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <Input
                label="Term (Years)"
                type="number"
                value={values.termYears}
                onChange={(e) => onChange("termYears", Number(e.target.value))}
            />
            <Input
                label="Term (Months)"
                type="number"
                value={values.termMonths}
                onChange={(e) => onChange("termMonths", Number(e.target.value))}
            />
        </div>
        <Input
            label="Start Date"
            type="date"
            value={values.startDate}
            onChange={(e) => onChange("startDate", e.target.value)}
        />

        {setShowExtraPayments && (
            <div className="pt-4 border-t border-gray-200">
                <label className="flex items-center space-x-2 cursor-pointer mb-4">
                    <input
                        type="checkbox"
                        checked={showExtraPayments}
                        onChange={(e) => setShowExtraPayments(e.target.checked)}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="font-semibold text-gray-900">Optional: make extra payments</span>
                </label>

                {showExtraPayments && (
                    <div className="space-y-4 bg-gray-50 p-4 rounded-md">
                        {/* Monthly */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <MoneyInput
                                label="Extra monthly pay"
                                value={values.extraMonthly || 0}
                                onChange={(e) => onChange("extraMonthly", Number(e.target.value))}
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">from</label>
                                <DateSelector
                                    value={values.extraMonthlyStartDate}
                                    onChange={(val) => onChange("extraMonthlyStartDate", val)}
                                />
                            </div>
                        </div>

                        {/* Yearly */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <MoneyInput
                                label="Extra yearly pay"
                                value={values.extraYearly || 0}
                                onChange={(e) => onChange("extraYearly", Number(e.target.value))}
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">from</label>
                                <DateSelector
                                    value={values.extraYearlyStartDate}
                                    onChange={(val) => onChange("extraYearlyStartDate", val)}
                                />
                            </div>
                        </div>

                        {/* One-time */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Extra one-time pay</label>
                            {(values.oneTimePayments || []).map((otp, idx) => (
                                <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-2">
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">$</span>
                                        <input
                                            type="number"
                                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white pl-7 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={otp.amount}
                                            onChange={(e) => onOneTimePaymentChange?.(idx, "amount", Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span>in</span>
                                        <DateSelector
                                            value={otp.date}
                                            onChange={(val) => onOneTimePaymentChange?.(idx, "date", val)}
                                        />
                                        <button
                                            onClick={() => onRemoveOneTimePayment?.(idx)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onAddOneTimePayment}
                                className="mt-2"
                            >
                                + More one-time payments
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
);

const ResultView = ({
    title,
    result,
    baseResult,
    inputs,
    showExtraPayments
}: {
    title: string;
    result: AmortizationResult;
    baseResult?: AmortizationResult | null;
    inputs: AmortizationInputs;
    showExtraPayments: boolean;
}) => {
    // Colors for chart: Blue for Principal (Loan Amount), Green for Interest
    const data = [
        { name: 'Loan amount', value: inputs.loanAmount, fill: '#3b82f6' }, // Blue
        { name: 'Interest', value: result.totalInterest, fill: '#84cc16' },   // Green
    ];

    return (
        <div className="space-y-6">
            <h3 className="font-semibold text-lg text-gray-900">{title}</h3>

            {/* Top Green Banner */}
            <div className="bg-indigo-50 text-indigo-900 p-4 rounded-md flex justify-between items-center shadow-sm">
                <span className="text-xl font-bold">Monthly Pay</span>
                <span className="text-2xl font-bold">
                    {formatCurrency(result.monthlyPayment)}
                </span>
            </div>

            {/* Summary Text */}
            <p className="text-gray-900 text-lg">
                {showExtraPayments && baseResult ? (
                    <>
                        With the extra payment(s), the loan will be paid off in <strong>{Math.floor(result.totalMonths / 12)} years and {result.totalMonths % 12} months</strong>,
                        and <strong>{formatCurrency(Math.max(0, baseResult.totalInterest - result.totalInterest))}</strong> interest will be saved.
                    </>
                ) : (
                    <>
                        The loan will be paid off in <strong>{Math.floor(result.totalMonths / 12)} years and {result.totalMonths % 12} months</strong>.
                    </>
                )}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Donut Chart */}
                <div className="flex justify-center h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={70}
                                paddingAngle={0}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number | undefined) => (value !== undefined ? formatCurrency(value) : "")} />
                            <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Summary Table */}
                <div className="border border-gray-200 rounded-sm overflow-hidden text-sm">
                    <div className="grid grid-cols-2 border-b border-gray-200 bg-gray-50">
                        <div className="p-3 font-medium text-gray-900">Total of {result.totalMonths} monthly payments</div>
                        <div className="p-3 text-right text-gray-900">{formatCurrency(result.totalPaid - (result.totalExtraPayments || 0))}</div>
                    </div>
                    <div className="grid grid-cols-2 border-b border-gray-200">
                        <div className="p-3 font-medium text-gray-900">Total interest</div>
                        <div className="p-3 text-right text-gray-900">{formatCurrency(result.totalInterest)}</div>
                    </div>
                    {showExtraPayments && baseResult && (
                        <>
                            <div className="grid grid-cols-2 border-b border-gray-200">
                                <div className="p-3 font-medium text-gray-900">Total extra payment(s)</div>
                                <div className="p-3 text-right text-gray-900">{formatCurrency(result.totalExtraPayments || 0)}</div>
                            </div>
                            <div className="grid grid-cols-2 border-b border-gray-200">
                                <div className="p-3 font-medium text-gray-900">Interest to be saved due to the extra payment(s)</div>
                                <div className="p-3 text-right text-gray-900">{formatCurrency(Math.max(0, baseResult.totalInterest - result.totalInterest))}</div>
                            </div>
                        </>
                    )}
                    <div className="grid grid-cols-2 bg-gray-100">
                        <div className="p-3 font-medium text-gray-900">Loan payoff date</div>
                        <div className="p-3 text-right text-gray-900">{result.payoffDate}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AmortizationCalculator = () => {
    const [scenarioA, setScenarioA] = useState<AmortizationInputs>({
        loanAmount: 300000,
        interestRate: 6.5,
        termYears: 30,
        termMonths: 0,
        startDate: new Date().toISOString().split("T")[0],
        paymentFrequency: "monthly",
        extraMonthly: 0,
        extraMonthlyStartDate: "",
        extraYearly: 0,
        extraYearlyStartDate: "",
        oneTimePayments: [],
    });

    const [compareMode, setCompareMode] = useState(false);
    const [scenarioB, setScenarioB] = useState<AmortizationInputs>({
        loanAmount: 300000,
        interestRate: 5.5,
        termYears: 15,
        termMonths: 0,
        startDate: new Date().toISOString().split("T")[0],
        paymentFrequency: "monthly",
    });

    const [results, setResults] = useState<{
        a: AmortizationResult | null;
        aBase: AmortizationResult | null; // For savings calculation
        b: AmortizationResult | null;
    }>({ a: null, aBase: null, b: null });

    const [viewMode, setViewMode] = useState<"monthly" | "yearly">("yearly");
    const [showExtraPayments, setShowExtraPayments] = useState(false);

    const handleCalculate = () => {
        const inputsA = showExtraPayments ? scenarioA : {
            ...scenarioA,
            extraMonthly: 0,
            extraMonthlyStartDate: "",
            extraYearly: 0,
            extraYearlyStartDate: "",
            oneTimePayments: [],
        };
        const resA = calculateAmortization(inputsA);

        // Calculate Base Scenario A (without extra payments) if needed for savings
        let resABase = null;
        if (showExtraPayments) {
            const inputsABase = {
                ...scenarioA,
                extraMonthly: 0,
                extraMonthlyStartDate: "",
                extraYearly: 0,
                extraYearlyStartDate: "",
                oneTimePayments: [],
            };
            resABase = calculateAmortization(inputsABase);
        }

        const resB = compareMode ? calculateAmortization(scenarioB) : null;
        setResults({ a: resA, aBase: resABase, b: resB });
    };

    const handleOneTimePaymentChange = (index: number, field: keyof OneTimePayment, val: string | number) => {
        setScenarioA(prev => {
            const newPayments = [...(prev.oneTimePayments || [])];
            newPayments[index] = { ...newPayments[index], [field]: val };
            return { ...prev, oneTimePayments: newPayments };
        });
    };

    const addOneTimePayment = () => {
        setScenarioA(prev => ({
            ...prev,
            oneTimePayments: [
                ...(prev.oneTimePayments || []),
                { amount: 0, date: new Date().toISOString().slice(0, 7) }
            ]
        }));
    };

    const removeOneTimePayment = (index: number) => {
        setScenarioA(prev => {
            const newPayments = [...(prev.oneTimePayments || [])];
            newPayments.splice(index, 1);
            return { ...prev, oneTimePayments: newPayments };
        });
    };

    return (
        <div className="space-y-8" >
            <div className="flex items-center justify-end">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={compareMode}
                        onChange={(e) => setCompareMode(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-900">Compare Scenarios</span>
                </label>
            </div>

            <div className={cn("grid gap-8", compareMode ? "md:grid-cols-2" : "grid-cols-1")}>
                <InputSection
                    title={compareMode ? "Scenario A" : "Loan Details"}
                    values={scenarioA}
                    onChange={(field, val) =>
                        setScenarioA((prev) => ({ ...prev, [field]: val }))
                    }
                    colorClass="bg-white border-gray-200"
                    showExtraPayments={showExtraPayments}
                    setShowExtraPayments={setShowExtraPayments}
                    onOneTimePaymentChange={handleOneTimePaymentChange}
                    onAddOneTimePayment={addOneTimePayment}
                    onRemoveOneTimePayment={removeOneTimePayment}
                />
                {compareMode && (
                    <InputSection
                        title="Scenario B"
                        values={scenarioB}
                        onChange={(field, val) =>
                            setScenarioB((prev) => ({ ...prev, [field]: val }))
                        }
                        colorClass="bg-blue-50 border-blue-200"
                    />
                )}
            </div>

            <div className="flex justify-center">
                <Button onClick={handleCalculate} size="lg" className="px-8">
                    Calculate {compareMode && "Comparison"}
                </Button>
            </div>

            {
                results.a && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <ResultView
                            title={compareMode ? "Results A" : "Results"}
                            result={results.a}
                            baseResult={results.aBase}
                            inputs={scenarioA}
                            showExtraPayments={showExtraPayments}
                        />

                        {/* Results B */}
                        {compareMode && results.b && (
                            <div className="pt-8 border-t border-gray-200">
                                <ResultView
                                    title="Results B"
                                    result={results.b}
                                    inputs={scenarioB}
                                    showExtraPayments={false}
                                />
                            </div>
                        )}
                    </div>
                )}
            {/* Amortization Table */}

            {/* Amortization Table */}
            {results.a && (
                <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-6 py-4 border-b flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">Amortization Schedule {compareMode && "(Scenario A)"}</h3>
                        <div className="flex space-x-2 bg-white rounded-lg border border-gray-200 p-1">
                            <button
                                onClick={() => setViewMode("yearly")}
                                className={cn(
                                    "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                                    viewMode === "yearly"
                                        ? "bg-indigo-100 text-indigo-700"
                                        : "text-gray-600 hover:text-gray-900"
                                )}
                            >
                                Yearly
                            </button>
                            <button
                                onClick={() => setViewMode("monthly")}
                                className={cn(
                                    "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                                    viewMode === "monthly"
                                        ? "bg-indigo-100 text-indigo-700"
                                        : "text-gray-600 hover:text-gray-900"
                                )}
                            >
                                Monthly
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto max-h-96">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-900 font-semibold">
                                <tr>
                                    <th className="px-6 py-3 text-left">#</th>
                                    <th className="px-6 py-3 text-left">Date</th>
                                    <th className="px-6 py-3 text-right">Payment</th>
                                    <th className="px-6 py-3 text-right">Principal</th>
                                    <th className="px-6 py-3 text-right">Interest</th>
                                    <th className="px-6 py-3 text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-gray-900">
                                {(viewMode === "yearly"
                                    ? groupScheduleByYear(results.a.schedule, scenarioA.paymentFrequency)
                                    : results.a.schedule
                                ).map((row) => (
                                    <tr key={row.paymentNumber}>
                                        <td className="px-6 py-3 text-left">{row.paymentNumber}</td>
                                        <td className="px-6 py-3 text-left">{row.date}</td>
                                        <td className="px-6 py-3 text-right">{formatCurrency(row.payment)}</td>
                                        <td className="px-6 py-3 text-right">{formatCurrency(row.principal)}</td>
                                        <td className="px-6 py-3 text-right">{formatCurrency(row.interest)}</td>
                                        <td className="px-6 py-3 text-right">{formatCurrency(row.remainingBalance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};



export default AmortizationCalculator;

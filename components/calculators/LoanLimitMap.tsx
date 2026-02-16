"use client";

import React, { useState } from "react";
import { Select } from "../ui/Select";
import { LOAN_LIMITS_2025, StateCode } from "@/data/loanLimits";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

// Simple grid map of US states
const US_STATE_GRID: StateCode[][] = [
    ["AK", "ME"],
    ["VT", "NH"],
    ["WA", "ID", "MT", "ND", "MN", "IL", "WI", "MI", "NY", "MA", "RI"],
    ["OR", "NV", "WY", "SD", "IA", "IN", "OH", "PA", "NJ", "CT"],
    ["CA", "UT", "CO", "NE", "MO", "KY", "WV", "VA", "MD", "DE"],
    ["AZ", "NM", "KS", "AR", "TN", "NC", "SC", "DC"],
    ["OK", "LA", "MS", "AL", "GA"],
    ["TX", "FL"],
    ["HI"]
];

// Flatten for easy validation
const ALL_STATES = new Set(US_STATE_GRID.flat().filter(Boolean));

const LoanLimitMap = () => {
    const [selectedState, setSelectedState] = useState<StateCode | "">("");
    const [year, setYear] = useState("2025");
    const [program, setProgram] = useState<"fannie" | "fha">("fannie");

    const handleStateClick = (state: StateCode) => {
        setSelectedState(state);
    };

    const limits = selectedState ? LOAN_LIMITS_2025[program][selectedState] : null;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="w-32">
                        <Select
                            label="Year"
                            options={[{ value: "2025", label: "2025" }]}
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            disabled
                        />
                    </div>
                    <div className="w-48">
                        <Select
                            label="Program"
                            options={[
                                { value: "fannie", label: "Conventional (Fannie/Freddie)" },
                                { value: "fha", label: "FHA" },
                            ]}
                            value={program}
                            onChange={(e) => setProgram(e.target.value as "fannie" | "fha")}
                        />
                    </div>
                </div>
                <div className="text-right">
                    <h3 className="text-lg font-bold text-gray-900">
                        {selectedState ? `${selectedState} Limits` : "Select a State"}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {program === "fha" ? "FHA Forward Mortgage" : "Conforming Loan Limits"}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Map Grid */}
                <div className="overflow-x-auto">
                    <div className="min-w-[400px] p-4 bg-white rounded-lg border border-gray-200 flex flex-col items-center gap-2">
                        {/* Custom Map Grid Layout for Visual Selection */}
                        {/* Row 1 */}
                        <div className="flex gap-2 w-full justify-between px-8">
                            <StateTile state="AK" selected={selectedState} onClick={handleStateClick} />
                            <div className="flex gap-2">
                                <StateTile state="VT" selected={selectedState} onClick={handleStateClick} />
                                <StateTile state="NH" selected={selectedState} onClick={handleStateClick} />
                                <StateTile state="ME" selected={selectedState} onClick={handleStateClick} />
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="flex gap-2 w-full justify-center">
                            {["WA", "ID", "MT", "ND", "MN", "WI", "MI", "NY", "MA", "RI"].map(s => (
                                <StateTile key={s} state={s as StateCode} selected={selectedState} onClick={handleStateClick} />
                            ))}
                        </div>

                        {/* Row 3 */}
                        <div className="flex gap-2 w-full justify-center">
                            {["OR", "NV", "WY", "SD", "IA", "IL", "IN", "OH", "PA", "NJ", "CT"].map(s => (
                                <StateTile key={s} state={s as StateCode} selected={selectedState} onClick={handleStateClick} />
                            ))}
                        </div>

                        {/* Row 4 */}
                        <div className="flex gap-2 w-full justify-center">
                            {["CA", "UT", "CO", "NE", "MO", "KY", "WV", "VA", "MD", "DE"].map(s => (
                                <StateTile key={s} state={s as StateCode} selected={selectedState} onClick={handleStateClick} />
                            ))}
                        </div>

                        {/* Row 5 */}
                        <div className="flex gap-2 w-full justify-center">
                            {["AZ", "NM", "KS", "AR", "TN", "NC", "SC", "DC"].map(s => (
                                <StateTile key={s} state={s as StateCode} selected={selectedState} onClick={handleStateClick} />
                            ))}
                        </div>

                        {/* Row 6 */}
                        <div className="flex gap-2 w-full justify-center">
                            {["OK", "LA", "MS", "AL", "GA"].map(s => (
                                <StateTile key={s} state={s as StateCode} selected={selectedState} onClick={handleStateClick} />
                            ))}
                        </div>

                        {/* Row 7 */}
                        <div className="flex gap-2 w-full justify-center">
                            {["HI", "TX", "FL"].map(s => (
                                <StateTile key={s} state={s as StateCode} selected={selectedState} onClick={handleStateClick} />
                            ))}
                        </div>
                    </div>
                    <p className="text-xs text-center text-gray-500 mt-2">Click a state to view limits.</p>
                </div>

                {/* Results Panel */}
                <div className="space-y-4">
                    {limits ? (
                        <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                                <h4 className="font-semibold text-gray-800">{selectedState} {year} Limits</h4>
                            </div>
                            <div className="divide-y divide-gray-100">
                                <LimitRow label="1-Unit" value={limits.oneUnit} />
                                <LimitRow label="2-Unit" value={limits.twoUnit} />
                                <LimitRow label="3-Unit" value={limits.threeUnit} />
                                <LimitRow label="4-Unit" value={limits.fourUnit} />
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
                            Select a state from the map
                        </div>
                    )}

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm text-yellow-800">
                        <strong>Disclaimer:</strong> {program === "fannie" ? "Conforming" : "FHA"} limits are subject to change. High-cost counties may have higher limits. Verify with FHFA/HUD.
                    </div>
                </div>
            </div>
        </div>
    );
};

const StateTile = ({ state, selected, onClick }: { state: StateCode, selected: string, onClick: (s: StateCode) => void }) => {
    const isSelected = selected === state;
    return (
        <button
            onClick={() => onClick(state)}
            className={cn(
                "w-8 h-8 md:w-10 md:h-10 text-[10px] md:text-xs font-semibold rounded flex items-center justify-center transition-all",
                isSelected
                    ? "bg-indigo-600 text-white shadow-lg scale-110 ring-2 ring-offset-1 ring-indigo-400"
                    : "bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-700"
            )}
            title={state}
            suppressHydrationWarning // States are static but just in case
        >
            {state}
        </button>
    )
}

const LimitRow = ({ label, value }: { label: string, value: number }) => (
    <div className="flex justify-between items-center px-4 py-3">
        <span className="text-gray-600">{label}</span>
        <span className="font-mono font-medium text-gray-900">{formatCurrency(value)}</span>
    </div>
)

export default LoanLimitMap;

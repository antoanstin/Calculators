"use client";

import { useState } from "react";
import { calculators } from "@/data/calculatorsRegistry";
import { Select } from "@/components/ui/Select";

export default function Home() {
  const [selectedCalcId, setSelectedCalcId] = useState<string>(
    calculators[0]?.id || ""
  );

  const selectedCalculator = calculators.find(
    (c) => c.id === selectedCalcId
  );

  const CalculatorComponent = selectedCalculator?.component;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <svg
              className="h-8 w-8 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <h1 className="ml-3 text-xl font-bold text-gray-900">
              Calculators
            </h1>
          </div>
          <div className="w-64">
            <Select
              value={selectedCalcId}
              onChange={(e) => setSelectedCalcId(e.target.value)}
              options={calculators.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
              className="text-sm"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedCalculator && CalculatorComponent ? (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-5">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:tracking-tight">
                {selectedCalculator.name}
              </h2>
              <p className="mt-2 max-w-4xl text-sm text-gray-500">
                {selectedCalculator.description}
              </p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <CalculatorComponent />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Select a calculator to get started.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Gooseberry Technovision. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}


import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectProps {
    label?: string;
    options: SelectOption[];
    value?: string;
    onChange?: (event: { target: { value: string } }) => void;
    className?: string;
    error?: string;
    disabled?: boolean;
}

export function Select({ label, options, value, onChange, className, error, disabled }: SelectProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
        if (onChange) {
            onChange({ target: { value: optionValue } });
        }
        setIsOpen(false);
    };

    return (
        <div className="w-full relative" ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <button
                    type="button"
                    disabled={error ? true : disabled}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={cn(
                        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
                        error && "border-red-500 focus:ring-red-500",
                        className
                    )}
                    suppressHydrationWarning
                >
                    <span className="block truncate">
                        {selectedOption ? selectedOption.label : "Select..."}
                    </span>
                    <ChevronDown className={cn("h-4 w-4 text-gray-500 ml-2 flex-shrink-0 transition-transform duration-200", isOpen && "transform rotate-180")} />
                </button>

                {isOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-xl bg-white shadow-lg focus:outline-none sm:text-sm animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
                        <div className="max-h-60 overflow-auto py-1">
                            {options.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={cn(
                                        "relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-indigo-50 text-gray-900",
                                        option.value === value ? "bg-indigo-50 font-medium" : ""
                                    )}
                                >
                                    <span className="block truncate">{option.label}</span>
                                    {option.value === value && (
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                                            <Check className="h-4 w-4" />
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
}

Select.displayName = "Select";

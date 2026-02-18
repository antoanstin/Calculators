import * as React from "react";
import { Input, InputProps } from "./Input";

interface MoneyInputProps extends Omit<InputProps, "leftIcon" | "type"> {
    currencySymbol?: string;
}

const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
    ({ currencySymbol = "$", value, onChange, ...props }, ref) => {
        // Local state to handle "0" vs "00" vs "" behavior cleanly
        const [localValue, setLocalValue] = React.useState<string>(value !== undefined && value !== null ? value.toString() : "");

        // Sync local value with prop value when prop changes externally (e.g. calculation updates)
        React.useEffect(() => {
            if (value === undefined || value === null) return;
            const propValStr = value.toString();

            // If the prop value matches our local value (string-wise), do nothing (e.g. "0." matches 0 if we ignore formatting)
            // But here we want strictly equal to avoid overwriting user input like "0."
            if (propValStr === localValue) return;

            const propValNum = Number(value);
            const localValNum = Number(localValue);

            // If meaningful numerical difference, update local state
            if (!isNaN(propValNum) && !isNaN(localValNum) && propValNum === localValNum) {
                // Determine if we should preserve specific local formats
                // 1. User cleared input ("") but prop is 0. Keep "".
                if (localValue === "" && propValNum === 0) return;

                // 2. User typed decimal ("5.") but prop is 5. Keep "5.".
                if (localValue.includes(".")) return;

                // 3. User typed leading zeros ("05"). We WANT to fix this to "5".
                // Logic continues below to update if we want to fix it.
                // But leading zeros are usually handled in handleChange.
                if (localValue.startsWith("0") && localValue.length > 1 && !localValue.startsWith("0.")) {
                    // Fall through to update
                } else {
                    return; // Preserve local format (e.g. "5.0")
                }
            }

            // Otherwise, sync from prop logic (external update or forcing format)
            setLocalValue(propValStr);
        }, [value, localValue]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let newValue = e.target.value;

            // Strip leading zeros for non-decimal values (e.g. "05" -> "5")
            if (newValue.startsWith("0") && newValue.length > 1 && !newValue.startsWith("0.")) {
                newValue = newValue.replace(/^0+/, "");
            }

            // Update local state
            setLocalValue(newValue);

            // Propagate change to parent
            if (onChange) {
                // Clone event? Or just mutate target?
                // Mutating target value is risky but works for synthetic events usually.
                // Better to trust standard behavior: parent reads e.target.value.
                // But e.target.value in the event IS what the user typed ("05").
                // If we want parent to receive "5", we must ensure e.target.value is "5"?
                // We can't easily mutate the event target value in React bubble phase.

                // However, most parents do `Number(e.target.value)`.
                // Number("05") === 5. Number("5") === 5.
                // So parent gets correct number regardless!
                // The issue was display ("05").
                // Since we update localValue to "5", the input will re-render with "5".
                // So visually it fixes itself instantly.
                onChange(e);
            }
        };

        return (
            <Input
                type="number"
                step="0.01"
                leftIcon={<span className="text-gray-700 font-semibold">{currencySymbol}</span>}
                ref={ref}
                value={localValue}
                onChange={handleChange}
                {...props}
            />
        );
    }
);
MoneyInput.displayName = "MoneyInput";

export { MoneyInput };

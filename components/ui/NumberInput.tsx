import * as React from "react";
import { Input, InputProps } from "./Input";

export interface NumberInputProps extends InputProps {
    // No specific extra props needed, just acts as a smart wrapper for Input
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
    ({ value, onChange, ...props }, ref) => {
        // Local state to handle "0" vs "00" vs "" behavior cleanly
        const [localValue, setLocalValue] = React.useState<string>(value !== undefined && value !== null ? value.toString() : "");

        // Sync local value with prop value when prop changes externally
        React.useEffect(() => {
            if (value === undefined || value === null) return;
            const propValStr = value.toString();

            // If the prop value matches our local value (string-wise), do nothing
            if (propValStr === localValue) return;

            const propValNum = Number(value);
            const localValNum = Number(localValue);

            // If meaningful numerical difference, update local state
            if (!isNaN(propValNum) && !isNaN(localValNum) && propValNum === localValNum) {
                // 1. User cleared input ("") but prop is 0. Keep "".
                if (localValue === "" && propValNum === 0) return;

                // 2. User typed decimal ("5.") but prop is 5. Keep "5.".
                if (localValue.includes(".")) return;

                // 3. User typed leading zeros ("05"). We update to fix this (to "5") if needed.
                if (localValue.startsWith("0") && localValue.length > 1 && !localValue.startsWith("0.")) {
                    // Fall through to update (strip leading zero)
                } else {
                    return; // Preserve local format (e.g. "5.0")
                }
            }

            setLocalValue(propValStr);
        }, [value, localValue]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let newValue = e.target.value;

            // Strip leading zeros for non-decimal values (e.g. "05" -> "5")
            if (newValue.startsWith("0") && newValue.length > 1 && !newValue.startsWith("0.")) {
                newValue = newValue.replace(/^0+/, "");
            }

            setLocalValue(newValue);

            if (onChange) {
                onChange(e);
            }
        };

        return (
            <Input
                type="number"
                ref={ref}
                value={localValue}
                onChange={handleChange}
                {...props}
            />
        );
    }
);

NumberInput.displayName = "NumberInput";

export { NumberInput };

import * as React from "react";
import { Input, InputProps } from "./Input";

interface MoneyInputProps extends Omit<InputProps, "leftIcon" | "type"> {
    currencySymbol?: string;
}

const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
    ({ currencySymbol = "$", ...props }, ref) => {
        return (
            <Input
                type="number"
                step="0.01"
                leftIcon={<span className="text-gray-700 font-semibold">{currencySymbol}</span>}
                ref={ref}
                {...props}
            />
        );
    }
);
MoneyInput.displayName = "MoneyInput";

export { MoneyInput };

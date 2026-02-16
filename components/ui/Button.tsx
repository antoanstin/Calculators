import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = "primary",
            size = "md",
            isLoading,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
                    {
                        "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500":
                            variant === "primary",
                        "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500":
                            variant === "secondary",
                        "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-indigo-500":
                            variant === "outline",
                        "bg-transparent hover:bg-gray-100 text-gray-700":
                            variant === "ghost",
                        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500":
                            variant === "danger",
                        "h-8 px-3 text-xs": size === "sm",
                        "h-10 py-2 px-4": size === "md",
                        "h-12 px-6 text-lg": size === "lg",
                    },
                    className
                )}
                ref={ref}
                disabled={disabled || isLoading}
                suppressHydrationWarning
                {...props}
            >
                {isLoading && (
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                )}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button };

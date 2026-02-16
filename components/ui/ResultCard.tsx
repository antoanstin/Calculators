import * as React from "react";
import { cn } from "@/lib/utils";

interface ResultCardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon?: React.ReactNode;
    variant?: "default" | "highlight" | "success";
    className?: string;
}

export function ResultCard({
    title,
    value,
    subtitle,
    icon,
    variant = "default",
    className,
}: ResultCardProps) {
    return (
        <div
            className={cn(
                "bg-white rounded-lg shadow p-4 border transition-all",
                {
                    "border-gray-200": variant === "default",
                    "border-indigo-100 bg-indigo-50": variant === "highlight",
                    "border-green-100 bg-green-50": variant === "success",
                },
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                    <p
                        className={cn("mt-1 text-2xl font-semibold text-gray-900", {
                            "text-indigo-600": variant === "highlight",
                            "text-green-600": variant === "success",
                        })}
                    >
                        {value}
                    </p>
                    {subtitle && (
                        <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
                    )}
                </div>
                {icon && (
                    <div
                        className={cn("p-2 rounded-full", {
                            "bg-gray-100 text-gray-600": variant === "default",
                            "bg-indigo-100 text-indigo-600": variant === "highlight",
                            "bg-green-100 text-green-600": variant === "success",
                        })}
                    >
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}

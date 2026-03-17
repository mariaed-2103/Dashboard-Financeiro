"use client";

import { cn } from "@/lib/utils";

interface GoalProgressBarProps {
  currentAmount: number;
  targetAmount: number;
  className?: string;
}

export function GoalProgressBar({
  currentAmount,
  targetAmount,
  className,
}: GoalProgressBarProps) {
  const percentage = targetAmount > 0 
    ? Math.min((currentAmount / targetAmount) * 100, 100) 
    : 0;

  return (
    <div className={cn("w-full", className)}>
      <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            percentage >= 100 
              ? "bg-emerald-500" 
              : percentage >= 50 
                ? "bg-amber-500" 
                : "bg-primary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

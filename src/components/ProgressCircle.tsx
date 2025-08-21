import { cn } from "@/lib/utils";

interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const ProgressCircle = ({ 
  percentage, 
  size = 120, 
  strokeWidth = 8,
  className 
}: ProgressCircleProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const isOverLimit = percentage > 100;
  
  return (
    <div className={cn("relative", className)}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isOverLimit ? "hsl(var(--warning))" : "hsl(var(--success))"}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
          style={{
            filter: isOverLimit ? "drop-shadow(0 0 8px hsl(var(--warning) / 0.5))" : "drop-shadow(0 0 8px hsl(var(--success) / 0.3))"
          }}
        />
      </svg>
      
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className={cn(
            "text-2xl font-bold transition-colors",
            isOverLimit ? "text-warning" : "text-success"
          )}>
            {Math.round(percentage)}%
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            {isOverLimit ? "Over Limit" : "Used"}
          </div>
        </div>
      </div>
    </div>
  );
};
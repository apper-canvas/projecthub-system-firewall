import React from "react";
import { cn } from "@/utils/cn";

const ProgressBar = ({ 
  value = 0, 
  max = 100,
  label,
  showValue = true,
  size = "default",
  variant = "primary",
  className,
  ...props 
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const sizes = {
    sm: "h-2",
    default: "h-3",
    lg: "h-4",
  };

  const variants = {
    primary: "from-primary-400 to-primary-600",
    success: "from-green-400 to-green-600",
    warning: "from-yellow-400 to-yellow-600",
    danger: "from-red-400 to-red-600",
  };

  return (
    <div className={cn("space-y-2", className)} {...props}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-sm">
          {label && <span className="text-gray-700 font-medium">{label}</span>}
          {showValue && (
            <span className="text-gray-500">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      
      <div className={cn("bg-gray-200 rounded-full overflow-hidden", sizes[size])}>
        <div
          className={cn(
            "bg-gradient-to-r rounded-full transition-all duration-500 ease-out",
            variants[variant],
            sizes[size]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
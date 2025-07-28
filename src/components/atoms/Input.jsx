import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Input = forwardRef(({ 
  className, 
  type = "text",
  icon,
  iconPosition = "left",
  error,
  ...props 
}, ref) => {
  const baseClasses = "w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0";
  
  const stateClasses = error 
    ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
    : "border-gray-300 focus:border-primary-500 focus:ring-primary-500";

  const iconClasses = "absolute top-1/2 transform -translate-y-1/2 text-gray-400";
  const leftIconClasses = "left-3";
  const rightIconClasses = "right-3";
  
  const inputClasses = cn(
    baseClasses,
    stateClasses,
    icon && iconPosition === "left" ? "pl-11" : "",
    icon && iconPosition === "right" ? "pr-11" : "",
    className
  );

  if (icon) {
    return (
      <div className="relative">
        <input
          type={type}
          className={inputClasses}
          ref={ref}
          {...props}
        />
        <ApperIcon 
          name={icon} 
          size={18}
          className={cn(
            iconClasses,
            iconPosition === "left" ? leftIconClasses : rightIconClasses
          )}
        />
      </div>
    );
  }

  return (
    <input
      type={type}
      className={inputClasses}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";
export default Input;
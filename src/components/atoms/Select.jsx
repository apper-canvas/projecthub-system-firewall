import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Select = forwardRef(({ 
  className, 
  children,
  error,
  placeholder,
  ...props 
}, ref) => {
  const baseClasses = "w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none bg-white";
  
  const stateClasses = error 
    ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
    : "border-gray-300 focus:border-primary-500 focus:ring-primary-500";

  return (
    <div className="relative">
      <select
        className={cn(baseClasses, stateClasses, "pr-11", className)}
        ref={ref}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      <ApperIcon 
        name="ChevronDown" 
        size={18}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
});

Select.displayName = "Select";
export default Select;
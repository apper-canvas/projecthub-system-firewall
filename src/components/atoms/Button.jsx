import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Button = forwardRef(({ 
  className, 
  variant = "primary", 
  size = "default",
  icon,
  iconPosition = "left",
  children, 
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 ease-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg hover:shadow-xl focus:ring-primary-500",
    secondary: "bg-white text-primary-600 border border-primary-200 hover:bg-primary-50 focus:ring-primary-500",
    outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500",
    ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500",
    danger: "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg hover:shadow-xl focus:ring-red-500",
  };
  
  const sizes = {
    sm: "px-3 py-2 text-sm",
    default: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const IconComponent = icon ? (
    <ApperIcon 
      name={icon} 
      size={size === "sm" ? 16 : size === "lg" ? 20 : 18} 
      className={cn(
        iconPosition === "left" && children ? "mr-2" : "",
        iconPosition === "right" && children ? "ml-2" : ""
      )}
    />
  ) : null;

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    >
      {iconPosition === "left" && IconComponent}
      {children}
      {iconPosition === "right" && IconComponent}
    </button>
  );
});

Button.displayName = "Button";
export default Button;
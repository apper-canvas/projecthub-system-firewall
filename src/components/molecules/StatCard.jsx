import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend,
  trendValue,
  className,
  gradient = false,
  ...props 
}) => {
  const cardClasses = cn(
    "card",
    gradient && "bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200",
    className
  );

  const getTrendColor = (trend) => {
    switch (trend) {
      case "up": return "text-green-600";
      case "down": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up": return "TrendingUp";
      case "down": return "TrendingDown";
      default: return "Minus";
    }
  };

  return (
    <div className={cardClasses} {...props}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && (
          <div className="p-2 bg-primary-100 rounded-lg">
            <ApperIcon 
              name={icon} 
              size={24} 
              className="text-primary-600" 
            />
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <p className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          {value}
        </p>
        
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
        
        {trend && trendValue && (
          <div className={cn("flex items-center space-x-1 text-sm", getTrendColor(trend))}>
            <ApperIcon name={getTrendIcon(trend)} size={16} />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
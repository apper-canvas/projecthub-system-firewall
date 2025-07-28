import React from "react";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No data found", 
  description = "Get started by adding your first item",
  action,
  actionLabel = "Add Item",
  icon = "Seedling"
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full blur-xl opacity-50"></div>
        <div className="relative bg-gradient-to-br from-primary-50 to-primary-100 p-8 rounded-full">
          <ApperIcon 
            name={icon} 
            size={56} 
            className="text-primary-500" 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">
          {title}
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          {description}
        </p>
      </div>

      {action && (
        <button
          onClick={action}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <ApperIcon name="Plus" size={16} />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

export default Empty;
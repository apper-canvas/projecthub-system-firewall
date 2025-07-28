import React from "react";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ message = "Something went wrong", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-red-100 rounded-full blur-xl opacity-50"></div>
        <div className="relative bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-full">
          <ApperIcon 
            name="AlertTriangle" 
            size={48} 
            className="text-red-500" 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">
          Oops! Something went wrong
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <ApperIcon name="RefreshCw" size={16} />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};

export default Error;
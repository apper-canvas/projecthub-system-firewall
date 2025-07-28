import React from "react";

const Loading = () => {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 bg-gray-200 rounded w-24"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="h-6 bg-gray-200 rounded w-28 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-5 bg-gray-200 rounded w-32"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";

const Header = ({ title, onMenuToggle, searchValue, onSearchChange, showSearch = true }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            icon="Menu"
            onClick={onMenuToggle}
            className="lg:hidden"
          />
          
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {showSearch && (
            <div className="hidden md:block w-80">
              <SearchBar
                value={searchValue}
                onChange={onSearchChange}
                placeholder="Search farms, crops, tasks..."
              />
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              icon="Bell"
              className="relative"
            >
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </Button>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <ApperIcon name="User" size={20} className="text-primary-500" />
              <span className="hidden sm:inline">Farm Manager</span>
            </div>
          </div>
        </div>
      </div>

      {showSearch && (
        <div className="md:hidden mt-4">
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search farms, crops, tasks..."
          />
        </div>
      )}
    </header>
  );
};

export default Header;
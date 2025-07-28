import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigationItems = [
    { name: "Dashboard", href: "/", icon: "BarChart3" },
    { name: "Farms", href: "/farms", icon: "MapPin" },
    { name: "Crops", href: "/crops", icon: "Wheat" },
    { name: "Tasks", href: "/tasks", icon: "CheckSquare" },
    { name: "Weather", href: "/weather", icon: "Cloud" },
    { name: "Finances", href: "/finances", icon: "DollarSign" },
  ];

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.href;
    
    return (
      <NavLink
        to={item.href}
        onClick={onClose}
        className={cn(
          "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
            : "text-gray-600 hover:bg-primary-50 hover:text-primary-600"
        )}
      >
        <ApperIcon 
          name={item.icon} 
          size={20}
          className={isActive ? "text-white" : ""}
        />
        <span>{item.name}</span>
      </NavLink>
    );
  };

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200">
      <div className="flex items-center px-6 py-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg">
            <ApperIcon name="Sprout" size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              FarmFlow
            </h1>
            <p className="text-xs text-gray-500">Farm Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-200">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <ApperIcon name="Lightbulb" size={20} className="text-primary-600" />
            <span className="text-sm font-medium text-primary-800">Pro Tip</span>
          </div>
          <p className="text-xs text-primary-700">
            Track your daily tasks to maximize harvest yields!
          </p>
        </div>
      </div>
    </div>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg">
              <ApperIcon name="Sprout" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                FarmFlow
              </h1>
              <p className="text-xs text-gray-500">Farm Management</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ApperIcon name="X" size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-200">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <ApperIcon name="Lightbulb" size={20} className="text-primary-600" />
              <span className="text-sm font-medium text-primary-800">Pro Tip</span>
            </div>
            <p className="text-xs text-primary-700">
              Track your daily tasks to maximize harvest yields!
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;
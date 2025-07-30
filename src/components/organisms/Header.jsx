import React, { useContext } from "react";
import { useSelector } from 'react-redux';
import ApperIcon from "@/components/ApperIcon";
import MobileMenuButton from "@/components/molecules/MobileMenuButton";
import Button from "@/components/atoms/Button"; 
import { AuthContext } from "@/App";
const Header = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
  const { logout } = useContext(AuthContext);
  const { user, isAuthenticated } = useSelector((state) => state.user);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <MobileMenuButton 
          isOpen={isMobileMenuOpen}
          onClick={onMobileMenuToggle}
        />
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-lg">
            <ApperIcon name="Folder" className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            ProjectHub
          </h1>
        </div>
      </div>
<div className="flex items-center space-x-4">
        <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-600">
          <ApperIcon name="Clock" className="w-4 h-4" />
          <span>{new Date().toLocaleDateString("en-US", { 
            weekday: "long", 
            year: "numeric", 
            month: "long", 
            day: "numeric" 
          })}</span>
        </div>
        
        {isAuthenticated && (
          <div className="flex items-center space-x-3">
            {user && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <ApperIcon name="User" className="w-4 h-4" />
                <span>{user.firstName} {user.lastName}</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <ApperIcon name="LogOut" className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
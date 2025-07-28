import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/") return "Dashboard";
    return path.slice(1).charAt(0).toUpperCase() + path.slice(2);
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="lg:ml-64">
        <Header
          title={getPageTitle()}
          onMenuToggle={() => setSidebarOpen(true)}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
        />
        
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex font-sans antialiased transition-colors duration-200 ${
      isDark ? 'text-[#e8ddd4]' : 'text-[#1a232c]'
    }`} style={{ backgroundColor: isDark ? '#0e161d' : '#faf8f5' }}>
      {/* Side Navigation Panel */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Header setMobileOpen={setMobileOpen} isCollapsed={isCollapsed} />

        <main className={`flex-1 p-3.5 sm:p-5 md:p-6 lg:p-8 overflow-y-auto w-full max-w-full transition-colors duration-200`}
          style={{ backgroundColor: isDark ? '#0e161d' : '#faf8f5' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

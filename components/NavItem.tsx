import React from 'react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isSidebarOpen: boolean;
  onClick: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, isSidebarOpen, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50
        ${isActive 
          ? 'bg-[#0D7A68] text-white shadow-md font-bold' 
          : 'text-slate-300 hover:bg-[#142642] hover:text-white font-medium'
        }`}
      title={!isSidebarOpen ? label : undefined}
    >
      <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
        {icon}
      </div>
      
      <span 
        className={`whitespace-nowrap transition-all duration-300 ${
          isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 hidden'
        }`}
      >
        {label}
      </span>
      
      {isActive && isSidebarOpen && (
        <div className="ml-auto h-2 w-2 rounded-full bg-white shadow-inner"></div>
      )}
    </button>
  );
};
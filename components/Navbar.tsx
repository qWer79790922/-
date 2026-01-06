import React, { useState, useRef, useEffect } from 'react';
import { ViewMode } from '../types';

interface NavbarProps {
  onNavigate: (view: ViewMode) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDropdownClick = (view: ViewMode) => {
    onNavigate(view);
    setIsDropdownOpen(false);
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-gray-200 border-b shadow-sm text-sm sticky top-0 z-50">
      <div 
        className="text-lg font-medium tracking-wide text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
        onClick={() => onNavigate(ViewMode.ALL)}
      >
        南聯合約管理系統
      </div>
      <div className="flex items-center space-x-6 text-gray-600">
        <button className="hover:text-blue-600 transition-colors" onClick={() => onNavigate(ViewMode.ALL)}>歷史查詢</button>
        <button 
          className="hover:text-blue-600 transition-colors"
          onClick={() => onNavigate(ViewMode.NEW_CONTRACT)}
        >
          新合約
        </button>
        
        {/* Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <button 
            className="flex items-center hover:text-blue-600 transition-colors focus:outline-none"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            合約管理 
            <span className="ml-1 text-[10px]">▼</span>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute left-0 mt-2 w-52 bg-white border border-gray-200 rounded-md shadow-xl py-2 z-50">
              <button onClick={() => handleDropdownClick(ViewMode.LENDING_FORM)} className="block w-full text-left px-6 py-2.5 hover:bg-gray-50 text-gray-700 transition-colors">
                合約借閱申請
              </button>
              <button onClick={() => handleDropdownClick(ViewMode.OVERDUE_FORM)} className="block w-full text-left px-6 py-2.5 hover:bg-gray-50 text-gray-700 transition-colors">
                合約逾期填寫
              </button>
              <button onClick={() => handleDropdownClick(ViewMode.LENDING_LIST)} className="block w-full text-left px-6 py-2.5 hover:bg-gray-50 text-gray-700 transition-colors">
                合約借閱清單
              </button>
              <button onClick={() => handleDropdownClick(ViewMode.OVERDUE_LIST)} className="block w-full text-left px-6 py-2.5 hover:bg-gray-50 text-gray-700 transition-colors">
                合約逾期清單
              </button>
            </div>
          )}
        </div>

        <button className="hover:text-blue-600 transition-colors">PDF上傳專區</button>
        <button className="hover:text-blue-600 transition-colors">下載操作說明</button>
        <button className="hover:text-blue-600 transition-colors">帳號管理</button>
        
        <button className="px-3 py-1 text-blue-500 border border-blue-500 rounded hover:bg-blue-50 transition-colors text-xs">
          登出
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
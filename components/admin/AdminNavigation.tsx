'use client';

import { useState } from 'react';

interface Tab {
  id: string;
  name: string;
  icon: string;
  mobileIcon?: string;
}

interface AdminNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  userEmail: string;
  onLogout: () => void;
}

export function AdminNavigation({ activeTab, onTabChange, userEmail, onLogout }: AdminNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs: Tab[] = [
    { id: 'overview', name: 'Overview', icon: '📊', mobileIcon: '📊' },
    { id: 'approvals', name: 'Approvals', icon: '👨‍⚕️', mobileIcon: '✅' },
    { id: 'invites', name: 'Invites', icon: '🔗', mobileIcon: '🔗' },
    { id: 'doctors', name: 'Doctors', icon: '👥', mobileIcon: '👥' },
    { id: 'patients', name: 'Patients', icon: '🏥', mobileIcon: '🏥' },
  ];

  return (
    <>
      {/* Desktop Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex justify-between items-center py-4">
            {/* Logo & Title */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg lg:text-xl">S</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-xs lg:text-sm text-gray-500">Healthcare Management</p>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Desktop User Info */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 truncate max-w-48">{userEmail}</p>
                <p className="text-xs text-green-800 bg-green-100 px-2 py-1 rounded-full">Admin</p>
              </div>
              <button
                onClick={onLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-900 truncate">{userEmail}</p>
              <p className="text-xs text-green-800">Administrator</p>
            </div>
            <div className="py-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-green-50 text-green-700 border-r-4 border-green-500'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{tab.mobileIcon || tab.icon}</span>
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
              <button
                onClick={onLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 border-t border-gray-200"
              >
                <span className="text-lg">🚪</span>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Desktop Navigation Tabs */}
      <div className="hidden lg:block bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-5 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center py-2 px-1 transition-colors ${
                activeTab === tab.id
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-lg mb-1">{tab.mobileIcon || tab.icon}</span>
              <span className="text-xs font-medium truncate">{tab.name}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

'use client';

interface DoctorNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userEmail: string;
  doctorName: string;
  doctorUID: string;
  onLogout: () => void;
}

export function DoctorNavigation({ 
  activeTab, 
  onTabChange, 
  userEmail, 
  doctorName,
  doctorUID,
  onLogout 
}: DoctorNavigationProps) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'patients', label: 'Patients', icon: '👥' },
    { id: 'appointments', label: 'Appointments', icon: '📅' },
    { id: 'prescriptions', label: 'Prescriptions', icon: '💊' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <>
      {/* Desktop Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {doctorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dr. {doctorName}</h1>
                <p className="text-sm text-gray-500">{doctorUID} • Siddha Savor</p>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{userEmail}</p>
                <p className="text-xs text-gray-500">Healthcare Professional</p>
              </div>
              <button
                onClick={onLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={onLogout}
                className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
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
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
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
              className={`flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-lg mb-1">{tab.icon}</span>
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

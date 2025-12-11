interface NavbarProps {
  showBackButton?: boolean;
}

export function Navbar({ showBackButton = false }: NavbarProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-2xl font-bold text-green-800">Siddha Savor</span>
          </div>
          {showBackButton ? (
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-all font-medium"
            >
              ← Back to Home
            </button>
          ) : (
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg font-semibold"
            >
              Get Started
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

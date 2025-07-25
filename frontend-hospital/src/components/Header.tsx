import { useState } from 'react';
import { Hospital, Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 shadow-md">
      <div className="w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-600"></div>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/dashboard" className="flex items-center">
            <Hospital className="text-cyan-500 mr-2" size={24} />
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              ResQNet
            </h1>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button 
              className="p-2 relative" 
              onClick={toggleNotifications}
              aria-label="Notifications"
            >
              <Bell size={20} className="text-gray-300 hover:text-cyan-400 transition-colors" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
                <div className="p-3 border-b border-gray-700">
                  <h3 className="text-sm font-medium text-gray-200">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <div className="p-4 border-b border-gray-700 hover:bg-gray-700 transition-colors">
                    <p className="text-sm text-gray-300">New emergency case assigned to your hospital</p>
                    <p className="text-xs text-gray-400 mt-1">10 minutes ago</p>
                  </div>
                  <div className="p-4 border-b border-gray-700 hover:bg-gray-700 transition-colors">
                    <p className="text-sm text-gray-300">System maintenance scheduled for tonight</p>
                    <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                  </div>
                  <div className="p-4 hover:bg-gray-700 transition-colors">
                    <p className="text-sm text-gray-300">Please update your hospital profile information</p>
                    <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                  </div>
                </div>
                <div className="p-2 text-center border-t border-gray-700">
                  <a href="#" className="text-xs text-cyan-400 hover:text-cyan-300">View all notifications</a>
                </div>
              </div>
            )}
          </div>
          
          <Link to="/profile" className="flex items-center group">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <span className="ml-2 text-sm text-gray-300 group-hover:text-cyan-400 transition-colors">ResClinic</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
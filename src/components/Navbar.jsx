import React, { useState } from 'react';
import { Menu, X, Award, CreditCard, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../AuthContext.jsx';

const Navbar = () => {
  const { isLoggedIn, logout } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    {
      name: 'Tournaments',
      icon: <Award size={20} />,
      path: 'dashboard/tournaments',
    },
    {
      name: 'Payment',
      icon: <CreditCard size={20} />,
      path: 'dashboard/payment',
    },
  ];

  return (
    <nav className="bg-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className="text-white font-bold text-xl">GamePortal</h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <div
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className="cursor-pointer text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.name}
                </div>
              ))}
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="text-white cursor-pointer hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <LogOut size={20} className="mr-1" />
                  Logout
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-indigo-500 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-indigo-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <div
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false); // close mobile menu after navigation
                }}
                className="cursor-pointer text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium flex items-center"
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </div>
            ))}
            {isLoggedIn && (
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="text-white hover:bg-indigo-500 w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center"
              >
                <LogOut size={20} className="mr-2" />
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

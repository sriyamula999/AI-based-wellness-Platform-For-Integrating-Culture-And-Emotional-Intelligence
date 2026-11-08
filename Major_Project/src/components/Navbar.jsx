import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthModal from './AuthModal';
import { Sparkles, Utensils, Landmark, HeartPulse, Home, LogIn, UserPlus, User, LogOut, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [authModal, setAuthModal] = useState(null);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loggedInStatus = localStorage.getItem('pranaai_is_logged_in') === 'true';
    const email = localStorage.getItem('pranaai_user_email') || '';
    setIsLoggedIn(loggedInStatus);
    setUserEmail(email);
  }, []);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', name: 'Home', icon: Home },
    { path: '/ahara', name: 'Ahara', icon: Utensils },
    { path: '/mandira', name: 'Mandira', icon: Landmark },
    { path: '/dhyana', name: 'Dhyana', icon: HeartPulse },
  ];

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('pranaai_user_email');
    localStorage.setItem('pranaai_is_logged_in', 'false');
    setIsLoggedIn(false);
    setProfileDropdownOpen(false);
    window.location.reload();
  };

  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : 'U';

  return (
    <>
      <header className="fixed top-4 left-0 right-0 z-50 px-4">
        <nav className="max-w-6xl mx-auto glass-panel rounded-2xl px-6 py-3 flex items-center justify-between shadow-xl">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-[#dff3e9] border border-[#22875f]/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-[#176b4d]" />
            </div>
            <span className="font-semibold text-lg tracking-wide text-[#176b4d]">
              Vedic Ethos
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#dff3e9] text-[#176b4d] shadow-sm border border-[#22875f]/20'
                      : 'text-[#557267] hover:text-[#176b4d] hover:bg-[#edf7f2]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-[#c9782d]' : 'text-[#557267]'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-[#dff3e9] hover:bg-[#c9e1d6] border border-[#22875f]/20 transition-all text-[#176b4d]"
                >
                  <div className="w-7 h-7 rounded-full bg-[#176b4d] flex items-center justify-center text-xs font-bold text-white shadow-inner">
                    {userInitial}
                  </div>
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">My Profile</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{userEmail}</p>
                    </div>

                    <div className="py-1">
                      <Link 
                        to="/profile" 
                        onClick={() => setProfileDropdownOpen(false)}
                        className="w-full px-4 py-2 text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                      >
                        <User className="w-4 h-4 text-purple-400" />
                        <span>View Profile</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-800 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-xs sm:text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAuthModal('login')}
                  className="px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4 text-purple-400" />
                  <span className="hidden sm:inline">Login</span>
                </button>
                <button
                  onClick={() => setAuthModal('signup')}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-[#176b4d] text-white shadow-lg hover:bg-[#22875f] transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      <AuthModal 
        isOpen={authModal !== null} 
        mode={authModal} 
        onClose={() => setAuthModal(null)} 
      />
    </>
  );
}
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

const Navbar: React.FC<{ userName?: string }> = ({ userName }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="text-2xl font-bold text-green-800">
            <Link href="/dashboard">Resume Tailor Pro</Link>
          </div>
          {/* Hamburger for mobile */}
          <button className="md:hidden text-green-800 focus:outline-none" onClick={() => setMenuOpen(v => !v)}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="text-green-800 font-semibold hover:underline">Dashboard</Link>
            <Link href="/generate-cv" className="text-green-800 font-semibold hover:underline">Generate Resume</Link>
            <Link href="/ats-checker" className="text-green-800 font-semibold hover:underline">ATS Checker</Link>
            <Link href="/feedback" className="text-green-800 font-semibold hover:underline">Feedback</Link>
            {userName && (
              <div className="relative">
                <button
                  className="flex items-center space-x-2 focus:outline-none"
                  onClick={() => setDropdownOpen((v) => !v)}
                >
                  <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center font-bold text-green-800">
                    {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <span className="text-green-800 font-semibold">{userName}</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-green-50"
                      onClick={() => { setDropdownOpen(false); router.push('/profile'); }}
                    >
                      Profile
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-green-50 text-red-600"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden flex flex-col space-y-2 mt-2 pb-4">
            <Link href="/dashboard" className="text-green-800 font-semibold hover:underline" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link href="/generate-cv" className="text-green-800 font-semibold hover:underline" onClick={() => setMenuOpen(false)}>Generate CV</Link>
            <Link href="/ats-checker" className="text-green-800 font-semibold hover:underline" onClick={() => setMenuOpen(false)}>ATS Checker</Link>
            <Link href="/feedback" className="text-green-800 font-semibold hover:underline" onClick={() => setMenuOpen(false)}>Feedback</Link>
            {userName && (
              <div className="relative">
                <button
                  className="flex items-center space-x-2 focus:outline-none w-full"
                  onClick={() => setDropdownOpen((v) => !v)}
                >
                  <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center font-bold text-green-800">
                    {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <span className="text-green-800 font-semibold">{userName}</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-green-50"
                      onClick={() => { setDropdownOpen(false); setMenuOpen(false); router.push('/profile'); }}
                    >
                      Profile
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-green-50 text-red-600"
                      onClick={() => { setMenuOpen(false); handleLogout(); }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 
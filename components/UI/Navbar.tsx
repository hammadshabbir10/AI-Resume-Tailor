import Link from 'next/link';
import { Button } from './button';
import { useState } from 'react';
import { FaBars } from 'react-icons/fa';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (

    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm py-4 px-6 flex items-center justify-between relative">
      <div className="flex items-center space-x-2">
        <span className="text-2xl font-extrabold tracking-widest bg-gradient-to-r from-blue-500 via-blue-700 to-blue-400 bg-clip-text text-transparent animate-gradient-x">
          NE<span className="text-blue-500">X</span>IUM
        </span>
      </div>
      {/* Desktop Links */}
      <div className="hidden md:flex items-center space-x-4">
        <Link href="/">
          <Button variant="ghost" className="text-blue-700 font-semibold">Home</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="ghost" className="text-blue-700 font-semibold">Dashboard</Button>
        </Link>
        <Link href="/dashboard/my-blogs">
          <Button variant="ghost" className="text-blue-700 font-semibold">My Blogs</Button>
        </Link>
        <Link href="/Feedback">
          <Button variant="ghost" className="text-blue-700 font-semibold">Feedback</Button>
        </Link>
      </div>
      {/* Hamburger for Mobile */}
      <button
        className="md:hidden text-blue-700 text-2xl focus:outline-none"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Open menu"
      >
        <FaBars />
      </button>
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full right-4 mt-2 bg-white rounded-xl shadow-lg flex flex-col items-start w-48 z-50 border border-blue-100">
          <Link href="/" className="w-full">
            <Button
              variant="ghost"
              className="w-full text-blue-700 font-semibold justify-start"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Button>
          </Link>
          <Link href="/dashboard" className="w-full">
            <Button
              variant="ghost"
              className="w-full text-blue-700 font-semibold justify-start"
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/my-blogs" className="w-full">
            <Button
              variant="ghost"
              className="w-full text-blue-700 font-semibold justify-start"
              onClick={() => setMenuOpen(false)}
            >
              My Blogs
            </Button>
          </Link>
          <Link href="/Feedback" className="w-full">
            <Button
              variant="ghost"
              className="w-full text-blue-700 font-semibold justify-start"
              onClick={() => setMenuOpen(false)}
            >
              Feedback
            </Button>
          </Link>
        </div>
      )}
    </nav>
  
  );
}



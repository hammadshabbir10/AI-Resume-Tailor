import Link from 'next/link';
import React from 'react';

const Footer: React.FC = () => (
  <footer className="bg-white shadow-inner mt-8">
    <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center text-gray-600 text-sm">
      <div>&copy; {new Date().getFullYear()} Resume Tailor Pro. All rights reserved.</div>
      <div>
        <Link href="/profile" className="hover:underline">About</Link>
      </div>
    </div>
  </footer>
);

export default Footer; 
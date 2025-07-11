import Link from 'next/link';
import { Button } from './button';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className="text-2xl font-extrabold tracking-widest bg-gradient-to-r from-blue-500 via-blue-700 to-blue-400 bg-clip-text text-transparent animate-gradient-x">
          NE<span className="text-blue-500">X</span>IUM
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <Link href="/">
          <Button variant="ghost" className="text-blue-700 font-semibold">Home</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="ghost" className="text-blue-700 font-semibold">Dashboard</Button>
        </Link>
        <Link href="dashboards/my-blogs">
          <Button variant="ghost" className="text-blue-700 font-semibold">My Blogs</Button>
        </Link>
      </div>
    </nav>
  );
}



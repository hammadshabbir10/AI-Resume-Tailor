'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Blog {
  id: string;
  blogText: string;
  summary: string;
  urdu: string;
  createdAt: string;
}

export default function MyBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedBlogs = localStorage.getItem('myBlogs');
    if (savedBlogs) {
      setBlogs(JSON.parse(savedBlogs));
    }
    setLoading(false);
  }, []);

  const deleteBlog = (id: string) => {
    const updated = blogs.filter(blog => blog.id !== id);
    setBlogs(updated);
    localStorage.setItem('myBlogs', JSON.stringify(updated));
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date not available';
      return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
    } catch {
      return 'Date not available';
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-blue-800">My Blogs</h1>
          <Link href="/dashboard" className="text-blue-600 font-semibold hover:underline">Back to Dashboard</Link>
        </div>
        {loading ? (
          <div className="text-center text-blue-600 py-12 text-lg font-semibold">Loading blogs...</div>
        ) : blogs.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No blogs found. Start summarizing to see your blogs here!</div>
        ) : (
          <div className="space-y-8">
            {blogs.map(blog => (
              <div key={blog.id} className="bg-white rounded-2xl shadow p-6 relative">
                <button
                  onClick={() => deleteBlog(blog.id)}
                  className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-bold text-lg"
                  title="Delete blog"
                >
                  ×
                </button>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">{formatDate(blog.createdAt)}</span>
                  <span className="text-blue-500 font-semibold text-xs">Blog ID: {blog.id}</span>
                </div>
                <div className="mb-3">
                  <h2 className="font-bold text-lg text-blue-700 mb-1">Original Blog</h2>
                  <p className="text-gray-700 whitespace-pre-line text-sm">{blog.blogText}</p>
                </div>
                <div className="mb-3">
                  <h2 className="font-bold text-lg text-blue-700 mb-1">Summary</h2>
                  <p className="text-gray-700 whitespace-pre-line text-sm">{blog.summary}</p>
                </div>
                <div>
                  <h2 className="font-bold text-lg text-blue-700 mb-1">Urdu Translation</h2>
                  <p className="text-gray-700 whitespace-pre-line text-sm">{blog.urdu}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
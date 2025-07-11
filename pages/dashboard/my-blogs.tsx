import React, { useEffect, useState } from "react";
import Link from "next/link";

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
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBlogs() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/getBlogs");
        if (!res.ok) throw new Error("Failed to fetch blogs");
        const data = await res.json();
        setBlogs(data.blogs || []);
      } catch (err: any) {
        setError(err.message || "Error fetching blogs");
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-blue-800">My Blogs</h1>
          <Link href="/dashboard" className="text-blue-600 font-semibold hover:underline">Back to Dashboard</Link>
        </div>
        {loading ? (
          <div className="text-center text-blue-600 py-12 text-lg font-semibold">Loading blogs...</div>
        ) : error ? (
          <div className="text-center text-red-600 py-12">{error}</div>
        ) : blogs.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No blogs found. Start summarizing to see your blogs here!</div>
        ) : (
          <div className="space-y-8">
            {blogs.map(blog => (
              <div key={blog.id} className="bg-white rounded-2xl shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">{new Date(blog.createdAt).toLocaleString()}</span>
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
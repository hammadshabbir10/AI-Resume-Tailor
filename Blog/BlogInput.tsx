import React, { useState } from "react";
import { FaPaste, FaLink, FaMagic } from "react-icons/fa";

export default function BlogInput({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [value, setValue] = useState("");
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const fetchBlogContent = async (url: string) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch('/api/fetch-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) throw new Error('Failed to fetch blog content');
      const data = await response.json();
      if (data.content) {
        setValue(data.content);
        setIsUrlMode(false);
      } else {
        throw new Error('No content found');
      }
    } catch (err) {
      setError('Failed to fetch blog content. Please paste the text directly.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    if (isUrlMode) {
      if (!isValidUrl(value)) {
        setError('Please enter a valid URL');
        return;
      }
      await fetchBlogContent(value);
    } else {
      onSubmit(value);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      {/* Segmented Control */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-full bg-gray-100 shadow-sm border border-gray-200">
          <button
            type="button"
            onClick={() => { setIsUrlMode(false); setError(""); }}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold text-base transition-all duration-200 focus:outline-none ${!isUrlMode ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:text-blue-700'}`}
          >
          <FaPaste className="text-lg" /> Paste Text          </button>
          <button
            type="button"
            onClick={() => { setIsUrlMode(true); setError(""); }}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold text-base transition-all duration-200 focus:outline-none ${isUrlMode ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:text-blue-700'}`}
          >
            <FaLink className="text-lg" /> Blog URL
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          {isUrlMode ? (
            <input
              type="url"
              className="w-full border border-gray-300 rounded-xl p-4 pr-12 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md text-base"
              placeholder="https://example.com/blog-post..."
              value={value}
              onChange={e => setValue(e.target.value)}
            />
          ) : (
            <textarea
              className="w-full border border-gray-300 rounded-xl p-4 pr-12 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md text-base"
              rows={8}
              placeholder="Paste blog text here..."
              value={value}
              onChange={e => setValue(e.target.value)}
            />
          )}
          {value && !isLoading && (
            <button
              type="button"
              onClick={() => setValue("")}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:bg-gray-300 text-red px-8 py-3 rounded-full font-semibold text-lg shadow-lg transition-all duration-200 transform hover:scale-[1.03] disabled:transform-none focus:outline-none"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>
                {isUrlMode ? 'Fetching Blog...' : 'Processing...'}
              </span>
            </>
          ) : (
            <>
              {isUrlMode ? <FaLink className="text-xl" /> : <FaMagic className="text-xl" />}
              <span>
                {isUrlMode ? 'Fetch Blog Content' : 'Start Summarization'}
              </span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
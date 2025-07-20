"use client";
import React, { useState, useEffect } from "react";
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Lottie from 'lottie-react';
import feedbackAnimation from '../public/animation.json';

const FeedbackPage: React.FC = () => {
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{to?: string, from?: string, subject?: string, message?: string}>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [userName, setUserName] = useState('');

useEffect(() => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const user = JSON.parse(userInfo);
    setFrom(user.email);
    setUserName(`${user.firstname || ''} ${user.lastname || ''}`.trim());
  }
}, []);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setFrom(user.email);
    }
  }, []);

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!to) newErrors.to = "To email is required";
    else if (!validateEmail(to)) newErrors.to = "Invalid email address";
    if (!from) newErrors.from = "From email is required";
    else if (!validateEmail(from)) newErrors.from = "Invalid email address";
    if (!subject) newErrors.subject = "Subject is required";
    if (!message) newErrors.message = "Message is required";
    setErrors(newErrors);
    setApiError("");
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        const userInfo = localStorage.getItem('userInfo');
        let userEmail = '';
        if (userInfo) {
          const user = JSON.parse(userInfo);
          userEmail = user.email;
        }
        const res = await fetch("/api/send-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to, from, subject, message, userEmail }),
        });
        if (!res.ok) throw new Error("Failed to send feedback");
        setSubmitted(true);
        setTo(""); setFrom(""); setSubject(""); setMessage("");
      } catch (err) {
        setApiError("Failed to send feedback. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Feedback - Resume Tailor</title>
        <meta name="description" content="Get AI-powered feedback on your resume and improve your chances" />
      </Head>
      <Navbar userName={userName} />
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-100 via-white to-green-200 p-4">
        <div className="flex flex-1 flex-col md:flex-row items-center justify-center gap-8 w-full max-w-6xl mx-auto">
          {/* Animation on the left */}
          <div className="hidden md:flex w-1/2 items-center justify-center">
            <svg width="480" height="480" viewBox="0 0 480 480" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Notebook cover */}
              <rect x="40" y="40" width="400" height="400" rx="48" fill="#E6F4EA" stroke="#34A853" strokeWidth="6"/>
              {/* Notebook binding */}
              <rect x="70" y="70" width="28" height="340" rx="14" fill="#34A853" fillOpacity="0.2"/>
              {/* Animated flipping page */}
              <rect x="110" y="70" width="280" height="340" rx="28" fill="#fff">
                <animate attributeName="x" values="110;170;110" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite" />
              </rect>
              {/* Page lines */}
              <rect x="140" y="120" width="220" height="18" rx="6" fill="#34A853" fillOpacity="0.18"/>
              <rect x="140" y="160" width="180" height="12" rx="4" fill="#34A853" fillOpacity="0.3"/>
              <rect x="140" y="190" width="140" height="12" rx="4" fill="#34A853" fillOpacity="0.3"/>
              <rect x="140" y="220" width="200" height="12" rx="4" fill="#34A853" fillOpacity="0.2"/>
              <rect x="140" y="250" width="160" height="12" rx="4" fill="#34A853" fillOpacity="0.2"/>
              {/* Animated pulsing feedback icon */}
              <g>
                <circle cx="340" cy="110" r="32" fill="#34A853" opacity="0.7">
                  <animate attributeName="r" values="32;48;32" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <text x="340" y="122" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#fff">✉️</text>
              </g>
              {/* Animated sliding highlight bar */}
              <rect x="140" y="190" width="60" height="12" rx="4" fill="#34A853">
                <animate attributeName="x" values="140;320;140" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />
              </rect>
            </svg>
          </div>
          {/* Feedback form card on the right */}
          <div className="w-full md:w-1/2 max-w-lg bg-white/90 rounded-2xl shadow-lg p-8 border border-green-200">
            <h1 className="text-3xl font-bold mb-6 text-center text-green-700">Feedback</h1>
            {submitted ? (
              <div className="text-green-500 text-center font-semibold">Thank you for your feedback!</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-green-900 font-semibold mb-1">To (Email)</label>
                  <input
                    type="email"
                    className="w-full border border-green-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-base placeholder:text-green-300"
                    value={to}
                    onChange={e => setTo(e.target.value)}
                    placeholder="hammadshabbir507@gmail.com"
                  />
                  {errors.to && <div className="text-red-500 text-sm mt-1">{errors.to}</div>}
                </div>
                <div>
                  <label className="block text-green-900 font-semibold mb-1">From (Email)</label>
                  <input
                    type="email"
                    className="w-full border border-green-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-base placeholder:text-green-300"
                    value={from}
                    readOnly
                    onChange={e => setFrom(e.target.value)}
                    placeholder="Your email address"
                  />
                  {errors.from && <div className="text-red-500 text-sm mt-1">{errors.from}</div>}
                </div>
                <div>
                  <label className="block text-green-900 font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    className="w-full border border-green-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-base placeholder:text-green-300"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Subject of your feedback"
                  />
                  {errors.subject && <div className="text-red-500 text-sm mt-1">{errors.subject}</div>}
                </div>
                <div>
                  <label className="block text-green-900 font-semibold mb-1">Message</label>
                  <textarea
                    className="w-full border border-green-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-base placeholder:text-green-300 min-h-[120px]"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type your feedback here..."
                  />
                  {errors.message && <div className="text-red-500 text-sm mt-1">{errors.message}</div>}
                </div>
                {apiError && <div className="text-red-500 text-center font-medium">{apiError}</div>}
                <button
                  type="submit"
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold mt-2 text-lg transition-colors duration-200 disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Feedback"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default FeedbackPage; 

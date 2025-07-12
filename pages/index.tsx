import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FaArrowDown } from 'react-icons/fa';
import { useRouter } from 'next/router';

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
// Import your Lottie JSON animation (place your file in public/animation.json or similar)
import animationData from '../public/animation.json';

const LOGO_LETTERS = [
  { char: 'N', color: 'text-blue-500' },
  { char: 'E', color: 'text-blue-500' },
  { char: 'X', color: 'text-blue-500' },
  { char: 'I', color: 'text-blue-500' },
  { char: 'U', color: 'text-blue-500' },
  { char: 'M', color: 'text-blue-500' },
];

export default function LandingPage() {
  const [isExiting, setIsExiting] = useState(false);
  const [showLetters, setShowLetters] = useState([false, false, false, false, false, false]);
  const [showHeading, setShowHeading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Staggered reveal for each letter
    LOGO_LETTERS.forEach((_, i) => {
      setTimeout(() => {
        setShowLetters(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 200 * i);
    });
    // Show heading after last letter (0.2s * 6 + 0.3s buffer)
    setTimeout(() => setShowHeading(true), 200 * LOGO_LETTERS.length + 300);
  }, []);

  const handleStart = () => {
    setIsExiting(true);
    setTimeout(() => {
      router.push('/home');
    }, 700); // match animation duration
  };

  return (
    <div className={`min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-50 relative overflow-hidden transition-transform duration-700 ${isExiting ? '-translate-y-full' : ''}`}>
      {/* Animated Bubbles (no central blue one) */}
      <div className="absolute top-[-120px] left-[-80px] w-80 h-80 bg-blue-200 opacity-30 rounded-full filter blur-2xl z-0" />
      <div className="absolute top-1/4 right-[-100px] w-72 h-72 bg-blue-300 opacity-20 rounded-full filter blur-2xl z-0" />
      <div className="absolute bottom-[-100px] left-1/3 w-96 h-96 bg-blue-100 opacity-30 rounded-full filter blur-2xl z-0" />
      <div className="absolute bottom-20 right-1/4 w-60 h-60 bg-blue-400 opacity-20 rounded-full filter blur-2xl z-0" />
      {/* Sparkles */}
      <div className="absolute top-1/3 left-1/2 animate-sparkle z-10">
        <span className="block w-3 h-3 bg-blue-400 rounded-full opacity-70 animate-pulse"></span>
      </div>
      <div className="absolute bottom-1/4 right-1/3 animate-sparkle2 z-10">
        <span className="block w-2 h-2 bg-blue-500 rounded-full opacity-60 animate-pulse"></span>
      </div>
      <div className="absolute top-24 right-1/4 animate-sparkle3 z-10">
        <span className="block w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-pulse"></span>
      </div>
      <div className="absolute bottom-32 left-1/3 animate-sparkle4 z-10">
        <span className="block w-3 h-3 bg-blue-500 rounded-full opacity-70 animate-pulse"></span>
      </div>
      <div className="absolute top-1/4 right-20 animate-sparkle5 z-10">
        <span className="block w-1.5 h-1.5 bg-blue-300 rounded-full opacity-80 animate-pulse"></span>
      </div>
      {/* Centered Logo and Tagline */}
      <div className="flex flex-col items-center justify-center flex-1 z-20">
        <span className="text-5xl md:text-6xl font-extrabold tracking-widest bg-gradient-to-r from-blue-500 via-blue-700 to-blue-400 bg-clip-text text-transparent animate-gradient-x mb-4 flex">
          {LOGO_LETTERS.map((l, i) => (
            <span
              key={i}
              className={`inline-block ${l.color} transition-all duration-500 ease-out logo-drop-letter ${showLetters[i] ? 'logo-drop-in' : ''}`}
              style={{ transitionDelay: `${i * 0.2}s` }}
            >
              {l.char}
            </span>
          ))}
        </span>
        <h2 className={`text-2xl md:text-3xl font-semibold text-blue-700 mb-8 text-center max-w-xl transition-opacity duration-700 ${showHeading ? 'opacity-100' : 'opacity-0'}`}>
          AI Blog Summarizer & Urdu Translator
        </h2>
        {/* Lottie Animation (optional, can be added back if needed) */}
        {/* <div className="w-64 h-64 md:w-80 md:h-80 mb-8">
          <Lottie animationData={animationData} loop={true} />
        </div> */}
      </div>
      {/* Arrow Button (no bounce) */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-center z-30">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-6 shadow-lg focus:outline-none transition-all duration-200 flex flex-col items-center"
          onClick={handleStart}
        >
          <FaArrowDown className="text-3xl mb-1" />
          <span className="font-bold text-lg tracking-wide">Go to Main Page</span>
        </button>
      </div>
      {/* Extra animated gradient overlays */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-200 rounded-full opacity-30 animate-pulse-slow" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-300 rounded-full opacity-20 animate-pulse-slow" />
      </div>
      <style jsx global>{`
        .logo-drop-letter {
          opacity: 0;
          transform: translateY(-60px);
        }
        .logo-drop-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.5; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        @keyframes blob1 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.1); }
        }
        .animate-blob1 { animation: blob1 8s ease-in-out infinite; }
        @keyframes blob2 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(40px) scale(1.08); }
        }
        .animate-blob2 { animation: blob2 10s ease-in-out infinite; }
        @keyframes blob3 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        .animate-blob3 { animation: blob3 7s ease-in-out infinite; }
        @keyframes sparkle {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
        .animate-sparkle { animation: sparkle 2.5s infinite; }
        @keyframes sparkle2 {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-sparkle2 { animation: sparkle2 3.2s infinite; }
        @keyframes sparkle3 {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        .animate-sparkle3 { animation: sparkle3 2.8s infinite; }
        @keyframes sparkle4 {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        .animate-sparkle4 { animation: sparkle4 2.2s infinite; }
        @keyframes sparkle5 {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-sparkle5 { animation: sparkle5 3.5s infinite; }
      `}</style>
    </div>
  );
}

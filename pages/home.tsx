import React, { useState } from 'react';
import Head from 'next/head';
import AuthCard from '../components/AuthCard';

const Home = () => {
  const [mode, setMode] = useState<'login' | 'signup' | null>(null);

  return (
    <>
      <Head>
        <title>Login/Signup - Resume Tailor</title>
        <meta name="description" content="Login or sign up to access your resume builder dashboard" />
      </Head>
      <div className="min-h-screen flex bg-green-50">
      {/* Left side: larger animated SVG illustration */}
      <div className="hidden md:flex w-1/2 items-center justify-center">
        <div className="w-[90%] h-[90%] flex items-center justify-center">
          <svg width="100%" height="100%" viewBox="0 0 480 480" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="80" y="80" width="300" height="340" rx="40" fill="#E6F4EA" stroke="#34A853" strokeWidth="4"/>
            <rect x="120" y="130" width="220" height="38" rx="10" fill="#34A853" fillOpacity="0.18"/>
            <rect x="120" y="190" width="170" height="24" rx="6" fill="#34A853" fillOpacity="0.4"/>
            <rect x="120" y="230" width="200" height="24" rx="6" fill="#34A853" fillOpacity="0.4"/>
            <rect x="120" y="270" width="140" height="24" rx="6" fill="#34A853" fillOpacity="0.4"/>
            <rect x="120" y="310" width="200" height="24" rx="6" fill="#34A853" fillOpacity="0.2"/>
            <rect x="120" y="350" width="160" height="24" rx="6" fill="#34A853" fillOpacity="0.2"/>
            {/* Animated pulsing circle */}
            <circle cx="220" cy="150" r="20">
              <animate attributeName="r" values="20;32;20" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="fill" values="#34A853;#B7E4C7;#34A853" dur="1.5s" repeatCount="indefinite" />
            </circle>
            {/* Animated sliding highlight bar */}
            <rect x="120" y="230" width="60" height="24" rx="6" fill="#34A853">
              <animate attributeName="x" values="120;260;120" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />
            </rect>
          </svg>
        </div>
      </div>
      {/* Right side with card and soft green background shade */}
      <div className="flex flex-1 items-center justify-center relative">
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <div className={`${mode === 'signup' ? 'w-[450px] h-[500px]' : 'w-[420px] h-[420px]'} bg-green-100 rounded-3xl opacity-60 blur-2xl`} />
        </div>
        <div className={`w-full max-w-md ${mode === 'signup' ? 'h-[500px]' : 'h-[420px]'} flex flex-col justify-center p-6 rounded-3xl shadow-2xl bg-white z-10`}>
          {mode ? (
            <AuthCard mode={mode} setMode={setMode} />
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-6 text-center text-green-800">Resume Tailor</h1>
              <div className="flex flex-col gap-6">
                <button
                  className="bg-green-700 hover:bg-green-800 text-white font-semibold py-4 text-lg rounded-xl transition"
                  onClick={() => setMode('login')}
                >
                  Log In
                </button>
                <button
                  className="border border-green-700 text-green-700 hover:bg-green-50 font-semibold py-4 text-lg rounded-xl transition"
                  onClick={() => setMode('signup')}
                >
                  Sign Up
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default Home; 
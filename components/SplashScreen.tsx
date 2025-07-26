import React from 'react';

const Sparkle = ({ style, delay = '0s' }: { style: React.CSSProperties; delay?: string }) => (
  <svg
    style={{ ...style, animationDelay: delay }}
    className="absolute animate-sparkle"
    width="18"
    height="18"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="M10 2 L12 8 L18 10 L12 12 L10 18 L8 12 L2 10 L8 8 Z"
      fill="#34A853"
      fillOpacity="0.7"
    />
  </svg>
);

const SplashScreen: React.FC = () => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-green-50 transition-all duration-700 overflow-hidden">
    {/* Sparkles */}
    <div className="absolute inset-0 pointer-events-none">
      <Sparkle style={{ top: '18%', left: '22%' }} delay="0s" />
      <Sparkle style={{ top: '30%', left: '70%', transform: 'scale(0.7)' }} delay="0.5s" />
      <Sparkle style={{ top: '65%', left: '15%', transform: 'scale(0.5)' }} delay="1s" />
      <Sparkle style={{ top: '75%', left: '60%', transform: 'scale(0.8)' }} delay="0.3s" />
      <Sparkle style={{ top: '50%', left: '85%', transform: 'scale(0.6)' }} delay="1.2s" />
      <Sparkle style={{ top: '10%', left: '80%', transform: 'scale(0.5)' }} delay="0.8s" />
    </div>
    <svg className="animate-spin mb-6" width="64" height="64" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#34A853" strokeWidth="4" strokeDasharray="60" strokeDashoffset="20" />
    </svg>
    <h1 className="text-3xl font-extrabold text-green-700 tracking-wide">Resume Tailor</h1>
  </div>
);

export default SplashScreen; 
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';

const images = ['/resume.jpg', '/resume1.jpg', '/resume2.jpg', '/resume3.jpg', '/resume4.png', '/resume5.avif', '/resume6.avif'];

const Landing: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>Resume Tailor - Professional Resume Builder</title>
        <meta name="description" content="Create, customize, and manage your professional resumes with ease. Resume Tailor helps you stand out with beautiful, modern templates and effortless editing." />
      </Head>
      <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background slideshow */}
      {images.map((img, idx) => (
        <img
          key={img}
          src={img}
          alt={`Resume background ${idx + 1}`}
          className={`fixed inset-0 w-full h-full object-cover transition-opacity duration-1000 ${current === idx ? 'opacity-100' : 'opacity-0'}`}
          style={{ zIndex: 0 }}
        />
      ))}
      {/* Overlay for readability */}
      <div className="fixed inset-0 bg-black bg-opacity-40 z-10" />
      {/* Centered content */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-8 rounded-3xl mt-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 text-center drop-shadow-lg">Welcome to Resume Tailor</h1>
        <p className="text-lg md:text-xl text-white mb-8 text-center drop-shadow animate-fade-in delay-200">
          Create, customize, and manage your professional resumes with ease. Resume Tailor helps you stand out with beautiful, modern templates and effortless editing.
        </p>
        <Link href="/home" className="inline-block px-8 py-4 bg-green-700 text-white text-lg font-bold rounded-xl shadow-md hover:bg-green-800 transition transform hover:scale-105 animate-bounce">
          Get Started
        </Link>
      </div>
    </div>
    </>
  );
};

export default Landing; 
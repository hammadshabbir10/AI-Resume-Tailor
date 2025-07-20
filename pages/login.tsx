import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import LoginForm from '../components/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Login - Resume Tailor</title>
        <meta name="description" content="Login to your Resume Tailor account" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="w-full max-w-md p-8 rounded-3xl shadow-2xl bg-white">
          <h1 className="text-3xl font-bold mb-6 text-center text-green-800">Log In</h1>
          <LoginForm />
          <p className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-green-700 font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-gray-400">
            <Link href="/" className="hover:underline">Back to Home</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage; 
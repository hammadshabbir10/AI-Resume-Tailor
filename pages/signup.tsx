import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import SignupForm from '../components/SignupForm';

const SignupPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Sign Up - Resume Tailor</title>
        <meta name="description" content="Create your Resume Tailor account" />
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 py-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-green-800">Sign Up</h1>
          <Link href="/" className="text-green-700 hover:underline text-sm">
            ← Back to Home
          </Link>
        </div>
        <div className="w-full max-w-md p-16 rounded-3xl shadow-2xl bg-white">
          <SignupForm />
          <p className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-green-700 font-semibold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default SignupPage; 
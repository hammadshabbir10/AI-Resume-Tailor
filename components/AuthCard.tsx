import React from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

type AuthCardProps = {
  mode: 'login' | 'signup';
  setMode: (mode: 'login' | 'signup' | null) => void;
};

const AuthCard: React.FC<AuthCardProps> = ({ mode, setMode }) => {
  return (
    <div className="w-full max-w-md p-8 rounded-3xl shadow-2xl bg-white">
      {mode === 'login' ? (
        <>
          <h2 className="text-2xl font-bold mb-6 text-green-800 text-center">Log In</h2>
          <LoginForm />
          <p className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <button className="text-green-700 font-semibold hover:underline" onClick={() => setMode('signup')}>
              Sign Up
            </button>
          </p>
          <p className="mt-2 text-center text-xs text-gray-400">
            <button className="hover:underline" onClick={() => setMode(null)}>Back to Home</button>
          </p>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-6 text-green-800 text-center">Sign Up</h2>
          <SignupForm />
          <p className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <button className="text-green-700 font-semibold hover:underline" onClick={() => setMode('login')}>
              Log In
            </button>
          </p>
          <p className="mt-2 text-center text-xs text-gray-400">
            <button className="hover:underline" onClick={() => setMode(null)}>Back to Home</button>
          </p>
        </>
      )}
    </div>
  );
};

export default AuthCard; 
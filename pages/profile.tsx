import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setUser(user);
      setName(`${user.firstname || ''} ${user.lastname || ''}`.trim());
      setUserName(`${user.firstname || ''} ${user.lastname || ''}`.trim());
      setEmail(user.email);
    }
  }, []);

  const handleNameSave = async () => {
    setMessage(null); setError(null);
    try {
      const res = await fetch('/api/updateName', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update name');
      setMessage('Name updated successfully!');
      // Optionally update localStorage
      if (user) {
        const [firstname, ...rest] = name.split(' ');
        const lastname = rest.join(' ');
        const updatedUser = { ...user, firstname, lastname };
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setUserName(name);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePasswordSave = async () => {
    setMessage(null); setError(null);
    try {
      const res = await fetch('/api/changePassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      setMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <Head>
        <title>Profile - Resume Tailor</title>
        <meta name="description" content="Manage your profile and account settings" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        <Navbar userName={userName} />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-3xl shadow-2xl p-10 w-full max-w-2xl flex flex-col items-center">
            {/* Avatar */}
            <div className="w-24 h-24 bg-green-200 rounded-full flex items-center justify-center text-4xl font-bold text-green-800 mb-4 shadow">
              {userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
            </div>
            <h1 className="text-3xl font-extrabold text-green-800 mb-6 text-center">Profile</h1>
            {message && <div className="mb-4 text-green-700 font-semibold">{message}</div>}
            {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
            <div className="mb-8 w-full">
              <h2 className="font-semibold mb-2 text-lg text-green-700">Account Info</h2>
              <div className="mb-4"><b>Email Address</b><br />{email}</div>
              <div className="mb-4">
                <b>Change Name</b><br />
                <input
                  className="w-full border-2 border-green-200 rounded-lg p-3 mt-1 text-lg"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Full Name"
                />
                <button
                  className="mt-3 bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg text-lg font-semibold w-full"
                  onClick={handleNameSave}
                >
                  Save
                </button>
              </div>
            </div>
            <div className="w-full">
              <h2 className="font-semibold mb-2 text-lg text-green-700">Change Password</h2>
              <div className="mb-4">
                <label className="block text-sm">Current Password</label>
                <input
                  type="password"
                  className="w-full border-2 border-green-200 rounded-lg p-3 mt-1 text-lg"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm">New Password</label>
                <input
                  type="password"
                  className="w-full border-2 border-green-200 rounded-lg p-3 mt-1 text-lg"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <button
                className="mt-3 bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg text-lg font-semibold w-full"
                onClick={handlePasswordSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default ProfilePage; 
import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const client = await clientPromise;
    const db = client.db('UserAuth');
    const users = db.collection('Users');
    const user = await users.findOne({ email });
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'User does not exist. Please sign up first.' });
    }
    
    // Check if user is verified
    if (user.status !== 'active') {
      return res.status(401).json({ message: 'Please verify your email first' });
    }
    
    // Check password
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }
     const userInfo = {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email
    };

    // Return user data (excluding password)
    return res.status(200).json({ 
      message: 'Login successful',
      user: {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
} 
import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ message: 'Email and code are required' });
  }
  try {
    const client = await clientPromise;
    const db = client.db('UserAuth');
    const users = db.collection('Users');
    const user = await users.findOne({ email });
    if (!user || user.status !== 'pending') return res.status(400).json({ message: 'No pending verification for this email' });
    if (user.verificationCode !== code) return res.status(400).json({ message: 'Invalid code' });
    if (new Date() > new Date(user.verificationExpires)) return res.status(400).json({ message: 'Code expired' });
    await users.updateOne(
      { email },
      { $set: { status: 'active' }, $unset: { verificationCode: '', verificationExpires: '' } }
    );
    return res.status(200).json({ message: 'Email verified, profile created' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
} 
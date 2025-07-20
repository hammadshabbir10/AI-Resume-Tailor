import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const dbName = 'UserAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { email, currentPassword, newPassword } = req.body;
  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Email, current password, and new password are required' });
  }
  try {
    const client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const users = db.collection('Users');
    const user = await users.findOne({ email });
    if (!user) {
      client.close();
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.password !== currentPassword) {
      client.close();
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    await users.updateOne({ email }, { $set: { password: newPassword } });
    client.close();
    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to change password' });
  }
} 
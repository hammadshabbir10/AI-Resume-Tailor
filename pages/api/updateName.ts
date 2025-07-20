import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const dbName = 'UserAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { email, name } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }
  try {
    const client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const users = db.collection('Users');
    const [firstname, ...rest] = name.split(' ');
    const lastname = rest.join(' ');
    const result = await users.updateOne(
      { email },
      { $set: { firstname, lastname } }
    );
    client.close();
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update name' });
  }
} 
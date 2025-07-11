import { MongoClient } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next';

const uri = process.env.MONGODB_URI!;
let client;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { blogText } = req.body;
    try {
      const client = await clientPromise;
      const db = client.db('Blogs');
      const collection = db.collection('Fulltexts');
      const result = await collection.insertOne({ blogText, createdAt: new Date() });
      return res.status(200).json({ insertedId: result.insertedId });
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message || 'Unknown error' });
    }
  }
  res.status(405).json({ error: 'Method not allowed' });
}
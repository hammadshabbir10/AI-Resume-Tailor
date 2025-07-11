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
  if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db('Blogs');
      const collection = db.collection('BlogSummaries');
      const blogs = await collection.find({}).sort({ createdAt: -1 }).toArray();
      const formatted = blogs.map((b: any) => ({
        id: b._id.toString(),
        blogText: b.blogText,
        summary: b.summary,
        urdu: b.urdu,
        createdAt: b.createdAt,
      }));
      return res.status(200).json({ blogs: formatted });
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message || 'Unknown error' });
    }
  }
  res.status(405).json({ error: 'Method not allowed' });
} 
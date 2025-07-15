import { MongoClient } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

const options = {
  serverSelectionTimeoutMS: 5000, // 5 seconds timeout
  socketTimeoutMS: 30000, // 30 seconds socket timeout
};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development, reuse connection
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create new connection per request
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('Blogs');
    const collection = db.collection('Fulltexts');
    
    const { blogText } = req.body;
    const result = await collection.insertOne({ 
      blogText, 
      createdAt: new Date() 
    });

    return res.status(200).json({ insertedId: result.insertedId });
  } catch (error) {
    console.error('MongoDB Error:', error);
    return res.status(500).json({ 
      error: 'Failed to save to database',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

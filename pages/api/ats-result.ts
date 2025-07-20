import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { userEmail, cvName, atsScore, report, createdAt } = req.body;
    if (!userEmail || !cvName || typeof atsScore !== 'number' || !report) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const client = await clientPromise;
    const db = client.db('ai_resume_tailor');
    const result = await db.collection('ats_results').insertOne({
      userEmail,
      cvName,
      atsScore,
      report,
      createdAt: createdAt ? new Date(createdAt) : new Date()
    });
    res.status(201).json({ success: true, id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save ATS result' });
  }
} 
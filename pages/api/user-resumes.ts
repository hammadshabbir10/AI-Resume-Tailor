import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const client = await clientPromise;
  const db = client.db('ai_resume_tailor');

  const dashboardResumes = await db.collection('ownresume').find({ userEmail: email }).toArray();
  const generatedResumes = await db.collection('generated_resumes').find({ userEmail: email }).toArray();

  res.json({
    resumes: [...dashboardResumes, ...generatedResumes]
  });
} 
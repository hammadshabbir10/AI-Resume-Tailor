import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const client = await clientPromise;
  const db = client.db('ai_resume_tailor');

  const ownResumes = await db.collection('ownresume').countDocuments({ userEmail: email });
  const generatedResumes = await db.collection('generated_resumes').countDocuments({ userEmail: email });
  const atsChecks = await db.collection('ats_results').countDocuments({ userEmail: email });
  const totalActivities = ownResumes + generatedResumes + atsChecks;

  res.json({
    resumesCreated: ownResumes + generatedResumes,
    pdfsUploaded:  atsChecks,
    totalActivities
  });
} 
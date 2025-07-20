import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/db';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    try {
      const client = await clientPromise;
      const db = client.db('ai_resume_tailor'); // Use the correct DB name
      const result = await db.collection('ownresume').deleteOne({ _id: new ObjectId(id as string) });
      if (result.deletedCount === 1) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(404).json({ error: 'Resume not found' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete resume' });
    }
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { userEmail, jobTitle, candidateName, resumeText, createdAt } = req.body;
    if (!userEmail || !jobTitle || !candidateName || !resumeText) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const client = await clientPromise;
    const db = client.db('ai_resume_tailor');
    const resumeToSave = typeof resumeText === 'string' ? JSON.parse(resumeText) : resumeText;
    const result = await db.collection('ownresume').insertOne({
      userEmail,
      jobTitle,
      candidateName,
      resumeText: resumeToSave,
      createdAt: createdAt ? new Date(createdAt) : new Date()
    });
    res.status(201).json({ success: true, id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save dashboard-created resume' });
  }
} 
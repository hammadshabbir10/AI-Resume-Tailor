import type { NextApiRequest, NextApiResponse } from 'next';
import translateToUrdu from '../../lib/urduDictionary';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { text } = req.body;
    if (typeof text !== 'string') {
      return res.status(400).json({ error: 'Text must be a string' });
    }
    const urdu = translateToUrdu(text);
    res.status(200).json({ urdu });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
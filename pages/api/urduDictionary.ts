import type { NextApiRequest, NextApiResponse } from 'next';
import translateToUrdu from '../../lib/urduDictionary';

async function translateWithGemini(text: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing Gemini API key');
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Translate the following text to Urdu. Only return the Urdu translation, no explanation or transliteration.\n\n${text}`,
              },
            ],
          },
        ],
      }),
    }
  );
  if (!response.ok) {
    const error = await response.text();
    console.error('Gemini API error response:', error);
    throw new Error(`Gemini API error: ${error}`);
  }
  const data = await response.json();
  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
    'No Urdu translation generated.'
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { text } = req.body;
    if (typeof text !== 'string') {
      return res.status(400).json({ error: 'Text must be a string' });
    }
    try {
      const urdu = await translateWithGemini(text);
      res.status(200).json({ urdu });
    } catch (err) {
      // Fallback to dictionary if Gemini fails
      const urdu = translateToUrdu(text);
      res.status(200).json({ urdu, fallback: true });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
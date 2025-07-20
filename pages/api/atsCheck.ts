import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import { supabase } from '../../lib/supabaseClient';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function parseForm(req: NextApiRequest): Promise<{ file: formidable.File }> {
    return new Promise((resolve, reject) => {
      const form = formidable({ multiples: false });
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        let file = files.resume as formidable.File | formidable.File[] | undefined;
        if (Array.isArray(file)) file = file[0];
        if (!file) return reject(new Error('No file uploaded'));
        resolve({ file });
      });
    });
  }
// Accept Buffer or string

async function extractTextFromPDF(input: Buffer | string): Promise<string> {
  let data;
  if (typeof input === 'string') {
    // input is a file path, read as buffer
    data = await pdfParse(fs.readFileSync(input));
  } else {
    // input is already a buffer
    data = await pdfParse(input);
  }
  return data.text;
}

async function getAtsReport(text: string): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini API key not set');
  const prompt = `
You are an ATS (Applicant Tracking System) resume checker. Analyze the following resume text for:
- Spelling and grammar errors (deduct score for 2 errors)
- Repeated words or phrases (deduct score for 2 keyword stuffing)
- Presence of all key sections: skills, education, experience, projects (deduct score for missing sections)
- Recognize section headings even if synonyms are used (e.g., "Core Skills", "Personal Projects", "Work Experience", etc.)
- Skill/keyword match (list found and missing skills)
- Formate check like bullet points, line breaks, and clear paragraph etc.
- Check Quantifying things included or not if not deduct score a little.
- Overall ATS score out of 100
- Suggestions for improvement

Return a JSON object with:
- score
- errors (list)
- repeatedWords (list)
- missingSections (list)
- foundSkills (list)
- missingSkills (list)
- suggestions (list)
- summary (string)

Resume Text:
${text}
`;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  const data = await response.json();
  // Robustly extract JSON from Gemini's response
  let raw = data.candidates[0].content.parts[0].text.trim();
  if (raw.startsWith('```json')) {
    raw = raw.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (raw.startsWith('```')) {
    raw = raw.replace(/^```/, '').replace(/```$/, '').trim();
  }
  let json = null;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error('Gemini did not return valid JSON');
  }
  return json;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    let text = '';
    let cvName = 'uploaded_cv.pdf'; // default

    if (req.headers['content-type']?.includes('application/json')) {
      // Manually parse JSON body
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      req.body = JSON.parse(Buffer.concat(buffers).toString());
      // Handle base64 PDF from JSON
      const { base64, fileName } = req.body;
      if (!base64) throw new Error('No PDF data provided');
      let base64Data = base64;
      if (base64.startsWith('data:')) {
        base64Data = base64.split(',')[1];
      }
      if (!base64Data) throw new Error('Invalid base64 PDF data');
      const buffer = Buffer.from(base64Data, 'base64');
      // Check PDF signature
      if (buffer.slice(0, 4).toString() !== '%PDF') {
        throw new Error('Uploaded file is not a valid PDF');
      }
      text = await extractTextFromPDF(buffer);
      if (fileName) cvName = fileName; // Use provided file name if available
    } else {
      // Handle file upload (multipart/form-data)
      const { file } = await parseForm(req);
      const filePath = file.filepath;
      if (!filePath) throw new Error('File path not found');
      const fileBuffer = require('fs').readFileSync(filePath);
      if (fileBuffer.slice(0, 4).toString() !== '%PDF') {
        throw new Error('Uploaded file is not a valid PDF');
      }
      text = await extractTextFromPDF(filePath);
      if (file.originalFilename) cvName = file.originalFilename;
    }

    const report = await getAtsReport(text);

    // Store in Supabase
    const { score } = report;
    const { error } = await supabase
      .from('AtsChecker')
      .insert([
        {
          cvName,      // varchar column
          atsScore: score // numeric column
          // createdAt will be set automatically if your table has a default value
        }
      ]);
    if (error) {
      console.error('Supabase insert error:', error);
      // Optionally, you can still return the report, but indicate DB error
      return res.status(200).json({ ...report, dbError: 'Failed to save ATS result' });
    }

    res.status(200).json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to analyze resume' });
  }
}
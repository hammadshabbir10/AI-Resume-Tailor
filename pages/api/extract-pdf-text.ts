import type { NextApiRequest, NextApiResponse } from 'next';
import pdf from 'pdf-parse';

// Disable the default body parser for this route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { pdfData } = req.body;
    console.log('Received PDF data, array length:', pdfData?.length);

    if (!pdfData || !Array.isArray(pdfData)) {
      return res.status(400).json({ success: false, error: 'Invalid PDF data' });
    }

    // Convert array back to Buffer
    const pdfBuffer = Buffer.from(pdfData);
    console.log('PDF buffer size:', pdfBuffer.length);

    // Validate PDF signature
    const pdfHeader = pdfBuffer.toString('ascii', 0, 5);
    console.log('PDF header:', pdfHeader);
    
    if (pdfHeader !== '%PDF-') {
      return res.status(400).json({ success: false, error: 'Invalid PDF file' });
    }

    // Extract text from PDF
    const data = await pdf(pdfBuffer);
    const text = data.text;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'No text found in PDF' });
    }

    res.status(200).json({ 
      success: true, 
      text: text.trim(),
      pages: data.numpages,
      info: data.info
    });

  } catch (error) {
    console.error('PDF extraction error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to extract text from PDF' 
    });
  }
} 
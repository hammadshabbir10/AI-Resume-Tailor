import type { NextApiRequest, NextApiResponse } from 'next';
import { PDFDocument, PDFPage, rgb, StandardFonts } from 'pdf-lib';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { originalPdfData, tailoredText, jobTitle } = req.body;

    if (!originalPdfData || !tailoredText) {
      return res.status(400).json({ 
        success: false, 
        error: 'Original PDF data and tailored text are required' 
      });
    }

    // Load the original PDF
    const pdfBuffer = Buffer.from(originalPdfData);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();

    // Embed fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Get the first page
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    // Add job title at the top if provided
    if (jobTitle) {
      firstPage.drawText(`Tailored for: ${jobTitle}`, {
        x: 50,
        y: height - 30,
        size: 12,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2),
      });
    }

    // Serialize the modified PDF
    const pdfBytes = await pdfDoc.save();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="tailored-cv-${jobTitle?.replace(/\s+/g, '-').toLowerCase() || 'resume'}.pdf"`);
    
    res.status(200).send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('PDF modification error:', error);
    res.status(500).json({ 
      success: false, 
      error: `Failed to modify PDF: ${error instanceof Error ? error.message : 'Unknown error'}` 
    });
  }
} 
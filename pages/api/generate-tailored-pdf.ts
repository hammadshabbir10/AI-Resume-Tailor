import type { NextApiRequest, NextApiResponse } from 'next';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { supabase } from '../../lib/supabaseClient';
import type { PDFPage, PDFFont, Color } from 'pdf-lib';

function cleanResumeText(text: string): string {
  const symbolMap: Record<string, string> = {
    '': '📞', '': '📞', '📱': '📞',
    '': '✉️', '✉': '✉️', '📧': '✉️',
    '': '🔗', '🔗': '🔗', '🌐': '🔗',
    '': '📍', '📍': '📍', '🏠': '📍',
    '®': '(R)', '©': '(C)', '™': '(TM)',
    '•': '•', '◦': '•', '▪': '•', '‣': '•', '⁃': '•',
    '→': '->', '⇒': '=>', '↦': '->', '↔': '<->',
    '✓': '[✓]', '✔': '[✓]', '☑': '[✓]',
    '☆': '*', '★': '*', '✩': '*', '✪': '*',
    '…': '...', '–': '-', '—': '-', '±': '+/-',
    '': '[YouTube]', '': '[Twitter]', '': '[GitHub]'
  };

  let cleaned = text;
  for (const [symbol, replacement] of Object.entries(symbolMap)) {
    cleaned = cleaned.replace(new RegExp(symbol, 'g'), replacement);
  }

  return cleaned.replace(/[^\x20-\x7E\u00A0-\u00FF\u0100-\u017F\u0180-\u024F\s\.,;:!?@#\$%&\*\(\)\-_\+=\[\]\{\}\|\\'"<>\/]/g, '');
}

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
    const { tailoredCV, jobTitle, candidateName } = req.body;

    if (!tailoredCV) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tailored CV text is required' 
      });
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();

    // Embed the standard font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Set up text formatting
    const fontSize = 12;
    const lineHeight = fontSize * 1.2;
    const margin = 50;
    let yPosition = height - margin;

    // Remove the "Tailored for:" title - start directly with content

    // Parse the tailored CV text and format it properly
    const cleanedCV = cleanResumeText(tailoredCV);
    const sections = cleanedCV.split('\n\n').filter((section: string) => section.trim());
    let currentPage = page;
    let isFirstLine = true;
    let inProjectsSection = false;
    
    for (const section of sections) {
      const lines = section.split('\n').filter((line: string) => line.trim());
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (yPosition < margin + 50) {
          currentPage = pdfDoc.addPage([595.28, 841.89]);
          yPosition = height - margin;
        }
        let currentFont = font;
        let currentSize = fontSize;
        let currentColor = rgb(0, 0, 0);
        // Main headings
        const isMainHeading = line.length < 50 && (
          /^education$/i.test(line.trim()) ||
          /^working\s+experience$/i.test(line.trim()) ||
          /^core\s+skills$/i.test(line.trim()) ||
          /^projects$/i.test(line.trim()) ||
          /^languages$/i.test(line.trim()) ||
          /^certificates$/i.test(line.trim())
        );
        // Detect entering/exiting Projects section
        if (/^projects$/i.test(line.trim())) {
          inProjectsSection = true;
        } else if (isMainHeading && !/^projects$/i.test(line.trim())) {
          inProjectsSection = false;
        }
        // Only bold the first line (name) and main headings
        if (isFirstLine || isMainHeading) {
          currentFont = boldFont;
          currentSize = 16;
          currentColor = rgb(0, 0, 0);
          if (isFirstLine) {
            yPosition -= 5;
          } else {
            yPosition -= 15;
            // Add extra space after main heading
            yPosition -= lineHeight;
          }
        }
        // Project subheading: in Projects section, contains '|' and not a main heading
        const isProjectSubheading = inProjectsSection && line.includes('|') && !isMainHeading;
        if (isProjectSubheading) {
          // Draw the project subheading (not bold)
          wrapAndDrawText(currentPage, line, font, fontSize, currentColor, margin, width, yPosition, lineHeight);
          yPosition -= lineHeight + 5;
          continue;
        }
        // Contact info
        if (line.includes('@') || line.includes('linkedin.com')) {
          currentSize = 11;
          currentColor = rgb(0.3, 0.3, 0.3);
        }
        // Bullet point
        if (line.startsWith('•') || line.startsWith('-')) {
          currentSize = 11;
          yPosition -= 8;
        }
        // Separator line
        if (line.includes('--------------------------------------------------------------------------------------------------------------------------------------------------------------------')) {
          yPosition -= 15;
          continue;
        }
        // Draw the line with improved wrapping
        yPosition = wrapAndDrawText(currentPage, line, currentFont, currentSize, currentColor, margin, width, yPosition, lineHeight);
        // Add extra space after sections (but not before the very first content)
        if ((isFirstLine || isMainHeading) && i === 0 && !isFirstLine) {
          yPosition -= 15;
        }
        isFirstLine = false;
      }
      // Add more space between sections
      yPosition -= 20;
    }

    // Save to Supabase GenerateResume table
    if (jobTitle && candidateName) {
      const { error } = await supabase
        .from('GenerateResume')
        .insert([
          {
            Jobtitle: jobTitle,
            candidateName: candidateName
            // createdAt will be set automatically if your table has a default value
          }
        ]);
      if (error) {
        console.error('Supabase insert error (GenerateResume):', error);
        // Optionally, you can add a field to the response to indicate DB error
      }
    }

    // Serialize the PDF
    const pdfBytes = await pdfDoc.save();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="tailored-cv-${jobTitle?.replace(/\s+/g, '-').toLowerCase() || 'resume'}.pdf"`);
    
    res.status(200).send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
} 

function wrapAndDrawText(
  page: PDFPage,
  text: string,
  font: PDFFont,
  fontSize: number,
  color: Color,
  margin: number,
  pageWidth: number,
  yPosition: number,
  lineHeight: number
): number {
  const maxWidth = pageWidth - 2 * margin;
  const words = text.split(' ');
  let currentLine = '';
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const textWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (textWidth > maxWidth && currentLine) {
      page.drawText(currentLine, {
        x: margin,
        y: yPosition,
        size: fontSize,
        font: font,
        color: color,
      });
      yPosition -= lineHeight;
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    page.drawText(currentLine, {
      x: margin,
      y: yPosition,
      size: fontSize,
      font: font,
      color: color,
    });
    yPosition -= lineHeight;
  }
  return yPosition;
} 
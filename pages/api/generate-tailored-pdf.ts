import type { NextApiRequest, NextApiResponse } from 'next';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { supabase } from '../../lib/supabaseClient';

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
    const sections = tailoredCV.split('\n\n').filter((section: string) => section.trim());
    let currentPage = page;
    
    for (const section of sections) {
      const lines = section.split('\n').filter((line: string) => line.trim());
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Check if we need a new page
        if (yPosition < margin + 50) {
          // Add new page if needed
          currentPage = pdfDoc.addPage([595.28, 841.89]);
          yPosition = height - margin;
        }

        // Determine font size and style based on content
        let currentFont = font;
        let currentSize = fontSize;
        let currentColor = rgb(0, 0, 0);
        
        // Check if this is a main heading (only major section headers)
        const isMainHeading = line.length < 50 && (
          // Only the main structural sections
          /^education$/i.test(line.trim()) ||
          /^working\s+experience$/i.test(line.trim()) ||
          /^core\s+skills$/i.test(line.trim()) ||
          /^projects$/i.test(line.trim()) ||
          /^languages$/i.test(line.trim()) ||
          /^certificates$/i.test(line.trim())
        );
        
        // Check if this is a name line (detect common name patterns)
        const isName = line.length < 50 && 
          !line.includes('@') && 
          !line.includes('linkedin.com') && 
          !line.includes('|') && 
          !line.includes('•') && 
          !line.includes('-') && 
          !line.includes('Undergraduate') &&
          !line.includes('Bachelor') &&
          !line.includes('Master') &&
          !line.includes('PhD') &&
          !line.includes('Degree') &&
          !line.includes('Diploma') &&
          !line.includes('Certificate') &&
          !line.includes('Experience') &&
          !line.includes('Skills') &&
          !line.includes('Projects') &&
          !line.includes('Education') &&
          !line.includes('Languages') &&
          !line.includes('Certificates') &&
          // Check if it looks like a name (contains letters and spaces, no numbers)
          /^[A-Za-z\s]+$/.test(line.trim()) &&
          // Must have at least 2 words (first and last name)
          line.trim().split(/\s+/).length >= 2;
        
        if (isMainHeading || isName) {
          currentFont = boldFont;
          currentSize = 14;
          currentColor = rgb(0, 0, 0);
          if (isName) {
            yPosition -= 5; // Less space before name
          } else {
            yPosition -= 15; // Space before main headings
          }
        }
        
        // Check if this is a name/title line
        if (line.includes('@') || line.includes('linkedin.com') || line.includes('|')) {
          currentSize = 11;
          currentColor = rgb(0.3, 0.3, 0.3);
        }
        
        // Check if this is a name line (no special characters, just name)
        if (line.length < 30 && !line.includes('@') && !line.includes('linkedin.com') && !line.includes('|') && !line.includes('•') && !line.includes('-')) {
          currentSize = 14;
          currentFont = boldFont;
          currentColor = rgb(0, 0, 0);
          yPosition -= 15; // Extra space before name
        }
        
        // Check if this is a bullet point
        if (line.startsWith('•') || line.startsWith('-')) {
          currentSize = 11;
          yPosition -= 8; // More space for bullet points
        }
        
        // Check if this is a separator line (long dashes)
        if (line.includes('--------------------------------------------------------------------------------------------------------------------------------------------------------------------')) {
          yPosition -= 15; // Space for separators
          continue; // Skip drawing separator lines
        }
        
        // Handle long lines by wrapping
        if (line.length > 80) {
          const words = line.split(' ');
          let currentLine = '';
          
          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const textWidth = currentFont.widthOfTextAtSize(testLine, currentSize);
            
            if (textWidth > width - 2 * margin) {
              if (currentLine) {
                // Check if we need a new page before drawing
                if (yPosition < margin + 50) {
                  currentPage = pdfDoc.addPage([595.28, 841.89]);
                  yPosition = height - margin;
                }
                
                currentPage.drawText(currentLine, {
                  x: margin,
                  y: yPosition,
                  size: currentSize,
                  font: currentFont,
                  color: currentColor,
                });
                
                // Add extra spacing for wrapped text
                if (isMainHeading || isName) {
                  yPosition -= lineHeight + 5; // Less space after main headings and name
                } else if (currentLine.startsWith('•') || currentLine.startsWith('-')) {
                  yPosition -= lineHeight + 2;
                } else if (currentLine.length > 100) {
                  yPosition -= lineHeight + 4;
                } else if (currentLine.includes('@') || currentLine.includes('linkedin.com') || currentLine.includes('|')) {
                  yPosition -= lineHeight + 1;
                } else {
                  yPosition -= lineHeight + 2;
                }
                currentLine = word;
              } else {
                // Single word is too long, draw it anyway
                if (yPosition < margin + 50) {
                  currentPage = pdfDoc.addPage([595.28, 841.89]);
                  yPosition = height - margin;
                }
                
                currentPage.drawText(word, {
                  x: margin,
                  y: yPosition,
                  size: currentSize,
                  font: currentFont,
                  color: currentColor,
                });
                
                // Add extra spacing for long words
                if (isMainHeading || isName) {
                  yPosition -= lineHeight + 5; // Less space after main headings and name
                } else if (word.length > 100) {
                  yPosition -= lineHeight + 4;
                } else {
                  yPosition -= lineHeight + 2;
                }
              }
            } else {
              currentLine = testLine;
            }
          }
          
          if (currentLine) {
            // Check if we need a new page before drawing
            if (yPosition < margin + 50) {
              currentPage = pdfDoc.addPage([595.28, 841.89]);
              yPosition = height - margin;
            }
            
            currentPage.drawText(currentLine, {
              x: margin,
              y: yPosition,
              size: currentSize,
              font: currentFont,
              color: currentColor,
            });
            
            // Add extra spacing for final line
            if (isMainHeading || isName) {
              yPosition -= lineHeight + 5; // Less space after main headings and name
            } else if (currentLine.startsWith('•') || currentLine.startsWith('-')) {
              yPosition -= lineHeight + 2;
            } else {
              yPosition -= lineHeight + 2;
            }
          }
        } else {
          // Check if we need a new page before drawing
          if (yPosition < margin + 50) {
            currentPage = pdfDoc.addPage([595.28, 841.89]);
            yPosition = height - margin;
          }
          
                  // Draw the line as is
        currentPage.drawText(line, {
          x: margin,
          y: yPosition,
          size: currentSize,
          font: currentFont,
          color: currentColor,
        });
        
        // Add extra spacing based on content type
        if (isMainHeading || isName) {
          yPosition -= lineHeight + 5; // Less space after main headings and name
        } else if (line.startsWith('•') || line.startsWith('-')) {
          yPosition -= lineHeight + 2; // Less space after bullet points
        } else if (line.length > 100) {
          // This is likely a paragraph/bio - add more space
          yPosition -= lineHeight + 4;
        } else if (line.includes('@') || line.includes('linkedin.com') || line.includes('|')) {
          // Contact info - less space
          yPosition -= lineHeight + 1;
        } else {
          yPosition -= lineHeight + 2; // Less spacing overall
        }
        }
        
                  // Add extra space after sections (but not before the very first content)
          if ((isMainHeading || isName) && i === 0 && !isName) {
            yPosition -= 15; // More space before first heading (but not before name)
          }
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
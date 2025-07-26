import type { NextApiRequest, NextApiResponse } from 'next';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

// Function to clean text of unsupported characters
function cleanResumeText(text: string): string {
  // Replace common special characters with text equivalents
  const replacements: Record<string, string> = {
    '': 'Phone:', // phone icon
    '': 'Email:', // email icon
    '': 'LinkedIn:', // link icon
    '': 'Location:', // location icon
    '•': '-',       // bullet point
  };

  let cleaned = text;
  for (const [char, replacement] of Object.entries(replacements)) {
    cleaned = cleaned.replace(new RegExp(char, 'g'), replacement);
  }

  // Remove any remaining non-printable characters
  return cleaned.replace(/[^\x20-\x7E\u00A0-\u00FF\u0100-\u017F\u0180-\u024F]/g, '');
}

async function getProfessionalResumeText(resume: any): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini API key not set');

  const educationArr = Array.isArray(resume.education) ? resume.education : [];
  const projectsArr = Array.isArray(resume.projects) ? resume.projects : [];
  const experienceArr = Array.isArray(resume.experience) ? resume.experience : [];

  const prompt = `
Create a professional resume for the following person. Use clear sections for Summary, Skills, Education, Projects, and Experience, and add a line (--------------------) to separate each section. Use all provided fields. Do not invent content.

Name: ${resume.name}
Email: ${resume.email}
Phone: ${resume.phone}
City: ${resume.city}
Country: ${resume.country}
${resume.linkedin ? `LinkedIn: ${resume.linkedin}` : ''}
${resume.github ? `GitHub: ${resume.github}` : ''}

--------------------
Summary:
${resume.summary}
--------------------
Skills:
${resume.skills}
--------------------
Education:
${educationArr.map((edu: any) => 
  `Degree: ${edu.degree}
  School: ${edu.school}
  City: ${edu.city}
  Country: ${edu.country}
  Graduation Date: ${edu.graduationDate}
  ${edu.cgpa ? `CGPA: ${edu.cgpa}` : ''}
  ${edu.coursework ? `Coursework: ${edu.coursework}` : ''}`
).join('\n--------------------\n')}
--------------------
Projects:
${projectsArr.length > 0 ? projectsArr.map((proj: any) => 
  `Project Title: ${proj.title}
  Technologies Used: ${proj.technologies}
  Description: ${proj.description}`
).join('\n--------------------\n') : 'None'}
--------------------
Experience:
${experienceArr.map((exp: any) => 
  `Role: ${exp.role}
  Company: ${exp.company}
  City: ${exp.city}
  Country: ${exp.country}
  Start Date: ${exp.startDate}
  End Date: ${exp.endDate}
  Description: ${exp.description}`
).join('\n--------------------\n')}
--------------------
`;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  
  const data = await response.json();
  if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
    throw new Error('Gemini API did not return expected output');
  }
  
  return cleanResumeText(data.candidates[0].content.parts[0].text);
}

async function generatePdfFromText(text: string): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    
    let page = pdfDoc.addPage([595, 842]); // A4 size
    
    // Try to load a custom font, fall back to standard font
    let font;
    try {
      // In a real app, load your custom font here
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    } catch (e) {
      console.warn('Failed to load custom font, using standard font');
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }
    
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 12;
    const headingSize = 16;
    const maxWidth = 495; // 595 - 2*50 margin

    const wrapText = (text: string, fontObj: any, size: number) => {
      const words = text.split(' ');
      let lines: string[] = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const width = fontObj.widthOfTextAtSize(testLine, size);
        
        if (width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      
      if (currentLine) lines.push(currentLine);
      return lines;
    };

    let y = 800;
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) {
        y -= 12;
        continue;
      }

      // Check for new page
      if (y < 50) {
        page = pdfDoc.addPage([595, 842]);
        y = 800;
      }

      // Section headers
      if (trimmedLine.startsWith('---')) {
        y -= 8;
        page.drawLine({
          start: { x: 50, y },
          end: { x: 545, y },
          thickness: 1,
          color: rgb(0.7, 0.7, 0.7),
        });
        y -= 24;
        continue;
      }

      // Headings
      const isHeading = [
        'Summary:', 'Skills:', 'Education:', 
        'Projects:', 'Experience:', 'Certifications:'
      ].some(h => trimmedLine.startsWith(h));
      
      if (isHeading) {
        page.drawText(trimmedLine, {
          x: 50,
          y,
          size: headingSize,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
        y -= 28;
        continue;
      }

      // Regular text
      const wrappedLines = wrapText(trimmedLine, font, fontSize);
      for (const wrappedLine of wrappedLines) {
        if (y < 50) {
          page = pdfDoc.addPage([595, 842]);
          y = 800;
        }
        
        page.drawText(wrappedLine, {
          x: 50,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
        y -= 20;
      }
    }

    return await pdfDoc.save();
  } catch (err) {
    console.error('PDF generation error:', err);
    throw new Error('Failed to generate PDF from text');
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const resume = req.body;
    let resumeObj = resume;
    
    if (typeof resume.resumeText === 'string') {
      try {
        resumeObj = JSON.parse(resume.resumeText);
      } catch {
        resumeObj = resume;
      }
    } else if (typeof resume.resumeText === 'object') {
      resumeObj = resume.resumeText;
    }

    const resumeText = await getProfessionalResumeText(resumeObj);
    const pdfBytes = await generatePdfFromText(resumeText);
    
    const jobTitle = resumeObj.jobTitle?.trim() || resume.jobTitle?.trim() || '';
    const name = resumeObj.name?.trim() || resume.candidateName?.trim() || resume.name?.trim() || '';
    
    const fileName = `resume-${jobTitle ? jobTitle.replace(/\s+/g, '-').toLowerCase() : 
      name ? name.replace(/\s+/g, '-').toLowerCase() : 'download'}`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
    res.status(200).send(Buffer.from(pdfBytes));
    
  } catch (err) {
    console.error('Error in generateResumePdf:', err);
    res.status(500).json({ 
      error: 'Failed to generate PDF', 
      details: (err as Error).message 
    });
  }
}
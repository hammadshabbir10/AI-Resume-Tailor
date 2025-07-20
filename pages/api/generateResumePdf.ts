import type { NextApiRequest, NextApiResponse } from 'next';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

async function getProfessionalResumeText(resume: any): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini API key not set');

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
${resume.education.map((edu: any, i: number) => 
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
${resume.projects && resume.projects.length > 0 ? resume.projects.map((proj: any, i: number) => 
  `Project Title: ${proj.title}
  Technologies Used: ${proj.technologies}
  Description: ${proj.description}`
).join('\n--------------------\n') : 'None'}
--------------------
Experience:
${resume.experience.map((exp: any, i: number) => 
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

  // Call Gemini API (Google Generative Language API)
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
  return data.candidates[0].content.parts[0].text;
}

async function generatePdfFromText(text: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontSize = 14;
  const headingSize = 18;
  const maxWidth = 495; // 595 - 2*50 margin

  const wrapText = (text: string, fontObj: any, size: number) => {
    const words = text.split(' ');
    let lines: string[] = [];
    let currentLine = '';
    for (let word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
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
  for (let line of lines) {
    line = line.trim();
    if (!line) {
      y -= 12;
      continue;
    }
    // Headings
    if (line.startsWith('### ')) {
      const heading = line.replace(/^### /, '');
      page.drawText(heading, { x: 50, y, size: headingSize, font: boldFont, color: rgb(0, 0, 0) });
      y -= 28;
      continue;
    }
    // Bold
    if (line.startsWith('**') && line.endsWith('**')) {
      const boldText = line.replace(/\*\*/g, '');
      const wrapped = wrapText(boldText, boldFont, fontSize);
      for (const w of wrapped) {
        page.drawText(w, { x: 50, y, size: fontSize, font: boldFont, color: rgb(0, 0, 0) });
        y -= 20;
      }
      continue;
    }
    // Section separator
    if (line.startsWith('---------------------------------------------------------------------')) {
      y -= 8;
      page.drawText('---------------------------------------------------------------------', { x: 50, y, size: fontSize, font, color: rgb(0.5, 0.5, 0.5) });
      y -= 32;
      continue;
    }
    // Normal text, with bold inside
    let cursor = 0;
    let match;
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastX = 50;
    let normalLines = wrapText(line, font, fontSize);
    for (const normalLine of normalLines) {
      let x = 50;
      let lastIndex = 0;
      while ((match = boldRegex.exec(normalLine)) !== null) {
        const before = normalLine.substring(lastIndex, match.index);
        if (before) {
          page.drawText(before, { x, y, size: fontSize, font, color: rgb(0, 0, 0) });
          x += font.widthOfTextAtSize(before, fontSize);
        }
        page.drawText(match[1], { x, y, size: fontSize, font: boldFont, color: rgb(0, 0, 0) });
        x += boldFont.widthOfTextAtSize(match[1], fontSize);
        lastIndex = match.index + match[0].length;
      }
      const after = normalLine.substring(lastIndex);
      if (after) {
        page.drawText(after, { x, y, size: fontSize, font, color: rgb(0, 0, 0) });
      }
      y -= 20;
    }
    if (y < 50) {
      page = pdfDoc.addPage([595, 842]);
      y = 800;
    }
  }
  return await pdfDoc.save();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
      console.log('Received resume:', req.body);
      const resume = req.body;
      const resumeText = await getProfessionalResumeText(resume);
      console.log('Gemini resume text:', resumeText);
      const pdfBytes = await generatePdfFromText(resumeText);
      const base64 = Buffer.from(pdfBytes).toString('base64');
      res.status(200).json({ base64 });
    } catch (err) {
      console.error('Error in generateResumePdf:', err);
      res.status(500).json({ error: 'Failed to generate PDF', details: (err as Error).message });
    }
  }
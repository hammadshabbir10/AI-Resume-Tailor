import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
    const { jobTitle, description, cvText } = req.body;

    if (!jobTitle || !description || !cvText) {
      return res.status(400).json({ 
        success: false, 
        error: 'Job title, description, and CV text are required' 
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are a professional Resume tailor. Your task is to optimize the given Resume for the specific job title and job description while maintaining the original structure and formatting.

      JOB TITLE: ${jobTitle}
      JOB DESCRIPTION: ${description}

      ORIGINAL CV TEXT:
      ${cvText}

      Please tailor this Resume by making the following changes:

      1. Update the professional summary to better align with the job title and description
      2. Reorder skills section to prioritize those most relevant to this position and description
      3. Refocus bullet points to highlight responsibilities matching the job title and description.
      4. Keep only relevant projects; rephrase descriptions using keywords like job title- and description-related terms.  
      5. Adjust experience descriptions to highlight relevant achievements.
      6. Keep ALL original formatting, structure, and layout.
      7. Add and changes in my uploaded CV or Resume according to Job Title and Description every section.
      8. Maintain the same sections and their order.
      9. Only modify content, not the overall structure.
      10. If any section is missing, add it and fill it with the relevant information.
      11. If any section like certificates and projects is not relevant to the job title or description, remove it.
      12. After Every section add a line width in middle for separation. 
      13. After my personal information add a space before writing something heading or summary.
      
      IMPORTANT: Return the Resume with the SAME formatting as the original. Keep line breaks, spacing, and structure exactly as they were. Only change the content to be more relevant to the job title and description.
    `;

    const result = await model.generateContent(prompt);
    const tailoredResume = result.response.text();

    if (!tailoredResume || tailoredResume.trim().length === 0) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to generate tailored CV' 
      });
    }

    res.status(200).json({ 
      success: true, 
      tailoredCV: tailoredResume.trim(),
      jobTitle: jobTitle,
      description: description
    });

  } catch (error) {
    console.error('CV tailoring error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to tailor CV' 
    });
  }
} 
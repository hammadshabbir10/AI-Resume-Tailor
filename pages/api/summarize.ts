import type { NextApiRequest, NextApiResponse } from "next";

// Standalone function for summarization using Gemini API
export async function summarizeText(text: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing Gemini API key");
  console.log("Using Gemini API key:", apiKey);
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Summarize the following blog content in 1-2 sentences:\n\n${text}`,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Gemini API error response:", error);
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  // Gemini's response structure:
  // data.candidates[0].content.parts[0].text
  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
    "No summary generated."
  );
}

// API route handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { text } = req.body;
    const summary = await summarizeText(text);
    res.status(200).json({ summary });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
}
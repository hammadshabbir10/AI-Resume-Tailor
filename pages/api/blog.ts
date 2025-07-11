import type { NextApiRequest, NextApiResponse } from "next";
// import { saveToSupabase } from "../../lib/supabase"; // implement as needed
// import { saveToMongo } from "../../lib/mongodb"; // implement as needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { blogText, summary, urdu } = req.body;
    // Save summary to Supabase and full text to MongoDB
    // await saveToSupabase({ summary, urdu });
    // await saveToMongo({ blogText });
    // For demo, just return success
    return res.status(200).json({ success: true });
  }
  res.status(405).end();
}
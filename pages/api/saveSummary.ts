import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
  
);

export default async function handler( req: NextApiRequest,res: NextApiResponse) {
  if (req.method === 'POST') {
    const { summary } = req.body;
    const { data, error } = await supabase
      .from('Summariz_of_Blog')
      .insert([{ summary }]);
      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json({ data });
  }
  res.status(405).json({ error: 'Method not allowed' });
}
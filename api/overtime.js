import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET': {
      // Handles fetching overtime data for a specific month
      const { month_year } = req.query;

      if (!month_year) {
        return res.status(400).json({ error: 'month_year query parameter is required' });
      }

      try {
        const { data, error } = await supabase
          .from('overtime') 
          .select('employee_id, total_ot, daily_data') 
          .eq('month_year', month_year);

        if (error) throw error;
        return res.status(200).json(data);
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }
    
    case 'POST': {
      const records = req.body;

      if (!records || !Array.isArray(records)) {
        return res.status(400).json({ error: 'Request body must be an array of overtime records.' });
      }

      try {
        
        const { data, error } = await supabase
          .from('overtime') 
          .upsert(records, { onConflict: 'employee_id,month_year' })
          .select();

        if (error) throw error;
        return res.status(201).json(data);
      } catch (error) {
        console.error('Overtime submission error:', error);
        return res.status(500).json({ error: error.message });
      }
    }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

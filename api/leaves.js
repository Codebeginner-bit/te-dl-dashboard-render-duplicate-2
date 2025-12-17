import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  const { id, month_year } = req.query; 

  switch (req.method) {
    case 'GET': {
      try {
        let query = supabase.from('leaves').select('*');

        if (month_year) {
          const [year, month] = month_year.split('-').map(Number);
          const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
          const endDate = new Date(year, month, 0).toISOString().split('T')[0]; 

          query = query.lte('start_date', endDate).gte('end_date', startDate);
        }

        const { data, error } = await query.order('start_date', { ascending: false });

        if (error) throw error;
        return res.status(200).json(data);

      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }
    
    case 'POST': {
      const { data, error } = await supabase.from('leaves').insert([req.body]).select();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(data);
    }

    case 'PUT': {
      if (!id) return res.status(400).json({ error: 'Leave ID is required for update' });
      const { data, error } = await supabase.from('leaves').update(req.body).eq('id', id).select();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }

    case 'DELETE': {
      if (!id) return res.status(400).json({ error: 'Leave ID is required for deletion' });
      const { error } = await supabase.from('leaves').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(204).send();
    }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

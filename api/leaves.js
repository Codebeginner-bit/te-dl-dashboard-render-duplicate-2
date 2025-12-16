import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// The main handler for the /api/leaves endpoint
export default async function handler(req, res) {
  const { id } = req.query; 
  switch (req.method) {
    case 'GET': {
      // Fetch all leaves, ordered by start date
      const { data, error } = await supabase.from('leaves').select('*').order('start_date', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }
    
    case 'POST': {
      // Create a new leave record
      const { data, error } = await supabase.from('leaves').insert([req.body]).select();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(data);
    }

    case 'PUT': {
      // Update an existing leave record
      if (!id) return res.status(400).json({ error: 'Leave ID is required for update' });
      const { data, error } = await supabase.from('leaves').update(req.body).eq('id_number', id).select();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }

    case 'DELETE': {
      if (!id) return res.status(400).json({ error: 'Leave ID is required for deletion' });
      const { error } = await supabase.from('leaves').delete().eq('id_number', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(204).send(); // 204 No Content for successful deletion
    }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

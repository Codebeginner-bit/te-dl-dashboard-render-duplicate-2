// /api/employees.js

import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client.
// These environment variables will be set in your Vercel project settings.
// IMPORTANT: Use the SERVICE_ROLE_KEY for server-side operations to bypass Row Level Security.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// The main handler for the serverless function.
export default async function handler(req, res) {
  const { id } = req.query; // Used for single-item GET, PUT, and DELETE

  switch (req.method) {
    case 'GET': {
      // Fetch all employees
      const { data, error } = await supabase.from('employees').select('*').order('id_number', { ascending: true });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }
    
    case 'POST': {
      // Create a new employee
      const { data, error } = await supabase.from('employees').insert([req.body]).select();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(data);
    }

    case 'PUT': {
      // Update an existing employee
      if (!id) return res.status(400).json({ error: 'Employee ID is required' });
      const { data, error } = await supabase.from('employees').update(req.body).eq('id_number', id).select();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }

    case 'DELETE': {
      // Delete an employee
      if (!id) return res.status(400).json({ error: 'Employee ID is required' });
      const { error } = await supabase.from('employees').delete().eq('id_number', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(204).send(); // 204 No Content for successful deletion
    }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

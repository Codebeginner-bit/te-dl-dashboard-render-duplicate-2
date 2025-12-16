

import { createClient } from '@supabase/supabase-js';

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

export default async function handler(req, res) {

  switch (req.method) {
    case 'GET': {
      const { month_year } = req.query;
      if (!month_year) {
        return res.status(400).json({ error: 'month_year query parameter is required.' });
      }

      try {
        const { data, error } = await supabase
          .from('overtime_details')
          .select('employee_id, daily_data')
          .eq('month_year', month_year);
        
        if (error) throw error;
        
        return res.status(200).json(data);
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }

    case 'POST': {
      const allEmployeeData = req.body; 

      try {

        for (const employeeData of allEmployeeData) {
          const { employee_id, month_year, daily_data, total_ot } = employeeData;
          const { error: upsertError } = await supabase
            .from('overtime_details')
            .upsert(
              { employee_id, month_year, daily_data },
              { onConflict: 'employee_id, month_year' } 
            );
          
          if (upsertError) throw upsertError;
          const { error: updateError } = await supabase
            .from('employees')
            .update({ ot_total: total_ot })
            .eq('id_number', employee_id); 
          if (updateError) throw updateError;
        }

        return res.status(200).json({ message: 'Overtime submitted successfully for all employees.' });

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

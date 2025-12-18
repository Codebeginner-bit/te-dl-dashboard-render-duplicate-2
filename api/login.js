import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY || !JWT_SECRET) {
      console.error('Server environment variables are not loaded!');
      return res.status(500).json({ error: 'Server configuration error.' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }


    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, password')
      .eq('username', username)
      .single();

    if (userError || !user) {
      if (userError) console.error('Supabase query error:', userError.message);
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    if (password !== user.password) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({ 
      message: 'Login successful!',
      token: token 
    });

  } catch (error) {
    console.error('Unhandled API Error in /api/login:', error);
    return res.status(500).json({ error: 'An internal server error occurred.' });
  }
}

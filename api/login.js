import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-that-is-long-and-secure';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
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
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    if (password !== user.password) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { 
        userId: user.id,
        username: user.username 
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({ 
      message: 'Login successful!',
      token: token 
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'An internal server error occurred.' });
  }
}

import { createClient } from '@supabase/supabase-js';

// Supabase Configuration for Gossip Garden
// Database Schema and Configuration

const supabaseConfig = {
  // Replace with your actual Supabase URL and ANON_KEY
  supabaseUrl: 'https://your-supabase-project.supabase.co',
  supabaseKey: 'your-supabase-anon-key',

  // Database Schema
  schema: {
    users: {
      id: 'bigint',
      username: 'string',
      water_count: 'int',
      premium_credits: 'int',
      created_at: 'timestamp',
      updated_at: 'timestamp'
    },
    messages: {
      id: 'uuid',
      recipient_id: 'bigint',
      sender_id: 'bigint',
      content: 'text',
      is_revealed: 'boolean',
      created_at: 'timestamp',
      updated_at: 'timestamp'
    }
  }
};

// Initialize Supabase
const supabase = createClient(
  supabaseConfig.supabaseUrl,
  supabaseConfig.supabaseKey
);

// Database initialization function
async function initializeDatabase() {
  try {
    // Create tables if they don't exist
    await supabase.from('users').upsert({
      id: 0,
      username: 'system',
      water_count: 0,
      premium_credits: 0,
      created_at: new Date(),
      updated_at: new Date()
    }, { returning: 'minimal' });

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

export {
  supabase,
  supabaseConfig,
  initializeDatabase
};

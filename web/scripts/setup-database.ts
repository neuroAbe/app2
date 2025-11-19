import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Setting up CatchFeelings database...\n');

  // Read the schema file
  const schemaPath = path.join(__dirname, '../../shared/database/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  console.log('📋 Schema file loaded');
  console.log('📊 Database: lonelyCat (rcdzetszicqyfxtkflih)');
  console.log('\n⚙️  Creating tables...\n');

  try {
    // Execute the schema
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema });

    if (error) {
      // If exec_sql doesn't exist, we need to run it via the SQL editor
      console.log('⚠️  Note: Direct SQL execution requires service role key.');
      console.log('\n📝 Please run the schema manually via Supabase dashboard:');
      console.log('\n1. Go to: https://supabase.com/dashboard/project/rcdzetszicqyfxtkflih/editor');
      console.log('2. Click "SQL Editor" → "New Query"');
      console.log('3. Copy the contents of: shared/database/schema.sql');
      console.log('4. Paste and click "Run"\n');
      console.log('Error details:', error.message);
      process.exit(1);
    }

    console.log('✅ Database schema created successfully!\n');
    console.log('📊 Created tables:');
    console.log('   • user_profiles');
    console.log('   • user_reports');
    console.log('   • blocked_users');
    console.log('   • matches');
    console.log('   • messages');
    console.log('   • game_events\n');

    console.log('🔒 Row Level Security policies enabled');
    console.log('📈 Performance indexes created');
    console.log('\n✨ Database setup complete! You can now run the app.\n');

  } catch (err: any) {
    console.error('❌ Error setting up database:', err.message);
    console.log('\n📝 Manual setup instructions:');
    console.log('1. Go to: https://supabase.com/dashboard/project/rcdzetszicqyfxtkflih/editor');
    console.log('2. Click "SQL Editor" → "New Query"');
    console.log('3. Copy the contents of: shared/database/schema.sql');
    console.log('4. Paste and click "Run"\n');
    process.exit(1);
  }
}

setupDatabase();

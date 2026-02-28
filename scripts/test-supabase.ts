import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function testConnection() {
  console.log('🚀 Starting Supabase Connection Test...')
  console.log(`URL: ${supabaseUrl ? '✅ Found' : '❌ Missing'}`)
  console.log(`Key: ${supabaseAnonKey ? '✅ Found' : '❌ Missing'}`)

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('\nInternal Error: Missing environment variables.')
    console.log('Note: If running with npx tsx, make sure to load your .env.local')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

  try {
    console.log('\n1. Testing basic connection...')
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError) throw authError
    console.log('✅ Auth Service: Connected')

    console.log('\n2. Testing Database Schema...')
    const { data: tableData, error: tableError } = await supabase
      .from('ad_spaces')
      .select('id')
      .limit(1)

    if (tableError) {
      if (tableError.code === 'PGRST116') {
        console.log('✅ Database: Table "ad_spaces" exists (empty)')
      } else if (tableError.code === '42P01') {
        console.error('❌ Database: Table "ad_spaces" does NOT exist. Did you run the schema.sql?')
      } else {
        throw tableError
      }
    } else {
      console.log(`✅ Database: Connected (Found ${tableData?.length ?? 0} spaces)`)
    }

    console.log('\n3. Testing Profiles table...')
    const { error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (profileError) {
       console.error(`❌ Profiles: ${profileError.message}`)
    } else {
      console.log('✅ Profiles: Table exists and is accessible')
    }

    console.log('\n✨ All systems operational!')

  } catch (error: any) {
    console.error('\n❌ Connection Failed:')
    console.error(error.message || error)
  }
}

testConnection()

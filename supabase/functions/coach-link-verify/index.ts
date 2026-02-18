// Coach Link Verify
// Searches for a user by email in the Coach-App Supabase instance
// If found, updates the coach_integrations record to "linked" status

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Authenticate user against Enterprise Supabase
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { integrationId, email } = await req.json()

    if (!integrationId || !email) {
      return new Response(JSON.stringify({ error: 'integrationId and email are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Connect to Coach-App Supabase using service role key
    const coachSupabaseUrl = Deno.env.get('COACH_SUPABASE_URL')
    const coachSupabaseKey = Deno.env.get('COACH_SUPABASE_SERVICE_KEY')

    if (!coachSupabaseUrl || !coachSupabaseKey) {
      return new Response(JSON.stringify({ error: 'Coach integration not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const coachSupabase = createClient(coachSupabaseUrl, coachSupabaseKey)

    // Search for user by email in Coach-App
    const { data: coachUsers, error: searchError } = await coachSupabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', email.toLowerCase())
      .limit(1)

    if (searchError) {
      console.error('Coach search error:', searchError)
      return new Response(JSON.stringify({ error: 'Failed to search coach database' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Use Enterprise service role to update integration record
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    if (coachUsers && coachUsers.length > 0) {
      const coachUser = coachUsers[0]

      // Update integration to linked status
      await supabaseAdmin.from('coach_integrations').update({
        coach_app_user_id: coachUser.id,
        status: 'linked',
        linked_at: new Date().toISOString(),
      }).eq('id', integrationId)

      return new Response(JSON.stringify({
        found: true,
        coachUserId: coachUser.id,
        coachName: coachUser.full_name,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else {
      // Update status to error (no account found)
      await supabaseAdmin.from('coach_integrations').update({
        status: 'error',
      }).eq('id', integrationId)

      return new Response(JSON.stringify({
        found: false,
        message: 'No account found with this email in Prometheus Coach',
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    console.error('Link verify error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

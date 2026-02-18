// Coach Data Bridge
// Queries Coach-App Supabase for coaching data (summary, clients, workouts, programs)
// Returns read-only data for display in Enterprise app

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

    const { coachAppUserId, dataType } = await req.json()

    if (!coachAppUserId || !dataType) {
      return new Response(JSON.stringify({ error: 'coachAppUserId and dataType are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Connect to Coach-App Supabase
    const coachSupabaseUrl = Deno.env.get('COACH_SUPABASE_URL')
    const coachSupabaseKey = Deno.env.get('COACH_SUPABASE_SERVICE_KEY')

    if (!coachSupabaseUrl || !coachSupabaseKey) {
      return new Response(JSON.stringify({ error: 'Coach integration not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const coachSupabase = createClient(coachSupabaseUrl, coachSupabaseKey)

    let responseData: any

    switch (dataType) {
      case 'summary': {
        responseData = await getCoachSummary(coachSupabase, coachAppUserId)
        break
      }
      case 'clients': {
        responseData = await getCoachClients(coachSupabase, coachAppUserId)
        break
      }
      case 'workouts': {
        responseData = await getCoachWorkouts(coachSupabase, coachAppUserId)
        break
      }
      case 'programs': {
        responseData = await getCoachPrograms(coachSupabase, coachAppUserId)
        break
      }
      default:
        return new Response(JSON.stringify({ error: 'Invalid dataType' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    // Update last_sync_at in Enterprise DB
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    await supabaseAdmin.from('coach_integrations')
      .update({
        last_sync_at: new Date().toISOString(),
        cached_data: dataType === 'summary' ? responseData : undefined,
      })
      .eq('coach_app_user_id', coachAppUserId)

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Data bridge error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function getCoachSummary(coachSupabase: any, userId: string) {
  const { data: profile } = await coachSupabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('id', userId)
    .single()

  // Count clients (coach_clients or clients table)
  const { count: clientCount } = await coachSupabase
    .from('coach_clients')
    .select('*', { count: 'exact', head: true })
    .eq('coach_id', userId)

  // Count workouts
  const { count: workoutCount } = await coachSupabase
    .from('workouts')
    .select('*', { count: 'exact', head: true })
    .eq('coach_id', userId)

  // Count programs
  const { count: programCount } = await coachSupabase
    .from('programs')
    .select('*', { count: 'exact', head: true })
    .eq('coach_id', userId)

  return {
    userId: profile?.id || userId,
    email: profile?.email || '',
    fullName: profile?.full_name || '',
    totalClients: clientCount || 0,
    totalWorkouts: workoutCount || 0,
    totalPrograms: programCount || 0,
    activeSessions: 0,
    lastActivity: null,
  }
}

async function getCoachClients(coachSupabase: any, userId: string) {
  const { data: clients } = await coachSupabase
    .from('coach_clients')
    .select('id, client:profiles(id, full_name, email), status, created_at')
    .eq('coach_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  return (clients || []).map((c: any) => ({
    id: c.id,
    name: c.client?.full_name || 'Unknown',
    email: c.client?.email || '',
    status: c.status || 'active',
    startDate: c.created_at,
    lastSession: null,
  }))
}

async function getCoachWorkouts(coachSupabase: any, userId: string) {
  const { data: workouts } = await coachSupabase
    .from('workouts')
    .select('id, title, type, duration_minutes, created_at')
    .eq('coach_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  return (workouts || []).map((w: any) => ({
    id: w.id,
    title: w.title || 'Untitled',
    type: w.type || 'custom',
    duration: w.duration_minutes || 0,
    exerciseCount: 0,
    createdAt: w.created_at,
  }))
}

async function getCoachPrograms(coachSupabase: any, userId: string) {
  const { data: programs } = await coachSupabase
    .from('programs')
    .select('id, title, description, duration_weeks, created_at')
    .eq('coach_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  return (programs || []).map((p: any) => ({
    id: p.id,
    title: p.title || 'Untitled',
    description: p.description || '',
    weekCount: p.duration_weeks || 0,
    clientCount: 0,
    createdAt: p.created_at,
  }))
}

// Stripe Connect OAuth Initiation
// This function generates a Stripe Connect OAuth URL for the facility to connect their account
//
// Deploy with: supabase functions deploy stripe-connect-oauth
// Set secrets: supabase secrets set STRIPE_CLIENT_ID=ca_xxx STRIPE_REDIRECT_URI=https://...

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const STRIPE_CLIENT_ID = Deno.env.get('STRIPE_CLIENT_ID')!
const STRIPE_REDIRECT_URI = Deno.env.get('STRIPE_REDIRECT_URI')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's profile to check role and gym_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('gym_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.gym_id) {
      return new Response(
        JSON.stringify({ error: 'Profile not found or no gym associated' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Only owners and admins can connect Stripe
    if (!['owner', 'admin'].includes(profile.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate state token (contains gym_id for callback)
    const state = btoa(JSON.stringify({
      gymId: profile.gym_id,
      userId: user.id,
      timestamp: Date.now()
    }))

    // Build Stripe OAuth URL
    const stripeOAuthUrl = new URL('https://connect.stripe.com/oauth/authorize')
    stripeOAuthUrl.searchParams.set('response_type', 'code')
    stripeOAuthUrl.searchParams.set('client_id', STRIPE_CLIENT_ID)
    stripeOAuthUrl.searchParams.set('scope', 'read_write')
    stripeOAuthUrl.searchParams.set('redirect_uri', STRIPE_REDIRECT_URI)
    stripeOAuthUrl.searchParams.set('state', state)

    return new Response(
      JSON.stringify({ url: stripeOAuthUrl.toString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in stripe-connect-oauth:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

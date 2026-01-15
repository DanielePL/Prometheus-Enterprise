// Stripe Dashboard Link
// This function generates a link to the Stripe Express Dashboard for the connected account
//
// Deploy with: supabase functions deploy stripe-dashboard-link
// Set secrets: supabase secrets set STRIPE_SECRET_KEY=sk_xxx

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.5.0'

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

    // Get user's profile to check permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('gym_id, role')
      .eq('id', user.id)
      .single()

    if (!profile?.gym_id || !['owner', 'admin'].includes(profile.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get gym's Stripe account
    const { data: gym } = await supabase
      .from('gyms')
      .select('stripe_account_id, stripe_account_status')
      .eq('id', profile.gym_id)
      .single()

    if (!gym?.stripe_account_id || gym.stripe_account_status !== 'connected') {
      return new Response(
        JSON.stringify({ error: 'Stripe account not connected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    })

    // Create login link for the connected account
    const loginLink = await stripe.accounts.createLoginLink(gym.stripe_account_id)

    return new Response(
      JSON.stringify({ url: loginLink.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating dashboard link:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create dashboard link' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

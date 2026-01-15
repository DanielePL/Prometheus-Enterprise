// Stripe Cancel Subscription
// This function cancels a subscription on the facility's connected Stripe account
//
// Deploy with: supabase functions deploy stripe-cancel-subscription
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

    // Get request body
    const { subscriptionId, cancelImmediately = false } = await req.json()

    if (!subscriptionId) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: subscriptionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    // Verify subscription belongs to this gym
    const { data: dbSubscription } = await supabase
      .from('stripe_subscriptions')
      .select('id')
      .eq('stripe_subscription_id', subscriptionId)
      .eq('gym_id', profile.gym_id)
      .single()

    if (!dbSubscription) {
      return new Response(
        JSON.stringify({ error: 'Subscription not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    })

    let subscription: Stripe.Subscription

    if (cancelImmediately) {
      // Cancel immediately
      subscription = await stripe.subscriptions.cancel(
        subscriptionId,
        { stripeAccount: gym.stripe_account_id }
      )

      // Update database
      await supabase
        .from('stripe_subscriptions')
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscriptionId)
    } else {
      // Cancel at period end
      subscription = await stripe.subscriptions.update(
        subscriptionId,
        { cancel_at_period_end: true },
        { stripeAccount: gym.stripe_account_id }
      )

      // Update database
      await supabase
        .from('stripe_subscriptions')
        .update({
          cancel_at_period_end: true,
        })
        .eq('stripe_subscription_id', subscriptionId)
    }

    return new Response(
      JSON.stringify({
        subscriptionId: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to cancel subscription' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

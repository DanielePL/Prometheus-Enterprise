// Platform Checkout Session Creator
// Creates a Stripe Checkout session for studio platform subscriptions
// Separate from member billing (stripe-create-subscription)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.5.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const stripe = new Stripe(Deno.env.get('PLATFORM_STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Authenticate user
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

    // Get request body
    const { priceId, planId, successUrl, cancelUrl } = await req.json()

    if (!priceId || !planId) {
      return new Response(JSON.stringify({ error: 'priceId and planId are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get user profile and gym
    const { data: profile } = await supabase
      .from('profiles')
      .select('gym_id, email, full_name')
      .eq('id', user.id)
      .single()

    if (!profile?.gym_id) {
      return new Response(JSON.stringify({ error: 'No gym associated with user' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Use service role for subscription lookup
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Check for existing subscription record
    const { data: existingSub } = await supabaseAdmin
      .from('platform_subscriptions')
      .select('stripe_customer_id')
      .eq('gym_id', profile.gym_id)
      .single()

    // Resolve or create Stripe customer
    let customerId = existingSub?.stripe_customer_id

    if (!customerId) {
      // Search by email in Stripe
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      })

      if (customers.data.length > 0) {
        customerId = customers.data[0].id
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          email: user.email,
          name: profile.full_name || undefined,
          metadata: {
            supabase_user_id: user.id,
            gym_id: profile.gym_id,
          },
        })
        customerId = customer.id
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${req.headers.get('origin')}/settings?tab=billing&status=success`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/pricing?status=canceled`,
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          supabase_user_id: user.id,
          gym_id: profile.gym_id,
          plan_id: planId,
        },
      },
      allow_promotion_codes: true,
      metadata: {
        supabase_user_id: user.id,
        gym_id: profile.gym_id,
        plan_id: planId,
      },
    })

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

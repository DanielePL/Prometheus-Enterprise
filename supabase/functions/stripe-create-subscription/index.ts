// Stripe Create Subscription
// This function creates a subscription for a member using the facility's connected Stripe account
//
// Deploy with: supabase functions deploy stripe-create-subscription
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
    const { memberId, priceId, paymentMethodId } = await req.json()

    if (!memberId || !priceId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: memberId, priceId' }),
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

    // Get member info
    const { data: member } = await supabase
      .from('members')
      .select('id, first_name, last_name, email, stripe_customer_id')
      .eq('id', memberId)
      .eq('gym_id', profile.gym_id)
      .single()

    if (!member) {
      return new Response(
        JSON.stringify({ error: 'Member not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    })

    // Create or get Stripe customer on the connected account
    let customerId = member.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: member.email,
        name: `${member.first_name} ${member.last_name}`,
        metadata: {
          member_id: member.id,
          gym_id: profile.gym_id,
        },
      }, {
        stripeAccount: gym.stripe_account_id,
      })
      customerId = customer.id

      // Update member with Stripe customer ID
      await supabase
        .from('members')
        .update({ stripe_customer_id: customerId })
        .eq('id', member.id)
    }

    // Attach payment method if provided
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      }, {
        stripeAccount: gym.stripe_account_id,
      })

      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      }, {
        stripeAccount: gym.stripe_account_id,
      })
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    }, {
      stripeAccount: gym.stripe_account_id,
    })

    // Store subscription in database
    await supabase.from('stripe_subscriptions').insert({
      gym_id: profile.gym_id,
      member_id: member.id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      stripe_price_id: priceId,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })

    // Get client secret for payment confirmation if needed
    const invoice = subscription.latest_invoice as Stripe.Invoice
    const paymentIntent = invoice?.payment_intent as Stripe.PaymentIntent

    return new Response(
      JSON.stringify({
        subscriptionId: subscription.id,
        status: subscription.status,
        clientSecret: paymentIntent?.client_secret,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating subscription:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create subscription' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Platform Webhook Handler
// Processes Stripe webhook events for platform subscriptions (studio billing)
// SEPARATE from stripe-webhook which handles Connected Account events (member billing)
//
// Deploy with: supabase functions deploy platform-webhook
// Set secrets: supabase secrets set PLATFORM_STRIPE_SECRET_KEY=sk_xxx PLATFORM_WEBHOOK_SECRET=whsec_xxx

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.5.0'

const stripe = new Stripe(Deno.env.get('PLATFORM_STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})
const webhookSecret = Deno.env.get('PLATFORM_WEBHOOK_SECRET')!

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature')!
    const body = await req.text()

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response('Webhook signature verification failed', { status: 400 })
    }

    // Initialize Supabase with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(supabase, session)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(supabase, subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(supabase, subscription)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoiceFailed(supabase, invoice)
        break
      }

      default:
        console.log('Unhandled platform event:', event.type)
    }

    return new Response(JSON.stringify({ received: true }))
  } catch (error) {
    console.error('Platform webhook error:', error)
    return new Response('Webhook handler failed', { status: 500 })
  }
})

async function handleCheckoutCompleted(supabase: any, session: Stripe.Checkout.Session) {
  const gymId = session.metadata?.gym_id
  const userId = session.metadata?.supabase_user_id
  const planId = session.metadata?.plan_id

  if (!gymId || !userId || !planId) {
    console.error('Missing metadata in checkout session:', session.id)
    return
  }

  // Get the subscription from Stripe to get period dates
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

  await supabase.from('platform_subscriptions').upsert({
    gym_id: gymId,
    owner_id: userId,
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: subscription.id,
    plan_id: planId,
    status: subscription.status === 'trialing' ? 'trialing' : 'active',
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    trial_start: subscription.trial_start
      ? new Date(subscription.trial_start * 1000).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
  }, {
    onConflict: 'gym_id',
  })
}

async function handleSubscriptionUpdated(supabase: any, subscription: Stripe.Subscription) {
  const planId = subscription.metadata?.plan_id

  await supabase.from('platform_subscriptions')
    .update({
      plan_id: planId || undefined,
      status: subscription.status === 'trialing' ? 'trialing' : subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      trial_start: subscription.trial_start
        ? new Date(subscription.trial_start * 1000).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handleSubscriptionDeleted(supabase: any, subscription: Stripe.Subscription) {
  await supabase.from('platform_subscriptions')
    .update({
      status: 'canceled',
      cancel_at_period_end: false,
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handleInvoiceFailed(supabase: any, invoice: Stripe.Invoice) {
  if (!invoice.subscription) return

  await supabase.from('platform_subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', invoice.subscription as string)
}

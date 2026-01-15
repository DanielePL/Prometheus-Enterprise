// Stripe Webhook Handler
// This function processes Stripe webhook events and syncs data to the database
//
// Deploy with: supabase functions deploy stripe-webhook
// Set secrets: supabase secrets set STRIPE_SECRET_KEY=sk_xxx STRIPE_WEBHOOK_SECRET=whsec_xxx
// Configure webhook in Stripe Dashboard to point to this endpoint

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.5.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

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

    // Initialize Supabase with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get the connected account ID from the event
    const accountId = event.account
    if (!accountId) {
      // This is a platform event, not a connected account event
      return new Response(JSON.stringify({ received: true, skipped: 'platform_event' }))
    }

    // Find the gym by Stripe account ID
    const { data: gym, error: gymError } = await supabase
      .from('gyms')
      .select('id')
      .eq('stripe_account_id', accountId)
      .single()

    if (gymError || !gym) {
      console.log('Gym not found for account:', accountId)
      return new Response(JSON.stringify({ received: true, skipped: 'gym_not_found' }))
    }

    // Handle different event types
    switch (event.type) {
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaid(supabase, gym.id, invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoiceFailed(supabase, gym.id, invoice)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(supabase, gym.id, subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(supabase, gym.id, subscription)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSucceeded(supabase, gym.id, paymentIntent)
        break
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        await handleAccountUpdated(supabase, gym.id, account)
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return new Response(JSON.stringify({ received: true }))
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Webhook handler failed', { status: 500 })
  }
})

// Handler functions
async function handleInvoicePaid(supabase: any, gymId: string, invoice: Stripe.Invoice) {
  // Find member by Stripe customer ID
  const { data: member } = await supabase
    .from('members')
    .select('id')
    .eq('stripe_customer_id', invoice.customer)
    .eq('gym_id', gymId)
    .single()

  if (!member) {
    console.log('Member not found for customer:', invoice.customer)
    return
  }

  // Upsert payment record
  await supabase.from('payments').upsert({
    gym_id: gymId,
    member_id: member.id,
    amount: (invoice.amount_paid || 0) / 100,
    description: invoice.lines?.data?.[0]?.description || 'Subscription payment',
    payment_type: 'membership',
    status: 'paid',
    due_date: invoice.due_date
      ? new Date(invoice.due_date * 1000).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    paid_date: new Date().toISOString(),
    payment_method: 'stripe',
    stripe_invoice_id: invoice.id,
  }, {
    onConflict: 'stripe_invoice_id',
  })
}

async function handleInvoiceFailed(supabase: any, gymId: string, invoice: Stripe.Invoice) {
  // Find member by Stripe customer ID
  const { data: member } = await supabase
    .from('members')
    .select('id')
    .eq('stripe_customer_id', invoice.customer)
    .eq('gym_id', gymId)
    .single()

  if (!member) return

  // Update or create payment record with overdue status
  await supabase.from('payments').upsert({
    gym_id: gymId,
    member_id: member.id,
    amount: (invoice.amount_due || 0) / 100,
    description: 'Failed payment attempt',
    payment_type: 'membership',
    status: 'overdue',
    due_date: invoice.due_date
      ? new Date(invoice.due_date * 1000).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    stripe_invoice_id: invoice.id,
  }, {
    onConflict: 'stripe_invoice_id',
  })
}

async function handleSubscriptionUpdate(supabase: any, gymId: string, subscription: Stripe.Subscription) {
  // Upsert subscription record
  await supabase.from('stripe_subscriptions').upsert({
    gym_id: gymId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    stripe_price_id: subscription.items.data[0]?.price?.id || '',
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
  }, {
    onConflict: 'stripe_subscription_id',
  })
}

async function handleSubscriptionDeleted(supabase: any, gymId: string, subscription: Stripe.Subscription) {
  await supabase.from('stripe_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handlePaymentSucceeded(supabase: any, gymId: string, paymentIntent: Stripe.PaymentIntent) {
  // Only process if we have customer info
  if (!paymentIntent.customer) return

  const { data: member } = await supabase
    .from('members')
    .select('id')
    .eq('stripe_customer_id', paymentIntent.customer)
    .eq('gym_id', gymId)
    .single()

  if (!member) return

  // Create payment record
  await supabase.from('payments').upsert({
    gym_id: gymId,
    member_id: member.id,
    amount: paymentIntent.amount / 100,
    description: paymentIntent.description || 'Payment',
    payment_type: 'other',
    status: 'paid',
    due_date: new Date().toISOString().split('T')[0],
    paid_date: new Date().toISOString(),
    payment_method: 'stripe',
    stripe_payment_intent_id: paymentIntent.id,
  }, {
    onConflict: 'stripe_payment_intent_id',
  })
}

async function handleAccountUpdated(supabase: any, gymId: string, account: Stripe.Account) {
  // Update account status based on capabilities
  let status: string = 'connected'

  if (account.requirements?.disabled_reason) {
    status = 'restricted'
  } else if (account.requirements?.currently_due?.length) {
    status = 'pending'
  }

  await supabase.from('gyms')
    .update({ stripe_account_status: status })
    .eq('id', gymId)
}

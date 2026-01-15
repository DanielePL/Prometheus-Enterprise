// Stripe Connect OAuth Callback
// This function handles the OAuth callback from Stripe and stores the connected account ID
//
// Deploy with: supabase functions deploy stripe-connect-callback
// Set secrets: supabase secrets set STRIPE_SECRET_KEY=sk_xxx APP_URL=https://...

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.5.0'

const APP_URL = Deno.env.get('APP_URL')!

serve(async (req) => {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')
    const errorDescription = url.searchParams.get('error_description')

    // Handle OAuth errors
    if (error) {
      console.error('Stripe OAuth error:', error, errorDescription)
      return Response.redirect(
        `${APP_URL}/settings?stripe_error=${encodeURIComponent(error)}`
      )
    }

    if (!code || !state) {
      return Response.redirect(`${APP_URL}/settings?stripe_error=missing_params`)
    }

    // Decode state to get gym_id
    let stateData: { gymId: string; userId: string; timestamp: number }
    try {
      stateData = JSON.parse(atob(state))
    } catch {
      return Response.redirect(`${APP_URL}/settings?stripe_error=invalid_state`)
    }

    // Verify state is not too old (1 hour max)
    if (Date.now() - stateData.timestamp > 3600000) {
      return Response.redirect(`${APP_URL}/settings?stripe_error=expired_state`)
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    })

    // Exchange authorization code for access token
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code: code,
    })

    const stripeAccountId = response.stripe_user_id

    if (!stripeAccountId) {
      return Response.redirect(`${APP_URL}/settings?stripe_error=no_account_id`)
    }

    // Initialize Supabase with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Update gym with Stripe account info
    const { error: updateError } = await supabase
      .from('gyms')
      .update({
        stripe_account_id: stripeAccountId,
        stripe_connected_at: new Date().toISOString(),
        stripe_account_status: 'connected',
      })
      .eq('id', stateData.gymId)

    if (updateError) {
      console.error('Error updating gym:', updateError)
      return Response.redirect(`${APP_URL}/settings?stripe_error=db_update_failed`)
    }

    // Success - redirect back to settings
    return Response.redirect(`${APP_URL}/settings?stripe_connected=true`)
  } catch (error) {
    console.error('Error in stripe-connect-callback:', error)
    return Response.redirect(
      `${APP_URL}/settings?stripe_error=internal_error`
    )
  }
})

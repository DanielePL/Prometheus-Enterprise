// Coach Invite Accept
// Validates an invitation token and either returns prefill data
// or accepts the invitation and links the coach integration.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { token, coachAppUserId } = await req.json()

    if (!token) {
      return new Response(JSON.stringify({ error: 'Token is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Use service role to query/update invitations (no user auth required for invite acceptance)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Look up the invitation by token
    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from('coach_invitations')
      .select('*')
      .eq('token', token)
      .single()

    if (fetchError || !invitation) {
      return new Response(JSON.stringify({ error: 'Invalid invitation token' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if invitation has been revoked
    if (invitation.status === 'revoked') {
      return new Response(JSON.stringify({ error: 'This invitation has been revoked' }), {
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if invitation has already been accepted
    if (invitation.status === 'accepted') {
      return new Response(JSON.stringify({ error: 'This invitation has already been accepted' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if invitation has expired
    const now = new Date()
    const expiresAt = new Date(invitation.expires_at)
    if (invitation.status === 'expired' || now > expiresAt) {
      // Update status to expired if it hasn't been already
      if (invitation.status !== 'expired') {
        await supabaseAdmin
          .from('coach_invitations')
          .update({ status: 'expired', updated_at: now.toISOString() })
          .eq('id', invitation.id)
      }

      return new Response(JSON.stringify({ error: 'This invitation has expired' }), {
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // If no coachAppUserId provided, return invitation details for prefill
    if (!coachAppUserId) {
      return new Response(JSON.stringify({
        valid: true,
        invitation: {
          id: invitation.id,
          coach_name: invitation.coach_name,
          coach_email: invitation.coach_email,
          gym_name: invitation.gym_name,
          expires_at: invitation.expires_at,
        },
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Accept the invitation: update status and set accepted_at
    const acceptedAt = now.toISOString()

    const { error: updateError } = await supabaseAdmin
      .from('coach_invitations')
      .update({
        status: 'accepted',
        accepted_at: acceptedAt,
        updated_at: acceptedAt,
      })
      .eq('id', invitation.id)

    if (updateError) {
      console.error('Failed to update invitation:', updateError)
      return new Response(JSON.stringify({ error: 'Failed to accept invitation' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Link the coach integration — upsert so it works whether or not a record exists
    const { error: integrationError } = await supabaseAdmin
      .from('coach_integrations')
      .upsert({
        gym_id: invitation.gym_id,
        coach_id: invitation.coach_id,
        coach_app_user_id: coachAppUserId,
        coach_app_email: invitation.coach_email.toLowerCase(),
        status: 'linked',
        linked_at: acceptedAt,
      }, {
        onConflict: 'gym_id,coach_id',
      })

    if (integrationError) {
      console.error('Failed to link integration:', integrationError)
      return new Response(JSON.stringify({ error: 'Invitation accepted but failed to link integration' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({
      accepted: true,
      coach_name: invitation.coach_name,
      gym_name: invitation.gym_name,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Coach invite accept error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

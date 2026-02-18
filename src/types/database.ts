export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MembershipType = 'basic' | 'premium' | 'vip' | 'trial';
export type ActivityStatus = 'active' | 'moderate' | 'inactive';
export type PaymentStatus = 'paid' | 'pending' | 'overdue';
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';
export type StaffRole = 'owner' | 'admin' | 'manager' | 'coach' | 'receptionist';
export type StripeAccountStatus = 'disconnected' | 'pending' | 'connected' | 'restricted';
export type StripeSubscriptionStatus = 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused';

// Platform subscription types (SaaS billing for studios)
export type PlatformSubscriptionStatus = 'none' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
export type PlatformPlanId = 'trial' | 'basic' | 'premium' | 'vip';

// Coach integration types
export type CoachIntegrationStatus = 'pending' | 'linked' | 'unlinked' | 'error';
export type CoachInvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';
export type CompetitorPricingTier = 'budget' | 'mid' | 'premium' | 'luxury';
export type ExpansionScenarioStatus = 'draft' | 'evaluating' | 'approved' | 'rejected';

// Access Control types
export type AccessMethod = 'bluetooth' | 'face_recognition' | 'manual' | 'qr_code';
export type AccessStatus = 'granted' | 'denied' | 'pending';

// Opening hours structure
export interface DaySchedule {
  open: string;
  close: string;
  closed: boolean;
}

export interface OpeningHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

// Facility types for different organizations
export type FacilityType =
  | 'gym'
  | 'fitness_studio'
  | 'sports_academy'
  | 'tennis_club'
  | 'golf_club'
  | 'martial_arts'
  | 'dance_studio'
  | 'therapy_center'
  | 'rehabilitation'
  | 'yoga_studio'
  | 'swimming_school'
  | 'climbing_gym'
  | 'equestrian_center'
  | 'other';

// Client types based on facility type
export type ClientType =
  | 'members'
  | 'students'
  | 'athletes'
  | 'patients'
  | 'clients';

export interface Database {
  public: {
    Tables: {
      gyms: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          logo_url: string | null;
          timezone: string;
          currency: string;
          facility_types: FacilityType[];
          client_types: ClientType[];
          stripe_account_id: string | null;
          stripe_connected_at: string | null;
          stripe_account_status: StripeAccountStatus;
          postal_code: string | null;
          city: string | null;
          area_sqm: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          logo_url?: string | null;
          timezone?: string;
          currency?: string;
          facility_types?: FacilityType[];
          client_types?: ClientType[];
          stripe_account_id?: string | null;
          stripe_connected_at?: string | null;
          stripe_account_status?: StripeAccountStatus;
          postal_code?: string | null;
          city?: string | null;
          area_sqm?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          logo_url?: string | null;
          timezone?: string;
          currency?: string;
          facility_types?: FacilityType[];
          client_types?: ClientType[];
          stripe_account_id?: string | null;
          stripe_connected_at?: string | null;
          stripe_account_status?: StripeAccountStatus;
          postal_code?: string | null;
          city?: string | null;
          area_sqm?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          gym_id: string | null;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: StaffRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          gym_id?: string | null;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: StaffRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string | null;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: StaffRole;
          created_at?: string;
          updated_at?: string;
        };
      };
      staff: {
        Row: {
          id: string;
          gym_id: string;
          profile_id: string;
          role: StaffRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          profile_id: string;
          role?: StaffRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          profile_id?: string;
          role?: StaffRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      coaches: {
        Row: {
          id: string;
          gym_id: string;
          profile_id: string | null;
          name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          specializations: string[];
          bio: string | null;
          hourly_rate: number;
          is_active: boolean;
          client_count: number;
          sessions_this_month: number;
          revenue_this_month: number;
          rating: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          profile_id?: string | null;
          name: string;
          email: string;
          phone?: string | null;
          avatar_url?: string | null;
          specializations?: string[];
          bio?: string | null;
          hourly_rate?: number;
          is_active?: boolean;
          client_count?: number;
          sessions_this_month?: number;
          revenue_this_month?: number;
          rating?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          profile_id?: string | null;
          name?: string;
          email?: string;
          phone?: string | null;
          avatar_url?: string | null;
          specializations?: string[];
          bio?: string | null;
          hourly_rate?: number;
          is_active?: boolean;
          client_count?: number;
          sessions_this_month?: number;
          revenue_this_month?: number;
          rating?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      members: {
        Row: {
          id: string;
          gym_id: string;
          coach_id: string | null;
          name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          membership_type: MembershipType;
          membership_start: string;
          membership_end: string | null;
          monthly_fee: number;
          activity_status: ActivityStatus;
          last_visit: string | null;
          total_visits: number;
          notes: string | null;
          stripe_customer_id: string | null;
          postal_code: string | null;
          city: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          coach_id?: string | null;
          name: string;
          email: string;
          phone?: string | null;
          avatar_url?: string | null;
          membership_type?: MembershipType;
          membership_start?: string;
          membership_end?: string | null;
          monthly_fee?: number;
          activity_status?: ActivityStatus;
          last_visit?: string | null;
          total_visits?: number;
          notes?: string | null;
          stripe_customer_id?: string | null;
          postal_code?: string | null;
          city?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          coach_id?: string | null;
          name?: string;
          email?: string;
          phone?: string | null;
          avatar_url?: string | null;
          membership_type?: MembershipType;
          membership_start?: string;
          membership_end?: string | null;
          monthly_fee?: number;
          activity_status?: ActivityStatus;
          last_visit?: string | null;
          total_visits?: number;
          notes?: string | null;
          stripe_customer_id?: string | null;
          postal_code?: string | null;
          city?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          gym_id: string;
          coach_id: string;
          member_id: string | null;
          title: string;
          description: string | null;
          session_type: string;
          start_time: string;
          end_time: string;
          status: SessionStatus;
          price: number;
          max_participants: number;
          current_participants: number;
          location: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          coach_id: string;
          member_id?: string | null;
          title: string;
          description?: string | null;
          session_type?: string;
          start_time: string;
          end_time: string;
          status?: SessionStatus;
          price?: number;
          max_participants?: number;
          current_participants?: number;
          location?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          coach_id?: string;
          member_id?: string | null;
          title?: string;
          description?: string | null;
          session_type?: string;
          start_time?: string;
          end_time?: string;
          status?: SessionStatus;
          price?: number;
          max_participants?: number;
          current_participants?: number;
          location?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      session_participants: {
        Row: {
          id: string;
          session_id: string;
          member_id: string;
          attended: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          member_id: string;
          attended?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          member_id?: string;
          attended?: boolean;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          gym_id: string;
          member_id: string;
          amount: number;
          description: string | null;
          payment_type: string;
          status: PaymentStatus;
          due_date: string;
          paid_date: string | null;
          payment_method: string | null;
          invoice_number: string | null;
          stripe_payment_intent_id: string | null;
          stripe_invoice_id: string | null;
          stripe_charge_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          member_id: string;
          amount: number;
          description?: string | null;
          payment_type?: string;
          status?: PaymentStatus;
          due_date: string;
          paid_date?: string | null;
          payment_method?: string | null;
          invoice_number?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_invoice_id?: string | null;
          stripe_charge_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          member_id?: string;
          amount?: number;
          description?: string | null;
          payment_type?: string;
          status?: PaymentStatus;
          due_date?: string;
          paid_date?: string | null;
          payment_method?: string | null;
          invoice_number?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_invoice_id?: string | null;
          stripe_charge_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      stripe_subscriptions: {
        Row: {
          id: string;
          gym_id: string;
          member_id: string;
          stripe_subscription_id: string;
          stripe_customer_id: string;
          stripe_price_id: string;
          status: StripeSubscriptionStatus;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          canceled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          member_id: string;
          stripe_subscription_id: string;
          stripe_customer_id: string;
          stripe_price_id: string;
          status?: StripeSubscriptionStatus;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          member_id?: string;
          stripe_subscription_id?: string;
          stripe_customer_id?: string;
          stripe_price_id?: string;
          status?: StripeSubscriptionStatus;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          gym_id: string;
          sender_id: string;
          recipient_id: string | null;
          subject: string;
          content: string;
          is_broadcast: boolean;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          sender_id: string;
          recipient_id?: string | null;
          subject: string;
          content: string;
          is_broadcast?: boolean;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          sender_id?: string;
          recipient_id?: string | null;
          subject?: string;
          content?: string;
          is_broadcast?: boolean;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          gym_id: string;
          type: string;
          title: string;
          message: string;
          severity: string;
          is_read: boolean;
          related_id: string | null;
          related_type: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          type: string;
          title: string;
          message: string;
          severity?: string;
          is_read?: boolean;
          related_id?: string | null;
          related_type?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          type?: string;
          title?: string;
          message?: string;
          severity?: string;
          is_read?: boolean;
          related_id?: string | null;
          related_type?: string | null;
          created_at?: string;
        };
      };
      settings: {
        Row: {
          id: string;
          gym_id: string;
          key: string;
          value: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          key: string;
          value: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          key?: string;
          value?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      member_visits: {
        Row: {
          id: string;
          member_id: string;
          gym_id: string;
          check_in: string;
          check_out: string | null;
          check_in_method: AccessMethod;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          gym_id: string;
          check_in?: string;
          check_out?: string | null;
          check_in_method?: AccessMethod;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          gym_id?: string;
          check_in?: string;
          check_out?: string | null;
          check_in_method?: AccessMethod;
          created_at?: string;
        };
      };
      member_face_data: {
        Row: {
          id: string;
          member_id: string;
          gym_id: string;
          face_descriptor: number[];
          photo_url: string | null;
          match_threshold: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          gym_id: string;
          face_descriptor: number[];
          photo_url?: string | null;
          match_threshold?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          gym_id?: string;
          face_descriptor?: number[];
          photo_url?: string | null;
          match_threshold?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      member_bluetooth_devices: {
        Row: {
          id: string;
          member_id: string;
          gym_id: string;
          device_id: string;
          device_name: string | null;
          device_type: string | null;
          is_active: boolean;
          last_seen: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          gym_id: string;
          device_id: string;
          device_name?: string | null;
          device_type?: string | null;
          is_active?: boolean;
          last_seen?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          gym_id?: string;
          device_id?: string;
          device_name?: string | null;
          device_type?: string | null;
          is_active?: boolean;
          last_seen?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      access_logs: {
        Row: {
          id: string;
          gym_id: string;
          member_id: string | null;
          access_method: AccessMethod;
          access_status: AccessStatus;
          confidence_score: number | null;
          device_id: string | null;
          denial_reason: string | null;
          terminal_id: string | null;
          terminal_name: string | null;
          ip_address: string | null;
          user_agent: string | null;
          attempted_at: string;
          visit_id: string | null;
        };
        Insert: {
          id?: string;
          gym_id: string;
          member_id?: string | null;
          access_method: AccessMethod;
          access_status: AccessStatus;
          confidence_score?: number | null;
          device_id?: string | null;
          denial_reason?: string | null;
          terminal_id?: string | null;
          terminal_name?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          attempted_at?: string;
          visit_id?: string | null;
        };
        Update: {
          id?: string;
          gym_id?: string;
          member_id?: string | null;
          access_method?: AccessMethod;
          access_status?: AccessStatus;
          confidence_score?: number | null;
          device_id?: string | null;
          denial_reason?: string | null;
          terminal_id?: string | null;
          terminal_name?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          attempted_at?: string;
          visit_id?: string | null;
        };
      };
      platform_subscriptions: {
        Row: {
          id: string;
          gym_id: string;
          owner_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          plan_id: PlatformPlanId;
          status: PlatformSubscriptionStatus;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          trial_start: string | null;
          trial_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          owner_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan_id?: PlatformPlanId;
          status?: PlatformSubscriptionStatus;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          trial_start?: string | null;
          trial_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          owner_id?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan_id?: PlatformPlanId;
          status?: PlatformSubscriptionStatus;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          trial_start?: string | null;
          trial_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      coach_integrations: {
        Row: {
          id: string;
          gym_id: string;
          coach_id: string;
          coach_app_user_id: string | null;
          coach_app_email: string;
          status: CoachIntegrationStatus;
          linked_at: string | null;
          last_sync_at: string | null;
          cached_data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          coach_id: string;
          coach_app_user_id?: string | null;
          coach_app_email: string;
          status?: CoachIntegrationStatus;
          linked_at?: string | null;
          last_sync_at?: string | null;
          cached_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          coach_id?: string;
          coach_app_user_id?: string | null;
          coach_app_email?: string;
          status?: CoachIntegrationStatus;
          linked_at?: string | null;
          last_sync_at?: string | null;
          cached_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      gym_access_settings: {
        Row: {
          id: string;
          gym_id: string;
          bluetooth_enabled: boolean;
          face_recognition_enabled: boolean;
          qr_code_enabled: boolean;
          manual_checkin_enabled: boolean;
          face_match_threshold: number;
          require_liveness_check: boolean;
          bluetooth_range_meters: number;
          auto_checkout_enabled: boolean;
          auto_checkout_minutes: number;
          require_active_membership: boolean;
          allow_expired_grace_days: number;
          opening_hours: OpeningHours;
          holiday_closures: string[];
          notify_on_denied_access: boolean;
          notify_on_after_hours_attempt: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          bluetooth_enabled?: boolean;
          face_recognition_enabled?: boolean;
          qr_code_enabled?: boolean;
          manual_checkin_enabled?: boolean;
          face_match_threshold?: number;
          require_liveness_check?: boolean;
          bluetooth_range_meters?: number;
          auto_checkout_enabled?: boolean;
          auto_checkout_minutes?: number;
          require_active_membership?: boolean;
          allow_expired_grace_days?: number;
          opening_hours?: OpeningHours;
          holiday_closures?: string[];
          notify_on_denied_access?: boolean;
          notify_on_after_hours_attempt?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          bluetooth_enabled?: boolean;
          face_recognition_enabled?: boolean;
          qr_code_enabled?: boolean;
          manual_checkin_enabled?: boolean;
          face_match_threshold?: number;
          require_liveness_check?: boolean;
          bluetooth_range_meters?: number;
          auto_checkout_enabled?: boolean;
          auto_checkout_minutes?: number;
          require_active_membership?: boolean;
          allow_expired_grace_days?: number;
          opening_hours?: OpeningHours;
          holiday_closures?: string[];
          notify_on_denied_access?: boolean;
          notify_on_after_hours_attempt?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      coach_invitations: {
        Row: {
          id: string;
          gym_id: string;
          coach_id: string;
          token: string;
          coach_name: string;
          coach_email: string;
          gym_name: string;
          status: CoachInvitationStatus;
          expires_at: string;
          accepted_at: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          coach_id: string;
          token: string;
          coach_name: string;
          coach_email: string;
          gym_name: string;
          status?: CoachInvitationStatus;
          expires_at: string;
          accepted_at?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          coach_id?: string;
          token?: string;
          coach_name?: string;
          coach_email?: string;
          gym_name?: string;
          status?: CoachInvitationStatus;
          expires_at?: string;
          accepted_at?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      competitors: {
        Row: {
          id: string;
          gym_id: string;
          name: string;
          address: string | null;
          postal_code: string | null;
          city: string | null;
          lat: number | null;
          lng: number | null;
          pricing_tier: CompetitorPricingTier | null;
          monthly_price: number | null;
          estimated_members: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          name: string;
          address?: string | null;
          postal_code?: string | null;
          city?: string | null;
          lat?: number | null;
          lng?: number | null;
          pricing_tier?: CompetitorPricingTier | null;
          monthly_price?: number | null;
          estimated_members?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          name?: string;
          address?: string | null;
          postal_code?: string | null;
          city?: string | null;
          lat?: number | null;
          lng?: number | null;
          pricing_tier?: CompetitorPricingTier | null;
          monthly_price?: number | null;
          estimated_members?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      expansion_scenarios: {
        Row: {
          id: string;
          gym_id: string;
          name: string;
          address: string | null;
          postal_code: string | null;
          city: string | null;
          lat: number | null;
          lng: number | null;
          investment: number | null;
          monthly_rent: number | null;
          area_sqm: number | null;
          estimated_members: number | null;
          estimated_monthly_revenue: number | null;
          roi_months: number | null;
          cannibalization_pct: number;
          notes: string | null;
          status: ExpansionScenarioStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          name: string;
          address?: string | null;
          postal_code?: string | null;
          city?: string | null;
          lat?: number | null;
          lng?: number | null;
          investment?: number | null;
          monthly_rent?: number | null;
          area_sqm?: number | null;
          estimated_members?: number | null;
          estimated_monthly_revenue?: number | null;
          roi_months?: number | null;
          cannibalization_pct?: number;
          notes?: string | null;
          status?: ExpansionScenarioStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          name?: string;
          address?: string | null;
          postal_code?: string | null;
          city?: string | null;
          lat?: number | null;
          lng?: number | null;
          investment?: number | null;
          monthly_rent?: number | null;
          area_sqm?: number | null;
          estimated_members?: number | null;
          estimated_monthly_revenue?: number | null;
          roi_months?: number | null;
          cannibalization_pct?: number;
          notes?: string | null;
          status?: ExpansionScenarioStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      membership_type: MembershipType;
      activity_status: ActivityStatus;
      payment_status: PaymentStatus;
      session_status: SessionStatus;
      staff_role: StaffRole;
    };
  };
}

// Helper types for easier use
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Convenience exports
export type Gym = Tables<'gyms'>;
export type Profile = Tables<'profiles'>;
export type Staff = Tables<'staff'>;
export type Coach = Tables<'coaches'>;
export type Member = Tables<'members'>;
export type Session = Tables<'sessions'>;
export type SessionParticipant = Tables<'session_participants'>;
export type Payment = Tables<'payments'>;
export type Message = Tables<'messages'>;
export type Alert = Tables<'alerts'>;
export type Setting = Tables<'settings'>;
export type MemberVisit = Tables<'member_visits'>;
export type StripeSubscription = Tables<'stripe_subscriptions'>;

// Access Control exports
export type MemberFaceData = Tables<'member_face_data'>;
export type MemberBluetoothDevice = Tables<'member_bluetooth_devices'>;
export type AccessLog = Tables<'access_logs'>;
export type GymAccessSettings = Tables<'gym_access_settings'>;

// Platform Subscription exports
export type PlatformSubscription = Tables<'platform_subscriptions'>;

// Coach Integration exports
export type CoachIntegrationRow = Tables<'coach_integrations'>;

// Coach Invitation exports
export type CoachInvitationRow = Tables<'coach_invitations'>;

// Location Analysis exports
export type Competitor = Tables<'competitors'>;
export type ExpansionScenario = Tables<'expansion_scenarios'>;

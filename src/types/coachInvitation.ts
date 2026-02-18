export type CoachInvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface CoachInvitation {
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
}

export interface CreateInvitationParams {
  gym_id: string;
  coach_id: string;
  coach_name: string;
  coach_email: string;
  gym_name: string;
  created_by: string;
}

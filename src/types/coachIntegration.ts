export type CoachIntegrationStatus = 'pending' | 'linked' | 'unlinked' | 'error';

export interface CoachIntegration {
  id: string;
  gym_id: string;
  coach_id: string;
  coach_app_user_id: string | null;
  coach_app_email: string;
  status: CoachIntegrationStatus;
  linked_at: string | null;
  last_sync_at: string | null;
  cached_data: CoachCachedData;
  created_at: string;
  updated_at: string;
}

export interface CoachCachedData {
  totalClients?: number;
  totalWorkouts?: number;
  totalPrograms?: number;
  activeSessions?: number;
  lastActivity?: string;
}

export interface CoachSummary {
  userId: string;
  email: string;
  fullName: string;
  totalClients: number;
  totalWorkouts: number;
  totalPrograms: number;
  activeSessions: number;
  lastActivity: string | null;
}

export interface CoachClient {
  id: string;
  name: string;
  email: string;
  status: string;
  startDate: string;
  lastSession: string | null;
}

export interface CoachWorkout {
  id: string;
  title: string;
  type: string;
  duration: number;
  exerciseCount: number;
  createdAt: string;
}

export interface CoachProgram {
  id: string;
  title: string;
  description: string;
  weekCount: number;
  clientCount: number;
  createdAt: string;
}

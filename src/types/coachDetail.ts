export interface CoachResponseMetrics {
  coachId: string;
  avgResponseMinutes: number;
  medianResponseMinutes: number;
  responseRate: number;
  totalMessagesReceived: number;
  totalMessagesReplied: number;
  weeklyTrend: Array<{ week: string; avgMinutes: number }>;
}

export interface ClientServiceEntry {
  clientId: string;
  clientName: string;
  email: string;
  satisfactionScore: number;       // 1-10
  retentionMonths: number;
  sessionsCompleted: number;
  sessionsNoShow: number;
  progressRating: number;          // 1-5
  lastFeedback: string | null;
  lastMessageAt: string | null;
  avgResponseMinutes: number | null;
  trend: 'improving' | 'stable' | 'declining';
}

export interface CoachServiceIndex {
  coachId: string;
  overallScore: number;            // 0-100
  npsScore: number;                // -100 to 100
  clientRetentionRate: number;
  avgClientTenureMonths: number;
  clients: ClientServiceEntry[];
  monthlyScores: Array<{ month: string; score: number }>;
}

export interface CoachActivityEvent {
  id: string;
  type: 'session_completed' | 'program_assigned' | 'message_sent' | 'workout_created' | 'client_onboarded' | 'feedback_received' | 'no_show';
  description: string;
  timestamp: string;
  relatedClientName?: string;
}

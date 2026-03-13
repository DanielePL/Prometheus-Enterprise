// Coach App configuration
export const COACH_APP_URL = import.meta.env.VITE_COACH_APP_URL || 'https://app.prometheus.coach';

// Deep link helpers for navigating to specific pages in the Coach App
export const coachDeepLinks = {
  dashboard: () => `${COACH_APP_URL}/dashboard`,
  clients: () => `${COACH_APP_URL}/clients`,
  client: (clientId: string) => `${COACH_APP_URL}/clients/${clientId}`,
  workouts: () => `${COACH_APP_URL}/workouts`,
  workout: (workoutId: string) => `${COACH_APP_URL}/workouts/${workoutId}`,
  programs: () => `${COACH_APP_URL}/programs`,
  program: (programId: string) => `${COACH_APP_URL}/programs/${programId}`,
  sessions: () => `${COACH_APP_URL}/sessions`,
  settings: () => `${COACH_APP_URL}/settings`,
  invite: (token: string) => `${COACH_APP_URL}/invite/${token}`,
};

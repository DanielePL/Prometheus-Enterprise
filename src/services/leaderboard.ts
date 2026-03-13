import { supabase } from '@/lib/supabase';
import type { InsertTables, UpdateTables, ScoreType } from '@/types/database';
import { isDemoMode, DEMO_MEMBERS } from './demoData';

export type WorkoutScoreInsert = InsertTables<'workout_scores'>;
export type WorkoutScoreUpdate = UpdateTables<'workout_scores'>;

// ============================================================
// DEMO DATA
// ============================================================

function daysAgoISO(n: number): string {
  return new Date(Date.now() - n * 86400000).toISOString();
}

/** Convert time string "M:SS" to seconds for score_value */
function timeToSeconds(m: number, s: number): number {
  return m * 60 + s;
}

// Realistic benchmark scores for demo members
const DEMO_SCORES: Array<{
  id: string;
  gym_id: string;
  session_id: string | null;
  member_id: string;
  workout_template_id: string | null;
  workout_name: string;
  score_type: ScoreType;
  score_value: number;
  score_display: string;
  rx: boolean;
  scaled: boolean;
  scale_notes: string | null;
  notes: string | null;
  is_pr: boolean;
  recorded_at: string;
  created_at: string;
  updated_at: string;
  member?: { id: string; name: string; avatar_url: string | null };
}> = [
  // === FRAN scores (today) ===
  { id: 'sc-1', gym_id: 'demo-gym-id', session_id: null, member_id: 'm3', workout_template_id: 'tpl-1', workout_name: 'Fran', score_type: 'time', score_value: timeToSeconds(2, 58), score_display: '2:58', rx: true, scaled: false, scale_notes: null, notes: 'Sub 3!!! New PR', is_pr: true, recorded_at: daysAgoISO(0), created_at: daysAgoISO(0), updated_at: daysAgoISO(0), member: { id: 'm3', name: 'Thomas Brunner', avatar_url: null } },
  { id: 'sc-2', gym_id: 'demo-gym-id', session_id: null, member_id: 'm5', workout_template_id: 'tpl-1', workout_name: 'Fran', score_type: 'time', score_value: timeToSeconds(3, 42), score_display: '3:42', rx: true, scaled: false, scale_notes: null, notes: null, is_pr: true, recorded_at: daysAgoISO(0), created_at: daysAgoISO(0), updated_at: daysAgoISO(0), member: { id: 'm5', name: 'Luca Müller', avatar_url: null } },
  { id: 'sc-3', gym_id: 'demo-gym-id', session_id: null, member_id: 'm2', workout_template_id: 'tpl-1', workout_name: 'Fran', score_type: 'time', score_value: timeToSeconds(4, 15), score_display: '4:15', rx: true, scaled: false, scale_notes: null, notes: 'Getting close to sub 4', is_pr: false, recorded_at: daysAgoISO(0), created_at: daysAgoISO(0), updated_at: daysAgoISO(0), member: { id: 'm2', name: 'Laura Zimmermann', avatar_url: null } },
  { id: 'sc-4', gym_id: 'demo-gym-id', session_id: null, member_id: 'm1', workout_template_id: 'tpl-1', workout_name: 'Fran', score_type: 'time', score_value: timeToSeconds(4, 33), score_display: '4:33', rx: true, scaled: false, scale_notes: null, notes: null, is_pr: false, recorded_at: daysAgoISO(0), created_at: daysAgoISO(0), updated_at: daysAgoISO(0), member: { id: 'm1', name: 'Emma Schneider', avatar_url: null } },
  { id: 'sc-5', gym_id: 'demo-gym-id', session_id: null, member_id: 'm7', workout_template_id: 'tpl-1', workout_name: 'Fran', score_type: 'time', score_value: timeToSeconds(5, 11), score_display: '5:11', rx: false, scaled: true, scale_notes: '30kg Thrusters, banded PU', notes: null, is_pr: true, recorded_at: daysAgoISO(0), created_at: daysAgoISO(0), updated_at: daysAgoISO(0), member: { id: 'm7', name: 'Mia Huber', avatar_url: null } },
  { id: 'sc-6', gym_id: 'demo-gym-id', session_id: null, member_id: 'm9', workout_template_id: 'tpl-1', workout_name: 'Fran', score_type: 'time', score_value: timeToSeconds(5, 48), score_display: '5:48', rx: false, scaled: true, scale_notes: '25kg, Ring Rows', notes: 'First time doing Fran!', is_pr: true, recorded_at: daysAgoISO(0), created_at: daysAgoISO(0), updated_at: daysAgoISO(0), member: { id: 'm9', name: 'Lea Bachmann', avatar_url: null } },
  { id: 'sc-7', gym_id: 'demo-gym-id', session_id: null, member_id: 'm6', workout_template_id: 'tpl-1', workout_name: 'Fran', score_type: 'time', score_value: timeToSeconds(6, 22), score_display: '6:22', rx: true, scaled: false, scale_notes: null, notes: null, is_pr: false, recorded_at: daysAgoISO(0), created_at: daysAgoISO(0), updated_at: daysAgoISO(0), member: { id: 'm6', name: 'Sofia Keller', avatar_url: null } },
  { id: 'sc-8', gym_id: 'demo-gym-id', session_id: null, member_id: 'm10', workout_template_id: 'tpl-1', workout_name: 'Fran', score_type: 'time', score_value: timeToSeconds(7, 5), score_display: '7:05', rx: false, scaled: true, scale_notes: '30kg, banded PU', notes: null, is_pr: false, recorded_at: daysAgoISO(0), created_at: daysAgoISO(0), updated_at: daysAgoISO(0), member: { id: 'm10', name: 'Fabian Roth', avatar_url: null } },

  // === CINDY scores (3 days ago) ===
  { id: 'sc-20', gym_id: 'demo-gym-id', session_id: null, member_id: 'm3', workout_template_id: 'tpl-2', workout_name: 'Cindy', score_type: 'rounds_reps', score_value: 23.10, score_display: '23+10', rx: true, scaled: false, scale_notes: null, notes: null, is_pr: true, recorded_at: daysAgoISO(3), created_at: daysAgoISO(3), updated_at: daysAgoISO(3), member: { id: 'm3', name: 'Thomas Brunner', avatar_url: null } },
  { id: 'sc-21', gym_id: 'demo-gym-id', session_id: null, member_id: 'm2', workout_template_id: 'tpl-2', workout_name: 'Cindy', score_type: 'rounds_reps', score_value: 21.05, score_display: '21+5', rx: true, scaled: false, scale_notes: null, notes: null, is_pr: true, recorded_at: daysAgoISO(3), created_at: daysAgoISO(3), updated_at: daysAgoISO(3), member: { id: 'm2', name: 'Laura Zimmermann', avatar_url: null } },
  { id: 'sc-22', gym_id: 'demo-gym-id', session_id: null, member_id: 'm5', workout_template_id: 'tpl-2', workout_name: 'Cindy', score_type: 'rounds_reps', score_value: 20.00, score_display: '20+0', rx: true, scaled: false, scale_notes: null, notes: 'Hit the 20 round target', is_pr: false, recorded_at: daysAgoISO(3), created_at: daysAgoISO(3), updated_at: daysAgoISO(3), member: { id: 'm5', name: 'Luca Müller', avatar_url: null } },
  { id: 'sc-23', gym_id: 'demo-gym-id', session_id: null, member_id: 'm1', workout_template_id: 'tpl-2', workout_name: 'Cindy', score_type: 'rounds_reps', score_value: 18.15, score_display: '18+15', rx: true, scaled: false, scale_notes: null, notes: null, is_pr: false, recorded_at: daysAgoISO(3), created_at: daysAgoISO(3), updated_at: daysAgoISO(3), member: { id: 'm1', name: 'Emma Schneider', avatar_url: null } },
  { id: 'sc-24', gym_id: 'demo-gym-id', session_id: null, member_id: 'm7', workout_template_id: 'tpl-2', workout_name: 'Cindy', score_type: 'rounds_reps', score_value: 15.20, score_display: '15+20', rx: false, scaled: true, scale_notes: 'Ring Rows instead of PU', notes: null, is_pr: true, recorded_at: daysAgoISO(3), created_at: daysAgoISO(3), updated_at: daysAgoISO(3), member: { id: 'm7', name: 'Mia Huber', avatar_url: null } },

  // === BACK SQUAT scores (5 days ago) ===
  { id: 'sc-30', gym_id: 'demo-gym-id', session_id: null, member_id: 'm3', workout_template_id: 'tpl-4', workout_name: 'Back Squat 5x5', score_type: 'load', score_value: 140, score_display: '140 kg', rx: true, scaled: false, scale_notes: null, notes: 'Felt heavy but solid', is_pr: true, recorded_at: daysAgoISO(5), created_at: daysAgoISO(5), updated_at: daysAgoISO(5), member: { id: 'm3', name: 'Thomas Brunner', avatar_url: null } },
  { id: 'sc-31', gym_id: 'demo-gym-id', session_id: null, member_id: 'm5', workout_template_id: 'tpl-4', workout_name: 'Back Squat 5x5', score_type: 'load', score_value: 115, score_display: '115 kg', rx: true, scaled: false, scale_notes: null, notes: null, is_pr: true, recorded_at: daysAgoISO(5), created_at: daysAgoISO(5), updated_at: daysAgoISO(5), member: { id: 'm5', name: 'Luca Müller', avatar_url: null } },
  { id: 'sc-32', gym_id: 'demo-gym-id', session_id: null, member_id: 'm2', workout_template_id: 'tpl-4', workout_name: 'Back Squat 5x5', score_type: 'load', score_value: 85, score_display: '85 kg', rx: true, scaled: false, scale_notes: null, notes: null, is_pr: false, recorded_at: daysAgoISO(5), created_at: daysAgoISO(5), updated_at: daysAgoISO(5), member: { id: 'm2', name: 'Laura Zimmermann', avatar_url: null } },
  { id: 'sc-33', gym_id: 'demo-gym-id', session_id: null, member_id: 'm1', workout_template_id: 'tpl-4', workout_name: 'Back Squat 5x5', score_type: 'load', score_value: 72.5, score_display: '72.5 kg', rx: true, scaled: false, scale_notes: null, notes: 'New 5RM PR!', is_pr: true, recorded_at: daysAgoISO(5), created_at: daysAgoISO(5), updated_at: daysAgoISO(5), member: { id: 'm1', name: 'Emma Schneider', avatar_url: null } },
  { id: 'sc-34', gym_id: 'demo-gym-id', session_id: null, member_id: 'm8', workout_template_id: 'tpl-4', workout_name: 'Back Squat 5x5', score_type: 'load', score_value: 100, score_display: '100 kg', rx: true, scaled: false, scale_notes: null, notes: null, is_pr: false, recorded_at: daysAgoISO(5), created_at: daysAgoISO(5), updated_at: daysAgoISO(5), member: { id: 'm8', name: 'David Steiner', avatar_url: null } },

  // === DT scores (7 days ago) ===
  { id: 'sc-40', gym_id: 'demo-gym-id', session_id: null, member_id: 'm3', workout_template_id: 'tpl-3', workout_name: 'DT', score_type: 'time', score_value: timeToSeconds(7, 12), score_display: '7:12', rx: true, scaled: false, scale_notes: null, notes: 'Unbroken first 3 rounds', is_pr: true, recorded_at: daysAgoISO(7), created_at: daysAgoISO(7), updated_at: daysAgoISO(7), member: { id: 'm3', name: 'Thomas Brunner', avatar_url: null } },
  { id: 'sc-41', gym_id: 'demo-gym-id', session_id: null, member_id: 'm5', workout_template_id: 'tpl-3', workout_name: 'DT', score_type: 'time', score_value: timeToSeconds(8, 45), score_display: '8:45', rx: true, scaled: false, scale_notes: null, notes: null, is_pr: false, recorded_at: daysAgoISO(7), created_at: daysAgoISO(7), updated_at: daysAgoISO(7), member: { id: 'm5', name: 'Luca Müller', avatar_url: null } },
  { id: 'sc-42', gym_id: 'demo-gym-id', session_id: null, member_id: 'm2', workout_template_id: 'tpl-3', workout_name: 'DT', score_type: 'time', score_value: timeToSeconds(9, 30), score_display: '9:30', rx: false, scaled: true, scale_notes: '47.5kg', notes: null, is_pr: true, recorded_at: daysAgoISO(7), created_at: daysAgoISO(7), updated_at: daysAgoISO(7), member: { id: 'm2', name: 'Laura Zimmermann', avatar_url: null } },
  { id: 'sc-43', gym_id: 'demo-gym-id', session_id: null, member_id: 'm6', workout_template_id: 'tpl-3', workout_name: 'DT', score_type: 'time', score_value: timeToSeconds(10, 55), score_display: '10:55', rx: true, scaled: false, scale_notes: null, notes: 'Just made the cap', is_pr: false, recorded_at: daysAgoISO(7), created_at: daysAgoISO(7), updated_at: daysAgoISO(7), member: { id: 'm6', name: 'Sofia Keller', avatar_url: null } },
];

const DEMO_PRS: Array<{
  id: string;
  gym_id: string;
  member_id: string;
  workout_name: string;
  score_type: string;
  score_value: number;
  score_display: string;
  rx: boolean;
  previous_value: number | null;
  previous_display: string | null;
  improvement_pct: number | null;
  score_id: string | null;
  achieved_at: string;
  created_at: string;
  updated_at: string;
}> = [
  { id: 'pr-1', gym_id: 'demo-gym-id', member_id: 'm3', workout_name: 'Fran', score_type: 'time', score_value: timeToSeconds(2, 58), score_display: '2:58', rx: true, previous_value: timeToSeconds(3, 22), previous_display: '3:22', improvement_pct: 11.9, score_id: 'sc-1', achieved_at: daysAgoISO(0), created_at: daysAgoISO(0), updated_at: daysAgoISO(0) },
  { id: 'pr-2', gym_id: 'demo-gym-id', member_id: 'm3', workout_name: 'Back Squat 5x5', score_type: 'load', score_value: 140, score_display: '140 kg', rx: true, previous_value: 135, previous_display: '135 kg', improvement_pct: 3.7, score_id: 'sc-30', achieved_at: daysAgoISO(5), created_at: daysAgoISO(5), updated_at: daysAgoISO(5) },
  { id: 'pr-3', gym_id: 'demo-gym-id', member_id: 'm3', workout_name: 'Cindy', score_type: 'rounds_reps', score_value: 23.10, score_display: '23+10', rx: true, previous_value: 21.00, previous_display: '21+0', improvement_pct: 10.0, score_id: 'sc-20', achieved_at: daysAgoISO(3), created_at: daysAgoISO(3), updated_at: daysAgoISO(3) },
  { id: 'pr-4', gym_id: 'demo-gym-id', member_id: 'm3', workout_name: 'DT', score_type: 'time', score_value: timeToSeconds(7, 12), score_display: '7:12', rx: true, previous_value: timeToSeconds(8, 5), previous_display: '8:05', improvement_pct: 10.9, score_id: 'sc-40', achieved_at: daysAgoISO(7), created_at: daysAgoISO(7), updated_at: daysAgoISO(7) },
  { id: 'pr-5', gym_id: 'demo-gym-id', member_id: 'm5', workout_name: 'Fran', score_type: 'time', score_value: timeToSeconds(3, 42), score_display: '3:42', rx: true, previous_value: timeToSeconds(4, 10), previous_display: '4:10', improvement_pct: 11.2, score_id: 'sc-2', achieved_at: daysAgoISO(0), created_at: daysAgoISO(0), updated_at: daysAgoISO(0) },
  { id: 'pr-6', gym_id: 'demo-gym-id', member_id: 'm5', workout_name: 'Back Squat 5x5', score_type: 'load', score_value: 115, score_display: '115 kg', rx: true, previous_value: 110, previous_display: '110 kg', improvement_pct: 4.5, score_id: 'sc-31', achieved_at: daysAgoISO(5), created_at: daysAgoISO(5), updated_at: daysAgoISO(5) },
  { id: 'pr-7', gym_id: 'demo-gym-id', member_id: 'm1', workout_name: 'Back Squat 5x5', score_type: 'load', score_value: 72.5, score_display: '72.5 kg', rx: true, previous_value: 70, previous_display: '70 kg', improvement_pct: 3.6, score_id: 'sc-33', achieved_at: daysAgoISO(5), created_at: daysAgoISO(5), updated_at: daysAgoISO(5) },
  { id: 'pr-8', gym_id: 'demo-gym-id', member_id: 'm2', workout_name: 'Cindy', score_type: 'rounds_reps', score_value: 21.05, score_display: '21+5', rx: true, previous_value: 19.00, previous_display: '19+0', improvement_pct: 10.8, score_id: 'sc-21', achieved_at: daysAgoISO(3), created_at: daysAgoISO(3), updated_at: daysAgoISO(3) },
];

// ============================================================
// SERVICE
// ============================================================

export const leaderboardService = {
  /** Get scores for a specific workout (leaderboard) */
  async getScoresByWorkout(gymId: string, workoutName: string) {
    if (isDemoMode()) {
      return DEMO_SCORES
        .filter((s) => s.workout_name === workoutName)
        .sort((a, b) => {
          // Time: lower is better. Everything else: higher is better
          if (a.score_type === 'time') return a.score_value - b.score_value;
          return b.score_value - a.score_value;
        });
    }

    const { data, error } = await supabase
      .from('workout_scores')
      .select('*, member:members(id, name, avatar_url)')
      .eq('gym_id', gymId)
      .eq('workout_name', workoutName)
      .order('score_value', { ascending: true });

    if (error) throw error;
    return data;
  },

  /** Get scores for a specific session */
  async getScoresBySession(gymId: string, sessionId: string) {
    if (isDemoMode()) {
      return DEMO_SCORES.filter((s) => s.session_id === sessionId);
    }

    const { data, error } = await supabase
      .from('workout_scores')
      .select('*, member:members(id, name, avatar_url)')
      .eq('gym_id', gymId)
      .eq('session_id', sessionId)
      .order('score_value', { ascending: true });

    if (error) throw error;
    return data;
  },

  /** Get recent scores across all workouts */
  async getRecentScores(gymId: string, limit = 20) {
    if (isDemoMode()) {
      return [...DEMO_SCORES]
        .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
        .slice(0, limit);
    }

    const { data, error } = await supabase
      .from('workout_scores')
      .select('*, member:members(id, name, avatar_url)')
      .eq('gym_id', gymId)
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  /** Get recent PRs */
  async getRecentPRs(gymId: string, limit = 10) {
    if (isDemoMode()) {
      return DEMO_SCORES
        .filter((s) => s.is_pr)
        .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
        .slice(0, limit);
    }

    const { data, error } = await supabase
      .from('workout_scores')
      .select('*, member:members(id, name, avatar_url)')
      .eq('gym_id', gymId)
      .eq('is_pr', true)
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  /** Get PRs for a specific member */
  async getMemberPRs(gymId: string, memberId: string) {
    if (isDemoMode()) {
      return DEMO_PRS.filter((p) => p.member_id === memberId);
    }

    const { data, error } = await supabase
      .from('personal_records')
      .select('*')
      .eq('gym_id', gymId)
      .eq('member_id', memberId)
      .order('achieved_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /** Get score history for a member on a specific workout */
  async getMemberWorkoutHistory(gymId: string, memberId: string, workoutName: string) {
    if (isDemoMode()) {
      return DEMO_SCORES
        .filter((s) => s.member_id === memberId && s.workout_name === workoutName)
        .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
    }

    const { data, error } = await supabase
      .from('workout_scores')
      .select('*')
      .eq('gym_id', gymId)
      .eq('member_id', memberId)
      .eq('workout_name', workoutName)
      .order('recorded_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  /** Get all unique workout names that have scores */
  async getWorkoutNames(gymId: string) {
    if (isDemoMode()) {
      return [...new Set(DEMO_SCORES.map((s) => s.workout_name))];
    }

    const { data, error } = await supabase
      .from('workout_scores')
      .select('workout_name')
      .eq('gym_id', gymId)
      .order('workout_name');

    if (error) throw error;
    return [...new Set((data || []).map((d) => d.workout_name))];
  },

  /** Log a new score (and check for PR) */
  async logScore(score: WorkoutScoreInsert) {
    if (isDemoMode()) {
      toast('Score logged (demo mode)');
      return;
    }

    // Check if this is a PR
    const { data: existing } = await supabase
      .from('personal_records')
      .select('*')
      .eq('gym_id', score.gym_id)
      .eq('member_id', score.member_id)
      .eq('workout_name', score.workout_name)
      .eq('score_type', score.score_type)
      .eq('rx', score.rx ?? false)
      .maybeSingle();

    let isPR = false;
    if (!existing) {
      isPR = true;
    } else {
      // Time: lower is better. Everything else: higher is better
      if (score.score_type === 'time') {
        isPR = score.score_value < existing.score_value;
      } else {
        isPR = score.score_value > existing.score_value;
      }
    }

    // Insert score
    const { data: newScore, error } = await supabase
      .from('workout_scores')
      .insert({ ...score, is_pr: isPR })
      .select()
      .single();

    if (error) throw error;

    // Update PR table if new PR
    if (isPR && newScore) {
      const prData = {
        gym_id: score.gym_id,
        member_id: score.member_id,
        workout_name: score.workout_name,
        score_type: score.score_type,
        score_value: score.score_value,
        score_display: score.score_display,
        rx: score.rx ?? false,
        previous_value: existing?.score_value ?? null,
        previous_display: existing?.score_display ?? null,
        improvement_pct: existing
          ? Math.round(Math.abs((score.score_value - existing.score_value) / existing.score_value) * 1000) / 10
          : null,
        score_id: newScore.id,
        achieved_at: new Date().toISOString(),
      };

      if (existing) {
        await supabase
          .from('personal_records')
          .update(prData)
          .eq('id', existing.id);
      } else {
        await supabase.from('personal_records').insert(prData);
      }
    }

    return { ...newScore, is_pr: isPR };
  },

  async deleteScore(id: string) {
    const { error } = await supabase.from('workout_scores').delete().eq('id', id);
    if (error) throw error;
  },
};

function toast(msg: string) {
  // Will be overridden by sonner in the UI
  console.log(msg);
}

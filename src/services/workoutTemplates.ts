import { supabase } from '@/lib/supabase';
import type { InsertTables, UpdateTables, WorkoutCategory } from '@/types/database';
import { isDemoMode } from './demoData';
import type { WorkoutBlock } from '@/types/workout';

export type WorkoutTemplateInsert = InsertTables<'workout_templates'>;
export type WorkoutTemplateUpdate = UpdateTables<'workout_templates'>;

// Demo templates for presentation mode
const DEMO_TEMPLATES: Array<{
  id: string;
  gym_id: string;
  created_by: string;
  name: string;
  category: WorkoutCategory;
  wod_type: string | null;
  time_cap: string | null;
  rounds: string | null;
  description: string | null;
  movements: any;
  coach_notes: string | null;
  score_type: string | null;
  tags: string[];
  is_benchmark: boolean;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}> = [
  {
    id: 'tpl-1', gym_id: 'demo-gym-id', created_by: 'demo-user-id',
    name: 'Fran', category: 'wod', wod_type: 'for_time',
    time_cap: '10 min', rounds: '21-15-9', description: 'Classic CrossFit benchmark',
    movements: [
      { name: 'Thrusters', reps: '21-15-9', weight: 'RX: 43/30 kg', category: 'barbell', notes: 'Scale: 30/20 kg' },
      { name: 'Pull-Ups', reps: '21-15-9', category: 'gymnastics', notes: 'Scale: Banded or Ring Rows' },
    ],
    coach_notes: 'Push athletes to go unbroken where possible.', score_type: 'Time',
    tags: ['benchmark', 'barbell', 'gymnastics'], is_benchmark: true,
    usage_count: 12, last_used_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(), updated_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'tpl-2', gym_id: 'demo-gym-id', created_by: 'demo-user-id',
    name: 'Cindy', category: 'wod', wod_type: 'amrap',
    time_cap: '20 min AMRAP', rounds: null, description: 'Bodyweight benchmark',
    movements: [
      { name: 'Pull-Ups', reps: '5', category: 'gymnastics' },
      { name: 'Push-Ups', reps: '10', category: 'bodyweight' },
      { name: 'Air Squats', reps: '15', category: 'bodyweight' },
    ],
    coach_notes: 'Target 20+ rounds RX. Beginners aim for 12-15.', score_type: 'Rounds + Reps',
    tags: ['benchmark', 'bodyweight'], is_benchmark: true,
    usage_count: 8, last_used_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(), updated_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'tpl-3', gym_id: 'demo-gym-id', created_by: 'demo-user-id',
    name: 'DT', category: 'wod', wod_type: 'for_time',
    time_cap: '12 min', rounds: '5 Rounds', description: 'Hero WOD — all barbell, same weight',
    movements: [
      { name: 'Deadlifts', reps: '12', weight: 'RX: 70/47.5 kg', category: 'barbell' },
      { name: 'Hang Power Cleans', reps: '9', weight: 'RX: 70/47.5 kg', category: 'barbell' },
      { name: 'Push Jerks', reps: '6', weight: 'RX: 70/47.5 kg', category: 'barbell' },
    ],
    coach_notes: 'Hero WOD — honor the intent. Touch and go is ideal.', score_type: 'Time',
    tags: ['benchmark', 'hero', 'barbell'], is_benchmark: true,
    usage_count: 5, last_used_at: new Date(Date.now() - 21 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(), updated_at: new Date(Date.now() - 21 * 86400000).toISOString(),
  },
  {
    id: 'tpl-4', gym_id: 'demo-gym-id', created_by: 'demo-user-id',
    name: 'Back Squat 5x5', category: 'strength', wod_type: null,
    time_cap: null, rounds: '5 x 5', description: 'Build to a heavy set of 5',
    movements: [
      { name: 'Back Squat', reps: '5-5-5-5-5', weight: 'Build to heavy', category: 'barbell', notes: 'Rest 2-3 min between sets' },
    ],
    coach_notes: 'Focus on depth and bracing. Newer athletes stay light.', score_type: 'Load',
    tags: ['strength', 'squat', 'barbell'], is_benchmark: false,
    usage_count: 18, last_used_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(), updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'tpl-5', gym_id: 'demo-gym-id', created_by: 'demo-user-id',
    name: 'Deadlift 5x3', category: 'strength', wod_type: null,
    time_cap: null, rounds: '5 x 3', description: '80-85% of 1RM',
    movements: [
      { name: 'Deadlift', reps: '3-3-3-3-3', weight: '80-85% 1RM', category: 'barbell', notes: 'Touch and go or reset' },
    ],
    coach_notes: 'Watch for rounded backs. Cue "push the floor away".', score_type: 'Load',
    tags: ['strength', 'deadlift', 'barbell'], is_benchmark: false,
    usage_count: 15, last_used_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(), updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'tpl-6', gym_id: 'demo-gym-id', created_by: 'demo-user-id',
    name: 'General Warm-Up', category: 'warmup', wod_type: null,
    time_cap: null, rounds: '3 Rounds', description: 'Easy pace warm-up',
    movements: [
      { name: 'Row', reps: '250m', category: 'monostructural' },
      { name: 'Inchworms', reps: '5', category: 'bodyweight' },
      { name: 'Air Squats', reps: '10', category: 'bodyweight' },
      { name: 'Push-Ups', reps: '10', category: 'bodyweight' },
      { name: 'Ring Rows', reps: '10', category: 'gymnastics' },
    ],
    coach_notes: null, score_type: null,
    tags: ['warmup', 'general'], is_benchmark: false,
    usage_count: 42, last_used_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(), updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'tpl-7', gym_id: 'demo-gym-id', created_by: 'demo-user-id',
    name: 'Cool Down & Mobility', category: 'cooldown', wod_type: null,
    time_cap: null, rounds: null, description: '5-10 min stretch and mobilize',
    movements: [
      { name: 'Foam Roll Quads & Lats', reps: '2 min each', category: 'bodyweight' },
      { name: 'Pigeon Stretch', reps: '1 min each side', category: 'bodyweight' },
      { name: 'Couch Stretch', reps: '1 min each side', category: 'bodyweight' },
      { name: 'Banded Shoulder Stretch', reps: '1 min each', category: 'bodyweight' },
    ],
    coach_notes: null, score_type: null,
    tags: ['cooldown', 'mobility'], is_benchmark: false,
    usage_count: 38, last_used_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(), updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'tpl-8', gym_id: 'demo-gym-id', created_by: 'demo-user-id',
    name: 'Chipper', category: 'wod', wod_type: 'chipper',
    time_cap: '25 min', rounds: null, description: 'Go through once — partition however you want',
    movements: [
      { name: 'Calorie Row', reps: '50', category: 'monostructural' },
      { name: 'Double-Unders', reps: '100', category: 'monostructural', notes: 'Scale: 200 Singles' },
      { name: 'Wall Balls', reps: '75', weight: '9/6 kg', category: 'other' },
      { name: 'Power Cleans', reps: '50', weight: '50/35 kg', category: 'barbell' },
      { name: 'HSPU', reps: '25', category: 'gymnastics', notes: 'Scale: DB Press or Pike Push-Ups' },
    ],
    coach_notes: 'Manage transitions. This is a grinder.', score_type: 'Time',
    tags: ['chipper', 'long', 'mixed'], is_benchmark: false,
    usage_count: 3, last_used_at: new Date(Date.now() - 28 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(), updated_at: new Date(Date.now() - 28 * 86400000).toISOString(),
  },
];

export const workoutTemplatesService = {
  async getAll(gymId: string) {
    if (isDemoMode()) return DEMO_TEMPLATES;

    const { data, error } = await supabase
      .from('workout_templates')
      .select('*')
      .eq('gym_id', gymId)
      .order('usage_count', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByCategory(gymId: string, category: WorkoutCategory) {
    if (isDemoMode()) return DEMO_TEMPLATES.filter(t => t.category === category);

    const { data, error } = await supabase
      .from('workout_templates')
      .select('*')
      .eq('gym_id', gymId)
      .eq('category', category)
      .order('usage_count', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getBenchmarks(gymId: string) {
    if (isDemoMode()) return DEMO_TEMPLATES.filter(t => t.is_benchmark);

    const { data, error } = await supabase
      .from('workout_templates')
      .select('*')
      .eq('gym_id', gymId)
      .eq('is_benchmark', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async create(template: WorkoutTemplateInsert) {
    const { data, error } = await supabase
      .from('workout_templates')
      .insert(template)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: WorkoutTemplateUpdate) {
    const { data, error } = await supabase
      .from('workout_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('workout_templates').delete().eq('id', id);
    if (error) throw error;
  },

  async incrementUsage(id: string) {
    if (isDemoMode()) return;

    const { error } = await supabase.rpc('increment_workout_usage', { template_id: id });
    if (error) {
      // Fallback if RPC doesn't exist
      const { data } = await supabase
        .from('workout_templates')
        .select('usage_count')
        .eq('id', id)
        .single();
      if (data) {
        await supabase
          .from('workout_templates')
          .update({ usage_count: (data.usage_count || 0) + 1, last_used_at: new Date().toISOString() })
          .eq('id', id);
      }
    }
  },

  /** Save workout blocks to a session */
  async saveSessionWorkout(sessionId: string, blocks: WorkoutBlock[]) {
    if (isDemoMode()) return;

    const { error } = await supabase
      .from('sessions')
      .update({ workout_data: blocks as any, updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) throw error;
  },

  /** Convert a template to a WorkoutBlock for use in sessions */
  templateToBlock(template: typeof DEMO_TEMPLATES[number]): WorkoutBlock {
    return {
      id: template.id,
      category: template.category as WorkoutBlock['category'],
      title: template.name,
      wodType: template.wod_type as WorkoutBlock['wodType'],
      timeCap: template.time_cap || undefined,
      rounds: template.rounds || undefined,
      description: template.description || undefined,
      movements: template.movements as WorkoutBlock['movements'],
      coachNotes: template.coach_notes || undefined,
      scoreType: template.score_type || undefined,
    };
  },
};

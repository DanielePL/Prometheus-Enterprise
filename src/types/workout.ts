// WOD / Workout Programming Types

export type WorkoutCategory = 'warmup' | 'strength' | 'wod' | 'accessory' | 'cooldown' | 'skill';
export type WodType = 'amrap' | 'emom' | 'for_time' | 'rounds' | 'tabata' | 'chipper' | 'custom';
export type MovementCategory = 'barbell' | 'gymnastics' | 'monostructural' | 'kettlebell' | 'dumbbell' | 'bodyweight' | 'other';

export interface WorkoutMovement {
  name: string;
  reps?: string;       // e.g. "21-15-9", "10", "Max"
  weight?: string;     // e.g. "60/40 kg", "RX: 70kg"
  notes?: string;      // e.g. "Scale: Ring rows"
  category?: MovementCategory;
}

export interface WorkoutBlock {
  id: string;
  category: WorkoutCategory;
  title: string;              // e.g. "Fran", "Warm-Up", "Back Squat"
  wodType?: WodType;          // only for WOD blocks
  timeCap?: string;           // e.g. "12 min", "20 min AMRAP"
  rounds?: string;            // e.g. "5 Rounds", "21-15-9"
  description?: string;       // free-text description
  movements: WorkoutMovement[];
  coachNotes?: string;        // internal notes for coaches
  scoreType?: string;         // e.g. "Time", "Rounds + Reps", "Load"
}

export interface SessionWorkout {
  sessionId: string;
  blocks: WorkoutBlock[];
}

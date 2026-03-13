// Demo WOD programming data for CrossFit sessions
import type { WorkoutBlock, SessionWorkout } from '@/types/workout';

// ============================================================
// WORKOUT BLOCK LIBRARY — realistic CrossFit programming
// ============================================================

const WARMUPS: WorkoutBlock[] = [
  {
    id: 'wu-1',
    category: 'warmup',
    title: 'General Warm-Up',
    description: '3 Rounds — easy pace',
    movements: [
      { name: 'Row', reps: '250m', category: 'monostructural' },
      { name: 'Inchworms', reps: '5', category: 'bodyweight' },
      { name: 'Air Squats', reps: '10', category: 'bodyweight' },
      { name: 'Push-Ups', reps: '10', category: 'bodyweight' },
      { name: 'Ring Rows', reps: '10', category: 'gymnastics' },
    ],
  },
  {
    id: 'wu-2',
    category: 'warmup',
    title: 'Warm-Up',
    description: '2 Rounds',
    movements: [
      { name: 'Bike', reps: '1 min', category: 'monostructural' },
      { name: 'PVC Pass-Throughs', reps: '10', category: 'bodyweight' },
      { name: 'Sampson Stretch', reps: '30s each', category: 'bodyweight' },
      { name: 'Scap Pull-Ups', reps: '10', category: 'gymnastics' },
      { name: 'Kip Swings', reps: '10', category: 'gymnastics' },
    ],
  },
  {
    id: 'wu-3',
    category: 'warmup',
    title: 'Warm-Up',
    description: '3 Rounds',
    movements: [
      { name: 'Jump Rope', reps: '1 min', category: 'monostructural' },
      { name: 'Banded Pull-Aparts', reps: '15', category: 'bodyweight' },
      { name: 'Empty Bar Deadlifts', reps: '10', category: 'barbell' },
      { name: 'Hollow Holds', reps: '20s', category: 'gymnastics' },
    ],
  },
];

const STRENGTH_BLOCKS: WorkoutBlock[] = [
  {
    id: 'str-1',
    category: 'strength',
    title: 'Back Squat',
    description: 'Build to a heavy set of 5',
    movements: [
      { name: 'Back Squat', reps: '5-5-5-5-5', weight: 'Build to heavy', category: 'barbell', notes: 'Rest 2-3 min between sets' },
    ],
    coachNotes: 'Focus on depth and bracing. Newer athletes should stay light and work on form.',
    scoreType: 'Load',
  },
  {
    id: 'str-2',
    category: 'strength',
    title: 'Deadlift',
    description: '5 x 3 @ 80-85%',
    movements: [
      { name: 'Deadlift', reps: '3-3-3-3-3', weight: '80-85% 1RM', category: 'barbell', notes: 'Touch and go or reset — athlete choice' },
    ],
    coachNotes: 'Watch for rounded backs. Cue "push the floor away".',
    scoreType: 'Load',
  },
  {
    id: 'str-3',
    category: 'strength',
    title: 'Bench Press & Strict Press',
    description: 'Superset — 4 Sets',
    movements: [
      { name: 'Bench Press', reps: '8', weight: 'Moderate', category: 'barbell' },
      { name: 'Strict Press', reps: '8', weight: 'Moderate', category: 'barbell' },
    ],
    coachNotes: 'Alternate between movements. Rest 90s between supersets.',
    scoreType: 'Load',
  },
  {
    id: 'str-4',
    category: 'strength',
    title: 'Front Squat',
    description: 'Every 2 min x 6 sets',
    movements: [
      { name: 'Front Squat', reps: '3', weight: '75-85% 1RM', category: 'barbell', notes: 'Build across sets' },
    ],
    coachNotes: 'Elbows high, full depth. Scale to goblet squat if needed.',
    scoreType: 'Load',
  },
  {
    id: 'str-5',
    category: 'strength',
    title: 'Overhead Squat',
    description: '5 x 2 — Build to heavy',
    movements: [
      { name: 'Overhead Squat', reps: '2-2-2-2-2', weight: 'Build to heavy', category: 'barbell', notes: 'Use snatch grip' },
    ],
    coachNotes: 'Mobility check first. Scale to front squat if overhead position is limited.',
    scoreType: 'Load',
  },
];

const WODS: WorkoutBlock[] = [
  {
    id: 'wod-1',
    category: 'wod',
    title: 'Fran',
    wodType: 'for_time',
    rounds: '21-15-9',
    timeCap: '10 min',
    movements: [
      { name: 'Thrusters', reps: '21-15-9', weight: 'RX: 43/30 kg', category: 'barbell', notes: 'Scale: 30/20 kg' },
      { name: 'Pull-Ups', reps: '21-15-9', category: 'gymnastics', notes: 'Scale: Banded or Ring Rows' },
    ],
    coachNotes: 'Classic benchmark. Push athletes to go unbroken where possible. Time cap 10 min.',
    scoreType: 'Time',
  },
  {
    id: 'wod-2',
    category: 'wod',
    title: 'Metcon',
    wodType: 'amrap',
    timeCap: '20 min AMRAP',
    movements: [
      { name: 'Wall Balls', reps: '15', weight: '9/6 kg', category: 'other', notes: '10ft/9ft target' },
      { name: 'Box Jumps', reps: '12', weight: '24/20 inch', category: 'bodyweight', notes: 'Step-down allowed' },
      { name: 'Toes-to-Bar', reps: '9', category: 'gymnastics', notes: 'Scale: Hanging Knee Raises' },
    ],
    coachNotes: 'Pace this one. Should aim for 5-7 rounds. T2B will be the limiter for most.',
    scoreType: 'Rounds + Reps',
  },
  {
    id: 'wod-3',
    category: 'wod',
    title: 'DT',
    wodType: 'for_time',
    rounds: '5 Rounds',
    timeCap: '12 min',
    movements: [
      { name: 'Deadlifts', reps: '12', weight: 'RX: 70/47.5 kg', category: 'barbell' },
      { name: 'Hang Power Cleans', reps: '9', weight: 'RX: 70/47.5 kg', category: 'barbell' },
      { name: 'Push Jerks', reps: '6', weight: 'RX: 70/47.5 kg', category: 'barbell' },
    ],
    coachNotes: 'All barbell, same weight. Touch and go is ideal. Hero WOD — honor the intent.',
    scoreType: 'Time',
  },
  {
    id: 'wod-4',
    category: 'wod',
    title: 'Metcon',
    wodType: 'emom',
    timeCap: '24 min EMOM',
    rounds: 'E3MOM x 8 sets',
    movements: [
      { name: 'Row', reps: '15/12 Cal', category: 'monostructural' },
      { name: 'Burpees over Rower', reps: '8', category: 'bodyweight' },
      { name: 'Dumbbell Snatches', reps: '10 (alt)', weight: '22.5/15 kg', category: 'dumbbell' },
    ],
    coachNotes: 'E3MOM = every 3 minutes. Should finish each round in about 2:15-2:30. Rest is the reward.',
    scoreType: 'Rounds + Reps',
  },
  {
    id: 'wod-5',
    category: 'wod',
    title: 'Cindy',
    wodType: 'amrap',
    timeCap: '20 min AMRAP',
    movements: [
      { name: 'Pull-Ups', reps: '5', category: 'gymnastics', notes: 'Scale: Banded or Ring Rows' },
      { name: 'Push-Ups', reps: '10', category: 'bodyweight' },
      { name: 'Air Squats', reps: '15', category: 'bodyweight' },
    ],
    coachNotes: 'Classic bodyweight benchmark. Target 20+ rounds for RX athletes. Beginners aim for 12-15.',
    scoreType: 'Rounds + Reps',
  },
  {
    id: 'wod-6',
    category: 'wod',
    title: 'Metcon',
    wodType: 'for_time',
    timeCap: '15 min',
    rounds: '3 Rounds',
    movements: [
      { name: 'Run', reps: '400m', category: 'monostructural' },
      { name: 'Kettlebell Swings', reps: '21', weight: '24/16 kg', category: 'kettlebell' },
      { name: 'Ring Dips', reps: '12', category: 'gymnastics', notes: 'Scale: Box Dips or Banded' },
    ],
    coachNotes: 'Run should be fast but controlled. KB swings are American (overhead). Ring dips will slow people down.',
    scoreType: 'Time',
  },
  {
    id: 'wod-7',
    category: 'wod',
    title: 'Metcon',
    wodType: 'chipper',
    timeCap: '25 min',
    movements: [
      { name: 'Calorie Row', reps: '50', category: 'monostructural' },
      { name: 'Double-Unders', reps: '100', category: 'monostructural', notes: 'Scale: 200 Singles' },
      { name: 'Wall Balls', reps: '75', weight: '9/6 kg', category: 'other' },
      { name: 'Power Cleans', reps: '50', weight: '50/35 kg', category: 'barbell' },
      { name: 'Handstand Push-Ups', reps: '25', category: 'gymnastics', notes: 'Scale: DB Press or Pike Push-Ups' },
    ],
    coachNotes: 'Chipper — go through once. Partition however you want. Manage the transitions.',
    scoreType: 'Time',
  },
];

const SKILL_BLOCKS: WorkoutBlock[] = [
  {
    id: 'skill-1',
    category: 'skill',
    title: 'Muscle-Up Progressions',
    description: '15 min practice',
    movements: [
      { name: 'Kip Swings on Rings', reps: '3 x 10', category: 'gymnastics' },
      { name: 'Transition Drill', reps: '3 x 5', category: 'gymnastics' },
      { name: 'Muscle-Up Attempts', reps: 'Max in 5 min', category: 'gymnastics' },
    ],
    coachNotes: 'Only for athletes who have a solid kipping pull-up. Others do banded transitions.',
  },
  {
    id: 'skill-2',
    category: 'skill',
    title: 'Handstand Walk Practice',
    description: '10 min',
    movements: [
      { name: 'Wall Walks', reps: '3 x 3', category: 'gymnastics' },
      { name: 'HS Hold (nose to wall)', reps: '3 x 30s', category: 'gymnastics' },
      { name: 'HS Walk Attempts', reps: '5 x max distance', category: 'gymnastics' },
    ],
    coachNotes: 'Scale: shoulder taps on wall, pike on box holds.',
  },
];

const COOLDOWNS: WorkoutBlock[] = [
  {
    id: 'cd-1',
    category: 'cooldown',
    title: 'Cool Down',
    description: '5-10 min — stretch and mobilize',
    movements: [
      { name: 'Foam Roll Quads & Lats', reps: '2 min each', category: 'bodyweight' },
      { name: 'Pigeon Stretch', reps: '1 min each side', category: 'bodyweight' },
      { name: 'Couch Stretch', reps: '1 min each side', category: 'bodyweight' },
      { name: 'Banded Shoulder Stretch', reps: '1 min each', category: 'bodyweight' },
    ],
  },
];

const ACCESSORY_BLOCKS: WorkoutBlock[] = [
  {
    id: 'acc-1',
    category: 'accessory',
    title: 'Accessory Work',
    description: '3 Rounds — not for time',
    movements: [
      { name: 'GHD Hip Extensions', reps: '15', category: 'gymnastics' },
      { name: 'Banded Face Pulls', reps: '20', category: 'bodyweight' },
      { name: 'Plank Hold', reps: '45s', category: 'bodyweight' },
    ],
    coachNotes: 'Optional but recommended. Focus on posterior chain and midline.',
  },
  {
    id: 'acc-2',
    category: 'accessory',
    title: 'Accessory Work',
    description: 'EMOM 8 min',
    movements: [
      { name: 'Odd: DB Rows', reps: '10 each arm', weight: 'Heavy', category: 'dumbbell' },
      { name: 'Even: Hollow Rocks', reps: '15', category: 'gymnastics' },
    ],
  },
];

// ============================================================
// MAP SESSION TEMPLATES TO WORKOUTS
// ============================================================

/** Deterministic mapping of session + day to workout blocks */
export function getWorkoutForSession(sessionTitle: string, dayOfYear: number): WorkoutBlock[] {
  const blocks: WorkoutBlock[] = [];
  const seed = dayOfYear;

  // Always add a warmup
  blocks.push(WARMUPS[seed % WARMUPS.length]);

  const titleLower = sessionTitle.toLowerCase();

  if (titleLower.includes('crossfit')) {
    // CrossFit classes: warmup + strength/skill + WOD + cooldown
    if (seed % 3 === 0) {
      blocks.push(SKILL_BLOCKS[seed % SKILL_BLOCKS.length]);
    } else {
      blocks.push(STRENGTH_BLOCKS[seed % STRENGTH_BLOCKS.length]);
    }
    blocks.push(WODS[seed % WODS.length]);
    if (seed % 2 === 0) blocks.push(ACCESSORY_BLOCKS[seed % ACCESSORY_BLOCKS.length]);
    blocks.push(COOLDOWNS[0]);
  } else if (titleLower.includes('strength') || titleLower.includes('power')) {
    // Strength-focused: warmup + 2 strength blocks + accessory
    blocks.push(STRENGTH_BLOCKS[seed % STRENGTH_BLOCKS.length]);
    blocks.push(STRENGTH_BLOCKS[(seed + 2) % STRENGTH_BLOCKS.length]);
    blocks.push(ACCESSORY_BLOCKS[seed % ACCESSORY_BLOCKS.length]);
    blocks.push(COOLDOWNS[0]);
  } else if (titleLower.includes('hiit') || titleLower.includes('functional')) {
    // HIIT: warmup + WOD (intense)
    blocks.push(WODS[(seed + 1) % WODS.length]);
    blocks.push(COOLDOWNS[0]);
  } else if (titleLower.includes('yoga') || titleLower.includes('pilates')) {
    // Yoga/Pilates: different blocks — just use the warmup block as full session
    blocks.length = 0; // Clear warmup
    blocks.push({
      id: `yoga-${seed}`,
      category: 'warmup',
      title: titleLower.includes('yoga') ? 'Vinyasa Flow' : 'Pilates Mat Work',
      description: '60 min guided class',
      movements: titleLower.includes('yoga') ? [
        { name: 'Sun Salutation A', reps: '5 rounds', category: 'bodyweight' },
        { name: 'Sun Salutation B', reps: '3 rounds', category: 'bodyweight' },
        { name: 'Warrior Flow Sequence', reps: '10 min', category: 'bodyweight' },
        { name: 'Balance Poses', reps: '10 min', category: 'bodyweight' },
        { name: 'Hip Openers', reps: '10 min', category: 'bodyweight' },
        { name: 'Savasana', reps: '5 min', category: 'bodyweight' },
      ] : [
        { name: 'The Hundred', reps: '100 pulses', category: 'bodyweight' },
        { name: 'Roll-Ups', reps: '10', category: 'bodyweight' },
        { name: 'Single Leg Circles', reps: '10 each', category: 'bodyweight' },
        { name: 'Teaser', reps: '5', category: 'bodyweight' },
        { name: 'Swimming', reps: '20', category: 'bodyweight' },
        { name: 'Side Plank Series', reps: '30s each', category: 'bodyweight' },
      ],
    });
  } else if (titleLower.includes('personal')) {
    // Personal training: flexible — show a simple template
    blocks.push(STRENGTH_BLOCKS[(seed + 1) % STRENGTH_BLOCKS.length]);
    blocks.push({
      id: `pt-wod-${seed}`,
      category: 'wod',
      title: 'Conditioning',
      wodType: 'custom',
      timeCap: '15 min',
      description: 'Tailored to client goals',
      movements: [
        { name: 'Programmed based on client assessment', category: 'other' },
      ],
      coachNotes: 'Adjust intensity based on client energy and recovery status.',
      scoreType: 'Notes',
    });
  } else {
    // Default: warmup + WOD
    blocks.push(WODS[(seed + 3) % WODS.length]);
    blocks.push(COOLDOWNS[0]);
  }

  return blocks;
}

/** Get day-of-year for a date */
export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

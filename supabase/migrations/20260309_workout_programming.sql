-- Workout Programming (clean slate)

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS workout_data JSONB;

DROP TABLE IF EXISTS workout_templates CASCADE;

CREATE TABLE workout_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('warmup', 'strength', 'wod', 'accessory', 'cooldown', 'skill')),
    wod_type TEXT CHECK (wod_type IN ('amrap', 'emom', 'for_time', 'rounds', 'tabata', 'chipper', 'custom')),
    time_cap TEXT,
    rounds TEXT,
    description TEXT,
    movements JSONB NOT NULL DEFAULT '[]',
    coach_notes TEXT,
    score_type TEXT,
    tags TEXT[] DEFAULT '{}',
    is_benchmark BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workout_templates_gym_id ON workout_templates(gym_id);
CREATE INDEX idx_workout_templates_category ON workout_templates(category);
CREATE INDEX idx_workout_templates_is_benchmark ON workout_templates(is_benchmark);
CREATE INDEX idx_workout_templates_tags ON workout_templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_sessions_workout_data ON sessions USING GIN(workout_data) WHERE workout_data IS NOT NULL;

CREATE TRIGGER update_workout_templates_updated_at BEFORE UPDATE ON workout_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workout templates for their gym" ON workout_templates FOR SELECT
USING (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Coaches and above can manage workout templates" ON workout_templates FOR ALL
USING (gym_id IN (SELECT p.gym_id FROM profiles p WHERE p.id = auth.uid() AND p.role::text IN ('owner', 'admin', 'manager', 'coach')));

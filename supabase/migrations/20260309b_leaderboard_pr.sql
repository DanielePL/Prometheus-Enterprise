-- Leaderboard & PR Tracking (clean slate)

DROP TABLE IF EXISTS personal_records CASCADE;
DROP TABLE IF EXISTS workout_scores CASCADE;

CREATE TABLE workout_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    workout_template_id UUID REFERENCES workout_templates(id) ON DELETE SET NULL,
    workout_name TEXT NOT NULL,
    score_type TEXT NOT NULL CHECK (score_type IN ('time', 'rounds_reps', 'load', 'reps', 'calories', 'distance', 'custom')),
    score_value DECIMAL(10,2) NOT NULL,
    score_display TEXT NOT NULL,
    rx BOOLEAN DEFAULT FALSE,
    scaled BOOLEAN DEFAULT FALSE,
    scale_notes TEXT,
    notes TEXT,
    is_pr BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE personal_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    workout_name TEXT NOT NULL,
    score_type TEXT NOT NULL,
    score_value DECIMAL(10,2) NOT NULL,
    score_display TEXT NOT NULL,
    rx BOOLEAN DEFAULT FALSE,
    previous_value DECIMAL(10,2),
    previous_display TEXT,
    improvement_pct DECIMAL(5,2),
    score_id UUID REFERENCES workout_scores(id) ON DELETE SET NULL,
    achieved_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gym_id, member_id, workout_name, score_type, rx)
);

CREATE INDEX idx_workout_scores_gym_id ON workout_scores(gym_id);
CREATE INDEX idx_workout_scores_session_id ON workout_scores(session_id);
CREATE INDEX idx_workout_scores_member_id ON workout_scores(member_id);
CREATE INDEX idx_workout_scores_workout_name ON workout_scores(workout_name);
CREATE INDEX idx_workout_scores_is_pr ON workout_scores(is_pr) WHERE is_pr = TRUE;
CREATE INDEX idx_workout_scores_recorded_at ON workout_scores(recorded_at DESC);
CREATE INDEX idx_personal_records_gym_id ON personal_records(gym_id);
CREATE INDEX idx_personal_records_member_id ON personal_records(member_id);
CREATE INDEX idx_personal_records_workout_name ON personal_records(workout_name);

CREATE TRIGGER update_workout_scores_updated_at BEFORE UPDATE ON workout_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_personal_records_updated_at BEFORE UPDATE ON personal_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE workout_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scores for their gym" ON workout_scores FOR SELECT
USING (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Coaches can manage scores for their gym" ON workout_scores FOR ALL
USING (gym_id IN (SELECT p.gym_id FROM profiles p WHERE p.id = auth.uid() AND p.role::text IN ('owner', 'admin', 'manager', 'coach')));
CREATE POLICY "Users can view PRs for their gym" ON personal_records FOR SELECT
USING (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Coaches can manage PRs for their gym" ON personal_records FOR ALL
USING (gym_id IN (SELECT p.gym_id FROM profiles p WHERE p.id = auth.uid() AND p.role::text IN ('owner', 'admin', 'manager', 'coach')));

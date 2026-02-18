-- Coach Integrations: Link Enterprise coaches to Prometheus Coach app
-- Uses email matching to connect accounts across separate Supabase instances

CREATE TABLE coach_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
    coach_app_user_id TEXT,          -- User-ID in Coach-App Supabase
    coach_app_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',  -- pending, linked, unlinked, error
    linked_at TIMESTAMPTZ,
    last_sync_at TIMESTAMPTZ,
    cached_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gym_id, coach_id)
);

-- Indexes
CREATE INDEX idx_coach_integrations_gym ON coach_integrations(gym_id);
CREATE INDEX idx_coach_integrations_coach ON coach_integrations(coach_id);
CREATE INDEX idx_coach_integrations_status ON coach_integrations(status);

-- Updated_at trigger
CREATE TRIGGER update_coach_integrations_updated_at
    BEFORE UPDATE ON coach_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE coach_integrations ENABLE ROW LEVEL SECURITY;

-- Staff can view their gym's integrations
CREATE POLICY "Staff can view own gym integrations"
    ON coach_integrations FOR SELECT
    USING (
        gym_id IN (
            SELECT gym_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Staff can manage integrations
CREATE POLICY "Staff can manage integrations"
    ON coach_integrations FOR ALL
    USING (
        gym_id IN (
            SELECT gym_id FROM profiles WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        gym_id IN (
            SELECT gym_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Service role full access
CREATE POLICY "Service role full access on coach_integrations"
    ON coach_integrations FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Coach Invitation System
-- Token-based invitation links for coaches to join the platform

CREATE TABLE coach_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    coach_name TEXT NOT NULL,
    coach_email TEXT NOT NULL,
    gym_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_coach_invitations_gym_id ON coach_invitations(gym_id);
CREATE INDEX idx_coach_invitations_coach_id ON coach_invitations(coach_id);
CREATE INDEX idx_coach_invitations_token ON coach_invitations(token);
CREATE INDEX idx_coach_invitations_status ON coach_invitations(status);

-- RLS
ALTER TABLE coach_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invitations for their gym"
    ON coach_invitations FOR SELECT
    USING (gym_id IN (
        SELECT gym_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can create invitations for their gym"
    ON coach_invitations FOR INSERT
    WITH CHECK (gym_id IN (
        SELECT gym_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update invitations for their gym"
    ON coach_invitations FOR UPDATE
    USING (gym_id IN (
        SELECT gym_id FROM profiles WHERE id = auth.uid()
    ));

-- Auto-update updated_at
CREATE TRIGGER update_coach_invitations_updated_at
    BEFORE UPDATE ON coach_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

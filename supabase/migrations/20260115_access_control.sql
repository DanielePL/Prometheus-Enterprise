-- Access Control System Migration (clean slate)

-- Enums
DO $$ BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'access_method') THEN
    CREATE TYPE access_method AS ENUM ('bluetooth', 'face_recognition', 'manual', 'qr_code');
END IF;
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'access_status') THEN
    CREATE TYPE access_status AS ENUM ('granted', 'denied', 'pending');
END IF;
END $$;

-- Drop and recreate
DROP TABLE IF EXISTS gym_access_settings CASCADE;
DROP TABLE IF EXISTS access_logs CASCADE;
DROP TABLE IF EXISTS member_bluetooth_devices CASCADE;
DROP TABLE IF EXISTS member_face_data CASCADE;

CREATE TABLE member_face_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    face_descriptor JSONB NOT NULL,
    photo_url TEXT,
    match_threshold DECIMAL(3,2) DEFAULT 0.6,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(member_id)
);

CREATE TABLE member_bluetooth_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    device_name TEXT,
    device_type TEXT,
    is_active BOOLEAN DEFAULT true,
    last_seen TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gym_id, device_id)
);

CREATE TABLE access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    access_method access_method NOT NULL,
    access_status access_status NOT NULL,
    confidence_score DECIMAL(5,4),
    device_id TEXT,
    denial_reason TEXT,
    terminal_id TEXT,
    terminal_name TEXT,
    ip_address TEXT,
    user_agent TEXT,
    attempted_at TIMESTAMPTZ DEFAULT NOW(),
    visit_id UUID REFERENCES member_visits(id) ON DELETE SET NULL
);

ALTER TABLE member_visits ADD COLUMN IF NOT EXISTS check_in_method access_method DEFAULT 'manual';

CREATE TABLE gym_access_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    bluetooth_enabled BOOLEAN DEFAULT true,
    face_recognition_enabled BOOLEAN DEFAULT true,
    qr_code_enabled BOOLEAN DEFAULT false,
    manual_checkin_enabled BOOLEAN DEFAULT true,
    face_match_threshold DECIMAL(3,2) DEFAULT 0.6,
    require_liveness_check BOOLEAN DEFAULT false,
    bluetooth_range_meters INTEGER DEFAULT 10,
    auto_checkout_enabled BOOLEAN DEFAULT true,
    auto_checkout_minutes INTEGER DEFAULT 120,
    require_active_membership BOOLEAN DEFAULT true,
    allow_expired_grace_days INTEGER DEFAULT 0,
    opening_hours JSONB DEFAULT '{
        "monday": { "open": "06:00", "close": "22:00", "closed": false },
        "tuesday": { "open": "06:00", "close": "22:00", "closed": false },
        "wednesday": { "open": "06:00", "close": "22:00", "closed": false },
        "thursday": { "open": "06:00", "close": "22:00", "closed": false },
        "friday": { "open": "06:00", "close": "22:00", "closed": false },
        "saturday": { "open": "08:00", "close": "20:00", "closed": false },
        "sunday": { "open": "08:00", "close": "18:00", "closed": false }
    }'::jsonb,
    holiday_closures DATE[] DEFAULT '{}',
    notify_on_denied_access BOOLEAN DEFAULT true,
    notify_on_after_hours_attempt BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gym_id)
);

-- Indexes
CREATE INDEX idx_member_face_data_member ON member_face_data(member_id);
CREATE INDEX idx_member_face_data_gym ON member_face_data(gym_id);
CREATE INDEX idx_member_face_data_active ON member_face_data(gym_id, is_active);
CREATE INDEX idx_member_bluetooth_devices_member ON member_bluetooth_devices(member_id);
CREATE INDEX idx_member_bluetooth_devices_gym ON member_bluetooth_devices(gym_id);
CREATE INDEX idx_member_bluetooth_devices_device ON member_bluetooth_devices(device_id);
CREATE INDEX idx_access_logs_gym ON access_logs(gym_id);
CREATE INDEX idx_access_logs_member ON access_logs(member_id);
CREATE INDEX idx_access_logs_attempted_at ON access_logs(attempted_at);
CREATE INDEX idx_access_logs_status ON access_logs(gym_id, access_status);
CREATE INDEX idx_access_logs_method ON access_logs(gym_id, access_method);
CREATE INDEX IF NOT EXISTS idx_member_visits_method ON member_visits(check_in_method);

-- Triggers
CREATE TRIGGER update_member_face_data_updated_at BEFORE UPDATE ON member_face_data FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_member_bluetooth_devices_updated_at BEFORE UPDATE ON member_bluetooth_devices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_gym_access_settings_updated_at BEFORE UPDATE ON gym_access_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE member_face_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_bluetooth_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_access_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view gym face data" ON member_face_data FOR SELECT USING (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Staff can manage face data" ON member_face_data FOR ALL USING (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Staff can view gym bluetooth devices" ON member_bluetooth_devices FOR SELECT USING (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Staff can manage bluetooth devices" ON member_bluetooth_devices FOR ALL USING (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Staff can view gym access logs" ON access_logs FOR SELECT USING (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Staff can insert access logs" ON access_logs FOR INSERT WITH CHECK (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Staff can view gym access settings" ON gym_access_settings FOR SELECT USING (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Admins can manage access settings" ON gym_access_settings FOR ALL USING (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid() AND role::text IN ('owner', 'admin')));

-- Functions
CREATE OR REPLACE FUNCTION is_gym_open(p_gym_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_settings gym_access_settings%ROWTYPE;
    v_today TEXT;
    v_current_time TIME;
    v_day_schedule JSONB;
BEGIN
    SELECT * INTO v_settings FROM gym_access_settings WHERE gym_id = p_gym_id;
    IF v_settings IS NULL THEN RETURN true; END IF;
    IF CURRENT_DATE = ANY(v_settings.holiday_closures) THEN RETURN false; END IF;
    v_today := TRIM(LOWER(TO_CHAR(CURRENT_DATE, 'day')));
    v_current_time := CURRENT_TIME;
    v_day_schedule := v_settings.opening_hours -> v_today;
    IF v_day_schedule IS NULL THEN RETURN true; END IF;
    IF (v_day_schedule ->> 'closed')::boolean = true THEN RETURN false; END IF;
    RETURN v_current_time >= (v_day_schedule ->> 'open')::TIME AND v_current_time <= (v_day_schedule ->> 'close')::TIME;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_member_access(p_member_id UUID, p_gym_id UUID)
RETURNS TABLE(can_access BOOLEAN, denial_reason TEXT) AS $$
DECLARE
    v_member members%ROWTYPE;
    v_settings gym_access_settings%ROWTYPE;
BEGIN
    SELECT * INTO v_member FROM members WHERE id = p_member_id AND gym_id = p_gym_id;
    IF v_member IS NULL THEN RETURN QUERY SELECT false, 'Member not found'; RETURN; END IF;
    SELECT * INTO v_settings FROM gym_access_settings WHERE gym_id = p_gym_id;
    IF NOT is_gym_open(p_gym_id) THEN RETURN QUERY SELECT false, 'Gym is currently closed'; RETURN; END IF;
    IF v_settings.require_active_membership AND v_member.membership_end IS NOT NULL THEN
        IF v_member.membership_end < CURRENT_DATE - v_settings.allow_expired_grace_days THEN
            RETURN QUERY SELECT false, 'Membership expired'; RETURN;
        END IF;
    END IF;
    RETURN QUERY SELECT true, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

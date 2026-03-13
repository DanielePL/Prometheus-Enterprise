-- Membership Management System (clean slate)

-- Enums
DO $$ BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_plan_category') THEN
    CREATE TYPE membership_plan_category AS ENUM ('main', 'addon');
END IF;
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billing_interval') THEN
    CREATE TYPE billing_interval AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'annual');
END IF;
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contract_status') THEN
    CREATE TYPE contract_status AS ENUM ('pending', 'active', 'frozen', 'cancelled', 'expired');
END IF;
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'freeze_reason') THEN
    CREATE TYPE freeze_reason AS ENUM ('injury', 'pregnancy', 'military', 'illness', 'relocation', 'other');
END IF;
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'freeze_status') THEN
    CREATE TYPE freeze_status AS ENUM ('pending', 'approved', 'active', 'ended', 'rejected');
END IF;
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cancellation_type') THEN
    CREATE TYPE cancellation_type AS ENUM ('regular', 'extraordinary', 'revocation');
END IF;
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'warning_level') THEN
    CREATE TYPE warning_level AS ENUM ('1', '2', '3');
END IF;
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ban_type') THEN
    CREATE TYPE ban_type AS ENUM ('temporary', 'permanent');
END IF;
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_standing') THEN
    CREATE TYPE member_standing AS ENUM ('good', 'warned', 'suspended', 'banned');
END IF;
END $$;

-- Drop and recreate
DROP TABLE IF EXISTS member_bans CASCADE;
DROP TABLE IF EXISTS member_warnings CASCADE;
DROP TABLE IF EXISTS membership_freezes CASCADE;
DROP TABLE IF EXISTS membership_addons CASCADE;
DROP TABLE IF EXISTS membership_contracts CASCADE;
DROP TABLE IF EXISTS membership_plans CASCADE;

CREATE TABLE membership_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category membership_plan_category DEFAULT 'main',
    billing_interval billing_interval DEFAULT 'monthly',
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    setup_fee DECIMAL(10,2) DEFAULT 0,
    min_contract_months INTEGER DEFAULT 0,
    cancellation_notice_days INTEGER DEFAULT 30,
    auto_renew BOOLEAN DEFAULT true,
    features JSONB DEFAULT '[]',
    includes_classes BOOLEAN DEFAULT true,
    includes_sauna BOOLEAN DEFAULT false,
    includes_personal_training INTEGER DEFAULT 0,
    max_members INTEGER,
    current_member_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    color TEXT DEFAULT '#F97316',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE membership_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES membership_plans(id) ON DELETE RESTRICT,
    contract_number TEXT,
    status contract_status DEFAULT 'pending',
    start_date DATE NOT NULL,
    end_date DATE,
    next_billing_date DATE,
    monthly_amount DECIMAL(10,2) NOT NULL,
    setup_fee_amount DECIMAL(10,2) DEFAULT 0,
    setup_fee_paid BOOLEAN DEFAULT false,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_reason TEXT,
    payment_method TEXT DEFAULT 'direct_debit',
    stripe_subscription_id TEXT,
    auto_renew BOOLEAN DEFAULT true,
    cancelled_at TIMESTAMPTZ,
    cancellation_type cancellation_type,
    cancellation_reason TEXT,
    cancellation_effective_date DATE,
    cancellation_proof_url TEXT,
    cancelled_by TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE membership_addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES membership_contracts(id) ON DELETE SET NULL,
    plan_id UUID NOT NULL REFERENCES membership_plans(id) ON DELETE RESTRICT,
    status contract_status DEFAULT 'active',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    monthly_amount DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE membership_freezes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    contract_id UUID NOT NULL REFERENCES membership_contracts(id) ON DELETE CASCADE,
    reason freeze_reason NOT NULL,
    reason_detail TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    original_contract_end DATE,
    extended_contract_end DATE,
    proof_document_url TEXT,
    proof_type TEXT,
    status freeze_status DEFAULT 'pending',
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    rejected_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE member_warnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    warning_level warning_level NOT NULL DEFAULT '1',
    reason TEXT NOT NULL,
    description TEXT,
    issued_by TEXT NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE member_bans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    ban_type ban_type NOT NULL DEFAULT 'temporary',
    reason TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    issued_by TEXT NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    lifted_at TIMESTAMPTZ,
    lifted_by TEXT,
    lift_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE members ADD COLUMN IF NOT EXISTS standing member_standing DEFAULT 'good';

-- Indexes
CREATE INDEX idx_membership_plans_gym ON membership_plans(gym_id);
CREATE INDEX idx_membership_plans_active ON membership_plans(gym_id, is_active);
CREATE INDEX idx_membership_plans_category ON membership_plans(gym_id, category);
CREATE INDEX idx_membership_contracts_gym ON membership_contracts(gym_id);
CREATE INDEX idx_membership_contracts_member ON membership_contracts(member_id);
CREATE INDEX idx_membership_contracts_status ON membership_contracts(gym_id, status);
CREATE INDEX idx_membership_contracts_end_date ON membership_contracts(end_date);
CREATE INDEX idx_membership_contracts_billing ON membership_contracts(next_billing_date);
CREATE INDEX idx_membership_addons_gym ON membership_addons(gym_id);
CREATE INDEX idx_membership_addons_member ON membership_addons(member_id);
CREATE INDEX idx_membership_addons_contract ON membership_addons(contract_id);
CREATE INDEX idx_membership_freezes_gym ON membership_freezes(gym_id);
CREATE INDEX idx_membership_freezes_member ON membership_freezes(member_id);
CREATE INDEX idx_membership_freezes_contract ON membership_freezes(contract_id);
CREATE INDEX idx_membership_freezes_status ON membership_freezes(status);
CREATE INDEX idx_member_warnings_gym ON member_warnings(gym_id);
CREATE INDEX idx_member_warnings_member ON member_warnings(member_id);
CREATE INDEX idx_member_warnings_active ON member_warnings(gym_id, is_active);
CREATE INDEX idx_member_bans_gym ON member_bans(gym_id);
CREATE INDEX idx_member_bans_member ON member_bans(member_id);
CREATE INDEX idx_member_bans_active ON member_bans(gym_id, is_active);

-- Triggers
CREATE TRIGGER update_membership_plans_updated_at BEFORE UPDATE ON membership_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_membership_contracts_updated_at BEFORE UPDATE ON membership_contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_membership_addons_updated_at BEFORE UPDATE ON membership_addons FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_membership_freezes_updated_at BEFORE UPDATE ON membership_freezes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_member_warnings_updated_at BEFORE UPDATE ON member_warnings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_member_bans_updated_at BEFORE UPDATE ON member_bans FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Functions
CREATE OR REPLACE FUNCTION update_member_standing()
RETURNS TRIGGER AS $$
DECLARE
    active_ban_exists BOOLEAN;
    active_warning_count INTEGER;
BEGIN
    SELECT EXISTS(SELECT 1 FROM member_bans WHERE member_id = COALESCE(NEW.member_id, OLD.member_id) AND is_active = true) INTO active_ban_exists;
    IF active_ban_exists THEN
        UPDATE members SET standing = 'banned' WHERE id = COALESCE(NEW.member_id, OLD.member_id);
        RETURN COALESCE(NEW, OLD);
    END IF;
    SELECT COUNT(*) FROM member_warnings WHERE member_id = COALESCE(NEW.member_id, OLD.member_id) AND is_active = true INTO active_warning_count;
    UPDATE members SET standing = CASE
        WHEN active_warning_count >= 3 THEN 'suspended'::member_standing
        WHEN active_warning_count >= 1 THEN 'warned'::member_standing
        ELSE 'good'::member_standing
    END WHERE id = COALESCE(NEW.member_id, OLD.member_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_standing_on_warning AFTER INSERT OR UPDATE OR DELETE ON member_warnings FOR EACH ROW EXECUTE FUNCTION update_member_standing();
CREATE TRIGGER update_standing_on_ban AFTER INSERT OR UPDATE OR DELETE ON member_bans FOR EACH ROW EXECUTE FUNCTION update_member_standing();

CREATE OR REPLACE FUNCTION update_plan_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE membership_plans SET current_member_count = (SELECT COUNT(*) FROM membership_contracts WHERE plan_id = NEW.plan_id AND status IN ('active', 'frozen')) WHERE id = NEW.plan_id;
    END IF;
    IF TG_OP = 'UPDATE' AND OLD.plan_id != NEW.plan_id THEN
        UPDATE membership_plans SET current_member_count = (SELECT COUNT(*) FROM membership_contracts WHERE plan_id = OLD.plan_id AND status IN ('active', 'frozen')) WHERE id = OLD.plan_id;
    END IF;
    IF TG_OP = 'DELETE' THEN
        UPDATE membership_plans SET current_member_count = (SELECT COUNT(*) FROM membership_contracts WHERE plan_id = OLD.plan_id AND status IN ('active', 'frozen')) WHERE id = OLD.plan_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_plan_count_on_contract AFTER INSERT OR UPDATE OR DELETE ON membership_contracts FOR EACH ROW EXECUTE FUNCTION update_plan_member_count();

CREATE OR REPLACE FUNCTION extend_contract_on_freeze()
RETURNS TRIGGER AS $$
DECLARE
    freeze_days INTEGER;
    contract_end DATE;
BEGIN
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        freeze_days := NEW.end_date - NEW.start_date;
        SELECT mc.end_date INTO contract_end FROM membership_contracts mc WHERE mc.id = NEW.contract_id;
        IF contract_end IS NOT NULL THEN
            NEW.original_contract_end := contract_end;
            NEW.extended_contract_end := contract_end + freeze_days;
            UPDATE membership_contracts SET end_date = contract_end + freeze_days WHERE id = NEW.contract_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER extend_contract_on_freeze_approval BEFORE UPDATE ON membership_freezes FOR EACH ROW EXECUTE FUNCTION extend_contract_on_freeze();

CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS TRIGGER AS $$
DECLARE
    gym_prefix TEXT;
    seq_num INTEGER;
BEGIN
    IF NEW.contract_number IS NULL THEN
        SELECT COALESCE(SUBSTRING(g.name FROM 1 FOR 3), 'PRO') INTO gym_prefix FROM gyms g WHERE g.id = NEW.gym_id;
        SELECT COUNT(*) + 1 INTO seq_num FROM membership_contracts WHERE gym_id = NEW.gym_id;
        NEW.contract_number := UPPER(gym_prefix) || '-' || TO_CHAR(NOW(), 'YYMM') || '-' || LPAD(seq_num::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_contract_number_trigger BEFORE INSERT ON membership_contracts FOR EACH ROW EXECUTE FUNCTION generate_contract_number();

-- RLS
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_freezes ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view gym plans" ON membership_plans FOR SELECT USING (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Admins can manage plans" ON membership_plans FOR ALL USING (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid() AND role::text IN ('owner', 'admin', 'manager')));
CREATE POLICY "Staff can view gym contracts" ON membership_contracts FOR SELECT USING (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Admins can manage contracts" ON membership_contracts FOR ALL USING (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid() AND role::text IN ('owner', 'admin', 'manager')));
CREATE POLICY "Staff can view gym addons" ON membership_addons FOR SELECT USING (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Admins can manage addons" ON membership_addons FOR ALL USING (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid() AND role::text IN ('owner', 'admin', 'manager')));
CREATE POLICY "Staff can view gym freezes" ON membership_freezes FOR SELECT USING (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Admins can manage freezes" ON membership_freezes FOR ALL USING (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid() AND role::text IN ('owner', 'admin', 'manager')));
CREATE POLICY "Staff can view gym warnings" ON member_warnings FOR SELECT USING (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Admins can manage warnings" ON member_warnings FOR ALL USING (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid() AND role::text IN ('owner', 'admin', 'manager')));
CREATE POLICY "Staff can view gym bans" ON member_bans FOR SELECT USING (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Admins can manage bans" ON member_bans FOR ALL USING (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid() AND role::text IN ('owner', 'admin', 'manager')));

-- Location Analysis tables and member address fields

-- Add address fields to members
ALTER TABLE members ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS address TEXT;

-- Add location fields to gyms
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS area_sqm DECIMAL(10,2);

-- Competitors table
CREATE TABLE competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    postal_code TEXT,
    city TEXT,
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    pricing_tier TEXT CHECK (pricing_tier IN ('budget', 'mid', 'premium', 'luxury')),
    monthly_price DECIMAL(10,2),
    estimated_members INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expansion scenarios table
CREATE TABLE expansion_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    postal_code TEXT,
    city TEXT,
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    investment DECIMAL(12,2),
    monthly_rent DECIMAL(10,2),
    area_sqm DECIMAL(10,2),
    estimated_members INTEGER,
    estimated_monthly_revenue DECIMAL(10,2),
    roi_months INTEGER,
    cannibalization_pct DECIMAL(5,2) DEFAULT 0,
    notes TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'evaluating', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_competitors_gym_id ON competitors(gym_id);
CREATE INDEX idx_expansion_scenarios_gym_id ON expansion_scenarios(gym_id);

-- RLS
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE expansion_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage competitors for their gym"
    ON competitors FOR ALL
    USING (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage expansion scenarios for their gym"
    ON expansion_scenarios FOR ALL
    USING (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid()));

-- Auto-update triggers
CREATE TRIGGER update_competitors_updated_at
    BEFORE UPDATE ON competitors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expansion_scenarios_updated_at
    BEFORE UPDATE ON expansion_scenarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

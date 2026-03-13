-- Platform Subscriptions (clean slate)

DROP TABLE IF EXISTS platform_subscriptions CASCADE;

CREATE TABLE platform_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE UNIQUE,
    owner_id UUID NOT NULL REFERENCES profiles(id),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    plan_id TEXT NOT NULL DEFAULT 'trial',
    status TEXT NOT NULL DEFAULT 'none',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_platform_subscriptions_gym ON platform_subscriptions(gym_id);
CREATE INDEX idx_platform_subscriptions_owner ON platform_subscriptions(owner_id);
CREATE INDEX idx_platform_subscriptions_status ON platform_subscriptions(status);

CREATE TRIGGER update_platform_subscriptions_updated_at BEFORE UPDATE ON platform_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE platform_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view own gym subscription" ON platform_subscriptions FOR SELECT
USING (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Owner can manage subscription" ON platform_subscriptions FOR ALL
USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Service role full access" ON platform_subscriptions FOR ALL
USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

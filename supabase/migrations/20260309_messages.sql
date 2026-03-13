-- Team Messaging System (idempotent)

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_broadcast ON messages(gym_id, is_broadcast) WHERE is_broadcast = TRUE;
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(recipient_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their messages" ON messages;
CREATE POLICY "Users can view their messages" ON messages FOR SELECT
USING (gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid())
    AND (sender_id = auth.uid() OR recipient_id = auth.uid() OR is_broadcast = TRUE));

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages FOR INSERT
WITH CHECK (sender_id = auth.uid() AND gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update received messages" ON messages;
CREATE POLICY "Users can update received messages" ON messages FOR UPDATE
USING (recipient_id = auth.uid() OR (is_broadcast = TRUE AND gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid())));

DROP POLICY IF EXISTS "Users can delete their messages" ON messages;
CREATE POLICY "Users can delete their messages" ON messages FOR DELETE
USING (sender_id = auth.uid() OR recipient_id = auth.uid());

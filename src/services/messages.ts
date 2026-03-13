import { supabase } from '@/lib/supabase';
import type { Message, InsertTables, UpdateTables } from '@/types/database';
import { isDemoMode, DEMO_MESSAGES, DEMO_STAFF } from './demoData';

export type MessageInsert = InsertTables<'messages'>;
export type MessageUpdate = UpdateTables<'messages'>;

export const messagesService = {
  // Get all messages for a gym (inbox)
  async getInbox(gymId: string, userId: string) {
    if (isDemoMode()) {
      return DEMO_MESSAGES.filter(m => m.recipient_id === 'staff-1' || m.is_broadcast);
    }

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(id, full_name, avatar_url, email)
      `)
      .eq('gym_id', gymId)
      .or(`recipient_id.eq.${userId},is_broadcast.eq.true`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get sent messages
  async getSent(gymId: string, userId: string) {
    if (isDemoMode()) {
      return DEMO_MESSAGES.filter(m => m.sender_id === 'staff-1');
    }

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        recipient:profiles!recipient_id(id, full_name, avatar_url, email)
      `)
      .eq('gym_id', gymId)
      .eq('sender_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get a single message by ID
  async getById(id: string) {
    if (isDemoMode()) {
      const msg = DEMO_MESSAGES.find(m => m.id === id);
      return msg || null;
    }

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(id, full_name, avatar_url, email),
        recipient:profiles!recipient_id(id, full_name, avatar_url, email)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Send a message
  async send(message: MessageInsert) {
    if (isDemoMode()) {
      const newMsg = {
        id: `msg-demo-${Date.now()}`,
        gym_id: message.gym_id || 'demo-gym-id',
        sender_id: message.sender_id || 'staff-1',
        recipient_id: message.recipient_id || null,
        subject: message.subject,
        content: message.content,
        is_broadcast: message.is_broadcast || false,
        is_read: false,
        read_at: null,
        created_at: new Date().toISOString(),
        sender: DEMO_STAFF.find(s => s.id === (message.sender_id || 'staff-1')) || DEMO_STAFF[0],
      };
      DEMO_MESSAGES.unshift(newMsg as typeof DEMO_MESSAGES[0]);
      return newMsg;
    }

    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Send a broadcast message to all team members
  async sendBroadcast(gymId: string, senderId: string, subject: string, content: string) {
    if (isDemoMode()) {
      const newMsg = {
        id: `msg-demo-${Date.now()}`,
        gym_id: 'demo-gym-id',
        sender_id: senderId,
        recipient_id: null,
        subject,
        content,
        is_broadcast: true,
        is_read: true,
        read_at: null,
        created_at: new Date().toISOString(),
        sender: DEMO_STAFF.find(s => s.id === senderId) || DEMO_STAFF[0],
      };
      DEMO_MESSAGES.unshift(newMsg as typeof DEMO_MESSAGES[0]);
      return newMsg;
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        gym_id: gymId,
        sender_id: senderId,
        subject,
        content,
        is_broadcast: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mark message as read
  async markAsRead(id: string) {
    if (isDemoMode()) {
      const msg = DEMO_MESSAGES.find(m => m.id === id);
      if (msg) {
        msg.is_read = true;
        msg.read_at = new Date().toISOString();
      }
      return msg || null;
    }

    const { data, error } = await supabase
      .from('messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mark all messages as read
  async markAllAsRead(gymId: string, userId: string) {
    if (isDemoMode()) {
      DEMO_MESSAGES.forEach(m => {
        if ((m.recipient_id === 'staff-1' || m.is_broadcast) && !m.is_read) {
          m.is_read = true;
          m.read_at = new Date().toISOString();
        }
      });
      return;
    }

    const { error } = await supabase
      .from('messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('gym_id', gymId)
      .or(`recipient_id.eq.${userId},is_broadcast.eq.true`)
      .eq('is_read', false);

    if (error) throw error;
  },

  // Delete a message
  async delete(id: string) {
    if (isDemoMode()) {
      const idx = DEMO_MESSAGES.findIndex(m => m.id === id);
      if (idx !== -1) DEMO_MESSAGES.splice(idx, 1);
      return;
    }

    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) throw error;
  },

  // Get unread count
  async getUnreadCount(gymId: string, userId: string) {
    if (isDemoMode()) {
      return DEMO_MESSAGES.filter(m => !m.is_read && (m.recipient_id === 'staff-1' || m.is_broadcast)).length;
    }

    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('gym_id', gymId)
      .or(`recipient_id.eq.${userId},is_broadcast.eq.true`)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  },

  // Get staff members for recipient selection
  async getStaffMembers(gymId: string) {
    if (isDemoMode()) {
      return DEMO_STAFF;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, email, role')
      .eq('gym_id', gymId);

    if (error) throw error;
    return data;
  },
};

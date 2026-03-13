import { supabase } from '@/lib/supabase';
import { messagesService } from '@/services/messages';
import type { MockSupabaseClient } from '@/test/supabase-mock';

const mockSupabase = supabase as unknown as MockSupabaseClient;

describe('messagesService', () => {
  beforeEach(() => {
    mockSupabase.__resetAll();
  });

  describe('getInbox', () => {
    it('returns messages with sender profile join and or filter', async () => {
      const messages = [
        {
          id: 'msg-1',
          gym_id: 'gym-1',
          recipient_id: 'user-1',
          is_broadcast: false,
          sender: { id: 'user-2', full_name: 'Jane', avatar_url: null, email: 'jane@test.com' },
        },
        {
          id: 'msg-2',
          gym_id: 'gym-1',
          is_broadcast: true,
          sender: { id: 'user-3', full_name: 'Admin', avatar_url: null, email: 'admin@test.com' },
        },
      ];

      mockSupabase.__getBuilder('messages').mockResult({ data: messages, error: null });

      const result = await messagesService.getInbox('gym-1', 'user-1');

      expect(result).toEqual(messages);
      expect(mockSupabase.from).toHaveBeenCalledWith('messages');
      const builder = mockSupabase.__getBuilder('messages');
      expect(builder.eq).toHaveBeenCalledWith('gym_id', 'gym-1');
      expect(builder.or).toHaveBeenCalledWith('recipient_id.eq.user-1,is_broadcast.eq.true');
      expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('throws on database error', async () => {
      const dbError = { code: '42P01', message: 'error' };
      mockSupabase.__getBuilder('messages').mockResult({ data: null, error: dbError });

      await expect(messagesService.getInbox('gym-1', 'user-1')).rejects.toEqual(dbError);
    });
  });

  describe('getSent', () => {
    it('returns sent messages with recipient join', async () => {
      const messages = [
        {
          id: 'msg-1',
          gym_id: 'gym-1',
          sender_id: 'user-1',
          recipient: { id: 'user-2', full_name: 'Jane', avatar_url: null, email: 'jane@test.com' },
        },
      ];

      mockSupabase.__getBuilder('messages').mockResult({ data: messages, error: null });

      const result = await messagesService.getSent('gym-1', 'user-1');

      expect(result).toEqual(messages);
      const builder = mockSupabase.__getBuilder('messages');
      expect(builder.eq).toHaveBeenCalledWith('gym_id', 'gym-1');
      expect(builder.eq).toHaveBeenCalledWith('sender_id', 'user-1');
      expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('throws on database error', async () => {
      const dbError = { code: '42P01', message: 'error' };
      mockSupabase.__getBuilder('messages').mockResult({ data: null, error: dbError });

      await expect(messagesService.getSent('gym-1', 'user-1')).rejects.toEqual(dbError);
    });
  });

  describe('send', () => {
    it('inserts message and returns created record', async () => {
      const newMessage = {
        gym_id: 'gym-1',
        sender_id: 'user-1',
        recipient_id: 'user-2',
        subject: 'Hello',
        content: 'Test message',
      };

      const createdMessage = { id: 'msg-new', ...newMessage, is_read: false, created_at: '2026-02-24' };

      mockSupabase.__getBuilder('messages').mockResult({ data: createdMessage, error: null });

      const result = await messagesService.send(newMessage as any);

      expect(result).toEqual(createdMessage);
      const builder = mockSupabase.__getBuilder('messages');
      expect(builder.insert).toHaveBeenCalledWith(newMessage);
      expect(builder.select).toHaveBeenCalled();
      expect(builder.single).toHaveBeenCalled();
    });

    it('throws on database error', async () => {
      const dbError = { code: '23503', message: 'foreign key violation' };
      mockSupabase.__getBuilder('messages').mockResult({ data: null, error: dbError });

      await expect(messagesService.send({} as any)).rejects.toEqual(dbError);
    });
  });

  describe('sendBroadcast', () => {
    it('inserts a broadcast message with is_broadcast=true', async () => {
      const broadcastMessage = {
        id: 'msg-broadcast',
        gym_id: 'gym-1',
        sender_id: 'user-1',
        subject: 'Announcement',
        content: 'Gym closed tomorrow',
        is_broadcast: true,
      };

      mockSupabase.__getBuilder('messages').mockResult({ data: broadcastMessage, error: null });

      const result = await messagesService.sendBroadcast('gym-1', 'user-1', 'Announcement', 'Gym closed tomorrow');

      expect(result).toEqual(broadcastMessage);
      const builder = mockSupabase.__getBuilder('messages');
      expect(builder.insert).toHaveBeenCalledWith({
        gym_id: 'gym-1',
        sender_id: 'user-1',
        subject: 'Announcement',
        content: 'Gym closed tomorrow',
        is_broadcast: true,
      });
      expect(builder.select).toHaveBeenCalled();
      expect(builder.single).toHaveBeenCalled();
    });

    it('throws on database error', async () => {
      const dbError = { code: '42501', message: 'permission denied' };
      mockSupabase.__getBuilder('messages').mockResult({ data: null, error: dbError });

      await expect(
        messagesService.sendBroadcast('gym-1', 'user-1', 'Test', 'Content')
      ).rejects.toEqual(dbError);
    });
  });

  describe('markAsRead', () => {
    it('updates is_read and read_at for the message', async () => {
      const updatedMessage = { id: 'msg-1', is_read: true, read_at: '2026-02-24T10:00:00Z' };

      mockSupabase.__getBuilder('messages').mockResult({ data: updatedMessage, error: null });

      const result = await messagesService.markAsRead('msg-1');

      expect(result).toEqual(updatedMessage);
      const builder = mockSupabase.__getBuilder('messages');
      expect(builder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          is_read: true,
          read_at: expect.any(String),
        })
      );
      expect(builder.eq).toHaveBeenCalledWith('id', 'msg-1');
      expect(builder.select).toHaveBeenCalled();
      expect(builder.single).toHaveBeenCalled();
    });

    it('throws on database error', async () => {
      const dbError = { code: '42501', message: 'permission denied' };
      mockSupabase.__getBuilder('messages').mockResult({ data: null, error: dbError });

      await expect(messagesService.markAsRead('msg-1')).rejects.toEqual(dbError);
    });
  });

  describe('markAllAsRead', () => {
    it('bulk updates unread messages for the user', async () => {
      mockSupabase.__getBuilder('messages').mockResult({ data: null, error: null });

      await messagesService.markAllAsRead('gym-1', 'user-1');

      const builder = mockSupabase.__getBuilder('messages');
      expect(builder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          is_read: true,
          read_at: expect.any(String),
        })
      );
      expect(builder.eq).toHaveBeenCalledWith('gym_id', 'gym-1');
      expect(builder.or).toHaveBeenCalledWith('recipient_id.eq.user-1,is_broadcast.eq.true');
      expect(builder.eq).toHaveBeenCalledWith('is_read', false);
    });

    it('throws on database error', async () => {
      const dbError = { code: '42501', message: 'permission denied' };
      mockSupabase.__getBuilder('messages').mockResult({ data: null, error: dbError });

      await expect(messagesService.markAllAsRead('gym-1', 'user-1')).rejects.toEqual(dbError);
    });
  });

  describe('delete', () => {
    it('deletes message by id', async () => {
      mockSupabase.__getBuilder('messages').mockResult({ data: null, error: null });

      await messagesService.delete('msg-1');

      const builder = mockSupabase.__getBuilder('messages');
      expect(builder.delete).toHaveBeenCalled();
      expect(builder.eq).toHaveBeenCalledWith('id', 'msg-1');
    });

    it('throws on database error', async () => {
      const dbError = { code: '42501', message: 'permission denied' };
      mockSupabase.__getBuilder('messages').mockResult({ data: null, error: dbError });

      await expect(messagesService.delete('msg-1')).rejects.toEqual(dbError);
    });
  });

  describe('getUnreadCount', () => {
    it('returns the count of unread messages', async () => {
      mockSupabase.__getBuilder('messages').mockResult({ count: 7, error: null });

      const result = await messagesService.getUnreadCount('gym-1', 'user-1');

      expect(result).toBe(7);
      const builder = mockSupabase.__getBuilder('messages');
      expect(builder.select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
      expect(builder.eq).toHaveBeenCalledWith('gym_id', 'gym-1');
      expect(builder.or).toHaveBeenCalledWith('recipient_id.eq.user-1,is_broadcast.eq.true');
      expect(builder.eq).toHaveBeenCalledWith('is_read', false);
    });

    it('returns 0 when count is null', async () => {
      mockSupabase.__getBuilder('messages').mockResult({ count: null, error: null });

      const result = await messagesService.getUnreadCount('gym-1', 'user-1');
      expect(result).toBe(0);
    });

    it('throws on database error', async () => {
      const dbError = { code: '42P01', message: 'error' };
      mockSupabase.__getBuilder('messages').mockResult({ count: null, error: dbError });

      await expect(messagesService.getUnreadCount('gym-1', 'user-1')).rejects.toEqual(dbError);
    });
  });
});

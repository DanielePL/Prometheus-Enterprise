import { supabase } from '@/lib/supabase';
import { isDemoMode, DEMO_MEMBER_NOTES, MemberNote } from './demoData';

// For demo mode, we store notes in localStorage
const DEMO_NOTES_KEY = 'prometheus_demo_member_notes';

function getDemoNotes(): MemberNote[] {
  try {
    const stored = localStorage.getItem(DEMO_NOTES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return [...DEMO_MEMBER_NOTES];
}

function saveDemoNotes(notes: MemberNote[]): void {
  try {
    localStorage.setItem(DEMO_NOTES_KEY, JSON.stringify(notes));
  } catch {
    // ignore
  }
}

export const memberNotesService = {
  async getByMember(memberId: string): Promise<MemberNote[]> {
    if (isDemoMode()) {
      const notes = getDemoNotes();
      return notes.filter(n => n.member_id === memberId && n.is_active);
    }

    const { data, error } = await supabase
      .from('member_notes')
      .select('*')
      .eq('member_id', memberId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getActiveNotesForMembers(memberIds: string[]): Promise<Record<string, MemberNote[]>> {
    if (isDemoMode()) {
      const notes = getDemoNotes();
      const result: Record<string, MemberNote[]> = {};
      memberIds.forEach(id => {
        const memberNotes = notes.filter(n => n.member_id === id && n.is_active);
        if (memberNotes.length > 0) {
          result[id] = memberNotes;
        }
      });
      return result;
    }

    const { data, error } = await supabase
      .from('member_notes')
      .select('*')
      .in('member_id', memberIds)
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) throw error;

    const result: Record<string, MemberNote[]> = {};
    data.forEach(note => {
      if (!result[note.member_id]) {
        result[note.member_id] = [];
      }
      result[note.member_id].push(note);
    });

    return result;
  },

  async create(note: Omit<MemberNote, 'id' | 'created_at'>): Promise<MemberNote> {
    if (isDemoMode()) {
      const notes = getDemoNotes();
      const newNote: MemberNote = {
        ...note,
        id: `note-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      notes.unshift(newNote);
      saveDemoNotes(notes);
      return newNote;
    }

    const { data, error } = await supabase
      .from('member_notes')
      .insert(note)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<MemberNote>): Promise<MemberNote> {
    if (isDemoMode()) {
      const notes = getDemoNotes();
      const index = notes.findIndex(n => n.id === id);
      if (index >= 0) {
        notes[index] = { ...notes[index], ...updates };
        saveDemoNotes(notes);
        return notes[index];
      }
      throw new Error('Note not found');
    }

    const { data, error } = await supabase
      .from('member_notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deactivate(id: string): Promise<void> {
    if (isDemoMode()) {
      const notes = getDemoNotes();
      const index = notes.findIndex(n => n.id === id);
      if (index >= 0) {
        notes[index].is_active = false;
        saveDemoNotes(notes);
      }
      return;
    }

    const { error } = await supabase
      .from('member_notes')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) {
      const notes = getDemoNotes();
      const filtered = notes.filter(n => n.id !== id);
      saveDemoNotes(filtered);
      return;
    }

    const { error } = await supabase
      .from('member_notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

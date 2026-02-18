import { supabase } from '@/lib/supabase';
import { isDemoMode } from './demoData';
import { DEMO_EXPANSION_SCENARIOS } from './locationDemoData';
import type { ExpansionScenarioData } from './locationDemoData';

export const expansionScenariosService = {
  async getAll(gymId: string): Promise<ExpansionScenarioData[]> {
    if (isDemoMode()) {
      return DEMO_EXPANSION_SCENARIOS;
    }

    const { data, error } = await supabase
      .from('expansion_scenarios')
      .select('*')
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ExpansionScenarioData[];
  },

  async create(data: Omit<ExpansionScenarioData, 'id'> & { gym_id: string }): Promise<ExpansionScenarioData> {
    if (isDemoMode()) {
      return { id: `exp-demo-${Date.now()}`, ...data } as ExpansionScenarioData;
    }

    const { data: result, error } = await supabase
      .from('expansion_scenarios')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result as ExpansionScenarioData;
  },

  async update(id: string, updates: Partial<ExpansionScenarioData>): Promise<ExpansionScenarioData> {
    if (isDemoMode()) {
      const existing = DEMO_EXPANSION_SCENARIOS.find(s => s.id === id);
      return { ...existing, ...updates } as ExpansionScenarioData;
    }

    const { data, error } = await supabase
      .from('expansion_scenarios')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ExpansionScenarioData;
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) {
      return; // no-op in demo mode
    }

    const { error } = await supabase
      .from('expansion_scenarios')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

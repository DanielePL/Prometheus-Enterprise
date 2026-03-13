import { supabase } from '@/lib/supabase';
import type {
  MembershipPlan,
  MembershipContract,
  MembershipAddon,
  MembershipFreeze,
  MemberWarning,
  MemberBan,
  InsertTables,
  UpdateTables,
  ContractStatus,
  FreezeStatus,
} from '@/types/database';
import {
  isDemoMode,
  DEMO_MEMBERSHIP_PLANS,
  DEMO_MEMBERSHIP_CONTRACTS,
  DEMO_MEMBERSHIP_ADDONS,
  DEMO_MEMBERSHIP_FREEZES,
  DEMO_MEMBER_WARNINGS,
  DEMO_MEMBER_BANS,
  DEMO_MEMBERSHIP_STATS,
} from './demoData';

// ============================================================
// PLANS
// ============================================================

export const membershipPlansService = {
  async getAll(gymId: string) {
    if (isDemoMode()) return DEMO_MEMBERSHIP_PLANS;

    const { data, error } = await supabase
      .from('membership_plans')
      .select('*')
      .eq('gym_id', gymId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data as MembershipPlan[];
  },

  async getActive(gymId: string) {
    if (isDemoMode()) return DEMO_MEMBERSHIP_PLANS.filter(p => p.is_active);

    const { data, error } = await supabase
      .from('membership_plans')
      .select('*')
      .eq('gym_id', gymId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data as MembershipPlan[];
  },

  async getByCategory(gymId: string, category: 'main' | 'addon') {
    if (isDemoMode()) return DEMO_MEMBERSHIP_PLANS.filter(p => p.category === category);

    const { data, error } = await supabase
      .from('membership_plans')
      .select('*')
      .eq('gym_id', gymId)
      .eq('category', category)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data as MembershipPlan[];
  },

  async create(plan: InsertTables<'membership_plans'>) {
    const { data, error } = await supabase
      .from('membership_plans')
      .insert(plan)
      .select()
      .single();

    if (error) throw error;
    return data as MembershipPlan;
  },

  async update(id: string, updates: UpdateTables<'membership_plans'>) {
    const { data, error } = await supabase
      .from('membership_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as MembershipPlan;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('membership_plans')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// ============================================================
// CONTRACTS
// ============================================================

export const membershipContractsService = {
  async getAll(gymId: string) {
    if (isDemoMode()) return DEMO_MEMBERSHIP_CONTRACTS;

    const { data, error } = await supabase
      .from('membership_contracts')
      .select(`
        *,
        member:members(id, name, email, avatar_url),
        plan:membership_plans(id, name, category, billing_interval, color)
      `)
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByStatus(gymId: string, status: ContractStatus) {
    if (isDemoMode()) return DEMO_MEMBERSHIP_CONTRACTS.filter(c => c.status === status);

    const { data, error } = await supabase
      .from('membership_contracts')
      .select(`
        *,
        member:members(id, name, email, avatar_url),
        plan:membership_plans(id, name, category, billing_interval, color)
      `)
      .eq('gym_id', gymId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByMember(memberId: string) {
    if (isDemoMode()) return DEMO_MEMBERSHIP_CONTRACTS.filter(c => c.member_id === memberId);

    const { data, error } = await supabase
      .from('membership_contracts')
      .select(`
        *,
        plan:membership_plans(id, name, category, billing_interval, price, color)
      `)
      .eq('member_id', memberId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(contract: InsertTables<'membership_contracts'>) {
    const { data, error } = await supabase
      .from('membership_contracts')
      .insert(contract)
      .select()
      .single();

    if (error) throw error;
    return data as MembershipContract;
  },

  async update(id: string, updates: UpdateTables<'membership_contracts'>) {
    const { data, error } = await supabase
      .from('membership_contracts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as MembershipContract;
  },

  async cancel(id: string, params: {
    cancellation_type: 'regular' | 'extraordinary' | 'revocation';
    cancellation_reason: string;
    cancellation_effective_date: string;
    cancelled_by: string;
    cancellation_proof_url?: string;
  }) {
    const { data, error } = await supabase
      .from('membership_contracts')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        ...params,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as MembershipContract;
  },

  async getExpiringContracts(gymId: string, daysAhead: number = 30) {
    if (isDemoMode()) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + daysAhead);
      return DEMO_MEMBERSHIP_CONTRACTS.filter(c =>
        c.status === 'active' && c.end_date && new Date(c.end_date) <= cutoff
      );
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + daysAhead);

    const { data, error } = await supabase
      .from('membership_contracts')
      .select(`
        *,
        member:members(id, name, email, avatar_url),
        plan:membership_plans(id, name, color)
      `)
      .eq('gym_id', gymId)
      .eq('status', 'active')
      .not('end_date', 'is', null)
      .lte('end_date', cutoff.toISOString().split('T')[0])
      .order('end_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getStats(gymId: string) {
    if (isDemoMode()) return DEMO_MEMBERSHIP_STATS;

    const { data, error } = await supabase
      .from('membership_contracts')
      .select('status, monthly_amount')
      .eq('gym_id', gymId);

    if (error) throw error;

    const active = data.filter(c => c.status === 'active');
    const frozen = data.filter(c => c.status === 'frozen');
    const cancelled = data.filter(c => c.status === 'cancelled');
    const mrr = active.reduce((sum, c) => sum + c.monthly_amount, 0);

    return {
      totalContracts: data.length,
      activeContracts: active.length,
      frozenContracts: frozen.length,
      cancelledContracts: cancelled.length,
      mrr,
      avgContractValue: active.length > 0 ? mrr / active.length : 0,
    };
  },
};

// ============================================================
// ADDONS
// ============================================================

export const membershipAddonsService = {
  async getByMember(memberId: string) {
    if (isDemoMode()) return DEMO_MEMBERSHIP_ADDONS.filter(a => a.member_id === memberId);

    const { data, error } = await supabase
      .from('membership_addons')
      .select(`
        *,
        plan:membership_plans(id, name, price, color)
      `)
      .eq('member_id', memberId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAll(gymId: string) {
    if (isDemoMode()) return DEMO_MEMBERSHIP_ADDONS;

    const { data, error } = await supabase
      .from('membership_addons')
      .select(`
        *,
        member:members(id, name, email),
        plan:membership_plans(id, name, price, color)
      `)
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(addon: InsertTables<'membership_addons'>) {
    const { data, error } = await supabase
      .from('membership_addons')
      .insert(addon)
      .select()
      .single();

    if (error) throw error;
    return data as MembershipAddon;
  },

  async cancel(id: string) {
    const { data, error } = await supabase
      .from('membership_addons')
      .update({ status: 'cancelled', end_date: new Date().toISOString().split('T')[0] })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as MembershipAddon;
  },
};

// ============================================================
// FREEZES (Timestop)
// ============================================================

export const membershipFreezesService = {
  async getAll(gymId: string) {
    if (isDemoMode()) return DEMO_MEMBERSHIP_FREEZES;

    const { data, error } = await supabase
      .from('membership_freezes')
      .select(`
        *,
        member:members(id, name, email, avatar_url),
        contract:membership_contracts(id, contract_number, plan_id)
      `)
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByMember(memberId: string) {
    if (isDemoMode()) return DEMO_MEMBERSHIP_FREEZES.filter(f => f.member_id === memberId);

    const { data, error } = await supabase
      .from('membership_freezes')
      .select('*')
      .eq('member_id', memberId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data as MembershipFreeze[];
  },

  async getPending(gymId: string) {
    if (isDemoMode()) return DEMO_MEMBERSHIP_FREEZES.filter(f => f.status === 'pending');

    const { data, error } = await supabase
      .from('membership_freezes')
      .select(`
        *,
        member:members(id, name, email, avatar_url),
        contract:membership_contracts(id, contract_number)
      `)
      .eq('gym_id', gymId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(freeze: InsertTables<'membership_freezes'>) {
    const { data, error } = await supabase
      .from('membership_freezes')
      .insert(freeze)
      .select()
      .single();

    if (error) throw error;
    return data as MembershipFreeze;
  },

  async approve(id: string, approvedBy: string) {
    const { data, error } = await supabase
      .from('membership_freezes')
      .update({
        status: 'approved' as FreezeStatus,
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as MembershipFreeze;
  },

  async reject(id: string, reason: string) {
    const { data, error } = await supabase
      .from('membership_freezes')
      .update({
        status: 'rejected' as FreezeStatus,
        rejected_reason: reason,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as MembershipFreeze;
  },
};

// ============================================================
// WARNINGS
// ============================================================

export const memberWarningsService = {
  async getAll(gymId: string) {
    if (isDemoMode()) return DEMO_MEMBER_WARNINGS;

    const { data, error } = await supabase
      .from('member_warnings')
      .select(`
        *,
        member:members(id, name, email, avatar_url)
      `)
      .eq('gym_id', gymId)
      .order('issued_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByMember(memberId: string) {
    if (isDemoMode()) return DEMO_MEMBER_WARNINGS.filter(w => w.member_id === memberId);

    const { data, error } = await supabase
      .from('member_warnings')
      .select('*')
      .eq('member_id', memberId)
      .order('issued_at', { ascending: false });

    if (error) throw error;
    return data as MemberWarning[];
  },

  async getActive(gymId: string) {
    if (isDemoMode()) return DEMO_MEMBER_WARNINGS.filter(w => w.is_active);

    const { data, error } = await supabase
      .from('member_warnings')
      .select(`
        *,
        member:members(id, name, email, avatar_url)
      `)
      .eq('gym_id', gymId)
      .eq('is_active', true)
      .order('issued_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(warning: InsertTables<'member_warnings'>) {
    const { data, error } = await supabase
      .from('member_warnings')
      .insert(warning)
      .select()
      .single();

    if (error) throw error;
    return data as MemberWarning;
  },

  async deactivate(id: string) {
    const { data, error } = await supabase
      .from('member_warnings')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as MemberWarning;
  },
};

// ============================================================
// BANS
// ============================================================

export const memberBansService = {
  async getAll(gymId: string) {
    if (isDemoMode()) return DEMO_MEMBER_BANS;

    const { data, error } = await supabase
      .from('member_bans')
      .select(`
        *,
        member:members(id, name, email, avatar_url)
      `)
      .eq('gym_id', gymId)
      .order('issued_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getActive(gymId: string) {
    if (isDemoMode()) return DEMO_MEMBER_BANS.filter(b => b.is_active);

    const { data, error } = await supabase
      .from('member_bans')
      .select(`
        *,
        member:members(id, name, email, avatar_url)
      `)
      .eq('gym_id', gymId)
      .eq('is_active', true)
      .order('issued_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByMember(memberId: string) {
    if (isDemoMode()) return DEMO_MEMBER_BANS.filter(b => b.member_id === memberId);

    const { data, error } = await supabase
      .from('member_bans')
      .select('*')
      .eq('member_id', memberId)
      .order('issued_at', { ascending: false });

    if (error) throw error;
    return data as MemberBan[];
  },

  async create(ban: InsertTables<'member_bans'>) {
    const { data, error } = await supabase
      .from('member_bans')
      .insert(ban)
      .select()
      .single();

    if (error) throw error;
    return data as MemberBan;
  },

  async lift(id: string, liftedBy: string, reason: string) {
    const { data, error } = await supabase
      .from('member_bans')
      .update({
        is_active: false,
        lifted_at: new Date().toISOString(),
        lifted_by: liftedBy,
        lift_reason: reason,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as MemberBan;
  },
};

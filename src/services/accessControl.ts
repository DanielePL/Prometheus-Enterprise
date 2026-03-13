import { supabase } from '@/lib/supabase';
import {
  InsertTables,
  UpdateTables,
  MemberFaceData,
  MemberBluetoothDevice,
  AccessLog,
  GymAccessSettings,
  AccessMethod,
  AccessStatus,
  OpeningHours,
  Member,
} from '@/types/database';
import { isDemoMode, DEMO_ACCESS_LOGS, DEMO_ACCESS_STATS, DEMO_ACCESS_SETTINGS } from './demoData';
import { alertsService } from './alerts';

// Default opening hours
export const DEFAULT_OPENING_HOURS: OpeningHours = {
  monday: { open: '06:00', close: '22:00', closed: false },
  tuesday: { open: '06:00', close: '22:00', closed: false },
  wednesday: { open: '06:00', close: '22:00', closed: false },
  thursday: { open: '06:00', close: '22:00', closed: false },
  friday: { open: '06:00', close: '22:00', closed: false },
  saturday: { open: '08:00', close: '20:00', closed: false },
  sunday: { open: '08:00', close: '18:00', closed: false },
};

export interface AccessValidationResult {
  canAccess: boolean;
  denialReason: string | null;
}

export interface CheckInResult {
  success: boolean;
  member?: Member;
  visitId?: string;
  message: string;
  accessLogId?: string;
}

export const accessControlService = {
  // ==========================================
  // ACCESS SETTINGS
  // ==========================================

  async getSettings(gymId: string): Promise<GymAccessSettings | null> {
    if (isDemoMode()) {
      return DEMO_ACCESS_SETTINGS as unknown as GymAccessSettings;
    }

    const { data, error } = await supabase
      .from('gym_access_settings')
      .select('*')
      .eq('gym_id', gymId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createSettings(data: InsertTables<'gym_access_settings'>): Promise<GymAccessSettings> {
    const { data: settings, error } = await supabase
      .from('gym_access_settings')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return settings;
  },

  async updateSettings(
    gymId: string,
    data: UpdateTables<'gym_access_settings'>
  ): Promise<GymAccessSettings> {
    const { data: settings, error } = await supabase
      .from('gym_access_settings')
      .update(data)
      .eq('gym_id', gymId)
      .select()
      .single();

    if (error) throw error;
    return settings;
  },

  async ensureSettings(gymId: string): Promise<GymAccessSettings> {
    let settings = await this.getSettings(gymId);
    if (!settings) {
      settings = await this.createSettings({
        gym_id: gymId,
        opening_hours: DEFAULT_OPENING_HOURS,
      });
    }
    return settings;
  },

  // ==========================================
  // FACE DATA
  // ==========================================

  async getFaceDataByMember(memberId: string): Promise<MemberFaceData | null> {
    const { data, error } = await supabase
      .from('member_face_data')
      .select('*')
      .eq('member_id', memberId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getAllFaceData(gymId: string): Promise<MemberFaceData[]> {
    const { data, error } = await supabase
      .from('member_face_data')
      .select('*')
      .eq('gym_id', gymId)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  },

  async saveFaceData(data: InsertTables<'member_face_data'>): Promise<MemberFaceData> {
    // Check if member already has face data
    const existing = await this.getFaceDataByMember(data.member_id);

    if (existing) {
      // Update existing
      const { data: updated, error } = await supabase
        .from('member_face_data')
        .update({
          face_descriptor: data.face_descriptor,
          photo_url: data.photo_url,
          is_active: true,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    }

    // Create new
    const { data: created, error } = await supabase
      .from('member_face_data')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return created;
  },

  async deleteFaceData(memberId: string): Promise<void> {
    const { error } = await supabase
      .from('member_face_data')
      .update({ is_active: false })
      .eq('member_id', memberId);

    if (error) throw error;
  },

  // ==========================================
  // BLUETOOTH DEVICES
  // ==========================================

  async getBluetoothDevices(memberId: string): Promise<MemberBluetoothDevice[]> {
    const { data, error } = await supabase
      .from('member_bluetooth_devices')
      .select('*')
      .eq('member_id', memberId)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  },

  async getBluetoothDeviceByDeviceId(
    gymId: string,
    deviceId: string
  ): Promise<MemberBluetoothDevice | null> {
    const { data, error } = await supabase
      .from('member_bluetooth_devices')
      .select('*')
      .eq('gym_id', gymId)
      .eq('device_id', deviceId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async registerBluetoothDevice(
    data: InsertTables<'member_bluetooth_devices'>
  ): Promise<MemberBluetoothDevice> {
    const { data: device, error } = await supabase
      .from('member_bluetooth_devices')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return device;
  },

  async updateBluetoothDevice(
    id: string,
    data: UpdateTables<'member_bluetooth_devices'>
  ): Promise<MemberBluetoothDevice> {
    const { data: device, error } = await supabase
      .from('member_bluetooth_devices')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return device;
  },

  async removeBluetoothDevice(id: string): Promise<void> {
    const { error } = await supabase
      .from('member_bluetooth_devices')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  // ==========================================
  // ACCESS LOGS
  // ==========================================

  async getAccessLogs(
    gymId: string,
    options?: {
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
      memberId?: string;
      method?: AccessMethod;
      status?: AccessStatus;
    }
  ): Promise<AccessLog[]> {
    if (isDemoMode()) {
      let logs = [...DEMO_ACCESS_LOGS] as unknown as AccessLog[];
      if (options?.memberId) logs = logs.filter(l => l.member_id === options.memberId);
      if (options?.method) logs = logs.filter(l => l.access_method === options.method);
      if (options?.status) logs = logs.filter(l => l.access_status === options.status);
      if (options?.limit) logs = logs.slice(0, options.limit);
      return logs;
    }

    let query = supabase
      .from('access_logs')
      .select('*')
      .eq('gym_id', gymId)
      .order('attempted_at', { ascending: false });

    if (options?.startDate) {
      query = query.gte('attempted_at', options.startDate);
    }
    if (options?.endDate) {
      query = query.lte('attempted_at', options.endDate);
    }
    if (options?.memberId) {
      query = query.eq('member_id', options.memberId);
    }
    if (options?.method) {
      query = query.eq('access_method', options.method);
    }
    if (options?.status) {
      query = query.eq('access_status', options.status);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async logAccess(data: InsertTables<'access_logs'>): Promise<AccessLog> {
    const { data: log, error } = await supabase
      .from('access_logs')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return log;
  },

  async getAccessStats(
    gymId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    totalAttempts: number;
    granted: number;
    denied: number;
    byMethod: Record<AccessMethod, number>;
  }> {
    if (isDemoMode()) {
      return DEMO_ACCESS_STATS;
    }

    const { data, error } = await supabase
      .from('access_logs')
      .select('access_method, access_status')
      .eq('gym_id', gymId)
      .gte('attempted_at', startDate)
      .lte('attempted_at', endDate);

    if (error) throw error;

    const logs = data || [];
    const stats = {
      totalAttempts: logs.length,
      granted: logs.filter((l) => l.access_status === 'granted').length,
      denied: logs.filter((l) => l.access_status === 'denied').length,
      byMethod: {
        bluetooth: 0,
        face_recognition: 0,
        manual: 0,
        qr_code: 0,
      } as Record<AccessMethod, number>,
    };

    logs.forEach((log) => {
      stats.byMethod[log.access_method as AccessMethod]++;
    });

    return stats;
  },

  // ==========================================
  // ACCESS VALIDATION
  // ==========================================

  isGymOpen(settings: GymAccessSettings): boolean {
    const now = new Date();

    // Check holiday closures
    const todayStr = now.toISOString().split('T')[0];
    if (settings.holiday_closures?.includes(todayStr)) return false;

    const dayNames = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ] as const;
    const today = dayNames[now.getDay()];
    const schedule = settings.opening_hours[today];

    if (schedule.closed) return false;

    const currentTime = now.toTimeString().slice(0, 5);
    return currentTime >= schedule.open && currentTime <= schedule.close;
  },

  async validateMemberAccess(
    memberId: string,
    gymId: string
  ): Promise<AccessValidationResult> {
    // Get member
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('id', memberId)
      .eq('gym_id', gymId)
      .single();

    if (memberError || !member) {
      return { canAccess: false, denialReason: 'Member not found' };
    }

    // Get settings
    const settings = await this.getSettings(gymId);

    // Check if gym is open
    if (settings && !this.isGymOpen(settings)) {
      return { canAccess: false, denialReason: 'Gym is currently closed' };
    }

    // Check membership status
    if (settings?.require_active_membership) {
      if (member.membership_end) {
        const endDate = new Date(member.membership_end);
        const graceDays = settings.allow_expired_grace_days || 0;
        const graceDate = new Date();
        graceDate.setDate(graceDate.getDate() - graceDays);

        if (endDate < graceDate) {
          return { canAccess: false, denialReason: 'Membership expired' };
        }
      }
    }

    return { canAccess: true, denialReason: null };
  },

  // ==========================================
  // CHECK-IN OPERATIONS
  // ==========================================

  async performCheckIn(
    gymId: string,
    memberId: string,
    method: AccessMethod,
    options?: {
      confidenceScore?: number;
      deviceId?: string;
      terminalId?: string;
      terminalName?: string;
    }
  ): Promise<CheckInResult> {
    // Validate access
    const validation = await this.validateMemberAccess(memberId, gymId);

    if (!validation.canAccess) {
      // Log denied access
      const accessLog = await this.logAccess({
        gym_id: gymId,
        member_id: memberId,
        access_method: method,
        access_status: 'denied',
        denial_reason: validation.denialReason,
        confidence_score: options?.confidenceScore,
        device_id: options?.deviceId,
        terminal_id: options?.terminalId,
        terminal_name: options?.terminalName,
      });

      // Create alert for denied access (skip in demo mode)
      if (!isDemoMode()) {
        const settings = await this.getSettings(gymId);
        const isAfterHours = validation.denialReason === 'Gym is currently closed';
        const shouldNotify =
          (isAfterHours && settings?.notify_on_after_hours_attempt) ||
          (!isAfterHours && settings?.notify_on_denied_access);

        if (shouldNotify) {
          // Get member name for the alert
          const { data: member } = await supabase
            .from('members')
            .select('name')
            .eq('id', memberId)
            .single();

          const methodLabel =
            method === 'face_recognition' ? 'Face Recognition' :
            method === 'bluetooth' ? 'Device' :
            method === 'qr_code' ? 'QR Code' : 'Manual';

          alertsService.createAccessDeniedAlert(
            gymId,
            member?.name || 'Unknown Member',
            memberId,
            validation.denialReason || 'Access denied',
            methodLabel
          ).catch(console.error);
        }
      }

      return {
        success: false,
        message: validation.denialReason || 'Access denied',
        accessLogId: accessLog.id,
      };
    }

    // Get member info
    const { data: member } = await supabase
      .from('members')
      .select('*')
      .eq('id', memberId)
      .single();

    // Create visit record
    const { data: visit, error: visitError } = await supabase
      .from('member_visits')
      .insert({
        gym_id: gymId,
        member_id: memberId,
        check_in_method: method,
      })
      .select()
      .single();

    if (visitError) throw visitError;

    // Update member stats
    await supabase.rpc('increment_visits', { member_uuid: memberId });

    // Log granted access
    const accessLog = await this.logAccess({
      gym_id: gymId,
      member_id: memberId,
      access_method: method,
      access_status: 'granted',
      confidence_score: options?.confidenceScore,
      device_id: options?.deviceId,
      terminal_id: options?.terminalId,
      terminal_name: options?.terminalName,
      visit_id: visit.id,
    });

    return {
      success: true,
      member: member || undefined,
      visitId: visit.id,
      message: 'Check-in successful',
      accessLogId: accessLog.id,
    };
  },

  async performCheckOut(gymId: string, memberId: string): Promise<boolean> {
    // Find active visit (no checkout yet)
    const { data: visit, error: findError } = await supabase
      .from('member_visits')
      .select('*')
      .eq('gym_id', gymId)
      .eq('member_id', memberId)
      .is('check_out', null)
      .order('check_in', { ascending: false })
      .limit(1)
      .single();

    if (findError || !visit) return false;

    // Update with checkout time
    const { error: updateError } = await supabase
      .from('member_visits')
      .update({ check_out: new Date().toISOString() })
      .eq('id', visit.id);

    if (updateError) throw updateError;

    return true;
  },

  // ==========================================
  // MEMBER ACCESS INFO
  // ==========================================

  subscribeToAccessLogs(
    gymId: string,
    callback: (log: AccessLog) => void
  ): { unsubscribe: () => void } {
    const channel = supabase
      .channel(`access-logs-${gymId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'access_logs',
          filter: `gym_id=eq.${gymId}`,
        },
        (payload) => {
          callback(payload.new as AccessLog);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  },

  async getCurrentOccupancy(gymId: string): Promise<number> {
    if (isDemoMode()) return 14;

    const today = new Date().toISOString().split('T')[0];
    const { count, error } = await supabase
      .from('member_visits')
      .select('*', { count: 'exact', head: true })
      .eq('gym_id', gymId)
      .is('check_out', null)
      .gte('check_in', today + 'T00:00:00');

    if (error) throw error;
    return count || 0;
  },

  async getMemberAccessInfo(
    memberId: string
  ): Promise<{
    hasFaceData: boolean;
    bluetoothDevices: MemberBluetoothDevice[];
    recentAccess: AccessLog[];
  }> {
    const [faceData, bluetoothDevices, { data: member }] = await Promise.all([
      this.getFaceDataByMember(memberId),
      this.getBluetoothDevices(memberId),
      supabase.from('members').select('gym_id').eq('id', memberId).single(),
    ]);

    let recentAccess: AccessLog[] = [];
    if (member?.gym_id) {
      recentAccess = await this.getAccessLogs(member.gym_id, {
        memberId,
        limit: 10,
      });
    }

    return {
      hasFaceData: !!faceData,
      bluetoothDevices,
      recentAccess,
    };
  },
};

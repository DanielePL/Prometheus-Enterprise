import { supabase } from '@/lib/supabase';
import { isDemoMode, DEMO_COACH_RESPONSE_METRICS, DEMO_COACH_SERVICE_INDEX, DEMO_COACH_ACTIVITY } from './demoData';
import type { CoachResponseMetrics, CoachServiceIndex, CoachActivityEvent, ClientServiceEntry } from '@/types/coachDetail';

export const coachDetailService = {
  async getResponseMetrics(coachId: string): Promise<CoachResponseMetrics> {
    if (isDemoMode()) {
      return DEMO_COACH_RESPONSE_METRICS[coachId] || {
        coachId, avgResponseMinutes: 0, medianResponseMinutes: 0, responseRate: 0,
        totalMessagesReceived: 0, totalMessagesReplied: 0, weeklyTrend: [],
      };
    }

    // Get coach_app_user_id from integration
    const coachAppUserId = await resolveCoachAppUserId(coachId);
    if (!coachAppUserId) {
      return { coachId, avgResponseMinutes: 0, medianResponseMinutes: 0, responseRate: 0, totalMessagesReceived: 0, totalMessagesReplied: 0, weeklyTrend: [] };
    }

    // Query messages where coach is participant to calculate response times
    const { data: messages } = await supabase
      .from('messages')
      .select('id, sender_id, created_at, conversation_id')
      .or(`sender_id.eq.${coachAppUserId}`)
      .order('created_at', { ascending: false })
      .limit(500);

    // Query conversations where coach participates
    const { data: participations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', coachAppUserId);

    const conversationIds = (participations || []).map(p => p.conversation_id);

    // Get all messages in those conversations
    const allMessages: any[] = [];
    if (conversationIds.length > 0) {
      const { data: convMessages } = await supabase
        .from('messages')
        .select('id, sender_id, created_at, conversation_id')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: true })
        .limit(1000);
      allMessages.push(...(convMessages || []));
    }

    // Calculate response metrics
    let totalReceived = 0;
    let totalReplied = 0;
    const responseTimes: number[] = [];

    // Group messages by conversation
    const byConversation: Record<string, any[]> = {};
    for (const msg of allMessages) {
      if (!byConversation[msg.conversation_id]) byConversation[msg.conversation_id] = [];
      byConversation[msg.conversation_id].push(msg);
    }

    for (const msgs of Object.values(byConversation)) {
      for (let i = 0; i < msgs.length - 1; i++) {
        if (msgs[i].sender_id !== coachAppUserId) {
          totalReceived++;
          if (msgs[i + 1]?.sender_id === coachAppUserId) {
            totalReplied++;
            const diff = (new Date(msgs[i + 1].created_at).getTime() - new Date(msgs[i].created_at).getTime()) / 60000;
            responseTimes.push(diff);
          }
        }
      }
    }

    const sorted = [...responseTimes].sort((a, b) => a - b);
    const avg = sorted.length > 0 ? Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length) : 0;
    const median = sorted.length > 0 ? Math.round(sorted[Math.floor(sorted.length / 2)]) : 0;

    // Weekly trend (last 8 weeks)
    const weeklyTrend: { week: string; avgMinutes: number }[] = [];
    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - w * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const weekLabel = `${weekStart.getDate()}.${weekStart.getMonth() + 1}`;
      const weekTimes = responseTimes.filter((_, idx) => {
        const msgTime = new Date(allMessages[idx]?.created_at);
        return msgTime >= weekStart && msgTime < weekEnd;
      });
      weeklyTrend.push({
        week: weekLabel,
        avgMinutes: weekTimes.length > 0 ? Math.round(weekTimes.reduce((a, b) => a + b, 0) / weekTimes.length) : avg,
      });
    }

    return {
      coachId,
      avgResponseMinutes: avg,
      medianResponseMinutes: median,
      responseRate: totalReceived > 0 ? totalReplied / totalReceived : 0,
      totalMessagesReceived: totalReceived,
      totalMessagesReplied: totalReplied,
      weeklyTrend,
    };
  },

  async getServiceIndex(coachId: string): Promise<CoachServiceIndex> {
    if (isDemoMode()) {
      return DEMO_COACH_SERVICE_INDEX[coachId] || {
        coachId, overallScore: 0, npsScore: 0, clientRetentionRate: 0,
        avgClientTenureMonths: 0, clients: [], monthlyScores: [],
      };
    }

    const coachAppUserId = await resolveCoachAppUserId(coachId);
    if (!coachAppUserId) {
      return { coachId, overallScore: 0, npsScore: 0, clientRetentionRate: 0, avgClientTenureMonths: 0, clients: [], monthlyScores: [] };
    }

    // Get clients
    const { data: clientData } = await supabase
      .from('coach_clients')
      .select(`
        id, created_at, status,
        client:profiles!coach_clients_client_id_fkey(id, full_name)
      `)
      .eq('coach_id', coachAppUserId);

    // Get coaching sessions for session counts
    const { data: sessions } = await supabase
      .from('coaching_sessions')
      .select('client_id, status, started_at')
      .eq('coach_id', coachAppUserId);

    // Get feedback/reviews
    const { data: reviews } = await supabase
      .from('coach_session_reviews')
      .select('client_id, rating, comment, created_at')
      .eq('coach_id', coachAppUserId)
      .order('created_at', { ascending: false });

    const clients: ClientServiceEntry[] = (clientData || []).map((d: any) => {
      const clientId = d.client?.id || d.id;
      const clientSessions = (sessions || []).filter(s => s.client_id === clientId);
      const completed = clientSessions.filter(s => s.status === 'completed').length;
      const noShow = clientSessions.filter(s => s.status === 'no_show').length;
      const clientReviews = (reviews || []).filter(r => r.client_id === clientId);
      const avgRating = clientReviews.length > 0
        ? clientReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / clientReviews.length
        : 0;
      const tenure = Math.floor((Date.now() - new Date(d.created_at).getTime()) / (30 * 24 * 60 * 60 * 1000));

      return {
        clientId,
        clientName: d.client?.full_name || 'Unknown',
        email: '',
        satisfactionScore: avgRating > 0 ? Math.round(avgRating * 2) : 0,
        retentionMonths: tenure,
        sessionsCompleted: completed,
        sessionsNoShow: noShow,
        progressRating: Math.round(avgRating) || 0,
        lastFeedback: clientReviews[0]?.comment || null,
        lastMessageAt: null,
        avgResponseMinutes: null,
        trend: 'stable' as const,
      };
    });

    const activeClients = clients.filter(c => c.sessionsCompleted > 0).length;
    const totalClients = clients.length;
    const retentionRate = totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0;
    const avgTenure = clients.length > 0 ? Math.round(clients.reduce((s, c) => s + c.retentionMonths, 0) / clients.length) : 0;
    const avgSatisfaction = clients.length > 0 ? clients.reduce((s, c) => s + c.satisfactionScore, 0) / clients.length : 0;
    const overallScore = Math.round((retentionRate * 0.4) + (avgSatisfaction * 6) + ((100 - Math.min(100, (0))) * 0.2));

    return {
      coachId,
      overallScore: Math.min(100, Math.max(0, overallScore)),
      npsScore: Math.round(avgSatisfaction * 10 - 10),
      clientRetentionRate: retentionRate,
      avgClientTenureMonths: avgTenure,
      clients,
      monthlyScores: [],
    };
  },

  async getActivityLog(coachId: string): Promise<CoachActivityEvent[]> {
    if (isDemoMode()) {
      return DEMO_COACH_ACTIVITY[coachId] || [];
    }

    const coachAppUserId = await resolveCoachAppUserId(coachId);
    if (!coachAppUserId) return [];

    const events: CoachActivityEvent[] = [];

    // Coaching sessions as activity
    const { data: sessions } = await supabase
      .from('coaching_sessions')
      .select(`
        id, status, started_at, ended_at,
        client:profiles!coaching_sessions_client_id_fkey(full_name)
      `)
      .eq('coach_id', coachAppUserId)
      .order('started_at', { ascending: false })
      .limit(20);

    for (const s of sessions || []) {
      const clientName = (s as any).client?.full_name || 'Client';
      if (s.status === 'completed' || s.ended_at) {
        events.push({
          id: `session-${s.id}`,
          type: 'session_completed',
          description: `Session mit ${clientName} abgeschlossen`,
          timestamp: s.ended_at || s.started_at,
          relatedClientName: clientName,
        });
      } else if (s.status === 'no_show') {
        events.push({
          id: `noshow-${s.id}`,
          type: 'no_show',
          description: `${clientName} nicht zur Session erschienen`,
          timestamp: s.started_at,
          relatedClientName: clientName,
        });
      }
    }

    // Recent workout templates created
    const { data: workouts } = await supabase
      .from('workout_templates')
      .select('id, name, created_at')
      .or(`coach_id.eq.${coachAppUserId},user_id.eq.${coachAppUserId}`)
      .order('created_at', { ascending: false })
      .limit(10);

    for (const w of workouts || []) {
      events.push({
        id: `workout-${w.id}`,
        type: 'workout_created',
        description: `Neues Workout "${w.name}" erstellt`,
        timestamp: w.created_at,
      });
    }

    // Recent messages sent
    const { data: msgs } = await supabase
      .from('messages')
      .select('id, created_at, content')
      .eq('sender_id', coachAppUserId)
      .order('created_at', { ascending: false })
      .limit(10);

    for (const m of msgs || []) {
      events.push({
        id: `msg-${m.id}`,
        type: 'message_sent',
        description: `Nachricht gesendet`,
        timestamp: m.created_at,
      });
    }

    // Reviews received
    const { data: reviews } = await supabase
      .from('coach_session_reviews')
      .select(`
        id, rating, created_at,
        client:profiles!coach_session_reviews_client_id_fkey(full_name)
      `)
      .eq('coach_id', coachAppUserId)
      .order('created_at', { ascending: false })
      .limit(10);

    for (const r of reviews || []) {
      const clientName = (r as any).client?.full_name || 'Client';
      events.push({
        id: `review-${r.id}`,
        type: 'feedback_received',
        description: `Neue ${r.rating}-Sterne Bewertung von ${clientName}`,
        timestamp: r.created_at,
        relatedClientName: clientName,
      });
    }

    // Sort all events by timestamp descending
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return events.slice(0, 20);
  },
};

// Helper: resolve enterprise coach ID to coach app user ID
async function resolveCoachAppUserId(coachId: string): Promise<string | null> {
  const { data } = await supabase
    .from('coach_integrations')
    .select('coach_app_user_id')
    .eq('coach_id', coachId)
    .eq('status', 'linked')
    .maybeSingle();

  return data?.coach_app_user_id || null;
}

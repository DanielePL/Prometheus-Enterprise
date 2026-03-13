import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  CheckCircle2,
  XCircle,
  ScanFace,
  Smartphone,
  User,
  Activity,
  QrCode,
  Radio,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { accessControlService } from '@/services/accessControl';
import { membersService } from '@/services/members';
import { isDemoMode, DEMO_MEMBERS } from '@/services/demoData';
import { AccessLog, AccessMethod, Member } from '@/types/database';

interface LiveEvent {
  id: string;
  memberName: string;
  method: AccessMethod;
  status: 'granted' | 'denied';
  time: string;
  timestamp: number;
}

interface LiveAccessMonitorProps {
  gymId: string;
}

export default function LiveAccessMonitor({ gymId }: LiveAccessMonitorProps) {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [occupancy, setOccupancy] = useState(0);
  const [todayGranted, setTodayGranted] = useState(0);
  const [todayDenied, setTodayDenied] = useState(0);
  const [memberMap, setMemberMap] = useState<Map<string, Member>>(new Map());
  const demoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load members for name lookup
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const members = await membersService.getAll(gymId);
        setMemberMap(new Map(members.map(m => [m.id, m])));
      } catch (error) {
        console.error('Failed to load members:', error);
      }
    };
    loadMembers();
  }, [gymId]);

  // Load initial stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const stats = await accessControlService.getAccessStats(
          gymId,
          today + 'T00:00:00',
          today + 'T23:59:59'
        );
        setTodayGranted(stats.granted);
        setTodayDenied(stats.denied);

        // Get current occupancy
        if (!isDemoMode()) {
          const { count } = await supabase
            .from('member_visits')
            .select('*', { count: 'exact', head: true })
            .eq('gym_id', gymId)
            .is('check_out', null)
            .gte('check_in', today + 'T00:00:00');
          setOccupancy(count || 0);
        } else {
          setOccupancy(14);
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };
    loadStats();
  }, [gymId]);

  const getMemberName = useCallback(
    (memberId: string | null): string => {
      if (!memberId) return 'Unknown';
      return memberMap.get(memberId)?.name || 'Unknown Member';
    },
    [memberMap]
  );

  // Add event to feed
  const addEvent = useCallback((event: LiveEvent) => {
    setEvents(prev => [event, ...prev].slice(0, 50));
  }, []);

  // Subscribe to real-time access logs
  useEffect(() => {
    if (isDemoMode()) {
      // Demo mode: generate fake events periodically
      const methods: AccessMethod[] = ['face_recognition', 'bluetooth', 'manual', 'qr_code'];
      const demoMembers = DEMO_MEMBERS.slice(0, 15);
      let eventIndex = 0;

      demoIntervalRef.current = setInterval(() => {
        const member = demoMembers[eventIndex % demoMembers.length];
        const isGranted = Math.random() > 0.1;
        const method = methods[Math.floor(Math.random() * methods.length)];
        const now = new Date();

        addEvent({
          id: `demo-${Date.now()}`,
          memberName: member.name,
          method,
          status: isGranted ? 'granted' : 'denied',
          time: now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          timestamp: now.getTime(),
        });

        if (isGranted) {
          setOccupancy(prev => prev + 1);
          setTodayGranted(prev => prev + 1);
        } else {
          setTodayDenied(prev => prev + 1);
        }

        eventIndex++;
      }, 15000 + Math.random() * 15000);

      return () => {
        if (demoIntervalRef.current) {
          clearInterval(demoIntervalRef.current);
        }
      };
    }

    // Real mode: Supabase Realtime subscription
    const channel = supabase
      .channel('access-logs-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'access_logs',
          filter: `gym_id=eq.${gymId}`,
        },
        (payload) => {
          const log = payload.new as AccessLog;
          const now = new Date();

          addEvent({
            id: log.id,
            memberName: getMemberName(log.member_id),
            method: log.access_method,
            status: log.access_status as 'granted' | 'denied',
            time: now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            timestamp: now.getTime(),
          });

          if (log.access_status === 'granted') {
            setOccupancy(prev => prev + 1);
            setTodayGranted(prev => prev + 1);
          } else if (log.access_status === 'denied') {
            setTodayDenied(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gymId, addEvent, getMemberName]);

  const getMethodIcon = (method: AccessMethod) => {
    switch (method) {
      case 'face_recognition': return <ScanFace className="h-4 w-4" />;
      case 'bluetooth': return <Smartphone className="h-4 w-4" />;
      case 'manual': return <User className="h-4 w-4" />;
      case 'qr_code': return <QrCode className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getMethodLabel = (method: AccessMethod): string => {
    switch (method) {
      case 'face_recognition': return 'Face';
      case 'bluetooth': return 'Device';
      case 'manual': return 'Manual';
      case 'qr_code': return 'QR Code';
      default: return method;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Currently in Gym</p>
                <p className="text-3xl font-bold">{occupancy}</p>
              </div>
              <Users className="h-8 w-8 text-primary/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Check-ins</p>
                <p className="text-3xl font-bold text-green-500">{todayGranted}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Denials</p>
                <p className="text-3xl font-bold text-red-500">{todayDenied}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Feed */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-green-500 animate-pulse" />
            Live Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Radio className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">Waiting for events...</p>
              <p className="text-sm">New check-in attempts will appear here in real-time</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    index === 0 ? 'animate-fade-in' : ''
                  } ${
                    event.status === 'granted'
                      ? 'bg-green-500/10 border border-green-500/20'
                      : 'bg-red-500/10 border border-red-500/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      event.status === 'granted' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {event.status === 'granted' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{event.memberName}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {getMethodIcon(event.method)}
                        <span>{getMethodLabel(event.method)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={event.status === 'granted' ? 'default' : 'destructive'} className={
                      event.status === 'granted' ? 'bg-green-500' : ''
                    }>
                      {event.status === 'granted' ? 'Granted' : 'Denied'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

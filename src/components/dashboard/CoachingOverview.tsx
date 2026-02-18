import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Link2, Users, Dumbbell, BookOpen, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { coachIntegrationService } from '@/services/coachIntegration';
import { coachDeepLinks } from '@/config/coachIntegration';
import type { CoachIntegrationRow } from '@/types/database';
import type { CoachCachedData } from '@/types/coachIntegration';
import { useNavigate } from 'react-router-dom';

export default function CoachingOverview() {
  const { gym } = useAuth();
  const navigate = useNavigate();

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['coach-integrations', gym?.id],
    queryFn: () => coachIntegrationService.getIntegrations(gym!.id),
    enabled: !!gym?.id,
  });

  const linkedIntegrations = (integrations || []).filter(
    (i: CoachIntegrationRow) => i.status === 'linked'
  );

  // Aggregate cached data
  const totals = linkedIntegrations.reduce(
    (acc: { clients: number; workouts: number; programs: number }, i: CoachIntegrationRow) => {
      const cached = (i.cached_data || {}) as CoachCachedData;
      return {
        clients: acc.clients + (cached.totalClients || 0),
        workouts: acc.workouts + (cached.totalWorkouts || 0),
        programs: acc.programs + (cached.totalPrograms || 0),
      };
    },
    { clients: 0, workouts: 0, programs: 0 }
  );

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (linkedIntegrations.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Link2 className="h-5 w-5 text-primary" />
            Coaching Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              No coaches linked to Prometheus Coach yet
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate('/coaches')}>
              Manage Coaches
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="h-5 w-5 text-primary" />
          Coaching Overview
          <Badge variant="outline">{linkedIntegrations.length} linked</Badge>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(coachDeepLinks.dashboard(), '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          Coach App
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Users className="h-5 w-5 mx-auto text-blue-500 mb-1" />
            <p className="text-xl font-bold">{totals.clients}</p>
            <p className="text-xs text-muted-foreground">Coaching Clients</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Dumbbell className="h-5 w-5 mx-auto text-green-500 mb-1" />
            <p className="text-xl font-bold">{totals.workouts}</p>
            <p className="text-xs text-muted-foreground">Workouts</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <BookOpen className="h-5 w-5 mx-auto text-purple-500 mb-1" />
            <p className="text-xl font-bold">{totals.programs}</p>
            <p className="text-xs text-muted-foreground">Programs</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

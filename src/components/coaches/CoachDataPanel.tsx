import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Dumbbell,
  BookOpen,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { coachIntegrationService } from '@/services/coachIntegration';
import { coachDeepLinks } from '@/config/coachIntegration';
import type { CoachClient, CoachWorkout, CoachProgram } from '@/types/coachIntegration';
import { format } from 'date-fns';

interface CoachDataPanelProps {
  coachAppUserId: string;
  coachName: string;
}

export default function CoachDataPanel({ coachAppUserId, coachName }: CoachDataPanelProps) {
  const [activeTab, setActiveTab] = useState('clients');

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['coach-clients', coachAppUserId],
    queryFn: () => coachIntegrationService.getCoachClients(coachAppUserId),
    enabled: activeTab === 'clients',
  });

  const { data: workouts, isLoading: workoutsLoading } = useQuery({
    queryKey: ['coach-workouts', coachAppUserId],
    queryFn: () => coachIntegrationService.getCoachWorkouts(coachAppUserId),
    enabled: activeTab === 'workouts',
  });

  const { data: programs, isLoading: programsLoading } = useQuery({
    queryKey: ['coach-programs', coachAppUserId],
    queryFn: () => coachIntegrationService.getCoachPrograms(coachAppUserId),
    enabled: activeTab === 'programs',
  });

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Coaching Data - {coachName}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(coachDeepLinks.dashboard(), '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Coach App
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="clients">
              <Users className="h-4 w-4 mr-1" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="workouts">
              <Dumbbell className="h-4 w-4 mr-1" />
              Workouts
            </TabsTrigger>
            <TabsTrigger value="programs">
              <BookOpen className="h-4 w-4 mr-1" />
              Programs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="mt-4">
            {clientsLoading ? (
              <LoadingState />
            ) : !clients?.length ? (
              <EmptyState label="No clients found" />
            ) : (
              <div className="space-y-2">
                {clients.map((client: CoachClient) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => window.open(coachDeepLinks.client(client.id), '_blank')}
                  >
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{client.status}</Badge>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="workouts" className="mt-4">
            {workoutsLoading ? (
              <LoadingState />
            ) : !workouts?.length ? (
              <EmptyState label="No workouts found" />
            ) : (
              <div className="space-y-2">
                {workouts.map((workout: CoachWorkout) => (
                  <div
                    key={workout.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => window.open(coachDeepLinks.workout(workout.id), '_blank')}
                  >
                    <div>
                      <p className="font-medium">{workout.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {workout.type} {workout.duration > 0 && `• ${workout.duration} min`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(workout.createdAt), 'MMM d')}
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="programs" className="mt-4">
            {programsLoading ? (
              <LoadingState />
            ) : !programs?.length ? (
              <EmptyState label="No programs found" />
            ) : (
              <div className="space-y-2">
                {programs.map((program: CoachProgram) => (
                  <div
                    key={program.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => window.open(coachDeepLinks.program(program.id), '_blank')}
                  >
                    <div>
                      <p className="font-medium">{program.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {program.weekCount} weeks {program.clientCount > 0 && `• ${program.clientCount} clients`}
                      </p>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <p className="text-center text-muted-foreground py-8">{label}</p>
  );
}

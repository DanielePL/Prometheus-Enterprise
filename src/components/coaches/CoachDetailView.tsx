import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Users,
  MessageSquare,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Dumbbell,
  BookOpen,
  UserPlus,
  Loader2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { coachDetailService } from '@/services/coachDetailService';
import type { Coach } from '@/types/database';
import type { ClientServiceEntry, CoachActivityEvent } from '@/types/coachDetail';
import { format, formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface CoachDetailViewProps {
  coach: Coach;
  onBack: () => void;
}

export default function CoachDetailView({ coach, onBack }: CoachDetailViewProps) {
  const [activeTab, setActiveTab] = useState('clients');

  const { data: responseMetrics, isLoading: responseLoading } = useQuery({
    queryKey: ['coach-response', coach.id],
    queryFn: () => coachDetailService.getResponseMetrics(coach.id),
  });

  const { data: serviceIndex, isLoading: serviceLoading } = useQuery({
    queryKey: ['coach-service', coach.id],
    queryFn: () => coachDetailService.getServiceIndex(coach.id),
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['coach-activity', coach.id],
    queryFn: () => coachDetailService.getActivityLog(coach.id),
  });

  const initials = coach.name.split(' ').map(n => n[0]).join('');

  function responseTimeColor(minutes: number): string {
    if (minutes <= 15) return 'text-green-500';
    if (minutes <= 30) return 'text-yellow-500';
    if (minutes <= 60) return 'text-orange-500';
    return 'text-red-500';
  }

  function responseTimeBg(minutes: number): string {
    if (minutes <= 15) return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (minutes <= 30) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    if (minutes <= 60) return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    return 'bg-red-500/10 text-red-500 border-red-500/20';
  }

  function scoreColor(score: number): string {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  }

  function scoreBg(score: number): string {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  }

  function satisfactionColor(score: number): string {
    if (score >= 9) return 'bg-green-500';
    if (score >= 7) return 'bg-yellow-500';
    if (score >= 5) return 'bg-orange-500';
    return 'bg-red-500';
  }

  function trendIcon(trend: string) {
    if (trend === 'improving') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'declining') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  }

  function activityIcon(type: string) {
    switch (type) {
      case 'session_completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'message_sent': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'workout_created': return <Dumbbell className="h-4 w-4 text-purple-500" />;
      case 'program_assigned': return <BookOpen className="h-4 w-4 text-primary" />;
      case 'client_onboarded': return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'feedback_received': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'no_show': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />;
    }
  }

  const isLoading = responseLoading || serviceLoading;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="mt-1">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-primary text-primary-foreground text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{coach.name}</h2>
            <Badge variant={coach.is_active ? 'default' : 'secondary'} className={coach.is_active ? 'bg-green-500' : ''}>
              {coach.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="text-muted-foreground">{coach.email}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {coach.specializations?.map(spec => (
              <Badge key={spec} variant="outline" className="text-xs">{spec}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Service Index</span>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className={`text-3xl font-bold ${scoreColor(serviceIndex?.overallScore || 0)}`}>
                  {serviceIndex?.overallScore || 0}
                  <span className="text-sm font-normal text-muted-foreground">/100</span>
                </p>
                <Progress value={serviceIndex?.overallScore || 0} className="mt-2 h-1.5" />
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Avg. Response</span>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className={`text-3xl font-bold ${responseTimeColor(responseMetrics?.avgResponseMinutes || 0)}`}>
                  {responseMetrics?.avgResponseMinutes || 0}
                  <span className="text-sm font-normal text-muted-foreground"> min</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((responseMetrics?.responseRate || 0) * 100)}% Response Rate
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Retention</span>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className={`text-3xl font-bold ${scoreColor(serviceIndex?.clientRetentionRate || 0)}`}>
                  {serviceIndex?.clientRetentionRate || 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ø {serviceIndex?.avgClientTenureMonths || 0} Monate
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">NPS Score</span>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className={`text-3xl font-bold ${(serviceIndex?.npsScore || 0) >= 50 ? 'text-green-500' : (serviceIndex?.npsScore || 0) >= 0 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {serviceIndex?.npsScore || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(serviceIndex?.npsScore || 0) >= 70 ? 'Exzellent' : (serviceIndex?.npsScore || 0) >= 50 ? 'Sehr gut' : (serviceIndex?.npsScore || 0) >= 0 ? 'Gut' : 'Verbesserung nötig'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="glass">
              <TabsTrigger value="clients">
                <Users className="h-4 w-4 mr-1" />
                Clients ({serviceIndex?.clients.length || 0})
              </TabsTrigger>
              <TabsTrigger value="response">
                <Clock className="h-4 w-4 mr-1" />
                Response Times
              </TabsTrigger>
              <TabsTrigger value="quality">
                <Star className="h-4 w-4 mr-1" />
                Service Quality
              </TabsTrigger>
              <TabsTrigger value="activity">
                <MessageSquare className="h-4 w-4 mr-1" />
                Activity
              </TabsTrigger>
            </TabsList>

            {/* Clients Tab */}
            <TabsContent value="clients" className="space-y-2">
              {!serviceIndex?.clients.length ? (
                <Card className="glass-card">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    Keine Kunden vorhanden
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass-card">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border/50">
                            <th className="text-left p-3 text-sm font-medium text-muted-foreground">Client</th>
                            <th className="text-center p-3 text-sm font-medium text-muted-foreground">Score</th>
                            <th className="text-center p-3 text-sm font-medium text-muted-foreground">Sessions</th>
                            <th className="text-center p-3 text-sm font-medium text-muted-foreground">No-Shows</th>
                            <th className="text-center p-3 text-sm font-medium text-muted-foreground">Response</th>
                            <th className="text-center p-3 text-sm font-medium text-muted-foreground">Trend</th>
                            <th className="text-left p-3 text-sm font-medium text-muted-foreground">Letztes Feedback</th>
                          </tr>
                        </thead>
                        <tbody>
                          {serviceIndex.clients.map((client: ClientServiceEntry) => (
                            <tr key={client.clientId} className="border-b border-border/30 hover:bg-muted/50 transition-colors">
                              <td className="p-3">
                                <div>
                                  <p className="font-medium text-sm">{client.clientName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {client.retentionMonths} {client.retentionMonths === 1 ? 'Monat' : 'Monate'}
                                  </p>
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${satisfactionColor(client.satisfactionScore)}`} />
                                  <span className="font-medium text-sm">{client.satisfactionScore}/10</span>
                                </div>
                              </td>
                              <td className="p-3 text-center text-sm">{client.sessionsCompleted}</td>
                              <td className="p-3 text-center">
                                <span className={`text-sm font-medium ${client.sessionsNoShow > 3 ? 'text-red-500' : client.sessionsNoShow > 1 ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                                  {client.sessionsNoShow}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                {client.avgResponseMinutes !== null ? (
                                  <Badge variant="outline" className={`text-xs ${responseTimeBg(client.avgResponseMinutes)}`}>
                                    {client.avgResponseMinutes} min
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-muted-foreground">–</span>
                                )}
                              </td>
                              <td className="p-3 text-center">{trendIcon(client.trend)}</td>
                              <td className="p-3 max-w-[200px]">
                                {client.lastFeedback ? (
                                  <p className="text-xs text-muted-foreground truncate italic">"{client.lastFeedback}"</p>
                                ) : (
                                  <span className="text-xs text-muted-foreground">–</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Response Times Tab */}
            <TabsContent value="response" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="glass-card">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Durchschnitt</p>
                    <p className={`text-4xl font-bold ${responseTimeColor(responseMetrics?.avgResponseMinutes || 0)}`}>
                      {responseMetrics?.avgResponseMinutes || 0}<span className="text-lg"> min</span>
                    </p>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Median</p>
                    <p className={`text-4xl font-bold ${responseTimeColor(responseMetrics?.medianResponseMinutes || 0)}`}>
                      {responseMetrics?.medianResponseMinutes || 0}<span className="text-lg"> min</span>
                    </p>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Response Rate</p>
                    <p className={`text-4xl font-bold ${scoreColor(Math.round((responseMetrics?.responseRate || 0) * 100))}`}>
                      {Math.round((responseMetrics?.responseRate || 0) * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {responseMetrics?.totalMessagesReplied || 0} / {responseMetrics?.totalMessagesReceived || 0} Nachrichten
                    </p>
                  </CardContent>
                </Card>
              </div>

              {responseMetrics?.weeklyTrend && responseMetrics.weeklyTrend.length > 0 && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-base">Response Time Trend (8 Wochen)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={responseMetrics.weeklyTrend}>
                        <defs>
                          <linearGradient id="responseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="week" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} unit=" min" />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                          labelStyle={{ color: 'hsl(var(--foreground))' }}
                          formatter={(value: number) => [`${value} min`, 'Avg. Response']}
                        />
                        <Area type="monotone" dataKey="avgMinutes" stroke="hsl(var(--primary))" fill="url(#responseGradient)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Service Quality Tab */}
            <TabsContent value="quality" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Score Ring */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-base">Service Index</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="relative w-40 h-40">
                      <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                        <circle
                          cx="60" cy="60" r="52" fill="none"
                          stroke={`hsl(var(--primary))`}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${(serviceIndex?.overallScore || 0) * 3.267} 326.7`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-bold ${scoreColor(serviceIndex?.overallScore || 0)}`}>
                          {serviceIndex?.overallScore || 0}
                        </span>
                        <span className="text-xs text-muted-foreground">von 100</span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-semibold">{serviceIndex?.clientRetentionRate}%</p>
                        <p className="text-xs text-muted-foreground">Retention</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{serviceIndex?.npsScore}</p>
                        <p className="text-xs text-muted-foreground">NPS</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{serviceIndex?.avgClientTenureMonths} Mo.</p>
                        <p className="text-xs text-muted-foreground">Ø Dauer</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Score Trend */}
                {serviceIndex?.monthlyScores && serviceIndex.monthlyScores.length > 0 && (
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-base">Score Entwicklung (6 Monate)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={serviceIndex.monthlyScores}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                          <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                          />
                          <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Client Feedback */}
              {serviceIndex?.clients.some(c => c.lastFeedback) && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-base">Letztes Kundenfeedback</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {serviceIndex.clients
                      .filter(c => c.lastFeedback)
                      .slice(0, 5)
                      .map(client => (
                        <div key={client.clientId} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <div className={`w-2 h-2 rounded-full mt-2 ${satisfactionColor(client.satisfactionScore)}`} />
                          <div>
                            <p className="text-sm italic">"{client.lastFeedback}"</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-muted-foreground font-medium">{client.clientName}</p>
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${i < client.progressRating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              )}

              {/* Warnings */}
              {serviceIndex && serviceIndex.overallScore < 70 && (
                <Card className="glass-card border-orange-500/30">
                  <CardContent className="p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-500">Achtung: Service Index unter 70</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Dieser Coach benötigt möglicherweise ein Gespräch zur Verbesserung der Servicequalität.
                        {(responseMetrics?.avgResponseMinutes || 0) > 60 && ' Die Antwortzeiten sind deutlich zu hoch.'}
                        {(serviceIndex.clientRetentionRate || 0) < 75 && ' Die Kundenbindung ist unterdurchschnittlich.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-base">Letzte Aktivitäten</CardTitle>
                </CardHeader>
                <CardContent>
                  {activityLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : !activity?.length ? (
                    <p className="text-center text-muted-foreground py-8">Keine Aktivitäten vorhanden</p>
                  ) : (
                    <div className="relative">
                      <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />
                      <div className="space-y-4">
                        {activity.map((event: CoachActivityEvent) => (
                          <div key={event.id} className="flex items-start gap-4 relative">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center z-10 shrink-0">
                              {activityIcon(event.type)}
                            </div>
                            <div className="flex-1 pt-1">
                              <p className="text-sm">{event.description}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true, locale: de })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

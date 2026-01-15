# Prometheus Gym Suite - Complete Export

## 1. Pages

### src/pages/GymDashboard.tsx
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, DollarSign, TrendingDown, Plus, MessageSquare, FileText, AlertTriangle, Calendar, Clock } from "lucide-react";

const GymDashboard = () => {
  // Mock data
  const stats = {
    totalMembers: 847,
    activeCoaches: 12,
    revenueMTD: 45230,
    churnRate: 2.3,
  };

  const todaySessions = [
    { time: "09:00", coach: "Max Müller", client: "Anna Schmidt", type: "Personal Training" },
    { time: "10:30", coach: "Lisa Weber", client: "Tom Fischer", type: "Ernährungsberatung" },
    { time: "14:00", coach: "Max Müller", client: "Sarah Klein", type: "Personal Training" },
    { time: "16:00", coach: "Jan Becker", client: "Mike Braun", type: "Gruppentraining" },
  ];

  const alerts = [
    { type: "warning", message: "5 Members seit 14+ Tagen nicht aktiv", priority: "high" },
    { type: "info", message: "Coach Lisa Weber: Zertifikat läuft in 30 Tagen ab", priority: "medium" },
    { type: "warning", message: "3 offene Zahlungen überfällig", priority: "high" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Command Center</h1>
          <p className="text-muted-foreground">Willkommen zurück, Prometheus Fitness</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Neues Mitglied
          </Button>
          <Button variant="outline" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Coach Nachricht
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">+12 diese Woche</p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Coaches</CardTitle>
            <UserCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.activeCoaches}</div>
            <p className="text-xs text-muted-foreground">2 im Urlaub</p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue MTD</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">€{stats.revenueMTD.toLocaleString()}</div>
            <p className="text-xs text-green-500">+8.2% vs. Vormonat</p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Churn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.churnRate}%</div>
            <p className="text-xs text-green-500">-0.5% vs. Vormonat</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Sessions */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Heutige Sessions
            </CardTitle>
            <CardDescription>4 Sessions geplant</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaySessions.map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">{session.time}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{session.client}</p>
                      <p className="text-sm text-muted-foreground">{session.coach}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{session.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alert Center */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Alert Center
            </CardTitle>
            <CardDescription>3 Benachrichtigungen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    alert.priority === "high" ? "bg-destructive/10" : "bg-muted/50"
                  }`}
                >
                  <AlertTriangle
                    className={`h-5 w-5 mt-0.5 ${
                      alert.priority === "high" ? "text-destructive" : "text-yellow-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{alert.message}</p>
                    <Button variant="link" className="h-auto p-0 text-xs text-primary">
                      Details anzeigen →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <Plus className="h-5 w-5" />
              <span>Member hinzufügen</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <MessageSquare className="h-5 w-5" />
              <span>Nachricht senden</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <FileText className="h-5 w-5" />
              <span>Report erstellen</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <Calendar className="h-5 w-5" />
              <span>Session planen</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GymDashboard;
```

### src/pages/CoachManagement.tsx
```tsx
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Search, Plus, Mail, Phone, Star, Users, Calendar, TrendingUp, Clock, MessageSquare } from "lucide-react";

const CoachManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const coaches = [
    {
      id: 1,
      name: "Max Müller",
      email: "max@prometheus.gym",
      phone: "+49 176 1234567",
      role: "Head Coach",
      status: "active",
      specialization: ["Krafttraining", "HIIT"],
      clients: 24,
      sessionsThisMonth: 48,
      revenue: 4800,
      rating: 4.9,
      utilization: 85,
      avatar: null,
    },
    {
      id: 2,
      name: "Lisa Weber",
      email: "lisa@prometheus.gym",
      phone: "+49 176 2345678",
      role: "Senior Coach",
      status: "active",
      specialization: ["Ernährung", "Yoga"],
      clients: 18,
      sessionsThisMonth: 36,
      revenue: 3600,
      rating: 4.8,
      utilization: 72,
      avatar: null,
    },
    {
      id: 3,
      name: "Jan Becker",
      email: "jan@prometheus.gym",
      phone: "+49 176 3456789",
      role: "Coach",
      status: "active",
      specialization: ["Gruppentraining", "Cardio"],
      clients: 15,
      sessionsThisMonth: 42,
      revenue: 3150,
      rating: 4.7,
      utilization: 78,
      avatar: null,
    },
    {
      id: 4,
      name: "Sarah Klein",
      email: "sarah@prometheus.gym",
      phone: "+49 176 4567890",
      role: "Junior Coach",
      status: "inactive",
      specialization: ["Rehabilitation", "Stretching"],
      clients: 8,
      sessionsThisMonth: 16,
      revenue: 1280,
      rating: 4.6,
      utilization: 45,
      avatar: null,
    },
  ];

  const filteredCoaches = coaches.filter(
    (coach) =>
      coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coach.specialization.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Coach Management</h1>
          <p className="text-muted-foreground">Verwalte dein Coaching-Team</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Coach hinzufügen
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Coach suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="roster" className="space-y-6">
        <TabsList>
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="communication">Kommunikation</TabsTrigger>
        </TabsList>

        <TabsContent value="roster" className="space-y-4">
          <div className="grid gap-4">
            {filteredCoaches.map((coach) => (
              <Card key={coach.id} className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={coach.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {coach.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">{coach.name}</h3>
                        <Badge variant={coach.status === "active" ? "default" : "secondary"}>
                          {coach.status === "active" ? "Aktiv" : "Inaktiv"}
                        </Badge>
                        <Badge variant="outline">{coach.role}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {coach.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {coach.phone}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {coach.specialization.map((spec) => (
                          <Badge key={spec} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="flex items-center justify-center gap-1 text-lg font-semibold text-foreground">
                          <Users className="h-4 w-4 text-primary" />
                          {coach.clients}
                        </div>
                        <p className="text-xs text-muted-foreground">Clients</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 text-lg font-semibold text-foreground">
                          <Calendar className="h-4 w-4 text-primary" />
                          {coach.sessionsThisMonth}
                        </div>
                        <p className="text-xs text-muted-foreground">Sessions</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 text-lg font-semibold text-foreground">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {coach.rating}
                        </div>
                        <p className="text-xs text-muted-foreground">Rating</p>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-foreground">€{coach.revenue}</div>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                      </div>
                    </div>

                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCoaches.map((coach) => (
              <Card key={coach.id} className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {coach.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{coach.name}</CardTitle>
                      <CardDescription>{coach.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Auslastung</span>
                      <span className="font-medium text-foreground">{coach.utilization}%</span>
                    </div>
                    <Progress value={coach.utilization} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Sessions</p>
                      <p className="font-semibold text-foreground">{coach.sessionsThisMonth}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Revenue</p>
                      <p className="font-semibold text-foreground">€{coach.revenue}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Clients</p>
                      <p className="font-semibold text-foreground">{coach.clients}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rating</p>
                      <p className="font-semibold text-foreground flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {coach.rating}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Wochenübersicht
              </CardTitle>
              <CardDescription>Coach-Verfügbarkeit und gebuchte Sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Kalender-Ansicht wird geladen...</p>
                <p className="text-sm">Hier erscheint die vollständige Wochenübersicht</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Direkte Nachricht
                </CardTitle>
                <CardDescription>Nachricht an einzelnen Coach senden</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Neue Nachricht</Button>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Team Broadcast
                </CardTitle>
                <CardDescription>Nachricht an alle Coaches</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">Broadcast senden</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoachManagement;
```

### src/pages/MemberCRM.tsx
```tsx
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Mail, Phone, Calendar, AlertTriangle, CheckCircle, Clock, TrendingDown, MessageSquare, Filter } from "lucide-react";

const MemberCRM = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const members = [
    {
      id: 1,
      name: "Anna Schmidt",
      email: "anna.schmidt@email.de",
      phone: "+49 170 1234567",
      membershipType: "Premium",
      status: "active",
      coach: "Max Müller",
      startDate: "2024-01-15",
      lastVisit: "2024-12-28",
      visitsThisMonth: 12,
      activityStatus: "green",
      tags: ["VIP", "PT-Paket"],
    },
    {
      id: 2,
      name: "Tom Fischer",
      email: "tom.fischer@email.de",
      phone: "+49 171 2345678",
      membershipType: "Standard",
      status: "active",
      coach: "Lisa Weber",
      startDate: "2024-03-01",
      lastVisit: "2024-12-20",
      visitsThisMonth: 6,
      activityStatus: "yellow",
      tags: ["Ernährungsplan"],
    },
    {
      id: 3,
      name: "Sarah Klein",
      email: "sarah.klein@email.de",
      phone: "+49 172 3456789",
      membershipType: "Premium",
      status: "active",
      coach: "Max Müller",
      startDate: "2023-06-01",
      lastVisit: "2024-12-10",
      visitsThisMonth: 2,
      activityStatus: "red",
      tags: ["At-Risk"],
    },
    {
      id: 4,
      name: "Mike Braun",
      email: "mike.braun@email.de",
      phone: "+49 173 4567890",
      membershipType: "Trial",
      status: "trial",
      coach: "Jan Becker",
      startDate: "2024-12-01",
      lastVisit: "2024-12-29",
      visitsThisMonth: 8,
      activityStatus: "green",
      tags: ["Probetraining"],
    },
    {
      id: 5,
      name: "Laura Hoffmann",
      email: "laura.hoffmann@email.de",
      phone: "+49 174 5678901",
      membershipType: "Standard",
      status: "paused",
      coach: "Sarah Klein",
      startDate: "2024-02-15",
      lastVisit: "2024-11-30",
      visitsThisMonth: 0,
      activityStatus: "red",
      tags: ["Pausiert"],
    },
  ];

  const atRiskMembers = members.filter((m) => m.activityStatus === "red");

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getActivityIcon = (status: string) => {
    switch (status) {
      case "green":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "yellow":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "red":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Member CRM</h1>
          <p className="text-muted-foreground">Verwalte deine Mitglieder</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Mitglied hinzufügen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt</p>
                <p className="text-2xl font-bold text-foreground">{members.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktiv</p>
                <p className="text-2xl font-bold text-green-500">
                  {members.filter((m) => m.activityStatus === "green").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Achtung</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {members.filter((m) => m.activityStatus === "yellow").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At-Risk</p>
                <p className="text-2xl font-bold text-red-500">{atRiskMembers.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Mitglied suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="database" className="space-y-6">
        <TabsList>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="communication">Kommunikation</TabsTrigger>
        </TabsList>

        <TabsContent value="database">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Membership</TableHead>
                    <TableHead>Coach</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Letzter Besuch</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {member.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{member.membershipType}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{member.coach}</TableCell>
                      <TableCell>{getActivityIcon(member.activityStatus)}</TableCell>
                      <TableCell className="text-muted-foreground">{member.lastVisit}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {member.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Activity Tracking</CardTitle>
              <CardDescription>Check-In History und Besuchsfrequenz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Activity Tracking wird geladen...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                At-Risk Members
              </CardTitle>
              <CardDescription>{atRiskMembers.length} Mitglieder benötigen Aufmerksamkeit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {atRiskMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 rounded-lg bg-red-500/10">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-red-500/20 text-red-500">
                          {member.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Letzter Besuch: {member.lastVisit}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-1">
                        <MessageSquare className="h-4 w-4" />
                        Kontaktieren
                      </Button>
                      <Button size="sm">Win-Back</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Direkte Nachricht
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Neue Nachricht</Button>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Bulk Messaging
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">Segment-Nachricht</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MemberCRM;
```

### src/pages/FinancialOverview.tsx
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, TrendingDown, Users, CreditCard, AlertTriangle, CheckCircle, Download } from "lucide-react";

const FinancialOverview = () => {
  const revenueStats = {
    mtd: 45230,
    qtd: 128450,
    ytd: 512800,
    mrr: 38500,
    growth: 8.2,
  };

  const revenueBySource = [
    { source: "Memberships", amount: 28500, percentage: 63 },
    { source: "Personal Training", amount: 12300, percentage: 27 },
    { source: "Produkte & Supplements", amount: 3200, percentage: 7 },
    { source: "Kurse & Workshops", amount: 1230, percentage: 3 },
  ];

  const coachRevenue = [
    { name: "Max Müller", revenue: 4800, sessions: 48, clients: 24 },
    { name: "Lisa Weber", revenue: 3600, sessions: 36, clients: 18 },
    { name: "Jan Becker", revenue: 3150, sessions: 42, clients: 15 },
    { name: "Sarah Klein", revenue: 1280, sessions: 16, clients: 8 },
  ];

  const payments = [
    { member: "Anna Schmidt", amount: 89, status: "paid", date: "2024-12-28", type: "Premium" },
    { member: "Tom Fischer", amount: 49, status: "paid", date: "2024-12-27", type: "Standard" },
    { member: "Sarah Klein", amount: 89, status: "overdue", date: "2024-12-15", type: "Premium" },
    { member: "Mike Braun", amount: 0, status: "trial", date: "2024-12-01", type: "Trial" },
    { member: "Laura Hoffmann", amount: 49, status: "overdue", date: "2024-12-01", type: "Standard" },
  ];

  const overduePayments = payments.filter((p) => p.status === "overdue");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Overview</h1>
          <p className="text-muted-foreground">Umsatz und Zahlungsübersicht</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Report exportieren
        </Button>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">MTD Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">€{revenueStats.mtd.toLocaleString()}</div>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +{revenueStats.growth}% vs. Vormonat
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">QTD Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">€{revenueStats.qtd.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">YTD Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">€{revenueStats.ytd.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">€{revenueStats.mrr.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-border/50 border-red-500/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-500">Überfällig</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{overduePayments.length}</div>
            <p className="text-xs text-muted-foreground">
              €{overduePayments.reduce((sum, p) => sum + p.amount, 0)} offen
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="by-source">Nach Quelle</TabsTrigger>
          <TabsTrigger value="by-coach">Nach Coach</TabsTrigger>
          <TabsTrigger value="payments">Zahlungen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Revenue by Source</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueBySource.map((item) => (
                    <div key={item.source} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.source}</span>
                        <span className="font-medium text-foreground">€{item.amount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Top Coaches by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {coachRevenue.slice(0, 4).map((coach, index) => (
                    <div key={coach.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-primary">#{index + 1}</span>
                        <div>
                          <p className="font-medium text-foreground">{coach.name}</p>
                          <p className="text-sm text-muted-foreground">{coach.sessions} Sessions</p>
                        </div>
                      </div>
                      <span className="font-semibold text-foreground">€{coach.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="by-source">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Revenue nach Quelle</CardTitle>
              <CardDescription>Detaillierte Aufschlüsselung der Einnahmequellen</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quelle</TableHead>
                    <TableHead>Betrag</TableHead>
                    <TableHead>Anteil</TableHead>
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueBySource.map((item) => (
                    <TableRow key={item.source}>
                      <TableCell className="font-medium">{item.source}</TableCell>
                      <TableCell>€{item.amount.toLocaleString()}</TableCell>
                      <TableCell>{item.percentage}%</TableCell>
                      <TableCell>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-coach">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Revenue nach Coach</CardTitle>
              <CardDescription>Umsatz pro Coach diesen Monat</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Coach</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>Clients</TableHead>
                    <TableHead>Ø pro Session</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coachRevenue.map((coach) => (
                    <TableRow key={coach.name}>
                      <TableCell className="font-medium">{coach.name}</TableCell>
                      <TableCell>€{coach.revenue.toLocaleString()}</TableCell>
                      <TableCell>{coach.sessions}</TableCell>
                      <TableCell>{coach.clients}</TableCell>
                      <TableCell>€{Math.round(coach.revenue / coach.sessions)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          {overduePayments.length > 0 && (
            <Card className="bg-card/80 backdrop-blur-sm border-red-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="h-5 w-5" />
                  Überfällige Zahlungen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overduePayments.map((payment) => (
                    <div key={payment.member} className="flex items-center justify-between p-3 rounded-lg bg-red-500/10">
                      <div>
                        <p className="font-medium text-foreground">{payment.member}</p>
                        <p className="text-sm text-muted-foreground">Fällig seit: {payment.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-foreground">€{payment.amount}</span>
                        <Button size="sm">Mahnung senden</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Alle Zahlungen</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Betrag</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.member}>
                      <TableCell className="font-medium">{payment.member}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.type}</Badge>
                      </TableCell>
                      <TableCell>€{payment.amount}</TableCell>
                      <TableCell className="text-muted-foreground">{payment.date}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === "paid"
                              ? "default"
                              : payment.status === "overdue"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {payment.status === "paid" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {payment.status === "overdue" && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {payment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialOverview;
```

### src/pages/AnalyticsReports.tsx
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Users, Clock, Download, FileText, Calendar } from "lucide-react";

const AnalyticsReports = () => {
  const occupancyData = [
    { time: "06:00", visitors: 15 },
    { time: "08:00", visitors: 45 },
    { time: "10:00", visitors: 62 },
    { time: "12:00", visitors: 38 },
    { time: "14:00", visitors: 28 },
    { time: "16:00", visitors: 55 },
    { time: "18:00", visitors: 78 },
    { time: "20:00", visitors: 42 },
    { time: "22:00", visitors: 12 },
  ];

  const weeklyTrends = {
    totalVisits: 2847,
    avgDaily: 407,
    peakDay: "Montag",
    peakHour: "18:00",
    uniqueVisitors: 412,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
          <p className="text-muted-foreground">Insights und Auswertungen</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="this-month">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Heute</SelectItem>
              <SelectItem value="this-week">Diese Woche</SelectItem>
              <SelectItem value="this-month">Dieser Monat</SelectItem>
              <SelectItem value="this-quarter">Dieses Quartal</SelectItem>
              <SelectItem value="this-year">Dieses Jahr</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-sm">Total Visits</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{weeklyTrends.totalVisits.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Ø Daily</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{weeklyTrends.avgDaily}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Peak Day</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{weeklyTrends.peakDay}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Peak Hour</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{weeklyTrends.peakHour}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-sm">Unique</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{weeklyTrends.uniqueVisitors}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="occupancy" className="space-y-6">
        <TabsList>
          <TabsTrigger value="occupancy">Auslastung</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="occupancy" className="space-y-4">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Tagesauslastung
              </CardTitle>
              <CardDescription>Besucherverteilung nach Uhrzeit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {occupancyData.map((item) => (
                  <div key={item.time} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-primary rounded-t"
                      style={{ height: `${(item.visitors / 80) * 100}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Peak Hours</CardTitle>
                <CardDescription>Stoßzeiten im Gym</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Morgens (6-9 Uhr)</span>
                    <span className="font-medium text-foreground">Moderat</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Mittags (12-14 Uhr)</span>
                    <span className="font-medium text-foreground">Ruhig</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Nachmittags (16-19 Uhr)</span>
                    <span className="font-medium text-primary">Peak</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Abends (20-22 Uhr)</span>
                    <span className="font-medium text-foreground">Moderat</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Wochentage</CardTitle>
                <CardDescription>Besucherverteilung</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day, index) => (
                    <div key={day} className="flex items-center gap-3">
                      <span className="w-8 text-sm text-muted-foreground">{day}</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${[95, 80, 75, 85, 70, 60, 30][index]}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Trend-Analyse</CardTitle>
              <CardDescription>Entwicklung über Zeit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Trend-Charts werden geladen...</p>
                <p className="text-sm">MoM, YoY Vergleiche</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 cursor-pointer hover:bg-card/90 transition-colors">
              <CardContent className="p-6 flex items-center gap-4">
                <FileText className="h-10 w-10 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Monthly Summary</h3>
                  <p className="text-sm text-muted-foreground">Kompletter Monatsbericht</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-border/50 cursor-pointer hover:bg-card/90 transition-colors">
              <CardContent className="p-6 flex items-center gap-4">
                <Users className="h-10 w-10 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Coach Performance</h3>
                  <p className="text-sm text-muted-foreground">Leistungsübersicht Coaches</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-border/50 cursor-pointer hover:bg-card/90 transition-colors">
              <CardContent className="p-6 flex items-center gap-4">
                <TrendingUp className="h-10 w-10 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Retention Report</h3>
                  <p className="text-sm text-muted-foreground">Churn-Analyse</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="export">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Daten exportieren</CardTitle>
              <CardDescription>Alle Listen und Reports als CSV oder PDF</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start gap-2">
                  <Download className="h-4 w-4" />
                  Member-Liste (CSV)
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <Download className="h-4 w-4" />
                  Coach-Liste (CSV)
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <Download className="h-4 w-4" />
                  Zahlungen (CSV)
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <FileText className="h-4 w-4" />
                  Monatsbericht (PDF)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsReports;
```

### src/pages/GymSettings.tsx
```tsx
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Users, Bell, Link, Save, Plus, Shield, Mail, Smartphone } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const GymSettings = () => {
  const [gymProfile, setGymProfile] = useState({
    name: "Prometheus Fitness",
    email: "info@prometheus-fitness.de",
    phone: "+49 89 123456",
    website: "www.prometheus-fitness.de",
    address: "Maximilianstraße 42, 80538 München",
  });

  const staffAccounts = [
    { id: 1, name: "Michael Schmidt", email: "michael@prometheus.gym", role: "owner", status: "active" },
    { id: 2, name: "Anna Müller", email: "anna@prometheus.gym", role: "manager", status: "active" },
    { id: 3, name: "Tom Weber", email: "tom@prometheus.gym", role: "staff", status: "active" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Gym-Einstellungen verwalten</p>
        </div>
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Änderungen speichern
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Gym Profile</TabsTrigger>
          <TabsTrigger value="users">User Roles</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="appearance">Erscheinungsbild</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Gym-Profil
              </CardTitle>
              <CardDescription>Grundlegende Informationen über dein Gym</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">PF</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline">Logo ändern</Button>
                  <p className="text-sm text-muted-foreground mt-2">PNG, JPG bis 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Gym Name</Label>
                  <Input
                    id="name"
                    value={gymProfile.name}
                    onChange={(e) => setGymProfile({ ...gymProfile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={gymProfile.email}
                    onChange={(e) => setGymProfile({ ...gymProfile, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={gymProfile.phone}
                    onChange={(e) => setGymProfile({ ...gymProfile, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={gymProfile.website}
                    onChange={(e) => setGymProfile({ ...gymProfile, website: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={gymProfile.address}
                    onChange={(e) => setGymProfile({ ...gymProfile, address: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    User Roles & Staff
                  </CardTitle>
                  <CardDescription>Verwalte Zugriffsrechte und Mitarbeiter</CardDescription>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Staff hinzufügen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staffAccounts.map((staff) => (
                  <div key={staff.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {staff.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{staff.name}</p>
                        <p className="text-sm text-muted-foreground">{staff.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select defaultValue={staff.role}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge variant={staff.status === "active" ? "default" : "secondary"}>
                        {staff.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-muted/30">
                <h4 className="font-medium text-foreground mb-2">Rollen-Berechtigungen</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Owner:</strong> Voller Zugriff auf alle Funktionen</p>
                  <p><strong>Manager:</strong> Alles außer Finanzen und Einstellungen</p>
                  <p><strong>Staff:</strong> Member Check-In und grundlegende Ansichten</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Benachrichtigungen
              </CardTitle>
              <CardDescription>Konfiguriere wann und wie du benachrichtigt wirst</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Email-Benachrichtigungen</p>
                      <p className="text-sm text-muted-foreground">Tägliche Zusammenfassung per Email</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Push-Benachrichtigungen</p>
                      <p className="text-sm text-muted-foreground">Echtzeit-Alerts auf dem Handy</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h4 className="font-medium text-foreground mb-4">Alert-Trigger</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Member inaktiv seit 7 Tagen</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Member inaktiv seit 14 Tagen</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Zahlung überfällig</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Coach Zertifikat läuft ab</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Neues Mitglied registriert</span>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5 text-primary" />
                Integrationen
              </CardTitle>
              <CardDescription>Verbinde externe Services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">S</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Stripe Payments</p>
                      <p className="text-sm text-muted-foreground">Zahlungsabwicklung</p>
                    </div>
                  </div>
                  <Button variant="outline">Verbinden</Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-green-500/10 flex items-center justify-center">
                      <span className="text-green-500 font-bold">W</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">WhatsApp Business</p>
                      <p className="text-sm text-muted-foreground">Automatische Nachrichten</p>
                    </div>
                  </div>
                  <Button variant="outline">Verbinden</Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-blue-500/10 flex items-center justify-center">
                      <span className="text-blue-500 font-bold">G</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Google Calendar</p>
                      <p className="text-sm text-muted-foreground">Kalender-Sync</p>
                    </div>
                  </div>
                  <Button variant="outline">Verbinden</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Erscheinungsbild</CardTitle>
              <CardDescription>Passe das Aussehen der App an</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Theme</p>
                  <p className="text-sm text-muted-foreground">Wähle zwischen Hell und Dunkel</p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GymSettings;
```

---

## 2. Navigation

### src/components/Navigation/Sidebar.tsx
```tsx
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  DollarSign,
  BarChart3,
  Settings,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/coaches", icon: UserCheck, label: "Coaches" },
  { to: "/members", icon: Users, label: "Members" },
  { to: "/financials", icon: DollarSign, label: "Finanzen" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/calendar", icon: Calendar, label: "Kalender" },
  { to: "/inbox", icon: MessageSquare, label: "Inbox" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen sticky top-0 bg-card/80 backdrop-blur-xl border-r border-border/50 transition-all duration-300 ease-in-out z-50",
        isExpanded ? "w-64" : "w-16"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-sm">P</span>
          </div>
          <span
            className={cn(
              "font-semibold text-foreground whitespace-nowrap transition-opacity duration-300",
              isExpanded ? "opacity-100" : "opacity-0"
            )}
          >
            Prometheus
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;

          return (
            <Tooltip key={item.to} delayDuration={0}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span
                    className={cn(
                      "whitespace-nowrap transition-opacity duration-300",
                      isExpanded ? "opacity-100" : "opacity-0 w-0"
                    )}
                  >
                    {item.label}
                  </span>
                </NavLink>
              </TooltipTrigger>
              {!isExpanded && (
                <TooltipContent side="right" sideOffset={10}>
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </nav>
    </aside>
  );
};
```

### src/components/Navigation/BottomNav.tsx
```tsx
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, UserCheck, DollarSign, Settings } from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { to: "/coaches", icon: UserCheck, label: "Coaches" },
  { to: "/members", icon: Users, label: "Members" },
  { to: "/financials", icon: DollarSign, label: "Finanzen" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/50 z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
```

---

## 3. App.tsx (Routing)

```tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/Navigation/Sidebar";
import { BottomNav } from "@/components/Navigation/BottomNav";
import { useTheme } from "next-themes";
import gradientBg from "@/assets/gradient-bg.jpg";
import gradientBgDark from "@/assets/gradient-bg-dark.png";

// Pages
import GymDashboard from "./pages/GymDashboard";
import CoachManagement from "./pages/CoachManagement";
import MemberCRM from "./pages/MemberCRM";
import FinancialOverview from "./pages/FinancialOverview";
import AnalyticsReports from "./pages/AnalyticsReports";
import GymSettings from "./pages/GymSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  return (
    <div className="min-h-screen flex w-full" style={{ backgroundImage: `url(${theme === "dark" ? gradientBgDark : gradientBg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8 overflow-auto">{children}</main>
      <BottomNav />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<AppLayout><GymDashboard /></AppLayout>} />
            <Route path="/coaches" element={<AppLayout><CoachManagement /></AppLayout>} />
            <Route path="/members" element={<AppLayout><MemberCRM /></AppLayout>} />
            <Route path="/financials" element={<AppLayout><FinancialOverview /></AppLayout>} />
            <Route path="/analytics" element={<AppLayout><AnalyticsReports /></AppLayout>} />
            <Route path="/calendar" element={<AppLayout><GymDashboard /></AppLayout>} />
            <Route path="/inbox" element={<AppLayout><GymDashboard /></AppLayout>} />
            <Route path="/settings" element={<AppLayout><GymSettings /></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
```

---

## 4. Required Dependencies

```json
{
  "@radix-ui/react-avatar": "^1.1.10",
  "@radix-ui/react-badge": "...",
  "@radix-ui/react-tabs": "^1.1.12",
  "@radix-ui/react-select": "^2.2.5",
  "@radix-ui/react-switch": "^1.2.5",
  "@radix-ui/react-tooltip": "^1.2.7",
  "@radix-ui/react-progress": "^1.1.7",
  "lucide-react": "^0.462.0",
  "react-router-dom": "^6.30.1",
  "next-themes": "^0.3.0"
}
```

---

## Integration Notes

1. **Copy all page files** to `src/pages/`
2. **Copy navigation components** to `src/components/Navigation/`
3. **Update App.tsx** with the routing configuration
4. **Ensure shadcn/ui components** are installed (Card, Button, Badge, Tabs, Avatar, Table, etc.)
5. **Add background images** to `src/assets/` for theme support
6. **Ensure ThemeToggle component** exists for dark/light mode switching

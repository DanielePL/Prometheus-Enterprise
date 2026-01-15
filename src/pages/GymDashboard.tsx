import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  UserCheck,
  DollarSign,
  TrendingDown,
  Clock,
  AlertTriangle,
  Bell,
  Calendar,
  MessageSquare,
  FileText,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardService } from "@/services/dashboard";
import { sessionsService } from "@/services/sessions";
import { alertsService } from "@/services/alerts";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const GymDashboard = () => {
  const { gym } = useAuth();
  const navigate = useNavigate();

  // Fetch dashboard overview
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["dashboard-overview", gym?.id],
    queryFn: () => (gym ? dashboardService.getOverview(gym.id) : null),
    enabled: !!gym?.id,
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch today's sessions
  const { data: todaysSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["sessions-today", gym?.id],
    queryFn: () => (gym ? sessionsService.getTodaySessions(gym.id) : []),
    enabled: !!gym?.id,
  });

  // Fetch growth metrics for percentage changes
  const { data: growth } = useQuery({
    queryKey: ["dashboard-growth", gym?.id],
    queryFn: () => (gym ? dashboardService.getGrowthMetrics(gym.id) : null),
    enabled: !!gym?.id,
  });

  // Auto-generate alerts on dashboard load
  useEffect(() => {
    if (gym?.id) {
      alertsService.checkAndCreateAlerts(gym.id).catch(console.error);
    }
  }, [gym?.id]);

  // Format currency
  const formatCurrency = (amount: number) => {
    const currency = gym?.currency || "EUR";
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Build stats from real data
  const stats = [
    {
      label: "Total Members",
      value: overview?.totalMembers?.toLocaleString() || "0",
      change: growth ? `${growth.growthRate > 0 ? "+" : ""}${growth.growthRate}%` : "-",
      icon: Users,
      color: "text-blue-500",
    },
    {
      label: "Active Coaches",
      value: overview?.activeCoaches?.toString() || "0",
      change: `${overview?.totalCoaches || 0} total`,
      icon: UserCheck,
      color: "text-green-500",
    },
    {
      label: "Revenue MTD",
      value: formatCurrency(overview?.revenueThisMonth || 0),
      change: `MRR: ${formatCurrency(overview?.mrr || 0)}`,
      icon: DollarSign,
      color: "text-primary",
    },
    {
      label: "Overdue",
      value: overview?.overduePayments?.toString() || "0",
      change: formatCurrency(overview?.overdueAmount || 0),
      icon: TrendingDown,
      color: overview?.overduePayments ? "text-destructive" : "text-green-500",
    },
  ];

  // Quick actions with navigation
  const quickActions = [
    { label: "Add Member", icon: Users, color: "bg-blue-500", path: "/members" },
    { label: "Schedule Session", icon: Calendar, color: "bg-green-500", path: "/calendar" },
    { label: "Send Broadcast", icon: MessageSquare, color: "bg-purple-500", path: "/inbox" },
    { label: "Generate Report", icon: FileText, color: "bg-primary", path: "/analytics" },
  ];

  // Get alert icon based on severity
  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  // Get alert styling based on severity
  const getAlertStyle = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-l-destructive bg-destructive/10";
      case "warning":
        return "border-l-yellow-500 bg-yellow-500/10";
      case "info":
        return "border-l-blue-500 bg-blue-500/10";
      default:
        return "border-l-green-500 bg-green-500/10";
    }
  };

  const unreadAlertCount = overview?.alerts?.length || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Command Center</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {unreadAlertCount}
              </span>
            )}
          </Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate("/calendar")}>
            Quick Action
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="glass-card">
                <CardContent className="p-4">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-6 w-20 mt-3" />
                  <Skeleton className="h-4 w-24 mt-1" />
                </CardContent>
              </Card>
            ))
          : stats.map((stat) => (
              <Card key={stat.label} className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    <Badge variant="secondary" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Sessions */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Today's Sessions
              {todaysSessions && (
                <Badge variant="outline" className="ml-2">
                  {todaysSessions.length}
                </Badge>
              )}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/calendar")}>
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <Skeleton className="h-4 w-12" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24 mt-1" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : todaysSessions && todaysSessions.length > 0 ? (
              <div className="space-y-3">
                {todaysSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => navigate("/calendar")}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-mono text-muted-foreground w-12">
                        {format(new Date(session.start_time), "HH:mm")}
                      </span>
                      <div>
                        <p className="font-medium">{session.title || session.session_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.session_type}
                          {session.coach && ` • ${session.coach.name}`}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={session.status === "completed" ? "default" : "secondary"}
                      className={
                        session.status === "completed"
                          ? "bg-green-500"
                          : session.status === "scheduled"
                          ? "bg-blue-500"
                          : ""
                      }
                    >
                      {session.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No sessions scheduled for today</p>
                <Button variant="link" onClick={() => navigate("/calendar")}>
                  Schedule a session
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alert Center */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Alert Center
              {unreadAlertCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadAlertCount}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : overview?.alerts && overview.alerts.length > 0 ? (
              <div className="space-y-3">
                {overview.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border-l-4 ${getAlertStyle(alert.severity)}`}
                  >
                    <div className="flex items-start gap-2">
                      {getAlertIcon(alert.severity)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.title}</p>
                        {alert.message && (
                          <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-50" />
                <p>All clear! No alerts.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="h-24 flex-col gap-2 hover:scale-105 transition-transform"
                onClick={() => navigate(action.path)}
              >
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <span>{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GymDashboard;

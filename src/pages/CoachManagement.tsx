import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { enUS as locale } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  UserPlus,
  Star,
  Calendar,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Link2,
  Send,
  Plus,
  Megaphone,
  Mail,
  MailOpen,
  Search,
  ArrowLeft,
  Clock,
  CheckCheck,
  Reply,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { coachesService } from "@/services/coaches";
import { coachIntegrationService } from "@/services/coachIntegration";
import { messagesService } from "@/services/messages";
import CoachDialog, { CoachFormData } from "@/components/coaches/CoachDialog";
import DeleteCoachDialog from "@/components/coaches/DeleteCoachDialog";
import CoachLinkDialog from "@/components/coaches/CoachLinkDialog";
import CoachIntegrationCard from "@/components/coaches/CoachIntegrationCard";
import CoachDataPanel from "@/components/coaches/CoachDataPanel";
import CoachInviteDialog from "@/components/coaches/CoachInviteDialog";
import CoachCalendar from "@/components/coaches/CoachCalendar";
import CoachDetailView from "@/components/coaches/CoachDetailView";
import MessageComposer from "@/components/inbox/MessageComposer";
import { useSubscription } from "@/contexts/SubscriptionContext";
import type { Coach, CoachIntegrationRow, Message } from "@/types/database";

interface MessageWithSender extends Message {
  sender?: { id: string; full_name: string | null; avatar_url: string | null; email: string } | null;
  recipient?: { id: string; full_name: string | null; avatar_url: string | null; email: string } | null;
}

const CoachManagement = () => {
  const { gym, user } = useAuth();
  const { hasFeature, staffLimit } = useSubscription();
  const queryClient = useQueryClient();
  const [coachDialogOpen, setCoachDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkingCoach, setLinkingCoach] = useState<Coach | null>(null);
  const [expandedCoach, setExpandedCoach] = useState<string | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [invitingCoach, setInvitingCoach] = useState<Coach | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerReplyTo, setComposerReplyTo] = useState<MessageWithSender | null>(null);
  const [composerPresetBroadcast, setComposerPresetBroadcast] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageWithSender | null>(null);
  const [commSearch, setCommSearch] = useState("");

  // Fetch coaches
  const { data: coaches = [], isLoading } = useQuery({
    queryKey: ["coaches", gym?.id],
    queryFn: () => (gym?.id ? coachesService.getAll(gym.id) : Promise.resolve([])),
    enabled: !!gym?.id,
  });

  // Fetch coach integrations
  const { data: integrations = [] } = useQuery({
    queryKey: ["coach-integrations", gym?.id],
    queryFn: () => (gym?.id ? coachIntegrationService.getIntegrations(gym.id) : Promise.resolve([])),
    enabled: !!gym?.id && hasFeature('coachIntegration'),
  });

  // Fetch messages for communication tab
  const { data: inboxMessages = [] } = useQuery({
    queryKey: ["messages", "inbox", gym?.id, user?.id],
    queryFn: () => (gym && user ? messagesService.getInbox(gym.id, user.id) : []),
    enabled: !!gym?.id && !!user?.id,
  });

  const { data: sentMessages = [] } = useQuery({
    queryKey: ["messages", "sent", gym?.id, user?.id],
    queryFn: () => (gym && user ? messagesService.getSent(gym.id, user.id) : []),
    enabled: !!gym?.id && !!user?.id,
  });

  const { data: staff = [] } = useQuery({
    queryKey: ["staff", gym?.id],
    queryFn: () => (gym ? messagesService.getStaffMembers(gym.id) : []),
    enabled: !!gym?.id,
  });

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: messagesService.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["messages"] }),
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: messagesService.send,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      setComposerOpen(false);
      setComposerReplyTo(null);
      toast.success("Message sent");
    },
  });

  // Send broadcast mutation
  const broadcastMutation = useMutation({
    mutationFn: ({ subject, content }: { subject: string; content: string }) =>
      gym && user ? messagesService.sendBroadcast(gym.id, user.id, subject, content) : Promise.reject(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      setComposerOpen(false);
      toast.success("Broadcast sent to team");
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: messagesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      setSelectedMessage(null);
      toast.success("Message deleted");
    },
  });

  // Combined & filtered messages for communication tab
  const allMessages = useMemo(() => {
    const combined = [...inboxMessages, ...sentMessages];
    // Deduplicate by id
    const seen = new Set<string>();
    const unique = combined.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
    unique.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (!commSearch) return unique;
    const q = commSearch.toLowerCase();
    return unique.filter(
      (m) =>
        m.subject.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q) ||
        m.sender?.full_name?.toLowerCase().includes(q) ||
        m.recipient?.full_name?.toLowerCase().includes(q)
    );
  }, [inboxMessages, sentMessages, commSearch]);

  const broadcasts = useMemo(() => allMessages.filter((m) => m.is_broadcast), [allMessages]);
  const directMessages = useMemo(() => allMessages.filter((m) => !m.is_broadcast), [allMessages]);
  const unreadCount = useMemo(() => inboxMessages.filter((m) => !m.is_read).length, [inboxMessages]);

  const formatMessageDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return format(date, "HH:mm");
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d", { locale });
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleSelectMessage = async (message: MessageWithSender) => {
    setSelectedMessage(message);
    if (!message.is_read && message.recipient_id === user?.id) {
      await markReadMutation.mutateAsync(message.id);
    }
  };

  const openComposer = (broadcast = false) => {
    setComposerReplyTo(null);
    setComposerPresetBroadcast(broadcast);
    setComposerOpen(true);
  };

  const handleReplyMessage = (message: MessageWithSender) => {
    setComposerReplyTo(message);
    setComposerPresetBroadcast(false);
    setComposerOpen(true);
  };

  const getIntegration = (coachId: string): CoachIntegrationRow | null => {
    return integrations.find((i: CoachIntegrationRow) => i.coach_id === coachId) || null;
  };

  const handleLinkCoach = (coach: Coach) => {
    setLinkingCoach(coach);
    setLinkDialogOpen(true);
  };

  const handleLinkSubmit = async (email: string) => {
    if (!gym?.id || !linkingCoach) return { success: false };
    try {
      const result = await coachIntegrationService.initiateLink(gym.id, linkingCoach.id, email);
      queryClient.invalidateQueries({ queryKey: ["coach-integrations"] });
      if (result.status === 'linked') {
        toast.success("Coach linked successfully");
        return { success: true };
      }
      return { success: false, message: "No account found with this email in Prometheus Coach" };
    } catch (error) {
      return { success: false, message: "Failed to link coach" };
    }
  };

  const handleUnlinkCoach = async (integrationId: string) => {
    try {
      await coachIntegrationService.unlinkCoach(integrationId);
      queryClient.invalidateQueries({ queryKey: ["coach-integrations"] });
      toast.success("Coach unlinked");
    } catch (error) {
      toast.error("Failed to unlink coach");
    }
  };

  // Create coach mutation
  const createMutation = useMutation({
    mutationFn: (data: CoachFormData) =>
      coachesService.create({
        ...data,
        gym_id: gym!.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      toast.success("Coach added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Update coach mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CoachFormData }) =>
      coachesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      toast.success("Coach updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Delete coach mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => coachesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      toast.success("Coach deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      coachesService.toggleActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      toast.success("Status updated");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Calculate stats
  const stats = useMemo(() => {
    const activeCoaches = coaches.filter((c: Coach) => c.is_active).length;
    const avgRating =
      coaches.length > 0
        ? coaches.reduce((sum: number, c: Coach) => sum + (c.rating || 0), 0) / coaches.length
        : 0;
    const totalClients = coaches.reduce((sum: number, c: Coach) => sum + (c.client_count || 0), 0);
    const totalRevenue = coaches.reduce(
      (sum: number, c: Coach) => sum + (c.revenue_this_month || 0),
      0
    );

    return {
      activeCoaches,
      avgRating: avgRating.toFixed(1),
      totalClients,
      totalRevenue,
    };
  }, [coaches]);

  const handleAddCoach = () => {
    setSelectedCoach(null);
    setCoachDialogOpen(true);
  };

  const handleEditCoach = (coach: Coach) => {
    setSelectedCoach(coach);
    setCoachDialogOpen(true);
  };

  const handleDeleteCoach = (coach: Coach) => {
    setSelectedCoach(coach);
    setDeleteDialogOpen(true);
  };

  const handleSaveCoach = async (data: CoachFormData) => {
    if (selectedCoach) {
      await updateMutation.mutateAsync({ id: selectedCoach.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedCoach) {
      await deleteMutation.mutateAsync(selectedCoach.id);
    }
  };

  const handleToggleActive = (coach: Coach) => {
    toggleActiveMutation.mutate({ id: coach.id, isActive: !coach.is_active });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate utilization (sessions this month / expected sessions)
  const getUtilization = (coach: Coach) => {
    const expectedSessions = 40; // Assumed max sessions per month
    return Math.min(100, Math.round((coach.sessions_this_month / expectedSessions) * 100));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Coach Management</h1>
          <p className="text-muted-foreground">
            Manage your coaching team and track performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          {staffLimit > 0 && (
            <span className="text-sm text-muted-foreground">
              {coaches.length} / {staffLimit} coaches
            </span>
          )}
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => {
              if (staffLimit > 0 && coaches.length >= staffLimit) {
                toast.error(`Staff limit reached (${staffLimit}). Upgrade your plan for more.`);
                return;
              }
              handleAddCoach();
            }}
            disabled={staffLimit > 0 && coaches.length >= staffLimit}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Coach
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.activeCoaches}</p>
                <p className="text-sm text-muted-foreground">Active Coaches</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.avgRating}</p>
                <p className="text-sm text-muted-foreground">Avg. Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalClients}</p>
                <p className="text-sm text-muted-foreground">Total Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-sm text-muted-foreground">Team Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="roster" className="space-y-4">
        <TabsList className="glass">
          <TabsTrigger value="roster">Team</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="schedule">Calendar</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        <TabsContent value="roster" className="space-y-4">
          {expandedCoach ? (
            <CoachDetailView
              coach={coaches.find((c: Coach) => c.id === expandedCoach)!}
              onBack={() => setExpandedCoach(null)}
            />
          ) : coaches.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Coaches Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first coach to get started.
                </p>
                <Button onClick={handleAddCoach}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Coach
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {coaches.map((coach: Coach) => (
                <Card
                  key={coach.id}
                  className={`glass-card hover:scale-[1.02] transition-transform cursor-pointer ${
                    !coach.is_active ? "opacity-60" : ""
                  }`}
                  onClick={() => setExpandedCoach(coach.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {coach.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{coach.name}</h3>
                            <p className="text-sm text-muted-foreground">{coach.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={coach.is_active ? "default" : "secondary"}
                              className={coach.is_active ? "bg-green-500" : ""}
                            >
                              {coach.is_active ? "Active" : "Inactive"}
                            </Badge>
                            {hasFeature('coachIntegration') && getIntegration(coach.id)?.status === 'linked' && (
                              <Badge variant="outline" className="text-xs border-primary text-primary">
                                <Link2 className="h-3 w-3 mr-1" />
                                Linked
                              </Badge>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditCoach(coach)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                {hasFeature('coachIntegration') && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleLinkCoach(coach)}>
                                      <Link2 className="h-4 w-4 mr-2" />
                                      {getIntegration(coach.id)?.status === 'linked' ? 'Manage Link' : 'Link to Coach App'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setInvitingCoach(coach); setInviteDialogOpen(true); }}>
                                      <Send className="h-4 w-4 mr-2" />
                                      Send Invite Link
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuItem onClick={() => handleToggleActive(coach)}>
                                  {coach.is_active ? (
                                    <>
                                      <ToggleLeft className="h-4 w-4 mr-2" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <ToggleRight className="h-4 w-4 mr-2" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteCoach(coach)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {coach.specializations?.map((spec) => (
                            <Badge key={spec} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                          {(!coach.specializations || coach.specializations.length === 0) && (
                            <span className="text-xs text-muted-foreground">
                              No specializations
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                          <div>
                            <p className="font-semibold">{coach.client_count}</p>
                            <p className="text-xs text-muted-foreground">Clients</p>
                          </div>
                          <div>
                            <p className="font-semibold flex items-center justify-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              {coach.rating?.toFixed(1) || "–"}
                            </p>
                            <p className="text-xs text-muted-foreground">Rating</p>
                          </div>
                          <div>
                            <p className="font-semibold">
                              {formatCurrency(coach.revenue_this_month)}
                            </p>
                            <p className="text-xs text-muted-foreground">Revenue</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Coach Utilization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {coaches.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No coaches available
                </p>
              ) : (
                coaches.map((coach: Coach) => (
                  <div key={coach.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{coach.name}</span>
                        {!coach.is_active && (
                          <Badge variant="secondary" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {coach.sessions_this_month} Sessions ({getUtilization(coach)}%)
                      </span>
                    </div>
                    <Progress value={getUtilization(coach)} className="h-2" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Revenue per Coach</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {coaches
                .filter((c: Coach) => c.is_active)
                .sort((a: Coach, b: Coach) => b.revenue_this_month - a.revenue_this_month)
                .map((coach: Coach) => (
                  <div key={coach.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/20 text-primary text-sm">
                          {coach.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{coach.name}</span>
                    </div>
                    <span className="font-semibold text-primary">
                      {formatCurrency(coach.revenue_this_month)}
                    </span>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <CoachCalendar coaches={coaches} />
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-16 flex-col gap-1 glass-card hover:border-primary/50 transition-colors"
              onClick={() => openComposer(false)}
            >
              <MessageSquare className="h-5 w-5 text-primary" />
              <span className="text-sm">Direct Message</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex-col gap-1 glass-card hover:border-primary/50 transition-colors"
              onClick={() => openComposer(true)}
            >
              <Megaphone className="h-5 w-5 text-primary" />
              <span className="text-sm">Team Broadcast</span>
            </Button>
            <div className="glass-card flex items-center justify-center gap-3 rounded-lg border px-4">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="text-center">
                <p className="text-lg font-bold">{unreadCount}</p>
                <p className="text-xs text-muted-foreground">Unread</p>
              </div>
              <div className="w-px h-8 bg-border mx-2" />
              <Send className="h-5 w-5 text-muted-foreground" />
              <div className="text-center">
                <p className="text-lg font-bold">{sentMessages.length}</p>
                <p className="text-xs text-muted-foreground">Sent</p>
              </div>
            </div>
          </div>

          {/* Messages Layout */}
          <div className="grid lg:grid-cols-3 gap-4" style={{ minHeight: "500px" }}>
            {/* Message List */}
            <Card className="glass-card lg:col-span-1 flex flex-col">
              <CardHeader className="pb-3 space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Messages</CardTitle>
                  <Button size="sm" variant="ghost" onClick={() => openComposer(false)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    value={commSearch}
                    onChange={(e) => setCommSearch(e.target.value)}
                    className="pl-9 h-8 text-sm"
                  />
                </div>
              </CardHeader>
              <ScrollArea className="flex-1">
                <div className="px-4 pb-4 space-y-1">
                  {allMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <MailOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No messages yet</p>
                      <Button
                        size="sm"
                        variant="link"
                        className="mt-1"
                        onClick={() => openComposer(false)}
                      >
                        Send your first message
                      </Button>
                    </div>
                  ) : (
                    allMessages.map((message) => {
                      const isSent = message.sender_id === (user?.id || "staff-1");
                      const person = isSent ? message.recipient : message.sender;
                      const isSelected = selectedMessage?.id === message.id;

                      return (
                        <div
                          key={message.id}
                          onClick={() => handleSelectMessage(message)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-primary/10 border border-primary/30"
                              : !message.is_read && !isSent
                              ? "bg-muted/30 hover:bg-muted/50"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback
                                className={`text-xs ${
                                  !message.is_read && !isSent
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                {message.is_broadcast ? (
                                  <Megaphone className="h-3.5 w-3.5" />
                                ) : (
                                  getInitials(person?.full_name)
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={`text-sm truncate ${
                                    !message.is_read && !isSent ? "font-semibold" : ""
                                  }`}
                                >
                                  {message.is_broadcast
                                    ? "Team Broadcast"
                                    : isSent
                                    ? `To: ${person?.full_name || person?.email || "Team"}`
                                    : person?.full_name || person?.email || "Unknown"}
                                </span>
                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                  {formatMessageDate(message.created_at)}
                                </span>
                              </div>
                              <p
                                className={`text-sm truncate ${
                                  !message.is_read && !isSent
                                    ? "font-medium"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {message.subject}
                              </p>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {message.content.slice(0, 60)}
                                {message.content.length > 60 ? "..." : ""}
                              </p>
                            </div>
                            {!message.is_read && !isSent && (
                              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </Card>

            {/* Message Detail */}
            <Card className="glass-card lg:col-span-2 flex flex-col">
              {selectedMessage ? (
                <>
                  <CardHeader className="border-b pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="lg:hidden h-8 w-8"
                          onClick={() => setSelectedMessage(null)}
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {selectedMessage.is_broadcast ? (
                              <Megaphone className="h-5 w-5" />
                            ) : (
                              getInitials(
                                selectedMessage.sender_id === (user?.id || "staff-1")
                                  ? selectedMessage.recipient?.full_name
                                  : selectedMessage.sender?.full_name
                              )
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{selectedMessage.subject}</h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedMessage.is_broadcast ? (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Team Broadcast
                              </span>
                            ) : selectedMessage.sender_id === (user?.id || "staff-1") ? (
                              `To: ${selectedMessage.recipient?.full_name || selectedMessage.recipient?.email || "Team"}`
                            ) : (
                              `From: ${selectedMessage.sender?.full_name || selectedMessage.sender?.email}`
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          {format(parseISO(selectedMessage.created_at), "MMM d, yyyy 'at' HH:mm", {
                            locale,
                          })}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => deleteMessageMutation.mutate(selectedMessage.id)}
                          disabled={deleteMessageMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-6 overflow-auto">
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                      {selectedMessage.content}
                    </div>
                  </CardContent>
                  {selectedMessage.sender_id !== (user?.id || "staff-1") &&
                    !selectedMessage.is_broadcast && (
                      <div className="p-4 border-t flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleReplyMessage(selectedMessage)}
                        >
                          <Reply className="h-4 w-4 mr-2" />
                          Reply
                        </Button>
                      </div>
                    )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold">Team Communication</h3>
                    <p className="text-muted-foreground text-sm mt-1 mb-4">
                      Select a message or start a new conversation
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button size="sm" onClick={() => openComposer(false)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Direct Message
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openComposer(true)}>
                        <Megaphone className="h-4 w-4 mr-2" />
                        Broadcast
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Recent Broadcasts */}
          {broadcasts.length > 0 && (
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-primary" />
                    Recent Broadcasts
                  </CardTitle>
                  <Button size="sm" variant="ghost" onClick={() => openComposer(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {broadcasts.slice(0, 3).map((broadcast) => (
                    <div
                      key={broadcast.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSelectMessage(broadcast)}
                    >
                      <Megaphone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm">{broadcast.subject}</span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatMessageDate(broadcast.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {broadcast.content.slice(0, 80)}
                          {broadcast.content.length > 80 ? "..." : ""}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          By {broadcast.sender?.full_name || "You"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Coach Dialog */}
      <CoachDialog
        open={coachDialogOpen}
        onOpenChange={setCoachDialogOpen}
        coach={selectedCoach}
        onSave={handleSaveCoach}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteCoachDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        coach={selectedCoach}
        onConfirm={handleConfirmDelete}
      />

      {/* Coach Link Dialog */}
      {linkingCoach && (
        <CoachLinkDialog
          open={linkDialogOpen}
          onOpenChange={setLinkDialogOpen}
          coachName={linkingCoach.name}
          coachEmail={linkingCoach.email}
          onLink={handleLinkSubmit}
        />
      )}

      {/* Coach Invite Dialog */}
      {invitingCoach && (
        <CoachInviteDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          coach={invitingCoach}
          gymId={gym?.id || ''}
          gymName={gym?.name || 'Prometheus Fitness'}
          userId="staff-1"
        />
      )}

      {/* Message Composer */}
      <MessageComposer
        open={composerOpen}
        onOpenChange={setComposerOpen}
        staff={staff}
        replyTo={composerReplyTo}
        onSend={async (data) => {
          if (data.isBroadcast) {
            await broadcastMutation.mutateAsync({
              subject: data.subject,
              content: data.content,
            });
          } else if (gym && user) {
            await sendMutation.mutateAsync({
              gym_id: gym.id,
              sender_id: user.id,
              recipient_id: data.recipientId,
              subject: data.subject,
              content: data.content,
              is_broadcast: false,
            });
          }
        }}
        loading={sendMutation.isPending || broadcastMutation.isPending}
      />
    </div>
  );
};

export default CoachManagement;
